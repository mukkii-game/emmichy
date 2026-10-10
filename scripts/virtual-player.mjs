// Interactive virtual player. Offline by default; --live explicitly enables at most three relay calls.
// DOM is simulated; typing animation is compressed, conversation pauses use a virtual clock.
import fs from 'node:fs/promises';
import readline from 'node:readline';
import kuromoji from 'kuromoji';
import {spawn} from 'node:child_process';
const liveMode=process.argv.includes('--live'),liveCalls=[];
const realTimeout=globalThis.setTimeout,realClear=globalThis.clearTimeout;
const output=process.argv[2];
if(!output)throw new Error('Provide a separate transcript path for each player');
const tokenizer=await new Promise((resolve,reject)=>kuromoji.builder({dicPath:'assets/dict/'}).build((error,value)=>error?reject(error):resolve(value)));
const elements=new Map(),storage=new Map(),intervals=[];
let now=Date.parse('2026-10-10T12:00:00+09:00'),nextTimer=1;
const origin=now,cancelled=new Set(),actions=[],seen=[];
class Element{
 constructor(){this.children=[];this.listeners={};this.value='';this.textContent='';this.disabled=false;this.hidden=false;this.scrollHeight=0;}
 append(...items){for(const item of items){item.parent=this;this.children.push(item);}} replaceChildren(...items){this.children=[];this.append(...items);}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(item=>item!==this);}
 get firstChild(){return this.children[0];}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
 async emit(type,event={}){for(const fn of this.listeners[type]||[])await fn({preventDefault(){},...event});}
 setAttribute(){} focus(){}
 getContext(){return {fillRect(){},save(){},scale(){},restore(){},drawImage(){}};}
}
const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
const store={getItem:key=>storage.get(key)||null,setItem:(key,value)=>{
 storage.set(key,value);
 if(key==='enny-memory-v1'){
  const history=JSON.parse(value).history||[];
  // History is capped by the game. Find the longest suffix already observed.
  let overlap=Math.min(history.length,seen.length);
  while(overlap&&!history.slice(0,overlap).every((h,i)=>JSON.stringify(h)===JSON.stringify(seen[seen.length-overlap+i].message)))overlap--;
  for(const message of history.slice(overlap))seen.push({atMs:now-origin,message});
 }
}};
globalThis.document={getElementById:get,createElement:()=>new Element(),addEventListener(){},hidden:false};
globalThis.window={addEventListener(){}};
globalThis.location={hostname:'preview.invalid',search:liveMode?'':'?nollm=1'};
globalThis.localStorage=store;globalThis.sessionStorage=store;globalThis.Image=class{};
globalThis.kuromoji={builder:()=>({build:callback=>queueMicrotask(()=>callback(null,tokenizer))})};
Date.now=()=>now;
globalThis.setInterval=(fn,ms)=>{intervals.push({fn,ms});return intervals.length;};
globalThis.setTimeout=(fn,ms)=>{if(liveMode&&ms>=2000)return realTimeout(fn,ms);const id=nextTimer++;if(ms<2000)queueMicrotask(()=>{if(!cancelled.has(id))fn();});return id;};
globalThis.clearTimeout=id=>{if(typeof id==='object')realClear(id);else cancelled.add(id);};
// There must be no network requests in this mode, including unexpected app changes.
globalThis.fetch=liveMode?async(url,options)=>{
 if(liveCalls.length>=3||liveCalls.some(call=>call.status===429))throw new Error('Live probe limit reached');
 const record={input:JSON.parse(options.body).input};liveCalls.push(record);
 const started=performance.now();
 const script=`import sys,json,urllib.request,urllib.error\np=json.load(sys.stdin)\nr=urllib.request.Request(p['url'],data=p['body'].encode(),headers={'Content-Type':'application/json','Origin':'https://mukkii-game.github.io','User-Agent':'Mozilla/5.0 Emmichy-playtest'},method='POST')\ntry:\n with urllib.request.urlopen(r,timeout=22) as response: result={'status':response.status,'body':response.read().decode()}\nexcept urllib.error.HTTPError as e: result={'status':e.code,'body':e.read().decode()}\nprint(json.dumps(result))`;
 const result=await new Promise((resolve,reject)=>{
  const child=spawn('python',['-X','utf8','-c',script],{windowsHide:true});let data='',errors='';
  const abort=()=>{child.kill();reject(new Error('Reply deadline'));};
  options.signal?.addEventListener('abort',abort,{once:true});
  child.stdout.on('data',chunk=>data+=chunk);child.stderr.on('data',chunk=>errors+=chunk);
  child.on('error',reject);child.on('close',code=>{options.signal?.removeEventListener('abort',abort);if(code)reject(new Error(errors||'Relay probe failed'));else{try{resolve(JSON.parse(data));}catch(error){reject(error);}}});
  child.stdin.end(JSON.stringify({url,body:options.body}));
 }).catch(error=>{record.wallMs=Math.round(performance.now()-started);record.error=String(error.message).trim().split('\n').at(-1).slice(0,160);throw error;});
 record.wallMs=Math.round(performance.now()-started);record.status=result.status;
 return {ok:result.status>=200&&result.status<300,status:result.status,json:async()=>{const body=JSON.parse(result.body);record.provider=body.provider;record.text=body.text;return body;}};
}:()=>{throw new Error('Network disabled in virtual-player harness');};
await import('../src/app.js');
for(let i=0;i<100;i++)await Promise.resolve();
const {readableText}=await import('../src/readable.js');
const tick=intervals.find(item=>item.ms===250).fn;
async function wait(seconds){
 if(!Number.isFinite(seconds)||seconds<0||seconds>360)throw new Error('wait seconds must be 0..360');
 const end=now+seconds*1000;
 while(now<end){now=Math.min(end,now+250);await tick();}
}
let delivered=0;
async function snapshot(action){
 const state=JSON.parse(storage.get('enny-memory-v1'));
 const session=JSON.parse(storage.get('emmichy-session'));
 const messages=seen.slice(delivered).map(({atMs,message})=>({atMs,role:message.role,text:message.text,screen:readableText(message.text,tokenizer)}));
 delivered=seen.length;
 const result={atSeconds:(now-origin)/1000,messages,draft:get('entry').value,finished:Boolean(session?.finished||state?.ended),turns:session?.turns||0,...(liveMode?{dialogueUse:session?.dialogueUse,chatHealth:session?.chatHealth,liveCalls}: {})};
 if(action)actions.push({action,result});
 await fs.writeFile(output,JSON.stringify({mode:liveMode?'actual app and live relay (max3 calls, stop429); simulated DOM/virtual pauses; compressed typing; real request wallMs; no browser/audio':'actual app; offline rule/bank; simulated DOM and virtual pauses; compressed typing animation; no live LLM or audio',actions,transcript:seen,...(liveMode?{liveCalls}: {})},null,2)+'\n');
 console.log(JSON.stringify(result));
}
await snapshot({type:'start'});
const input=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
for await(const line of input){
 try{
  const action=JSON.parse(line);
  if(action.type==='say'){
   get('entry').value=String(action.text);await get('entry').emit('input');await get('talk').emit('submit');
  }else if(action.type==='wait')await wait(action.seconds);
  else if(action.type==='draft'){get('entry').value=String(action.text||'');await get('entry').emit('input');}
  else if(action.type==='composition')await get('entry').emit(action.active?'compositionstart':'compositionend');
  else if(action.type==='reset'){get('restart-chat').onclick();get('new-chat').onclick();}
  else if(action.type==='quit')break;
  else throw new Error('Use say, wait, draft, composition, reset or quit');
  await snapshot(action);
 }catch(error){console.log(JSON.stringify({error:error.message}));}
}
