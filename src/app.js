import {freshState,restoreState,respond,normalize} from './engine.js?v=20261007-candidate1';
import {chiikawaReply,checkedAt} from './topics.js?v=20261006-mix1';
import {text,kana} from './font.js?v=20261006-mix1';
import {shouldEnd,finishSession,checkpointSession,resumeSession,startConversation} from './session.js?v=20261008-farewell1';
import {createAudioDirector} from './audio.js?v=20261008-ready1';
import {CHAT_API_URL} from './config.js?v=20261006-mix1';
import {advancePerformance} from './performance.js?v=20261007-loop7';
import {requestChat,chatAvailable} from './chat.js?v=20261008-hybrid1';
import {readableText,loadReadings} from './readable.js?v=20261008-ready1';
import {selectKnowledge} from './fandom.js?v=20261006-mix1';
import {selectGap} from './gap.js?v=20261006-mix1';
import {chooseRepertoire,rememberReply,polishReply} from './repertoire.js?v=20261008-route2';
import {cultureReply} from './culture.js?v=20261006-mix1';
import {chooseFiller,startFiller,longFiller,retainAside,idleAside,createIdleSequence} from './filler.js?v=20261008-listen3';
import {learnInterests} from './balance.js?v=20261008-route2';
import {selectOpening} from './openings.js?v=20261006-open1';
import {preparedReply} from './routing.js?v=20261008-route2';
import {cleanConversation,noteConversationReply} from './conversation.js?v=20261007-loop7';
import {offlineFallback} from './fallback.js?v=20261008-finish1';
let recentFillers=[];
const idleSequence=createIdleSequence();
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
const messageNodes=new WeakMap();
function renderConversation(){
 const log=$('conversation'),pending=$('live-reply');
 if(!readingsSettled)return;
 const nodes=lines.map(item=>{
  if(messageNodes.has(item))return messageNodes.get(item);
  const p=document.createElement('p');p.className='message '+item.role;const label=document.createElement('span');label.className='speaker';label.textContent=item.role==='user'?'YOU >':item.role==='system'?'SYSTEM >':'EMMICHY >';const body=document.createElement('span');body.textContent=readableText(item.value,tokenizer);p.append(label,body);messageNodes.set(item,p);return p;
 });
 log.replaceChildren(...nodes,pending);
 log.scrollTop=log.scrollHeight;
}
function add(role,value){
 live='';$('live-body').textContent='';$('live-reply').hidden=true;
 lines.push({role,value});lines=lines.slice(-40);renderConversation();
}
function recordAside(line,pendingState=null){
 if(pendingState){
  pendingState.history=retainAside(pendingState.history,line,{pendingReply:true});
  state.history=pendingState.history.slice(0,-1);
  state.conversation=cleanConversation(pendingState.conversation);
 }else state.history=retainAside(state.history,line);
 add('enny',line);save();
 const p=document.createElement('p');p.textContent=`えみちぃ：${line}`;$('transcript').append(p);
 if($('transcript').children.length>40)$('transcript').firstChild.remove();
}
function openingText(returning=false){const picked=selectOpening(state,returning);state.openingSeen=picked.seen;return picked.text;}
function addOpening(returning=false){const line=openingText(returning);add('enny',line);state.history.push({role:'enny',text:line});save();}
$('send').disabled=true;
loadReadings().then(value=>{tokenizer=value;readingsSettled=true;if(ready&&!session)session={startedAt:Date.now(),turns:0,finished:false};saveSession();renderConversation();if(ready&&!busy)$('send').disabled=false;if(!value)$('status').textContent='読みの辞書を使えないため、原文を交えて表示します。会話は続けられます。';return value;});
if(state.history.length) {for(const h of state.history){add(h.role,h.text);const p=document.createElement('p');p.textContent=`${h.role==='user'?'あなた':'えみちぃ'}：${h.text}`;$('transcript').append(p);}} else {
 add('system','EMMICHY / THE ALMOST CLEVER GAME');
 addOpening();
 add('system','ニホンゴ デ フツウニ ハナシテネ');
}
const img=new Image();img.crossOrigin='anonymous';img.src='assets/emmichy-portrait.png';
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
 const nextLive=readingsSettled?live:'';
 if($('live-body').textContent!==nextLive){$('live-body').textContent=nextLive;$('live-reply').hidden=!nextLive;const log=$('conversation');log.scrollTop=log.scrollHeight;}
 $('terminal-note').textContent=session?.finished?'— END —　コンニチハ デ サイカイ':'アタシ エミチィ　ナンデモ ハナシテネ';
 $('terminal-note').setAttribute('aria-hidden',String(busy));
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
async function endSession(reason='time'){
 if(!ready||ending||busy||session?.finished||state.ended||(!session&&reason!=='idle'))return;
 if(!session)session={startedAt:Date.now(),turns:0,finished:false};
 ending=true;busy=true;$('send').disabled=true;$('reset').disabled=true;$('restart-chat').disabled=true;
 const end=finishSession(state,session,{reason});state=end.state;session=end.session;mood='soft';saveSession();save();
 audioDirector.se.ending();
 const endingDisplay=readableText(end.text,tokenizer);
 for(const c of endingDisplay){live+=c;draw();await wait(32);}
 add('enny',end.text);live='';save();busy=false;ending=false;$('send').disabled=false;$('reset').disabled=false;$('restart-chat').disabled=false;
 const p=document.createElement('p');p.textContent=`えみちぃ：${end.text}。おしまい。`;$('transcript').append(p);
 $('status').textContent='おしまい。「コンニチハ」で、もう一度。';draw();
}
$('talk').addEventListener('submit',async e=>{
 e.preventDefault();if(!ready||busy||composing||!readingsSettled)return;
 const raw=$('entry').value.trim();if(!raw)return;
 const isRestart=state.ended&&/コンニチ[ハワ]|タダイマ|オハヨウ/.test(normalize(raw));
 if(!session||isRestart){session={startedAt:Date.now(),turns:0,finished:false};if(isRestart){lines=[];state.performance={};state.conversation=cleanConversation(null);state.fan={worry:0,excitement:0,lastTopic:''};}saveSession();}
  session.turns++;saveSession();
 busy=true;live='';$('send').disabled=true;$('reset').disabled=true;$('entry').value='';audioDirector.se.send();
 add('user',raw);$('disk').textContent='● DISK ACCESS';
 const before=advancePerformance(state,raw,session.turns);let result=chiikawaReply(normalize(raw),respond(raw,state),undefined,raw);
 if(result.kind==='bye'){const end=finishSession({...result.state,history:result.state.history.slice(0,-1)},session);result.text=end.text;result.state=end.state;session=end.session;}
 before.interests=learnInterests(raw,state.interests);result.state.interests=before.interests;
 result.state.performance=before.performance;result.state.speechStyle=before.speechStyle;
 if(result.kind!=='bye')result.state.conversation=before.conversation;
 const knowledge=selectKnowledge(raw,before);
 const repertoire=chooseRepertoire(raw,before);
 const culture=cultureReply(raw,before,repertoire.intent);
 const fandomReply=culture?.text||repertoire.candidate?.text;
 if(!isRestart&&!state.ended){
  result.state.knowledge=knowledge.memory;
  if(fandomReply&&!/嫌い|キライ|苦手|やめ|ヤメ|以外|イガイ|ばかり|バカリ/.test(raw)&&!['bye','asleep','name','memory','arithmetic','comfort','contradiction','repeat'].includes(result.kind)){
   result.text=fandomReply;result.state.history.at(-1).text=result.text;
  }
 }
 let usedModel=false,locallyReplaced=false,fillerGap=0;
 const gap=!isRestart&&!state.ended&&selectGap(raw,state);
 let prepared=isRestart||state.ended?null:preparedReply(raw,state,session,{gap,culture,repertoire,modelEnabled,kind:result.kind});
 if(prepared?.topic==='greeting'){prepared.text=openingText(true);result.state.openingSeen=state.openingSeen;}
 if(gap)result.state.gap=gap.memory;
 if(prepared){result.text=['everyday','conversation-move','context-name','greeting','island-water','gap','repertoire','culture'].includes(prepared.topic)?prepared.text:fandomReply||prepared.text;result.kind='curated';result.state.history.at(-1).text=result.text;if(/[！!]/.test(result.text))result.mood='excited';}
 if(isRestart){result.text=openingText(true);result.state.openingSeen=state.openingSeen;result.state.history.at(-1).text=result.text;}
 const ruleOnly=isRestart||['curated','bye','asleep','name','memory','arithmetic'].includes(result.kind);
 if(modelEnabled && !ruleOnly && chatAvailable(session)){
  $('status').textContent='';
  const stopFiller=startFiller(()=>{
   const line=chooseFiller(raw,recentFillers);recentFillers=[...recentFillers,line].slice(-6);
   recordAside(line,result.state);draw();
  },{later:()=>{
   const recent=result.state.history.filter(h=>h.role==='enny').slice(-20).map(h=>h.text);
   recordAside(longFiller(raw,recent),result.state);draw();
  }});
  let data;
  try{data=await requestChat(chatEndpoint,raw,before,session,{offline});}
  finally{fillerGap=stopFiller();live='';draw();}
  if(data){result.text=data.text;result.state.history.at(-1).text=data.text;usedModel=true;modelProvider=data.provider;}
 }
 if(!isRestart&&!['bye','asleep','name','memory','arithmetic'].includes(result.kind)){
  const fallback=!usedModel&&!prepared&&!fandomReply?offlineFallback(raw,before,result.kind):null;
  if(fallback){result.text=fallback.text;locallyReplaced=true;}
  const polished=polishReply(result.text,raw,before,repertoire);result.text=polished.text;
  result.state.history.at(-1).text=result.text;
  const replyId=polished.id||prepared?.id||(prepared?.topic==='repertoire'||(!usedModel&&repertoire.candidate&&result.text===repertoire.candidate.text)?repertoire.candidate?.id:null);
  result.state.repertoire=rememberReply(before,result.text,replyId,Boolean(prepared||polished.replaced));
  if(polished.replaced){if(usedModel)session.chatHealth={...session.chatHealth,replaced:(session.chatHealth?.replaced||0)+1};usedModel=false;locallyReplaced=true;}
 }
 session.dialogueUse={ai:(session.dialogueUse?.ai||0)+(usedModel?1:0),bank:(session.dialogueUse?.bank||0)+(!usedModel&&(prepared||locallyReplaced)?1:0)};
 if(result.kind!=='bye')result.state.conversation=noteConversationReply(result.state.conversation,result.text,raw,session.turns);
 state=result.state;mood=result.mood;session.lastMood=mood;saveSession();save();
 await wait(Math.max(fillerGap,300+Math.min(raw.length*10,500)));
 if(mood==='excited')audioDirector.se.excited();else if(mood==='worried')audioDirector.se.worried();else audioDirector.se.reply();
 const replyDisplay=readableText(result.text,tokenizer);
 for(const c of replyDisplay){live+=c;draw();await wait(mood==='excited'?12:mood==='worried'&&c==='\n'?420:22);}
 add('enny',result.text);live='';noteActivity();save();busy=false;$('send').disabled=false;$('reset').disabled=false;
 $('status').textContent=usedModel?`AI会話${modelProvider?' / '+({groq:'Groq',gemini:'Google Gemini','workers-ai':'Cloudflare Workers AI',local:'ローカルAI'}[modelProvider]||modelProvider):''} / ENTER で送信`:locallyReplaced?'用意した会話で調整 / ENTER で送信':prepared?'用意した会話 / ENTER で送信':modelEnabled&&!ruleOnly?'AI失敗→ルール会話 / ENTER で送信':'ルール会話 / ENTER で送信';
 const item=document.createElement('p');item.textContent=`あなた：${raw}。Emmichy：${result.text}`;$('transcript').append(item);if($('transcript').children.length>40)$('transcript').firstChild.remove();
 $('entry').focus();draw();
 if(state.ended){session.finished=true;saveSession();}
 else if(shouldEnd(session)&&!$('entry').value.trim()&&!composing)await endSession();
});
let composing=false;
function noteActivity(){lastActivity=Date.now();idleSequence.touch(lastActivity);}
$('entry').addEventListener('compositionstart',()=>{composing=true;noteActivity();});
$('entry').addEventListener('compositionend',()=>{composing=false;noteActivity();draw();});
$('entry').addEventListener('input',()=>{noteActivity();if(!busy){live='';draw();}});
$('entry').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.isComposing||e.keyCode===229))e.preventDefault();});
let lastActivity=Date.now();
$('entry').addEventListener('keydown',noteActivity);
document.addEventListener('pointerdown',noteActivity);
canvas.addEventListener('click',()=>$('entry').focus());
$('sound').onclick=async()=>{let on;try{on=await audioDirector.toggle();}catch{$('status').textContent='音を開始できません。もう一度音ボタンを押してください。';return;}$('sound').textContent='BGM + SE '+(on?'ON':'OFF');$('sound').setAttribute('aria-pressed',String(on));if(on)audioDirector.se.reply();};
$('help').onclick=()=>{$('instructions').hidden=!$('instructions').hidden;};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.screen-wrap').requestFullscreen();}catch{$('status').textContent='このブラウザでは全画面にできません。';}};
$('export').onclick=()=>{const body=state.history.map(h=>`${h.role==='user'?'YOU':'EMMICHY'}: ${h.text}`).join('\r\n\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+body],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='enny-conversation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
let resetArmed=false,resetTimer;
$('reset').onclick=()=>{if(!resetArmed){resetArmed=true;$('reset-note').textContent=' もう一度押すと記憶が消えます。';resetTimer=setTimeout(()=>{resetArmed=false;$('reset-note').textContent='';},5000);return;}
 clearTimeout(resetTimer);resetArmed=false;$('reset-note').textContent=' 初期化しました。';state=freshState();session=null;saveSession();lines=[];live='';mood='idle';addOpening();$('transcript').replaceChildren();save();draw();};
function showStartChoice(){
 if(busy)return;
 if(ready)saveSession();
 ready=false;$('start-choice').hidden=false;$('talk').hidden=true;$('send').disabled=true;$('entry').disabled=true;
 $('continue').disabled=!state.history.length;
 $('status').textContent='続きから／最初から を選んでください';
 $('continue').focus();
}
function enterConversation(){ready=true;if(!session)session={startedAt:Date.now(),turns:0,finished:false};$('start-choice').hidden=true;$('talk').hidden=false;$('send').disabled=!readingsSettled;$('entry').disabled=false;noteActivity();$('entry').focus();}
$('continue').onclick=()=>{session=resumeSession(session);enterConversation();saveSession();$('status').textContent=state.ended?'おしまい。「最初から」で、もう一度。':'会話を再開しました / ENTER で送信';};
$('new-chat').onclick=()=>{const next=startConversation(state);state=next.state;session=next.session;lines=[];live='';mood='idle';$('transcript').replaceChildren();addOpening(true);enterConversation();save();saveSession();$('status').textContent='新しい会話 / 漢字・ひらがな OK';draw();};
$('restart-chat').onclick=showStartChoice;
if(hadSavedDialogue){ready=false;showStartChoice();}
document.addEventListener('visibilitychange',()=>{if(!ready)return;if(document.hidden)saveSession();else{session=resumeSession(session);noteActivity();saveSession();}});
setInterval(()=>{if(ready&&!document.hidden)saveSession();},5000);
window.addEventListener('pagehide',saveSession);
function setEngineNote(){
 $('engine-note').textContent=(modelEnabled?`定番の一言は用意した台詞、具体的な話や続きはAI会話。接続失敗時はルール会話に戻ります${modelProvider?'（'+modelProvider+'）':''}。`:'無料・通信不要のルール会話。')+` 記憶はこのブラウザ内に保存します。時事ネタの確認日：${checkedAt}。`;
}
setEngineNote();
if(isLocal&&!offline){
 fetch('/api/config').then(r=>r.json()).then(c=>{if(c.localModel){chatEndpoint='/api/chat';modelProvider='local';}setEngineNote();}).catch(()=>{});
}
setInterval(draw,160);setInterval(async()=>{
 if(ready&&readingsSettled&&!document.hidden&&!busy&&!session?.finished&&!state.ended&&!composing){
  const stage=idleSequence.poll(Date.now(),{allowFinish:Boolean(session)&&Date.now()-session.startedAt>=5*60*1000});
  if(stage===3)await endSession('idle');
  else if(stage){recordAside(idleAside(state.history,stage-1));draw();}
 }
},1000);draw();if(ready)$('entry').focus();






