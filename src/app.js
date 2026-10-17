import {bindMobileViewport,bindChatViewport} from './mobile-viewport.js?v=20261014-face1';
import {bindBrowserLauncher} from './browser-launcher.js?v=20261014-face1';
import {selfReaction,complimentReaction} from './profile.js?v=20261014-view1';
import {freshState,restoreState,respond,normalize} from './engine.js?v=20261017-quota1';
import {chiikawaReply,checkedAt} from './topics.js?v=20261014-view1';
import {text,kana} from './font.js?v=20261017-quota1';
import {shouldEnd,finishSession,checkpointSession,resumeSession,startConversation,remainingTime} from './session.js?v=20261014-view1';
import {noteChiikawa,chiikawaReminder} from './chiikawa-reminder.js?v=20261014-view1';
import {createAudioDirector,bindAudioLifecycle} from './audio.js?v=20261014-view1';
import {CHAT_API_URL} from './config.js?v=20261014-view1';
import {advancePerformance} from './performance.js?v=20261014-view1';
import {requestChat,chatAvailable,unwantedFanRedirect} from './chat.js?v=20261017-quota1';
import {readableText,loadReadings} from './readable.js?v=20261014-view1';
import {selectKnowledge,rememberKnowledge} from './fandom.js?v=20261014-view1';
import {selectGap} from './gap.js?v=20261014-view1';
import {chooseRepertoire,rememberReply} from './repertoire.js?v=20261017-quota1';
import {cultureReply} from './culture.js?v=20261014-view1';
import {chooseFiller,startFiller,longFiller,retainAside,idleAside,createIdleSequence} from './filler.js?v=20261017-quota1';
import {learnInterests,shouldRequestModel,noteDialogueMix} from './balance.js?v=20261014-view1';
import {selectOpening,planOpening,openingTiming} from './openings.js?v=20261014-view1';
import {preparedReply} from './routing.js?v=20261017-quota1';
import {cleanConversation,noteConversationReply} from './conversation.js?v=20261014-view1';
import {offlineFallback} from './fallback.js?v=20261014-view1';
import {portraitColors} from './portrait-palette.js?v=20261014-view1';
import {planContinuation,createContinuation} from './continuation.js?v=20261017-quota1';
import {recognizeName,namedGesture,NAME_REACTION_MS} from './names.js?v=20261014-view1';
import {substantiveHistory,appendDialogue} from './dialogue-history.js?v=20261014-view1';
import {directReply} from './dialogue-director.js?v=20261017-quota1';
import {cleanPlayerMemory,nameQuestion,notePlayerQuestion,choosePlayerQuestion,answerPlayerQuestion,playerRecall,playerCreationReply,notePlayerReply} from './player-memory.js?v=20261014-view1';
import {conversationRepair,updateDialogueControl,waitForPlayer} from './conversation-repair.js?v=20261014-view1';
import {personalFanReply} from './chiikawa-theme.js?v=20261017-quota1';
import {specialistPacket,noteSpecialistDelivery} from './specialist.js?v=20261017-quota1';
const continuation=createContinuation();
let continuationVersion=0,continuing=false,hadContinuation=false,awaitingOpening=[];
function stopContinuation(clear=false){continuationVersion++;if(clear){continuation.clear();hadContinuation=false;awaitingOpening=[];}if(continuing){live='';draw();}}
let recentFillers=[];
const idleSequence=createIdleSequence();
let tokenizer=null;
let readingsSettled=false;
const $=id=>document.getElementById(id),canvas=$('screen'),ctx=canvas.getContext('2d',{willReadFrequently:true});
// Keep the mobile game anchored to the visible area above the keyboard.
bindMobileViewport();
bindChatViewport($('conversation'));
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
function saveSession(){if(ready&&session)Object.assign(session,checkpointSession(session));try{localStorage.setItem('emmichy-session',JSON.stringify(session));sessionStorage.setItem('emmichy-session',JSON.stringify(session));}catch{}}
function resumeCurrentSession(){const next=resumeSession(session);if(session&&next)Object.assign(session,next);else session=next;}
try {state=restoreState(JSON.parse(localStorage.getItem(key)));}catch{saveAvailable=false;}
state.dialogue=substantiveHistory(state);
const readable=value=>readableText(value,tokenizer,{protectedNames:[state.playerMemory?.nickname||state.name]});
const hadSavedDialogue=state.history.length>0;
let lines=[];
const messageNodes=new WeakMap();
function renderConversation(){
 const log=$('conversation'),pending=$('live-reply');
 if(!readingsSettled)return;
 const nodes=lines.map(item=>{
  const name=state.playerMemory?.nickname||state.name;
  if(messageNodes.has(item)){const node=messageNodes.get(item);if(item.displayName!==name){node.children[1].textContent=readable(item.value);item.displayName=name;}return node;}
  item.displayName=name;
  const p=document.createElement('p');p.className='message '+item.role;const label=document.createElement('span');label.className='speaker';label.textContent=item.role==='user'?'YOU >':item.role==='system'?'SYSTEM >':'EMMICHY >';const body=document.createElement('span');body.textContent=readable(item.value);p.append(label,body);messageNodes.set(item,p);return p;
 });
 log.replaceChildren(...nodes,pending);
 log.scrollTop=log.scrollHeight;
}
function add(role,value,track=true){
 if(track&&role==='enny')state.specialist=noteSpecialistDelivery(state.specialist,value,state.dialogue);
 if(track&&role==='enny'){state.playerMemory=notePlayerReply(state.playerMemory,value);notePlayerQuestion(value,session);}
 if(track&&role!=='system')noteChiikawa(session,value);
 if(track&&role!=='system')state.knowledge=rememberKnowledge(state.knowledge,value);
 live='';$('live-body').textContent='';$('live-reply').hidden=true;
 lines.push({role,value});lines=lines.slice(-40);renderConversation();
}
function recordAside(line,pendingState=null,{substantive=!pendingState}={}){
 if(pendingState){
  pendingState.knowledge=rememberKnowledge(pendingState.knowledge,line);
  pendingState.history=retainAside(pendingState.history,line,{pendingReply:true});
  state.history=pendingState.history.slice(0,-1);
  if(substantive)appendDialogue(pendingState,'enny',line);
  state.dialogue=substantiveHistory(pendingState);
  state.conversation=cleanConversation(pendingState.conversation);
 }else {appendDialogue(state,'enny',line);state.history=retainAside(state.history,line);}
 add('enny',line);saveSession();save();
 const p=document.createElement('p');p.textContent=`えみちぃ：${line}`;$('transcript').append(p);
 if($('transcript').children.length>40)$('transcript').firstChild.remove();
}
function openingPlan(returning=false){const picked=selectOpening(state,returning);state.openingSeen=picked.seen;const plan=planOpening(picked);if(!returning){plan.later=['アタシ、エミチィ。日本語を勉強してるの。ちいかわが大好き！',nameQuestion];}return plan;}
function addOpening(returning=false){
 const plan=openingPlan(returning);add('enny',plan.first);appendDialogue(state,'enny',plan.first);state.history.push({role:'enny',text:plan.first});save();
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
  for(const c of readable(parts[i])){live+=c;draw();await wait(speed);}
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
 const before=advancePerformance({...state,history:substantiveHistory(state)},raw,session.turns);let result=chiikawaReply(normalize(raw),respond(raw,state),undefined,raw);
 before.heardHistory=state.history.slice(-12);
 before.dialogueControl=updateDialogueControl(state.dialogueControl,raw);result.state.dialogueControl=before.dialogueControl;
 const repair=conversationRepair(raw,before);
 if(repair)session.pendingQuestion=null;
 if(repair&&!session.feedbackGraceUsed&&Date.now()-session.startedAt>=270000){session.feedbackUntil=Math.min(Date.now()+45000,session.startedAt+360000);session.feedbackGraceUsed=true;}
 const canRemember=!state.ended&&!session?.finished||isRestart;
 const player=!canRemember||['bye','asleep'].includes(result.kind)?{memory:cleanPlayerMemory(state.playerMemory)}:answerPlayerQuestion(state.playerMemory,session,raw);
 result.state.playerMemory=player.memory;
 if(player.name!==undefined)result.state.name=player.name;
 const recall=canRemember?playerRecall(player.memory,raw):null;
 const creation=canRemember?playerCreationReply(player.memory,state.playerMemory,raw):null;
 before.playerMemory=player.memory;
 if(player.reply||recall){result.text=player.reply||recall;result.kind='memory';result.state.history.at(-1).text=result.text;}
 result.state.dialogue=isRestart?[]:substantiveHistory(before);
 appendDialogue(result.state,'user',raw);
 let farewellParts=null;
 if(result.kind==='bye'){const end=finishSession({...result.state,history:result.state.history.slice(0,-1)},session);result.text=end.text;result.state=end.state;session=end.session;farewellParts=end.parts;}
 before.interests=learnInterests(raw,state.interests);result.state.interests=before.interests;
 result.state.performance=before.performance;result.state.speechStyle=before.speechStyle;
 if(result.kind!=='bye')result.state.conversation=before.conversation;
 const knowledge=selectKnowledge(raw,before);
 const specialist=specialistPacket(raw,before);
 before.specialist=specialist.memory;result.state.specialist=specialist.memory;
 const repertoire=chooseRepertoire(raw,before);
 const culture=cultureReply(raw,before,repertoire.intent);
 const fandomReply=culture?.text||repertoire.candidate?.text;
 if(!isRestart&&!state.ended){
  result.state.knowledge=knowledge.memory;
  if(fandomReply&&!/嫌い|キライ|苦手|やめ|ヤメ|以外|イガイ|ばかり|バカリ/.test(raw)&&!['bye','asleep','name','memory','arithmetic','comfort','contradiction','repeat'].includes(result.kind)){
   result.text=fandomReply;result.state.history.at(-1).text=result.text;
  }
 }
 let usedModel=false,locallyReplaced=false,fillerGap=0,replySource='authored';
 const gap=!isRestart&&!state.ended&&selectGap(raw,state);
 let prepared=isRestart||state.ended?null:preparedReply(raw,state,session,{gap,culture,repertoire,modelEnabled,kind:result.kind});
 if(repair&&!isRestart&&result.kind!=='bye'){
  prepared=repair;result.text=repair.text;result.state.history.at(-1).text=repair.text;
  before.dialogueControl.quiet=true;result.state.dialogueControl.quiet=true;
  result.state.dialogueControl.lastIntent=repair.intent;result.state.dialogueControl.lastWord=repair.word||'';
 }
 if(player.reply||recall)prepared={topic:'player-memory',text:result.text};
 else if(creation&&!['bye','asleep'].includes(result.kind)&&prepared?.topic!=='deflection')prepared={topic:'player-creation',text:creation};
 const requestModel=shouldRequestModel(session,{enabled:modelEnabled,kind:result.kind,topic:prepared?.topic,restart:isRestart,fixedIdentity:prepared?.id==='profile:home'});
 let greetingPlan=null;
 if(prepared?.topic==='greeting'){greetingPlan=openingPlan(true);prepared.text=greetingPlan.first;result.state.openingSeen=state.openingSeen;}
 if(gap)result.state.gap=gap.memory;
 if(prepared){result.text=['conversation-repair','player-memory','player-creation','japanese-word','compliment','japan-place','deflection','fandom-decline','profile','chiikawa-name','everyday','conversation-move','context-name','greeting','island-water','gap','repertoire','culture'].includes(prepared.topic)?prepared.text:fandomReply||prepared.text;result.kind=state.ended&&!isRestart?'asleep':prepared.topic==='player-memory'?'memory':'curated';result.state.history.at(-1).text=result.text;if(/[！!]/.test(result.text))result.mood='excited';}
 if(isRestart){greetingPlan=openingPlan(true);result.text=greetingPlan.first;result.state.openingSeen=state.openingSeen;result.state.history.at(-1).text=result.text;}
 const ruleOnly=!requestModel;
 let heard=['bye','asleep','name','memory','arithmetic','comfort','contradiction'].includes(result.kind)||isRestart||['conversation-repair','fandom-decline','profile','player-creation'].includes(prepared?.topic)?null:recognizeName(raw,{reading:readable(raw),state:before});
 const self=['bye','asleep','comfort','contradiction'].includes(result.kind)||isRestart||['conversation-repair','deflection'].includes(prepared?.topic)||personalFanReply(raw,before)?null:complimentReaction(raw,before)||selfReaction(raw,before);
 if(self||prepared?.topic==='deflection')heard=null;
 if(self?.affection){result.mood='excited';mood='excited';}
 // Generation overlaps the human pause before the first named reaction.
 const modelTask=modelEnabled&&!ruleOnly&&chatAvailable(session)?requestChat(chatEndpoint,raw,before,session,{offline}):null;
 if(prepared?.gesture){await wait(NAME_REACTION_MS);recordAside(prepared.gesture,result.state);draw();}
 if(self){await wait(NAME_REACTION_MS);recordAside(self.gesture,result.state);draw();}
 if(heard?.decline)heard=null;
 if(heard?.work==='chiikawa'&&unwantedFanRedirect('ちいかわ',raw,before))heard=null;
 if(heard?.work==='chiikawa'&&heard.name===state.specialist?.subject)heard=null;
 if(heard?.soft&&recentFillers.includes(namedGesture(heard)))heard=null;
 if(heard){await wait(NAME_REACTION_MS);const line=namedGesture(heard);recordAside(line,result.state);recentFillers=[...recentFillers,line].slice(-6);draw();}
 if(modelTask){
  $('status').textContent='';
  const stopFiller=startFiller(index=>{
   if(specialist.active&&index>0)return;
   const recent=result.state.history.filter(h=>h.role==='enny').slice(-20).map(h=>h.text);
   const line=specialist.active?'あの話、アタシも考えてる。':index===1?planContinuation(longFiller(raw,recent,before),'',before,{display:s=>readable(s),tokenizer}).first:chooseFiller(raw,recentFillers,{match:heard,state:before});recentFillers=[...recentFillers,line].slice(-6);
   recordAside(line,result.state,{substantive:!specialist.active&&index===1});draw();
  },{initialDelay:2000});
  let data;
  try{data=await modelTask;}
  finally{fillerGap=stopFiller();live='';draw();}
  if(data){result.text=data.text;result.state.history.at(-1).text=data.text;replySource=data.source;usedModel=data.source!=='authored';modelProvider=data.provider;}
 }
 if(!isRestart&&!['bye','asleep','name','memory','arithmetic'].includes(result.kind)&&!(!usedModel&&prepared?.topic==='player-creation')){
  const fallback=!usedModel&&!prepared&&!fandomReply?offlineFallback(raw,before,result.kind):null;
  if(fallback){result.text=fallback.text;locallyReplaced=true;}
  const polished=directReply(result.text,raw,before,{source:replySource,choice:greetingPlan||['profile','compliment','japan-place','chiikawa-name'].includes(prepared?.topic)?null:repertoire,allowBridge:!greetingPlan&&!['profile','compliment','deflection','fandom-decline'].includes(prepared?.topic)});
  result.text=polished.text;replySource=polished.source;
  if(polished.recovered){locallyReplaced=true;result.mood='excited';}
  result.state.history.at(-1).text=result.text;
  const replyId=polished.id||prepared?.id||(prepared?.topic==='repertoire'||(!usedModel&&repertoire.candidate&&result.text===repertoire.candidate.text)?repertoire.candidate?.id:null);
  result.state.repertoire=rememberReply(before,result.text,replyId,Boolean(prepared||polished.replaced));
  if(polished.replaced||replySource==='authored'&&usedModel){if(usedModel)session.chatHealth={...session.chatHealth,replaced:(session.chatHealth?.replaced||0)+1};usedModel=false;locallyReplaced=true;}
 }
 if(self?.thanks&&!/うれし|嬉し/.test(result.text)){result.text+=` ${self.thanks}`;result.state.history.at(-1).text=result.text;if(replySource==='llm')replySource='mixed';}
 if(!repair&&knowledge.work==='chiikawa'&&!heard?.decline&&!['bye','asleep','name','memory','arithmetic','comfort','contradiction'].includes(result.kind)&&!unwantedFanRedirect('ちいかわ',raw,before)&&!/つらい|ツライ|苦しい|病気|事故|相談|亡く|死に/.test(raw))result.mood='excited';
 noteChiikawa(session,result.text);
 const paced=greetingPlan||(['bye','asleep','name','arithmetic','contradiction'].includes(result.kind)||isRestart?{first:result.text,later:[]}:planContinuation(result.text,raw,before,{display:s=>readable(s),tokenizer,maxUnits:before.dialogueControl.concise?40:60,enthusiastic:knowledge.work==='chiikawa'&&result.mood==='excited'}));
 if(replySource==='llm'&&paced.later.some(line=>!result.text.includes(line)))replySource='mixed';
 result.text=paced.first;result.state.history.at(-1).text=result.text;
 // Keep the selected reply pending until its first displayed beat completes.
 // Autosave/reload during animation must not invent a completed assistant turn.
 const pendingReply=result.kind==='bye'?null:result.state.history.pop();
 state=result.state;mood=result.mood;session.lastMood=mood;saveSession();save();
 await wait(Math.max(fillerGap,300+Math.min(raw.length*10,500)));
 if(mood==='excited')audioDirector.se.excited();else if(mood==='worried')audioDirector.se.worried();else audioDirector.se.reply();
 if(farewellParts)await speakParts(farewellParts);
 else{
  const replyDisplay=readable(result.text);
  for(const c of replyDisplay){live+=c;draw();await wait(mood==='excited'?12:mood==='worried'&&c==='\n'?420:22);}
  add('enny',result.text);live='';
 }
 if(pendingReply)state.history.push(pendingReply);appendDialogue(state,'enny',result.text);
 session.replyTrace=[...(Array.isArray(session.replyTrace)?session.replyTrace:[]),{turn:session.turns,input:raw,reply:[result.text,...paced.later].join(' '),topic:prepared?.topic||result.kind,source:replySource,modelRequested:Boolean(modelTask),outcome:modelTask?session.chatHealth?.lastOutcome:'local',provider:modelTask?modelProvider:null,repair:repair?.id||null}].slice(-24);
 session.replyOrigins={...session.replyOrigins,[replySource]:(session.replyOrigins?.[replySource]||0)+1};
 session.dialogueUse={ai:(session.dialogueUse?.ai||0)+(usedModel?1:0),bank:(session.dialogueUse?.bank||0)+(!usedModel&&(prepared||locallyReplaced)?1:0)};
 noteDialogueMix(session,{usedModel,usedBank:Boolean(!usedModel&&(prepared||locallyReplaced)),topic:prepared?.topic,kind:result.kind,restart:isRestart});
 if(result.kind!=='bye')state.conversation=noteConversationReply(state.conversation,result.text,raw,session.turns);
 noteActivity();saveSession();save();busy=false;$('send').disabled=false;$('reset').disabled=false;
 continuation.start(paced.later,Date.now(),greetingPlan?openingTiming:paced.timing);hadContinuation=paced.later.length>0;
 $('status').textContent=usedModel?`AI会話${modelProvider?' / '+({groq:'Groq',gemini:'Google Gemini','workers-ai':'Cloudflare Workers AI',local:'ローカルAI'}[modelProvider]||modelProvider):''} / ENTER で送信`:locallyReplaced?'用意した会話で調整 / ENTER で送信':prepared?'用意した会話 / ENTER で送信':modelEnabled&&!ruleOnly?'AI失敗→ルール会話 / ENTER で送信':'ルール会話 / ENTER で送信';
 const item=document.createElement('p');item.textContent=`あなた：${raw}。Emmichy：${result.text}`;$('transcript').append(item);if($('transcript').children.length>40)$('transcript').firstChild.remove();
 $('entry').focus({preventScroll:true});draw();
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
canvas.addEventListener('click',()=>$('entry').focus({preventScroll:true}));
$('sound').onclick=async()=>{let on;try{on=await audioDirector.toggle();}catch{$('status').textContent='音を開始できません。もう一度音ボタンを押してください。';return;}$('sound').textContent='BGM + SE '+(on?'ON':'OFF');$('sound').setAttribute('aria-pressed',String(on));if(on)audioDirector.se.reply();};
$('help').onclick=()=>{$('instructions').hidden=!$('instructions').hidden;};
let settingsOpen=false;
function setSettings(open){settingsOpen=open;$('settings-panel').setAttribute('data-open',String(open));$('settings-toggle').setAttribute('aria-expanded',String(open));}
$('settings-toggle').onclick=()=>setSettings(!settingsOpen);
$('settings-close').onclick=()=>{setSettings(false);$('settings-toggle').focus({preventScroll:true});};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&settingsOpen){setSettings(false);$('settings-toggle').focus({preventScroll:true});}});
document.addEventListener('click',e=>{if(settingsOpen&&!e.target?.closest?.('#settings-panel,#settings-toggle'))setSettings(false);});
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.screen-wrap').requestFullscreen();}catch{$('status').textContent='このブラウザでは全画面にできません。';}};
$('export').onclick=()=>{const body=state.history.map(h=>`${h.role==='user'?'YOU':'EMMICHY'}: ${h.text}`).join('\r\n\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+body],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='enny-conversation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('export-debug').onclick=()=>{const body=JSON.stringify({version:'20261017-quota1',mode:modelEnabled?'online':'offline',state,session},null,2);const url=URL.createObjectURL(new Blob([body],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='emmichy-playtest.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
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
 $('continue').focus({preventScroll:true});
}
function focusEntryOnDesktop(){if(!window.matchMedia?.('(max-width:680px)').matches)$('entry').focus({preventScroll:true});}
function enterConversation(){ready=true;if(!session)session={startedAt:Date.now(),turns:0,finished:false};$('start-choice').hidden=true;$('talk').hidden=false;$('send').disabled=!readingsSettled;$('entry').disabled=false;noteActivity();focusEntryOnDesktop();}
$('continue').onclick=()=>{resumeCurrentSession();enterConversation();saveSession();$('status').textContent=state.ended?'おしまい。「最初から」で、もう一度。':'会話を再開しました / ENTER で送信';};
function startFreshConversation(){
 if(busy)return;
 stopContinuation(true);$('entry').value='';
 const next=startConversation(state);state=next.state;session=next.session;lines=[];live='';mood='idle';$('transcript').replaceChildren();addOpening();enterConversation();save();saveSession();$('status').textContent='新しい会話 / 漢字・ひらがな OK';draw();
}
$('new-chat').onclick=startFreshConversation;
$('restart-chat').onclick=()=>{if(busy)return;setSettings(false);startFreshConversation();};
if(hadSavedDialogue){ready=false;showStartChoice();}
let readyBeforeBrowserGuide=false;
bindBrowserLauncher({onOpen:()=>{
 if(busy)return false;
 readyBeforeBrowserGuide=ready;if(ready)saveSession();ready=false;
 stopContinuation();setSettings(false);$('entry').disabled=true;$('send').disabled=true;
},onClose:()=>{
 ready=readyBeforeBrowserGuide;
 if(ready){resumeCurrentSession();if(!session&&readingsSettled)session={startedAt:Date.now(),turns:0,finished:false};$('entry').disabled=false;$('send').disabled=!readingsSettled;continuation.typed(Date.now());noteActivity();saveSession();}
}});
document.addEventListener('visibilitychange',()=>{if(!ready)return;stopContinuation();if(document.hidden)saveSession();else{resumeCurrentSession();continuation.typed(Date.now());noteActivity();saveSession();}});
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
 if(ready&&!document.hidden&&!busy&&!ending&&!session?.finished&&!state.ended&&shouldEnd(session)){await endSession('time');return;}
 if(ready&&readingsSettled&&!document.hidden&&!busy&&!continuing&&!session?.finished&&!state.ended&&!composing){
  if(continuation.pending){
   if($('entry').value.trim())return;
   const line=continuation.peek(Date.now(),{composing});if(!line)return;
   const version=continuationVersion;continuing=true;live='';
   for(const c of readable(line)){
    if(version!==continuationVersion||busy||document.hidden||!ready||composing||$('entry').value.trim()){continuing=false;draw();return;}
    live+=c;draw();await wait(22);
   }
   if(version===continuationVersion&&!busy&&!document.hidden&&ready&&!composing){recordAside(line);continuation.spoken(Date.now());noteActivity();}
   live='';continuing=false;draw();return;
  }
 const holding=Boolean(session.pendingQuestion)||waitForPlayer(state);
 const lastUser=state.history.filter(h=>h.role==='user').at(-1)?.text||'';
 const questionDelay=personalFanReply(lastUser,state)?25000:15000;
 const question=!holding&&Date.now()-lastActivity>=questionDelay&&!$('entry').value.trim()?choosePlayerQuestion(state.playerMemory,session,{allowChiikawa:!unwantedFanRedirect('ちいかわ',state.history.filter(h=>h.role==='user').at(-1)?.text||'',state)}):null;
 if(question){recordAside(question.text);noteActivity();draw();return;}
 const reminder=!holding&&Date.now()-lastActivity>=6000&&!$('entry').value.trim()?chiikawaReminder(state,session):null;
  if(reminder){
   const plan=planContinuation(reminder,'',state,{display:s=>readable(s),tokenizer});
   session.chiikawaReminders=(session.chiikawaReminders||0)+1;
   recordAside(plan.first);continuation.start(plan.later,Date.now(),plan.timing);hadContinuation=plan.later.length>0;noteActivity();draw();return;
  }
  const stage=idleSequence.poll(Date.now(),{allowFinish:Boolean(session)&&Date.now()-session.startedAt>=5*60*1000&&!(session.feedbackUntil>Date.now())});
  if(stage===3)await endSession('idle');
  else if(stage===2&&!holding&&!$('entry').value.trim()){const line=idleAside(state.history,0,{memory:state.playerMemory,control:state.dialogueControl});if(line){recordAside(line);draw();}}
 }
},250);draw();if(ready)focusEntryOnDesktop();


