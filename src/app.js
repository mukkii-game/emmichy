import {freshState,restoreState,respond,normalize,displayText} from './engine.js?v=20261006-readable2';
import {chiikawaReply,checkedAt} from './topics.js?v=20261006-readable2';
import {text,kana} from './font.js?v=20261006-readable2';
import {shouldEnd,finishSession} from './session.js?v=20261006-readable2';
import {createAudioDirector} from './audio.js?v=20261006-readable2';
import {CHAT_API_URL} from './config.js?v=20261006-readable2';
import {advancePerformance} from './performance.js?v=20261006-readable2';
import {requestChat} from './chat.js?v=20261006-readable2';
import {readableText,loadReadings} from './readable.js?v=20261006-readable2';
let tokenizer=null;
const $=id=>document.getElementById(id),canvas=$('screen'),ctx=canvas.getContext('2d',{willReadFrequently:true});
ctx.imageSmoothingEnabled=false;
const key='enny-memory-v1';
const isLocal=['127.0.0.1','localhost','[::1]'].includes(location.hostname);
let chatEndpoint=CHAT_API_URL;
const offline=['auto','seed','replay','nollm'].some(k=>new URLSearchParams(location.search).has(k));
let state=freshState(),saveAvailable=true,busy=false,portrait=null,live='',mood='idle',modelEnabled=Boolean(chatEndpoint)&&!offline,modelProvider='';
let session=null,ending=false;
const audioDirector=createAudioDirector();
try{const stored=JSON.parse(sessionStorage.getItem('emmichy-session'));if(stored&&Number.isFinite(stored.startedAt)&&Number.isFinite(stored.turns))session=stored;}catch{}
function saveSession(){try{sessionStorage.setItem('emmichy-session',JSON.stringify(session));}catch{}}
try {state=restoreState(JSON.parse(localStorage.getItem(key)));}catch{saveAvailable=false;}
let lines=[];
function renderConversation(){
 const log=$('conversation');log.replaceChildren();
 for(const item of lines){const p=document.createElement('p');p.className='message '+item.role;const label=document.createElement('span');label.className='speaker';label.textContent=item.role==='user'?'YOU >':item.role==='system'?'SYSTEM >':'EMMICHY >';const body=document.createElement('span');body.textContent=readableText(item.value,tokenizer);p.append(label,body);log.append(p);}
 log.scrollTop=log.scrollHeight;
}
function add(role,value){lines.push({role,value});lines=lines.slice(-40);renderConversation();}
loadReadings().then(value=>{tokenizer=value;renderConversation();});
if(state.history.length) {for(const h of state.history)add(h.role,h.text);} else {
 add('system','EMMICHY / THE ALMOST CLEVER GAME');
 add('enny','ネエ Chiikawa ッテ シッテル？');
 add('system','ニホンゴ デ フツウニ ハナシテネ');
}
const img=new Image();img.src='assets/emmichy-portrait.png';
img.onload=()=>{
 const c=document.createElement('canvas');c.width=248;c.height=168;const p=c.getContext('2d',{willReadFrequently:true});
 const cropWidth=Math.min(img.width,img.height*248/336);
 p.drawImage(img,(img.width-cropWidth)/2,0,cropWidth,img.height,0,0,248,168);const d=p.getImageData(0,0,248,168),bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
 for(let y=0;y<168;y++)for(let x=0;x<248;x++){const i=(y*248+x)*4,threshold=(bayer[(y%4)*4+x%4]+.5)*16;for(let z=0;z<3;z++)d.data[i+z]=d.data[i+z]>threshold?255:0;d.data[i+3]=255;}
 p.putImageData(d,0,0);portrait=c;draw();
};
img.onerror=()=>{$('status').textContent='人物画像を読み込めません。再読み込みしてください。';};
function draw(){
 ctx.fillStyle='#000';ctx.fillRect(0,0,248,168);
 if(portrait)ctx.drawImage(portrait,0,0,248,168);
 $('live-reply').textContent=live;
 $('terminal-note').textContent=session?.finished?'— END —　コンニチハ デ サイカイ':busy?'● THINKING / RECEIVING…':'アタシ エミチィ　ナンデモ ハナシテネ';
 if(mood==='knowing' && Math.floor(Date.now()/700)%2)text(ctx,'*',230,10,'#00ffff');
 if(mood==='worried'){
   ctx.fillStyle='#00ffff';ctx.fillRect(229,42,2,2);ctx.fillRect(228,44,4,3);ctx.fillRect(229,47,2,1);
   if(Math.floor(Date.now()/900)%2)kana(ctx,'シーサー...',16,161,'#00ffff');
 }
 if(mood==='excited'){text(ctx,'*',225,20,'#ffff00');text(ctx,'*',16,90,'#00ffff');}
}
function save(){try{localStorage.setItem(key,JSON.stringify(state));saveAvailable=true;}catch{saveAvailable=false;}$('disk').textContent=saveAvailable?'● DISK SAVED':'● MEMORY ONLY';}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function endSession(){
 if(ending||busy||!session||session.finished||state.ended)return;
 ending=true;busy=true;$('send').disabled=true;$('reset').disabled=true;
 const end=finishSession(state,session);state=end.state;session=end.session;mood='soft';saveSession();
 audioDirector.se.ending();
 const endingDisplay=readableText(end.text,tokenizer);
 for(const c of endingDisplay){live+=c;draw();await wait(32);}
 add('enny',end.text);live='';save();busy=false;ending=false;$('send').disabled=false;$('reset').disabled=false;
 const p=document.createElement('p');p.textContent=`えみちぃ：${end.text}。おしまい。`;$('transcript').append(p);
 $('status').textContent='おしまい。「コンニチハ」で、もう一度。';draw();
}
$('talk').addEventListener('submit',async e=>{
 e.preventDefault();if(busy||composing)return;
 const raw=$('entry').value.trim();if(!raw)return;
 const isRestart=state.ended&&/コンニチ[ハワ]|タダイマ|オハヨウ/.test(normalize(raw));
 if(!session||isRestart){session={startedAt:Date.now(),turns:0,finished:false};if(isRestart){lines=[];state.performance={};state.fan={worry:0,excitement:0,lastTopic:''};}saveSession();}
  session.turns++;saveSession();
 busy=true;$('send').disabled=true;$('reset').disabled=true;$('entry').value='';audioDirector.se.send();
 add('user',raw);$('disk').textContent='● DISK ACCESS';
 const before=advancePerformance(state,raw,session.turns);let result=chiikawaReply(normalize(raw),respond(raw,state),undefined,raw);
 result.state.performance=before.performance;result.state.speechStyle=before.speechStyle;
 let usedModel=false;
 if(isRestart){result.text='ネエ Chiikawa ッテ シッテル？';result.state.history.at(-1).text=result.text;}
 const ruleOnly=isRestart||['bye','asleep','name','memory','arithmetic'].includes(result.kind);
 if(modelEnabled && !ruleOnly){
  $('status').textContent='Emmichyが考えています…';
  const data=await requestChat(chatEndpoint,raw,before,session,{offline});
  if(data){result.text=data.text;result.state.history.at(-1).text=data.text;usedModel=true;modelProvider=data.provider;}
 }
 state=result.state;mood=result.mood;session.lastMood=mood;saveSession();
 await wait(300+Math.min(raw.length*10,500));
 if(mood==='excited')audioDirector.se.excited();else if(mood==='worried')audioDirector.se.worried();else audioDirector.se.reply();
 const replyDisplay=readableText(result.text,tokenizer);
 for(const c of replyDisplay){live+=c;draw();await wait(mood==='excited'?12:mood==='worried'&&c==='\n'?420:22);}
 add('enny',result.text);live='';lastActivity=Date.now();save();busy=false;$('send').disabled=false;$('reset').disabled=false;
 $('status').textContent=usedModel?`AI会話${modelProvider?' / '+({groq:'Groq',gemini:'Google Gemini','workers-ai':'Cloudflare Workers AI',local:'ローカルAI'}[modelProvider]||modelProvider):''} / ENTER で送信`:modelEnabled&&!ruleOnly?'AI失敗→ルール会話 / ENTER で送信':'ルール会話 / ENTER で送信';
 const item=document.createElement('p');item.textContent=`あなた：${raw}。Emmichy：${result.text}`;$('transcript').append(item);if($('transcript').children.length>40)$('transcript').firstChild.remove();
 $('entry').focus();draw();
 if(state.ended){session.finished=true;saveSession();}
 else if(shouldEnd(session)&&!$('entry').value.trim()&&!composing)await endSession();
});
let composing=false;
$('entry').addEventListener('compositionstart',()=>composing=true);
$('entry').addEventListener('compositionend',()=>{composing=false;draw();});
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
 clearTimeout(resetTimer);resetArmed=false;$('reset-note').textContent=' 初期化しました。';state=freshState();session=null;saveSession();lines=[];live='';mood='idle';add('enny','ネエ Chiikawa ッテ シッテル?');$('transcript').replaceChildren();save();draw();};
function setEngineNote(){
 $('engine-note').textContent=(modelEnabled?`AI会話を優先。接続失敗時はルール会話に戻ります${modelProvider?'（'+modelProvider+'）':''}。`:'無料・通信不要のルール会話。')+` 記憶はこのブラウザ内に保存します。時事ネタの確認日：${checkedAt}。`;
}
setEngineNote();
if(isLocal&&!offline){
 fetch('/api/config').then(r=>r.json()).then(c=>{if(c.localModel){chatEndpoint='/api/chat';modelProvider='local';}setEngineNote();}).catch(()=>{});
}
setInterval(draw,160);setInterval(()=>{if(shouldEnd(session)&&!composing&&!$('entry').value.trim()&&Date.now()-lastActivity>8000)endSession();},1000);draw();$('entry').focus();
