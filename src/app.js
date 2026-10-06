import {freshState,restoreState,respond,normalize} from './engine.js?v=20261006-open1';
import {chiikawaReply,checkedAt} from './topics.js?v=20261006-mix1';
import {text,kana} from './font.js?v=20261006-mix1';
import {shouldEnd,finishSession,checkpointSession,resumeSession,startConversation} from './session.js?v=20261006-end1';
import {createAudioDirector} from './audio.js?v=20261006-mix1';
import {CHAT_API_URL} from './config.js?v=20261006-mix1';
import {advancePerformance} from './performance.js?v=20261006-mix1';
import {requestChat} from './chat.js?v=20261006-mix1';
import {readableText,loadReadings} from './readable.js?v=20261006-words1';
import {curatedReply} from './curated.js?v=20261006-mix1';
import {selectKnowledge,knowledgeFallback} from './fandom.js?v=20261006-mix1';
import {selectGap} from './gap.js?v=20261006-mix1';
import {chooseRepertoire,rememberReply,polishReply} from './repertoire.js?v=20261006-mix1';
import {cultureReply} from './culture.js?v=20261006-mix1';
import {chooseFiller,startFiller,longFiller} from './filler.js?v=20261006-end1';
import {balanceRoute,learnInterests} from './balance.js?v=20261006-balance1';
import {selectOpening} from './openings.js?v=20261006-open1';
import {contextualReply} from './context.js?v=20261006-context1';
let recentFillers=[];
let idleAsideAt=0,idleAsideIndex=0;
let tokenizer=null;
let readingsSettled=false;
const $=id=>document.getElementById(id),canvas=$('screen'),ctx=canvas.getContext('2d',{willReadFrequently:true});
ctx.imageSmoothingEnabled=false;
const key='enny-memory-v1';
const isLocal=['127.0.0.1','localhost','[::1]'].includes(location.hostname);
let chatEndpoint=CHAT_API_URL;
const offline=['auto','seed','replay','nollm'].some(k=>new URLSearchParams(location.search).has(k));
let state=freshState(),saveAvailable=true,busy=false,portrait=null,live='',mood='idle',modelEnabled=Boolean(chatEndpoint)&&!offline,modelProvider='';
let session=null,ending=false,ready=true;
const audioDirector=createAudioDirector();
try{const stored=JSON.parse(localStorage.getItem('emmichy-session')||sessionStorage.getItem('emmichy-session'));if(stored&&Number.isFinite(stored.startedAt)&&Number.isFinite(stored.turns))session=stored;}catch{}
function saveSession(){if(ready)session=checkpointSession(session);try{localStorage.setItem('emmichy-session',JSON.stringify(session));sessionStorage.setItem('emmichy-session',JSON.stringify(session));}catch{}}
try {state=restoreState(JSON.parse(localStorage.getItem(key)));}catch{saveAvailable=false;}
const hadSavedDialogue=state.history.length>0;
let lines=[];
function renderConversation(){
 const log=$('conversation');log.replaceChildren();
 if(!tokenizer){const p=document.createElement('p');p.className='message system';p.textContent=readingsSettled?'コトバ ノ ヨミコミ ニ シッパイ。サイヨミコミ シテネ。':'コトバ ヲ ジュンビ シテイマス…';log.append(p);return;}
 for(const item of lines){const p=document.createElement('p');p.className='message '+item.role;const label=document.createElement('span');label.className='speaker';label.textContent=item.role==='user'?'YOU >':item.role==='system'?'SYSTEM >':'EMMICHY >';const body=document.createElement('span');body.textContent=readableText(item.value,tokenizer);p.append(label,body);log.append(p);}
 log.scrollTop=log.scrollHeight;
}
function add(role,value){lines.push({role,value});lines=lines.slice(-40);renderConversation();}
function openingText(returning=false){const picked=selectOpening(state,returning);state.openingSeen=picked.seen;return picked.text;}
function addOpening(returning=false){const line=openingText(returning);add('enny',line);state.history.push({role:'enny',text:line});save();}
$('send').disabled=true;
const readingsReady=loadReadings().then(value=>{tokenizer=value;readingsSettled=true;renderConversation();if(ready&&!busy)$('send').disabled=!value;return value;});
if(state.history.length) {for(const h of state.history)add(h.role,h.text);} else {
 add('system','EMMICHY / THE ALMOST CLEVER GAME');
 addOpening();
 add('system','ニホンゴ デ フツウニ ハナシテネ');
}
const img=new Image();img.src='assets/emmichy-portrait.png';
img.onload=()=>{
 const c=document.createElement('canvas');c.width=496;c.height=672;const p=c.getContext('2d',{willReadFrequently:true});
 const cropWidth=Math.min(img.width,img.height*496/672);
 p.drawImage(img,(img.width-cropWidth)/2,0,cropWidth,img.height,0,0,496,672);const d=p.getImageData(0,0,496,672),bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
 for(let y=0;y<672;y++)for(let x=0;x<496;x++){const i=(y*496+x)*4,threshold=(bayer[(y%4)*4+x%4]+.5)*16;for(let z=0;z<3;z++)d.data[i+z]=d.data[i+z]>threshold?255:0;d.data[i+3]=255;}
 p.putImageData(d,0,0);portrait=c;draw();
};
img.onerror=()=>{$('status').textContent='人物画像を読み込めません。再読み込みしてください。';};
function draw(){
 ctx.fillStyle='#000';ctx.fillRect(0,0,496,672);
 if(portrait)ctx.drawImage(portrait,0,0,496,672);
 $('live-reply').textContent=tokenizer?live:'';
 $('terminal-note').textContent=session?.finished?'— END —　コンニチハ デ サイカイ':busy?'':'アタシ エミチィ　ナンデモ ハナシテネ';
 ctx.save();ctx.scale(2,4);
 if(mood==='knowing' && Math.floor(Date.now()/700)%2)text(ctx,'*',230,10,'#00ffff');
 if(mood==='worried'){
   ctx.fillStyle='#00ffff';ctx.fillRect(229,42,2,2);ctx.fillRect(228,44,4,3);ctx.fillRect(229,47,2,1);
   if(Math.floor(Date.now()/900)%2)kana(ctx,'シーサー...',16,161,'#00ffff');
 }
 if(mood==='excited'){text(ctx,'*',225,20,'#ffff00');text(ctx,'*',16,90,'#00ffff');}
 ctx.restore();
}
function save(){try{localStorage.setItem(key,JSON.stringify(state));saveAvailable=true;}catch{saveAvailable=false;}$('disk').textContent=saveAvailable?'● DISK SAVED':'● MEMORY ONLY';}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function endSession(){
 if(!ready||ending||busy||!session||session.finished||state.ended)return;
 ending=true;busy=true;$('send').disabled=true;$('reset').disabled=true;$('restart-chat').disabled=true;
 const end=finishSession(state,session);state=end.state;session=end.session;mood='soft';saveSession();
 audioDirector.se.ending();
 const endingDisplay=readableText(end.text,tokenizer);
 for(const c of endingDisplay){live+=c;draw();await wait(32);}
 add('enny',end.text);live='';save();busy=false;ending=false;$('send').disabled=false;$('reset').disabled=false;$('restart-chat').disabled=false;
 const p=document.createElement('p');p.textContent=`えみちぃ：${end.text}。おしまい。`;$('transcript').append(p);
 $('status').textContent='おしまい。「コンニチハ」で、もう一度。';draw();
}
$('talk').addEventListener('submit',async e=>{
 e.preventDefault();if(!ready||busy||composing||!tokenizer)return;
 const raw=$('entry').value.trim();if(!raw)return;
 const isRestart=state.ended&&/コンニチ[ハワ]|タダイマ|オハヨウ/.test(normalize(raw));
 if(!session||isRestart){session={startedAt:Date.now(),turns:0,finished:false};if(isRestart){lines=[];state.performance={};state.fan={worry:0,excitement:0,lastTopic:''};}saveSession();}
  session.turns++;saveSession();
 busy=true;live='';$('send').disabled=true;$('reset').disabled=true;$('entry').value='';audioDirector.se.send();
 add('user',raw);$('disk').textContent='● DISK ACCESS';
 const before=advancePerformance(state,raw,session.turns);let result=chiikawaReply(normalize(raw),respond(raw,state),undefined,raw);
 if(result.kind==='bye'){const end=finishSession({...result.state,history:result.state.history.slice(0,-1)},session);result.text=end.text;result.state=end.state;session=end.session;}
 before.interests=learnInterests(raw,state.interests);result.state.interests=before.interests;
 result.state.performance=before.performance;result.state.speechStyle=before.speechStyle;
 const knowledge=selectKnowledge(raw,before);
 const repertoire=chooseRepertoire(raw,before);
 const culture=cultureReply(raw,before,repertoire.intent);
 const fandomReply=culture?.text||repertoire.candidate?.text||knowledgeFallback(knowledge);
 if(!isRestart&&!state.ended){
  result.state.knowledge=knowledge.memory;
  if(fandomReply&&!/嫌い|キライ|苦手|やめ|ヤメ|以外|イガイ|ばかり|バカリ/.test(raw)&&!['bye','asleep','name','memory','arithmetic','comfort','contradiction','repeat'].includes(result.kind)){
   result.text=fandomReply;result.state.history.at(-1).text=result.text;
  }
 }
 let usedModel=false,locallyReplaced=false;
 const gap=!isRestart&&!state.ended&&selectGap(raw,state);
 const legacy=!isRestart&&!state.ended&&(contextualReply(raw,state)||curatedReply(raw,state));
 let prepared=isRestart||state.ended?null:gap?{text:gap.text,topic:'gap'}:culture?.kind==='curiosity'?{text:culture.text,topic:'culture'}:repertoire.scripted?{text:repertoire.candidate.text,topic:'repertoire'}:
  legacy&&(!repertoire.candidate||legacy.topic==='greeting')?legacy:null;
 if(!isRestart&&!state.ended)prepared=balanceRoute(prepared,repertoire,session,modelEnabled);
 if(prepared?.topic==='greeting'){prepared.text=openingText(true);result.state.openingSeen=state.openingSeen;}
 if(gap)result.state.gap=gap.memory;
 if(prepared){result.text=['context-name','greeting','island-water','gap','repertoire','culture'].includes(prepared.topic)?prepared.text:fandomReply||prepared.text;result.kind='curated';result.state.history.at(-1).text=result.text;if(/[！!]/.test(result.text))result.mood='excited';}
 if(isRestart){result.text=openingText(true);result.state.openingSeen=state.openingSeen;result.state.history.at(-1).text=result.text;}
 const ruleOnly=isRestart||['curated','bye','asleep','name','memory','arithmetic'].includes(result.kind);
 if(modelEnabled && !ruleOnly){
  $('status').textContent='';
  const stopFiller=startFiller(()=>{
   const line=chooseFiller(raw,recentFillers);recentFillers=[...recentFillers,line].slice(-4);
   live=readableText(line,tokenizer);draw();
  },{later:()=>{const line=longFiller(raw,recentFillers);recentFillers=[...recentFillers,line].slice(-4);live=readableText(line,tokenizer);draw();}});
  let data;
  try{data=await requestChat(chatEndpoint,raw,before,session,{offline});}
  finally{stopFiller();live='';draw();}
  if(data){result.text=data.text;result.state.history.at(-1).text=data.text;usedModel=true;modelProvider=data.provider;}
 }
 if(!isRestart&&!['bye','asleep','name','memory','arithmetic'].includes(result.kind)){
  if(!usedModel&&!prepared&&repertoire.intent==='question'&&!repertoire.candidate&&knowledge.work){result.text='そこはまだ詳しくわからないの。知っていたら教えて？';}
  const polished=polishReply(result.text,raw,before,repertoire);result.text=polished.text;
  result.state.history.at(-1).text=result.text;
  const replyId=polished.id||(prepared?.topic==='repertoire'||(!usedModel&&repertoire.candidate&&result.text===repertoire.candidate.text)?repertoire.candidate?.id:null);
  result.state.repertoire=rememberReply(before,result.text,replyId,Boolean(prepared||polished.replaced));
  if(polished.replaced){usedModel=false;locallyReplaced=true;}
 }
 if(/[一-龠ぁ-ゖ]/.test(result.text)&&!tokenizer){$('status').textContent='読みやすい文字を準備しています…';if(!await readingsReady){result.text='ゴメン、コトバ ノ ヨミコミ ガ ウマク イカナイ。モウ イチド ハナシテネ。';result.state.history.at(-1).text=result.text;usedModel=false;}}
 session.dialogueUse={ai:(session.dialogueUse?.ai||0)+(usedModel?1:0),bank:(session.dialogueUse?.bank||0)+(!usedModel&&(prepared||locallyReplaced)?1:0)};
 state=result.state;mood=result.mood;session.lastMood=mood;saveSession();
 await wait(300+Math.min(raw.length*10,500));
 if(mood==='excited')audioDirector.se.excited();else if(mood==='worried')audioDirector.se.worried();else audioDirector.se.reply();
 const replyDisplay=readableText(result.text,tokenizer);
 for(const c of replyDisplay){live+=c;draw();await wait(mood==='excited'?12:mood==='worried'&&c==='\n'?420:22);}
 add('enny',result.text);live='';lastActivity=Date.now();save();busy=false;$('send').disabled=false;$('reset').disabled=false;
 $('status').textContent=usedModel?`AI会話${modelProvider?' / '+({groq:'Groq',gemini:'Google Gemini','workers-ai':'Cloudflare Workers AI',local:'ローカルAI'}[modelProvider]||modelProvider):''} / ENTER で送信`:locallyReplaced?'用意した会話で調整 / ENTER で送信':prepared?'用意した会話 / ENTER で送信':modelEnabled&&!ruleOnly?'AI失敗→ルール会話 / ENTER で送信':'ルール会話 / ENTER で送信';
 const item=document.createElement('p');item.textContent=`あなた：${raw}。Emmichy：${result.text}`;$('transcript').append(item);if($('transcript').children.length>40)$('transcript').firstChild.remove();
 $('entry').focus();draw();
 if(state.ended){session.finished=true;saveSession();}
 else if(shouldEnd(session)&&!$('entry').value.trim()&&!composing)await endSession();
});
let composing=false;
$('entry').addEventListener('compositionstart',()=>composing=true);
$('entry').addEventListener('compositionend',()=>{composing=false;draw();});
$('entry').addEventListener('input',()=>{lastActivity=Date.now();if(!busy){live='';draw();}});
$('entry').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.isComposing||e.keyCode===229))e.preventDefault();});
let lastActivity=Date.now();
$('entry').addEventListener('input',()=>{lastActivity=Date.now();draw();});
canvas.addEventListener('click',()=>$('entry').focus());
$('sound').onclick=async()=>{const on=await audioDirector.toggle();$('sound').textContent='BGM + SE '+(on?'ON':'OFF');$('sound').setAttribute('aria-pressed',String(on));if(on)audioDirector.se.reply();};
$('help').onclick=()=>{$('instructions').hidden=!$('instructions').hidden;};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.screen-wrap').requestFullscreen();}catch{$('status').textContent='このブラウザでは全画面にできません。';}};
$('export').onclick=()=>{const body=state.history.map(h=>`${h.role==='user'?'YOU':'EMMICHY'}: ${h.text}`).join('\r\n\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+body],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='enny-conversation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
let resetArmed=false,resetTimer;
$('reset').onclick=()=>{if(!resetArmed){resetArmed=true;$('reset-note').textContent=' もう一度押すと記憶が消えます。';resetTimer=setTimeout(()=>{resetArmed=false;$('reset-note').textContent='';},5000);return;}
 clearTimeout(resetTimer);resetArmed=false;$('reset-note').textContent=' 初期化しました。';state=freshState();session=null;saveSession();lines=[];live='';mood='idle';addOpening();$('transcript').replaceChildren();save();draw();};
function showStartChoice(){
 if(busy)return;
 if(ready)saveSession();
 ready=false;$('start-choice').hidden=false;$('send').disabled=true;$('entry').disabled=true;
 $('continue').disabled=!state.history.length;
 $('status').textContent='続きから／最初から を選んでください';
}
function enterConversation(){ready=true;$('start-choice').hidden=true;$('send').disabled=!tokenizer;$('entry').disabled=false;lastActivity=Date.now();$('entry').focus();}
$('continue').onclick=()=>{session=resumeSession(session);enterConversation();saveSession();$('status').textContent=state.ended?'おしまい。「最初から」で、もう一度。':'会話を再開しました / ENTER で送信';};
$('new-chat').onclick=()=>{const next=startConversation(state);state=next.state;session=next.session;lines=[];live='';mood='idle';$('transcript').replaceChildren();addOpening(true);enterConversation();save();saveSession();$('status').textContent='新しい会話 / 漢字・ひらがな OK';draw();};
$('restart-chat').onclick=showStartChoice;
if(hadSavedDialogue){ready=false;showStartChoice();}
document.addEventListener('visibilitychange',()=>{if(!session||!ready)return;if(document.hidden)saveSession();else{session=resumeSession(session);saveSession();}});
setInterval(()=>{if(ready&&!document.hidden)saveSession();},5000);
window.addEventListener('pagehide',saveSession);
function setEngineNote(){
 $('engine-note').textContent=(modelEnabled?`定番の一言は用意した台詞、具体的な話や続きはAI会話。接続失敗時はルール会話に戻ります${modelProvider?'（'+modelProvider+'）':''}。`:'無料・通信不要のルール会話。')+` 記憶はこのブラウザ内に保存します。時事ネタの確認日：${checkedAt}。`;
}
setEngineNote();
if(isLocal&&!offline){
 fetch('/api/config').then(r=>r.json()).then(c=>{if(c.localModel){chatEndpoint='/api/chat';modelProvider='local';}setEngineNote();}).catch(()=>{});
}
setInterval(draw,160);setInterval(()=>{
 if(ready&&!document.hidden&&shouldEnd(session)&&!composing&&!$('entry').value.trim()&&Date.now()-lastActivity>8000)endSession();
 if(ready&&!document.hidden&&!busy&&session&&!session.finished&&!state.ended&&!composing&&!$('entry').value.trim()&&Date.now()-lastActivity>=10000&&idleAsideAt!==lastActivity){
  idleAsideAt=lastActivity;
  const gentle=/つらい|苦しい|相談|病気|いじめ/.test(state.history.filter(h=>h.role==='user').at(-1)?.text||'');
  const lines=gentle?['急がなくて大丈夫。ここにいるよ。']:['あ、別の話題でもいいよ。何か日本のこと、教えて？','アタシの質問、むずかしかったかな？ 気楽に話してね。','漫画じゃなくてもいいの。今日あったこと、聞きたい！'];
  live=readableText(lines[idleAsideIndex++%lines.length],tokenizer);draw();
 }
},1000);draw();if(ready)$('entry').focus();







