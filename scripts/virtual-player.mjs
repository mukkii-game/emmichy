// Interactive, local-only virtual player. Runs the real app, not a duplicate router.
// DOM is simulated; typing animation is compressed, conversation pauses use a virtual clock.
import fs from 'node:fs/promises';
import readline from 'node:readline';
import kuromoji from 'kuromoji';
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
globalThis.location={hostname:'preview.invalid',search:'?nollm=1'};
globalThis.localStorage=store;globalThis.sessionStorage=store;globalThis.Image=class{};
globalThis.kuromoji={builder:()=>({build:callback=>queueMicrotask(()=>callback(null,tokenizer))})};
Date.now=()=>now;
globalThis.setInterval=(fn,ms)=>{intervals.push({fn,ms});return intervals.length;};
globalThis.setTimeout=(fn,ms)=>{const id=nextTimer++;if(ms<2000)queueMicrotask(()=>{if(!cancelled.has(id))fn();});return id;};
globalThis.clearTimeout=id=>cancelled.add(id);
// There must be no network requests in this mode, including unexpected app changes.
globalThis.fetch=()=>{throw new Error('Network disabled in virtual-player harness');};
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
 const result={atSeconds:(now-origin)/1000,messages,draft:get('entry').value,finished:Boolean(session?.finished||state?.ended),turns:session?.turns||0};
 if(action)actions.push({action,result});
 await fs.writeFile(output,JSON.stringify({mode:'actual app; offline rule/bank; simulated DOM and virtual pauses; compressed typing animation; no live LLM or audio',actions,transcript:seen},null,2)+'\n');
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
