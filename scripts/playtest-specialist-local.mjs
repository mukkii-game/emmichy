// Actual app event handlers in a tiny DOM fixture. Virtual clock, unavailable
// reading dictionary, no portrait/audio/browser and ZERO game model requests.
import fs from 'node:fs';
const inputs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const captured=process.argv[4]?JSON.parse(fs.readFileSync(process.argv[4],'utf8')):null;
const replayGame=captured?(await import('../../game-llm/games/emmichy.js')).default:null;
if(!Array.isArray(inputs)||inputs.length>8||inputs.some(s=>typeof s!=='string'||s.length>180))throw Error('Use at most eight short synthetic inputs.');
class Element{
 constructor(){this.children=[];this.listeners={};this.value='';this.textContent='';this.disabled=false;this.hidden=false;this.scrollHeight=0;}
 append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}get firstChild(){return this.children[0];}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}async emit(type){for(const fn of this.listeners[type]||[])await fn({preventDefault(){}});}
 setAttribute(){}focus(){}getContext(){return {fillRect(){},save(){},scale(){},restore(){},drawImage(){}};}
}
const elements=new Map(),intervals=[],storage=new Map();let time=Date.now(),providerCalls=0;const fixtureResponses=[];
const first={version:1,name:'テスト',history:[{role:'enny',text:'こんにちは。'}],dialogue:[{role:'enny',text:'こんにちは。'}],playerMemory:{nickname:'テスト'}};
storage.set('enny-memory-v1',JSON.stringify(first));
globalThis.document={hidden:false,getElementById:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement:()=>new Element(),addEventListener(){}};
globalThis.window={addEventListener(){}};globalThis.location={hostname:'fixture.invalid',search:captured?'':'?nollm=1'};
globalThis.localStorage=globalThis.sessionStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
globalThis.Image=class{};Date.now=()=>time;
globalThis.setInterval=(fn,ms)=>{intervals.push({fn,ms});return 0;};
globalThis.setTimeout=(fn,ms)=>{time+=ms;queueMicrotask(fn);return 0;};globalThis.clearTimeout=()=>{};
globalThis.fetch=async(url,options)=>{
 if(captured&&String(url).includes('/api/chat/emmichy')){
  const data=JSON.parse(options.body),record=captured.turns.find(t=>t.input===data.input),raw=record?.rawOutputs?.[0]?.raw;
  if(!raw)throw Error('No captured response for this fixture input');
  const messages=replayGame.buildMessages(data);
  if(!Array.isArray(messages))throw Error('Network lookup forbidden in replay');
  const validated=replayGame.validate(raw,{messages});
  fixtureResponses.push({input:data.input,history:data.state.history,specialist:data.state.specialist,validated});
  if(!validated)return new Response('',{status:502});
  return Response.json({...(typeof validated==='string'?{text:validated,source:'llm'}:validated),provider:record.rawOutputs[0].provider});
 }
 throw Error('network forbidden in local playtest');
};
await import('../src/app.js');await Promise.resolve();await Promise.resolve();
elements.get('continue').onclick();await Promise.resolve();
const entry=elements.get('entry'),form=elements.get('talk'),tick=intervals.find(i=>i.ms===250).fn;
const rows=[];
for(const input of inputs){
 entry.value=input;await entry.emit('input');await form.emit('submit');
 for(let i=0;i<3;i++){time+=4000;await tick();}
 const state=JSON.parse(storage.get('enny-memory-v1')),at=state.history.findLastIndex(h=>h.role==='user');
 rows.push({input,replies:state.history.slice(at+1).filter(h=>h.role==='enny').map(h=>h.text),specialist:state.specialist,pendingQuestion:JSON.parse(storage.get('emmichy-session')||'{}').pendingQuestion||null});
}
const result={mode:captured?'actual app handlers with captured raw provider responses revalidated against actual request state; virtual timing; no browser/human/new-generation evaluation':'actual app handlers in offline DOM fixture; virtual timing; no browser/human/live-model evaluation',providerCalls,...(captured?{capturedCommit:captured.commit,fixtureResponses}:{}),rows};
fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({providerCalls,rows:rows.map(r=>({input:r.input,replies:r.replies}))}));
