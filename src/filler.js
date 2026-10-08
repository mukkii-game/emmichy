// Listening gestures are dialogue, retained alongside the eventual answer.
export function retainAside(history,line,{pendingReply=false}={}){
 const next=[...history];
 next.splice(pendingReply?Math.max(0,next.length-1):next.length,0,{role:'enny',text:line});
 return next.slice(-40);
}
export function chooseFiller(input, recent=[]){
 const serious=/つらい|苦しい|相談|病気|入院|死に|いじめ|怖い|こわい/.test(input);
 const pool=serious?['うん、聞いてるよ。','うん…。','そっか…。']:['ウンウン…。','エト…。','アノネ…。','ンー…。','アッ…。','ウン…。'];
 return pool.find(line=>!recent.includes(line))||pool.find(line=>line!==recent.at(-1))||pool[0];
}
export function longFiller(input,recent=[]){
 const pool=/つらい|苦しい|相談|病気|入院|死に|いじめ|怖い/.test(input)?['急がなくて大丈夫。ちゃんと聞きたいの。','うん、ここにいるよ。']:['むずかしい話、ちょっと整理してるの…。','エト…ちゃんと答えたいの。もう少しだけ！','ンー…言いたいことをまとめてるの。'];
 return pool.find(x=>!recent.includes(x))||pool[0];
}
export function idleAside(history=[],index=0){
 const lastUser=history.filter(h=>h.role==='user').at(-1)?.text||'';
 if(/つらい|苦しい|相談|病気|いじめ/.test(lastUser))return ['急がなくて大丈夫。ここにいるよ。','アタシ、少しここで待ってるね。'][index%2];
 const food=/ご飯|ごはん|ゴハン|牛丼|ギュウドン|丼|ドンブリ|吉野家|ヨシノヤ|チーズ|プリン|そば|ソバ|食べ|タベ/.test(lastUser);
 const pool=food?['さっきのご飯の話、思い出したらお腹すいてきちゃった。','アタシ、食べ物の話になると急に元気なの。フフ。','おいしい物の話、まだ聞いていたいな。']:['別の話でもいいよ。ゆっくりで大丈夫。','アタシ、覚えた日本語を小さいノートに書いてるの。字はまだ、ちょっとへた。','急がなくていいよ。アタシ、ここにいるから。'];
 return pool[index%pool.length];
}
export function startFiller(show,{schedule=setTimeout,cancel=clearTimeout,now=Date.now}={}){
 let active=true,timer,lastShown=null;
 const speak=()=>{if(!active)return;lastShown=now();show();if(active)timer=schedule(speak,2000);};
 timer=schedule(speak,1000);
 // Stop before displaying the answer; reserve breathing room after the last gesture.
 return ()=>{active=false;cancel(timer);return lastShown===null?0:Math.max(0,300-(now()-lastShown));};
}
export function createIdleSequence(now=Date.now()){
 let activityAt=now,stage=0;
 return {
  touch(time=Date.now()){activityAt=time;stage=0;},
  poll(time=Date.now()){
   if(stage>=3||time-activityAt<10000)return null;
   activityAt=time;return ++stage;
  }
 };
}
