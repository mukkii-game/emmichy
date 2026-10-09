import {japaneseExamples} from './profile.js?v=20261009-talk1';
import {waitingReply} from './waiting-db.js?v=20261008-listen3';
import {recognizeName,namedGesture,namedFollowup} from './names.js?v=20261009-talk1';
// Listening gestures are dialogue, retained alongside the eventual answer.
export function retainAside(history,line,{pendingReply=false}={}){
 const next=[...history];
 next.splice(pendingReply?Math.max(0,next.length-1):next.length,0,{role:'enny',text:line});
 return next.slice(-40);
}
// Conservative lexical hints only: uncertainty stays with a listening gesture.
export function waitingTone(input){
 const text=String(input).normalize('NFKC');
 if(/つらい|苦しい|相談|病気|入院|死に|亡く|いじめ|怖い|こわい|けが|怪我|事故|失敗|ミス|落ち込|悲しい|疲れ|嫌い|苦手|うれしくない|嬉しくない|楽しくない|嬉しくなかった|楽しくなかった|合格しなかった|成功しなかった/.test(text))return 'negative';
 if(/うれしい|嬉しい|楽しい|楽しかった|おいしい|美味しい|大好き|合格した|成功した|うまくできた|やった[!！]|最高/.test(text)&&!/ない|なかった|なく|じゃなく|ではなく|と言った|って言った|って言葉|という言葉|意味/.test(text))return 'positive';
 return 'neutral';
}
export function chooseFiller(input, recent=[],{match=recognizeName(input)}={}){
 const text=String(input).normalize('NFKC').trim();
 const serious=/つらい|苦しい|相談|病気|入院|死に|亡く|いじめ|怖い|こわい|けが|怪我|事故/.test(text);
 const sound=/^[ァ-ヶーッっぁ-ん]{2,14}[!！?？]+$/.test(text)?text.replace(/[!！?？]+$/,''):'';
 const topic=text.match(/ピアノ|ギター|音楽|プリン|牛丼|散歩|猫|ネコ|犬|イヌ/)?.[0];
 const echo=sound?`えっ、${sound}！？`:topic?`${topic}…。`:null;
 const tone=waitingTone(text);
 const language=['ニホンゴデ、ナンテイウンダッケ…。','エト…コノコトバ…。'];
 if(match&&!serious){const named=[namedGesture(match),namedFollowup(match,input),'ンー…。'];const next=named.find(line=>!recent.includes(line));if(next)return next;}
 const pool=serious?['うん、聞いてるよ。','そっか…。','うん…。']:
  tone==='negative'?['エエッ…。','そっか…。','うん、聞いてるよ。','フムフム…。']:
  sound?[echo,'！？','ウンウン…。',...language,'フムフム…。']:
  tone==='positive'?['ワオ！','エヘヘ…。','フフッ。','ウンウン…。','ソウネー…。','フムフム…。',...language,...(echo?[echo]:[])]:
  ['ウンウン…。','ソウネー…。','フムフム…。',...language,...(echo?[echo]:[]),'ンー…。'];
 return pool.find(line=>!recent.includes(line))||pool.find(line=>line!==recent.at(-1))||pool[0];
}
export function longFiller(input,recent=[]){
 return waitingReply(input,recent);
}
export function idleAside(history=[],index=0){
 const lastUser=history.filter(h=>h.role==='user').at(-1)?.text||'';
 if(/つらい|苦しい|相談|病気|いじめ/.test(lastUser))return ['急がなくて大丈夫。ここにいるよ。','アタシ、少しここで待ってるね。'][index%2];
 const food=/ご飯|ごはん|ゴハン|牛丼|ギュウドン|丼|ドンブリ|吉野家|ヨシノヤ|チーズ|プリン|そば|ソバ|食べ|タベ/.test(lastUser);
 const pool=food?['さっきのご飯の話、思い出したらお腹すいてきちゃった。','アタシ、食べ物の話になると急に元気なの。フフ。','おいしい物の話、まだ聞いていたいな。']:['別の話でもいいよ。ゆっくりで大丈夫。',japaneseExamples[(history.filter(h=>h.role==='user').length+index)%japaneseExamples.length],'急がなくていいよ。アタシ、ここにいるから。'];
 return pool[index%pool.length];
}
export function startFiller(show,{schedule=setTimeout,cancel=clearTimeout,now=Date.now,later,initialDelay=2000}={}){
 let active=true,timer,lastShown=null,count=0;
 const speak=()=>{
  if(!active)return;
  lastShown=now();show();count++;
  if(!active)return;
  if(count<2)timer=schedule(speak,3000);
  else if(later)timer=schedule(()=>{if(active){lastShown=now();later();}},3000);
 };
 timer=schedule(speak,initialDelay);
 // Stop before displaying the answer; reserve breathing room after the last gesture.
 return ()=>{active=false;cancel(timer);return lastShown===null?0:Math.max(0,300-(now()-lastShown));};
}
export function createIdleSequence(now=Date.now()){
 let activityAt=now,stage=0;
 return {
  touch(time=Date.now()){activityAt=time;stage=0;},
  poll(time=Date.now(),{allowFinish=true}={}){
   if(stage>=3||time-activityAt<10000||(stage===2&&!allowFinish))return null;
   activityAt=time;return ++stage;
  }
 };
}
