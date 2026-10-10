import {selfReaction,complimentReaction} from './profile.js?v=20261010-fanmemory1';
import {freshState,restoreState,respond,normalize} from './engine.js?v=20261010-fanmemory1';
import {chiikawaReply,checkedAt} from './topics.js?v=20261006-mix1';
import {text,kana} from './font.js?v=20261010-fanmemory1';
import {shouldEnd,finishSession,checkpointSession,resumeSession,startConversation,remainingTime} from './session.js?v=20261010-fanmemory1';
import {noteChiikawa,chiikawaReminder} from './chiikawa-reminder.js?v=20261010-fanmemory1';
import {createAudioDirector,bindAudioLifecycle} from './audio.js?v=20261010-fanmemory1';
import {CHAT_API_URL} from './config.js?v=20261006-mix1';
import {advancePerformance} from './performance.js?v=20261008-humor1';
import {requestChat,chatAvailable,unwantedFanRedirect} from './chat.js?v=20261009-pacing2';
import {readableText,loadReadings} from './readable.js?v=20261010-fanmemory1';
import {selectKnowledge,rememberKnowledge,fanRecovery} from './fandom.js?v=20261010-fanmemory1';
import {selectGap} from './gap.js?v=20261006-mix1';
import {chooseRepertoire,rememberReply,polishReply} from './repertoire.js?v=20261010-fanmemory1';
import {cultureReply} from './culture.js?v=20261009-profile1';
import {chooseFiller,startFiller,longFiller,retainAside,idleAside,createIdleSequence} from './filler.js?v=20261010-fanmemory1';
import {learnInterests,needsFirstModelReply} from './balance.js?v=20261010-fanmemory1';
import {selectOpening,planOpening,openingTiming} from './openings.js?v=20261009-readmenu1';
import {preparedReply} from './routing.js?v=20261010-fanmemory1';
import {cleanConversation,noteConversationReply} from './conversation.js?v=20261008-humor1';
import {offlineFallback} from './fallback.js?v=20261008-finish1';
import {portraitColors} from './portrait-palette.js?v=20261008-portrait3';
import {planContinuation,createContinuation} from './continuation.js?v=20261009-clause1';
import {recognizeName,namedGesture,NAME_REACTION_MS} from './names.js?v=20261010-fanmemory1';
const continuation=createContinuation();
let continuationVersion=0,continuing=false,hadContinuation=false,awaitingOpening=[];
function stopContinuation(clear=false){continuationVersion++;if(clear){continuation.clear();hadContinuation=false;awaitingOpening=[];}if(continuing){live='';draw();}}
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
bindAudioLifecycle(audioDirector);
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
function add(role,value,track=true){
 if(track&&role!=='system')noteChiikawa(session,value);
 if(track&&role!=='system')state.knowledge=rememberKnowledge(state.knowledge,value);
 live='';$('live-body').textContent='';$('live-reply').hidden=true;
 lines.push({role,value});lines=lines.slice(-40);renderConversation();
}
function recordAside(line,pendingState=null){
 if(pendingState){
  pendingState.knowledge=rememberKnowledge(pendingState.knowledge,line);
  pendingState.history=retainAside(pendingState.history,line,{pendingReply:true});
  state.history=pendingState.history.slice(0,-1);
  state.conversation=cleanConversation(pendingState.conversation);
 }else state.history=retainAside(state.history,line);
 add('enny',line);saveSession();save();
 const p=document.createElement('p');p.textContent=`えみちぃ：${line}`;$('transcript').append(p);
 if($('transcript').children.length>40)$('transcript').firstChild.remove();
}
function openingPlan(returning=false){const picked=selectOpening(state,returning);state.openingSeen=picked.seen;return planOpening(picked);}
function addOpening(returning=false){
 const plan=openingPlan(returning);add('enny',plan.first);state.history.push({role:'enny',text:plan.first});save();
 hadContinuation=plan.later.length>0;
 if(readingsSettled)continuation.start(plan.later,Date.now(),openingTiming);else awaitingOpening=plan.later;
}
$('send').disabled=true;
loadReadings().then(value=>{tokenizer=value;readingsSettled=true;if(ready&&!session)session={startedAt:Date.now(),turns:0,finished:false};saveSession();renderConversation();if(awaitingOpening.length){continuation.start(awaitingOpening,Date.now(),openingTiming);awaitingOpening=[];}if(ready&&!busy)$('send').disabled=false;if(!value)$('status').textContent='読みの辞書を使えないため、原文を交えて表示します。会話は続けられます。';return value;});
if(state.history.length) {for(const h of state.history){add(h.role,h.text,false);const p=document.createElement('p');p.textContent=`${h.role==='user'?'あなた':'えみちぃ'}：${h.text}`;$('transcript').append(p);}} else {
 add('system','EMMICHY / THE ALMOST CLEVER GAME');
 addOpening();
 add('system','ニホンゴ デ フツウニ ハナシテネ');
}
const img=new Image();img.crossOrigin='anonymous';img.src='assets/emmichy-nordic-muted-bust-20261008.png';
img.onload=()=>{
 // Native 248x336 indexed eight-color tile, expanded exactly 2x without smoothing.
 portrait=img;draw();
};
img.onerror=()=>{$('status').textContent='人物画像を読み込めません。再読み込みしてください。';};
function draw(){
 $('remaining-time').textContent=remainingTime(session,ready&&!document.hidden?Date.now():session?.lastSavedAt??Date.now());
 ctx.fillStyle='#000';ctx.fillRect(0,0,496,672);
 if(portrait)ctx.drawImage(portrait,0,0,496,672);
 const nextLive=readingsSettled?live:'';
 if($('live-body').textContent!==nextLive){$('live-body').textContent=nextLive;$('live-reply').hidden=!nextLive;const log=$('conversation');log.scrollTop=log.scrollHeight;}
 $('terminal-note').textContent=session?.finished?'— END —　コンニチハ デ サイカイ':'アタシ エミチィ　ナンデモ ハナシテネ';
 $('terminal-note').setAttribute('aria-hidden',String(busy));
 ctx.save();ctx.scale(2,4);
 if(mood==='knowing' && Math.floor(Date.now()/700)%2)text(ctx,'*',230,10,portraitColors[5]);
 if(mood==='worried'){
   ctx.fillStyle=portraitColors[5];ctx.fillRect(229,42,2,2);ctx.fillRect(228,44,4,3);ctx.fillRect(229,47,2,1);
   if(Math.floor(Date.now()/900)%2)kana(ctx,'シーサー...',16,161,portraitColors[5]);
 }
 if(mood==='excited'){text(ctx,'*',225,20,portraitColors[6]);text(ctx,'*',16,90,portraitColors[5]);}
 ctx.restore();
}
function save(){try{localStorage.setItem(key,JSON.stringify(state));saveAvailable=true;}catch{saveAvailable=false;}$('disk').textContent=saveAvailable?'● DISK SAVED':'● MEMORY ONLY';}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function speakParts(parts,speed=22){
 for(let i=0;i<parts.length;i++){
  if(i)await wait(1500);
  live='';
  for(const c of readableText(parts[i],tokenizer)){live+=c;draw();await wait(speed);}
  add('enny',parts[i]);live='';draw();
 }
}
async function endSession(reason='time'){
 if(!ready||ending||busy||session?.finished||state.ended||(!session&&reason!=='idle'))return;
 if(!session)session={startedAt:Date.now(),turns:0,finished:false};
 stopContinuation(true);ending=true;busy=true;$('send').disabled=true;$('reset').disabled=true;$('restart-chat').disabled=true;
 const end=finishSession(state,session,{reason});state=end.state;session=end.session;mood='soft';saveSession();save();
 audioDirector.se.ending();
 await speakParts(end.parts,32);
 save();busy=false;ending=false;$('send').disabled=false;$('reset').disabled=false;$('restart-chat').disabled=false;
 const p=document.createElement('p');p.textContent=`えみちぃ：${end.text}。おしまい。`;$('transcript').append(p);
 $('status').textContent='おしまい。「コンニチハ」で、もう一度。';draw();
}
$('talk').addEventListener('submit',async e=>{
 e.preventDefault();if(!ready||busy||composing||!readingsSettled)return;
 const raw=$('entry').value.trim();if(!raw)return;
 stopContinuation(true);
 const isRestart=state.ended&&/コンニチ[ハワ]|タダイマ|オハヨウ/.test(normalize(raw));
 if(!session||isRestart){session={startedAt:Date.now(),turns:0,finished:false};if(isRestart){lines=[];state.performance={};state.conversation=cleanConversation(null);state.fan={worry:0,excitement:0,lastTopic:''};}saveSession();}
  session.turns++;saveSession();
 busy=true;live='';$('send').disabled=true;$('reset').disabled=true;$('entry').value='';audioDirector.se.send();
 add('user',raw);$('disk').textContent='● DISK ACCESS';
 const before=advancePerformance(state,raw,session.turns);let result=chiikawaReply(normalize(raw),respond(raw,state),undefined,raw);
 let farewellParts=null;
 if(result.kind==='bye'){const end=finishSession({...result.state,history:result.state.history.slice(0,-1)},session);result.text=end.text;result.state=end.state;session=end.session;farewellParts=end.parts;}
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
 const firstModel=needsFirstModelReply(session,{enabled:modelEnabled,kind:result.kind,topic:prepared?.topic,restart:isRestart});
 let greetingPlan=null;
 if(prepared?.topic==='greeting'){greetingPlan=openingPlan(true);prepared.text=greetingPlan.first;result.state.openingSeen=state.openingSeen;}
 if(gap)result.state.gap=gap.memory;
 if(prepared){result.text=['compliment','japan-place','deflection','fandom-decline','profile','chiikawa-name','everyday','conversation-move','context-name','greeting','island-water','gap','repertoire','culture'].includes(prepared.topic)?prepared.text:fandomReply||prepared.text;result.kind='curated';result.state.history.at(-1).text=result.text;if(/[！!]/.test(result.text))result.mood='excited';}
 if(isRestart){greetingPlan=openingPlan(true);result.text=greetingPlan.first;result.state.openingSeen=state.openingSeen;result.state.history.at(-1).text=result.text;}
 const ruleOnly=isRestart||(['curated','bye','asleep','name','memory','arithmetic'].includes(result.kind)&&!firstModel);
 let heard=['bye','asleep','name','memory','arithmetic','comfort','contradiction'].includes(result.kind)||isRestart||prepared?.topic==='profile'?null:recognizeName(raw,{reading:readableText(raw,tokenizer),state:before});
 const self=['bye','asleep','comfort','contradiction'].includes(result.kind)||isRestart||prepared?.topic==='deflection'?null:complimentReaction(raw,before)||selfReaction(raw,before);
 if(self||prepared?.topic==='deflection')heard=null;
 if(self?.affection){result.mood='excited';mood='excited';}
 if(prepared?.gesture){await wait(NAME_REACTION_MS);recordAside(prepared.gesture,result.state);draw();}
 if(self){await wait(NAME_REACTION_MS);recordAside(self.gesture,result.state);draw();}
 if(heard?.work==='chiikawa'&&!heard.decline&&unwantedFanRedirect('ちいかわ',raw,before))heard=null;
 if(heard?.soft&&recentFillers.includes(namedGesture(heard)))heard=null;
 if(heard){await wait(NAME_REACTION_MS);const line=namedGesture(heard);recordAside(line,result.state);recentFillers=[...recentFillers,line].slice(-6);draw();}
 if(modelEnabled && !ruleOnly && chatAvailable(session)){
  $('status').textContent='';
  const stopFiller=startFiller(()=>{
   const line=chooseFiller(raw,recentFillers,{match:heard,state:before});recentFillers=[...recentFillers,line].slice(-6);
   recordAside(line,result.state);draw();
  },{initialDelay:heard||self?5000:2000,later:()=>{
   const recent=result.state.history.filter(h=>h.role==='enny').slice(-20).map(h=>h.text);
   recordAside(longFiller(raw,recent,before),result.state);draw();
  }});
  let data;
  try{data=await requestChat(chatEndpoint,raw,before,session,{offline});}
  finally{fillerGap=stopFiller();live='';draw();}
  if(data){result.text=data.text;result.state.history.at(-1).text=data.text;usedModel=true;modelProvider=data.provider;}
 }
 if(!isRestart&&!['bye','asleep','name','memory','arithmetic'].includes(result.kind)){
  const recovered=!unwantedFanRedirect('ちいかわ',raw,before)?fanRecovery(raw,before,usedModel||prepared||fandomReply?result.text:''):null;
  const fallback=!usedModel&&!prepared&&!fandomReply&&!recovered?offlineFallback(raw,before,result.kind):null;
  if(recovered){if(usedModel)usedModel=false;result.text=recovered;locallyReplaced=true;result.mood='excited';}
  if(fallback){result.text=fallback.text;locallyReplaced=true;}
  const polished=polishReply(result.text,raw,before,recovered||greetingPlan||['profile','compliment','japan-place','chiikawa-name'].includes(prepared?.topic)?null:repertoire);result.text=polished.text;
  result.state.history.at(-1).text=result.text;
  const replyId=polished.id||prepared?.id||(prepared?.topic==='repertoire'||(!usedModel&&repertoire.candidate&&result.text===repertoire.candidate.text)?repertoire.candidate?.id:null);
  result.state.repertoire=rememberReply(before,result.text,replyId,Boolean(prepared||polished.replaced));
  if(polished.replaced){if(usedModel)session.chatHealth={...session.chatHealth,replaced:(session.chatHealth?.replaced||0)+1};usedModel=false;locallyReplaced=true;}
 }
 if(self?.thanks&&!/うれし|嬉し/.test(result.text)){result.text+=` ${self.thanks}`;result.state.history.at(-1).text=result.text;}
 if(knowledge.work==='chiikawa'&&!heard?.decline&&!['bye','asleep','name','memory','arithmetic','comfort','contradiction'].includes(result.kind)&&!/つらい|ツライ|苦しい|病気|事故|相談|亡く|死に|嫌い|キライ|苦手|ヤメ|やめ|以外|イガイ/.test(raw))result.mood='excited';
 noteChiikawa(session,result.text);
 const paced=greetingPlan||(['bye','asleep','name','memory','arithmetic','contradiction'].includes(result.kind)||isRestart?{first:result.text,later:[]}:planContinuation(result.text,raw,before,{display:s=>readableText(s,tokenizer),tokenizer}));
 result.text=paced.first;result.state.history.at(-1).text=result.text;
 session.dialogueUse={ai:(session.dialogueUse?.ai||0)+(usedModel?1:0),bank:(session.dialogueUse?.bank||0)+(!usedModel&&(prepared||locallyReplaced)?1:0)};
 if(result.kind!=='bye')result.state.conversation=noteConversationReply(result.state.conversation,result.text,raw,session.turns);
 state=result.state;mood=result.mood;session.lastMood=mood;saveSession();save();
 await wait(Math.max(fillerGap,300+Math.min(raw.length*10,500)));
 if(mood==='excited')audioDirector.se.excited();else if(mood==='worried')audioDirector.se.worried();else audioDirector.se.reply();
 if(farewellParts)await speakParts(farewellParts);
 else{
  const replyDisplay=readableText(result.text,tokenizer);
  for(const c of replyDisplay){live+=c;draw();await wait(mood==='excited'?12:mood==='worried'&&c==='\n'?420:22);}
  add('enny',result.text);live='';
 }
 noteActivity();save();busy=false;$('send').disabled=false;$('reset').disabled=false;
 continuation.start(paced.later,Date.now(),greetingPlan?openingTiming:paced.timing);hadContinuation=paced.later.length>0;
 $('status').textContent=usedModel?`AI会話${modelProvider?' / '+({groq:'Groq',gemini:'Google Gemini','workers-ai':'Cloudflare Workers AI',local:'ローカルAI'}[modelProvider]||modelProvider):''} / ENTER で送信`:locallyReplaced?'用意した会話で調整 / ENTER で送信':prepared?'用意した会話 / ENTER で送信':modelEnabled&&!ruleOnly?'AI失敗→ルール会話 / ENTER で送信':'ルール会話 / ENTER で送信';
 const item=document.createElement('p');item.textContent=`あなた：${raw}。Emmichy：${result.text}`;$('transcript').append(item);if($('transcript').children.length>40)$('transcript').firstChild.remove();
 $('entry').focus();draw();
 if(state.ended){session.finished=true;saveSession();}
 else if(shouldEnd(session)&&!$('entry').value.trim()&&!composing)await endSession();
});
let composing=false;
function noteActivity(){lastActivity=Date.now();idleSequence.touch(lastActivity);}
function noteTyping(){continuation.typed(Date.now());stopContinuation();noteActivity();}
$('entry').addEventListener('compositionstart',()=>{composing=true;noteTyping();});
$('entry').addEventListener('compositionend',()=>{composing=false;noteTyping();draw();});
$('entry').addEventListener('input',()=>{noteTyping();if(!busy){live='';draw();}});
$('entry').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.isComposing||e.keyCode===229))e.preventDefault();});
let lastActivity=Date.now();
$('entry').addEventListener('keydown',noteTyping);
document.addEventListener('pointerdown',noteActivity);
const activateAudio=e=>{if(e.target?.closest?.('#sound'))return;void audioDirector.activate().catch(()=>{});};
document.addEventListener('pointerdown',activateAudio,{capture:true});
document.addEventListener('keydown',activateAudio,{capture:true});
canvas.addEventListener('click',()=>$('entry').focus());
$('sound').onclick=async()=>{let on;try{on=await audioDirector.toggle();}catch{$('status').textContent='音を開始できません。もう一度音ボタンを押してください。';return;}$('sound').textContent='BGM + SE '+(on?'ON':'OFF');$('sound').setAttribute('aria-pressed',String(on));if(on)audioDirector.se.reply();};
$('help').onclick=()=>{$('instructions').hidden=!$('instructions').hidden;};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.screen-wrap').requestFullscreen();}catch{$('status').textContent='このブラウザでは全画面にできません。';}};
$('export').onclick=()=>{const body=state.history.map(h=>`${h.role==='user'?'YOU':'EMMICHY'}: ${h.text}`).join('\r\n\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+body],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='enny-conversation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
let resetArmed=false,resetTimer;
$('reset').onclick=()=>{if(!resetArmed){resetArmed=true;$('reset-note').textContent=' もう一度押すと記憶が消えます。';resetTimer=setTimeout(()=>{resetArmed=false;$('reset-note').textContent='';},5000);return;}
 stopContinuation(true);clearTimeout(resetTimer);resetArmed=false;$('reset-note').textContent=' 初期化しました。';state=freshState();session=readingsSettled?{startedAt:Date.now(),turns:0,finished:false}:null;saveSession();lines=[];live='';mood='idle';addOpening();$('transcript').replaceChildren();save();draw();};
function showStartChoice(){
 if(busy)return;
 stopContinuation(true);
 if(ready)saveSession();
 ready=false;$('start-choice').hidden=false;$('talk').hidden=true;$('send').disabled=true;$('entry').disabled=true;
 $('continue').disabled=!state.history.length;
 $('status').textContent='続きから／最初から を選んでください';
 $('continue').focus();
}
function enterConversation(){ready=true;if(!session)session={startedAt:Date.now(),turns:0,finished:false};$('start-choice').hidden=true;$('talk').hidden=false;$('send').disabled=!readingsSettled;$('entry').disabled=false;noteActivity();$('entry').focus();}
$('continue').onclick=()=>{session=resumeSession(session);enterConversation();saveSession();$('status').textContent=state.ended?'おしまい。「最初から」で、もう一度。':'会話を再開しました / ENTER で送信';};
$('new-chat').onclick=()=>{const next=startConversation(state);state=next.state;session=next.session;lines=[];live='';mood='idle';$('transcript').replaceChildren();addOpening();enterConversation();save();saveSession();$('status').textContent='新しい会話 / 漢字・ひらがな OK';draw();};
$('restart-chat').onclick=showStartChoice;
if(hadSavedDialogue){ready=false;showStartChoice();}
document.addEventListener('visibilitychange',()=>{if(!ready)return;stopContinuation();if(document.hidden)saveSession();else{session=resumeSession(session);continuation.typed(Date.now());noteActivity();saveSession();}});
setInterval(()=>{if(ready&&!document.hidden)saveSession();},5000);
window.addEventListener('pagehide',saveSession);
function setEngineNote(){
 $('engine-note').textContent=(modelEnabled?`一回の会話で、最初の通常のやり取りはAI会話を優先します。定番の一言は用意した台詞も使います。接続失敗時はルール会話に戻ります${modelProvider?'（'+modelProvider+'）':''}。`:'無料・通信不要のルール会話。')+` 記憶はこのブラウザ内に保存します。時事ネタの確認日：${checkedAt}。`;
}
setEngineNote();
if(isLocal&&!offline){
 fetch('/api/config').then(r=>r.json()).then(c=>{if(c.localModel){chatEndpoint='/api/chat';modelProvider='local';}setEngineNote();}).catch(()=>{});
}
setInterval(draw,160);setInterval(async()=>{
 if(ready&&readingsSettled&&!document.hidden&&!busy&&!continuing&&!session?.finished&&!state.ended&&!composing){
  if(continuation.pending){
   const line=continuation.peek(Date.now(),{composing});if(!line)return;
   const version=continuationVersion;continuing=true;live='';
   for(const c of readableText(line,tokenizer)){
    if(version!==continuationVersion||busy||document.hidden||!ready||composing){continuing=false;draw();return;}
    live+=c;draw();await wait(22);
   }
   if(version===continuationVersion&&!busy&&!document.hidden&&ready&&!composing){recordAside(line);continuation.spoken(Date.now());noteActivity();}
   live='';continuing=false;draw();return;
  }
  const reminder=Date.now()-lastActivity>=6000&&!$('entry').value.trim()?chiikawaReminder(state,session):null;
  if(reminder){
   const plan=planContinuation(reminder,'',state,{display:s=>readableText(s,tokenizer),tokenizer});
   session.chiikawaReminders=(session.chiikawaReminders||0)+1;
   recordAside(plan.first);continuation.start(plan.later,Date.now(),plan.timing);hadContinuation=plan.later.length>0;noteActivity();draw();return;
  }
  const stage=idleSequence.poll(Date.now(),{allowFinish:Boolean(session)&&Date.now()-session.startedAt>=5*60*1000});
  if(stage===3)await endSession('idle');
  else if(stage&&!hadContinuation){recordAside(idleAside(state.history,stage-1));draw();}
 }
},250);draw();if(ready)$('entry').focus();






