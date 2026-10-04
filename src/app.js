import {freshState,restoreState,respond,normalize,displayText} from './engine.js';
import {chiikawaReply,checkedAt} from './topics.js';
import {text,kana} from './font.js';
import {shouldEnd,finishSession} from './session.js';
import {createAudioDirector} from './audio.js';
const $=id=>document.getElementById(id),canvas=$('screen'),ctx=canvas.getContext('2d',{willReadFrequently:true});
ctx.imageSmoothingEnabled=false;
const key='enny-memory-v1';
let state=freshState(),saveAvailable=true,busy=false,portrait=null,live='',mood='idle',modelEnabled=false;
let session=null,ending=false;
const audioDirector=createAudioDirector();
try{const stored=JSON.parse(sessionStorage.getItem('emmichy-session'));if(stored&&Number.isFinite(stored.startedAt)&&Number.isFinite(stored.turns))session=stored;}catch{}
function saveSession(){try{sessionStorage.setItem('emmichy-session',JSON.stringify(session));}catch{}}
try {state=restoreState(JSON.parse(localStorage.getItem(key)));}catch{saveAvailable=false;}
let lines=[];
const colors=['#ffffff','#00ffff','#ffff00','#00ff00'];
function wrap(s,width=46){return String(s).split('\n').flatMap(p=>{const t=displayText(p);return t.match(new RegExp(`.{1,${width}}`,'g'))??[''];});}
function add(role,value){for(const line of wrap(value))lines.push({line,color:role==='user'?'#00ffff':role==='system'?'#ffff00':colors[(state.turn%3)+1]});lines=lines.slice(-15);}
if(state.history.length) {for(const h of state.history)add(h.role,h.text);} else {
 add('system','EMMICHY / THE ALMOST CLEVER GAME');
 add('enny','ネエ Chiikawa ッテ シッテル?');
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
 ctx.fillStyle='#000';ctx.fillRect(0,0,640,200);
 if(portrait)ctx.drawImage(portrait,0,0,248,168);
 const visible=[...lines];if(live)for(const line of wrap(live))visible.push({line,color:'#ffff00'});
 visible.slice(-15).forEach((l,i)=>text(ctx,l.line,264,i*9,l.color));
 text(ctx,'EMMICHY',454,147,'#ff0000',3);
 text(ctx,'THE ALMOST CLEVER GAME',454,177,'#00ff00');
 text(ctx,'PILOT',592,135,'#ffff00');
 if(session?.finished){text(ctx,'- END -',280,153,'#ffff00');kana(ctx,'コンニチハ デ サイカイ',264,166,'#ffffff');}
 kana(ctx,state.ended?'マタネ エミチィ':'アタシ エミチィ ナンデモ ハナシテネ',0,179,'#00ffff');
 const preview=displayText($('entry').value).slice(-73);
 text(ctx,'> '+preview+(busy?'':Math.floor(Date.now()/500)%2?'_':' '),0,190,'#00ffff');
 if(busy)text(ctx,'. . .',264,153,'#ffffff');
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
 for(const c of end.text){live+=c;draw();await wait(32);}
 add('enny',end.text);live='';save();busy=false;ending=false;$('send').disabled=false;$('reset').disabled=false;
 const p=document.createElement('p');p.textContent=`えみちぃ：${end.text}。おしまい。`;$('transcript').append(p);
 $('status').textContent='おしまい。「コンニチハ」で、もう一度。';draw();
}
$('talk').addEventListener('submit',async e=>{
 e.preventDefault();if(busy||composing)return;
 const raw=$('entry').value.trim();if(!raw)return;
 const isRestart=state.ended&&/コンニチ[ハワ]|タダイマ|オハヨウ/.test(normalize(raw));
 if(!session||isRestart){session={startedAt:Date.now(),turns:0,finished:false};if(isRestart){lines=[];state.fan={worry:0,excitement:0,lastTopic:''};}saveSession();}
 if(shouldEnd(session)&&!state.ended){await endSession();return;}
 session.turns++;saveSession();
 busy=true;$('send').disabled=true;$('reset').disabled=true;$('entry').value='';audioDirector.se.send();
 add('user',raw);$('disk').textContent='● DISK ACCESS';
 const before=state;let result=chiikawaReply(normalize(raw),respond(raw,state),undefined,raw);
 let usedModel=false;
 try{
  if(modelEnabled && !['name','memory','contradiction','arithmetic','bye','asleep','news','repeat','shisa','movie','fan-comfort','fan-distraction','age'].includes(result.kind)){
   $('status').textContent='Emmichyが考えています…';
   const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:raw,state:before}),signal:AbortSignal.timeout(22000)});
   if(res.ok){const data=await res.json();if(data.text){result.text=data.text;result.state.history.at(-1).text=data.text;usedModel=true;}}
  }
 }catch{}
 state=result.state;mood=result.mood;
 await wait(350+Math.min(raw.length*14,650));
 if(mood==='excited')audioDirector.se.excited();else if(mood==='worried')audioDirector.se.worried();else audioDirector.se.reply();
 for(const c of result.text){live+=c;draw();await wait(mood==='excited'?12:mood==='worried'&&c==='\n'?450:24);}
 add('enny',result.text);live='';save();busy=false;$('send').disabled=false;$('reset').disabled=false;
 $('status').textContent=usedModel?'AI会話 / ENTER で送信':modelEnabled?'ルール会話 / ENTER で送信':'日本語入力OK / ENTER で送信';
 const item=document.createElement('p');item.textContent=`あなた：${raw}。Emmichy：${result.text}`;$('transcript').append(item);if($('transcript').children.length>40)$('transcript').firstChild.remove();
 $('entry').focus();draw();
 if(state.ended){session.finished=true;saveSession();}
 else if(shouldEnd(session))await endSession();
});
let composing=false;
$('entry').addEventListener('compositionstart',()=>composing=true);
$('entry').addEventListener('compositionend',()=>{composing=false;draw();});
$('entry').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.isComposing||e.keyCode===229))e.preventDefault();});
$('entry').addEventListener('input',draw);
canvas.addEventListener('click',()=>$('entry').focus());
$('sound').onclick=async()=>{const on=await audioDirector.toggle();$('sound').textContent='BGM + SE '+(on?'ON':'OFF');$('sound').setAttribute('aria-pressed',String(on));if(on)audioDirector.se.reply();};
$('help').onclick=()=>{$('instructions').hidden=!$('instructions').hidden;};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.screen-wrap').requestFullscreen();}catch{$('status').textContent='このブラウザでは全画面にできません。';}};
$('export').onclick=()=>{const body=state.history.map(h=>`${h.role==='user'?'YOU':'EMMICHY'}: ${h.text}`).join('\r\n\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+body],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='enny-conversation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
let resetArmed=false,resetTimer;
$('reset').onclick=()=>{if(!resetArmed){resetArmed=true;$('reset-note').textContent=' もう一度押すと記憶が消えます。';resetTimer=setTimeout(()=>{resetArmed=false;$('reset-note').textContent='';},5000);return;}
 clearTimeout(resetTimer);resetArmed=false;$('reset-note').textContent=' 初期化しました。';state=freshState();session=null;saveSession();lines=[];live='';mood='idle';add('enny','ネエ Chiikawa ッテ シッテル?');$('transcript').replaceChildren();save();draw();};
$('engine-note').textContent=`無料・通信不要のルール会話。記憶はこのブラウザ内に保存します。時事ネタの確認日：${checkedAt}。`;
if(['127.0.0.1','localhost','[::1]'].includes(location.hostname)){
 fetch('/api/config').then(r=>r.json()).then(c=>{modelEnabled=c.localModel;$('engine-note').textContent=(c.localModel?'ローカルLLMを使用。接続失敗時はルール会話に戻ります。会話はこのPC内で処理します。':'無料・通信不要のルール会話。生成AI相当の自由な理解ではなく、記憶と話題転換を演出します。')+` 時事ネタの確認日：${checkedAt}。`;}).catch(()=>{});
}
setInterval(draw,160);setInterval(()=>{if(shouldEnd(session)&&!composing)endSession();},1000);draw();$('entry').focus();
