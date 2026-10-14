// Actual app event handlers in a tiny DOM fixture. Virtual clock, unavailable
// reading dictionary, no portrait/audio/browser and ZERO game model requests.
import fs from 'node:fs';
const inputs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
if(!Array.isArray(inputs)||inputs.length>8||inputs.some(s=>typeof s!=='string'||s.length>180))throw Error('Use at most eight short synthetic inputs.');
class Element{
 constructor(){this.children=[];this.listeners={};this.value='';this.textContent='';this.disabled=false;this.hidden=false;this.scrollHeight=0;}
 append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}get firstChild(){return this.children[0];}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}async emit(type){for(const fn of this.listeners[type]||[])await fn({preventDefault(){}});}
 setAttribute(){}focus(){}getContext(){return {fillRect(){},save(){},scale(){},restore(){},drawImage(){}};}
}
const elements=new Map(),intervals=[],storage=new Map();let time=Date.now(),providerCalls=0;
const first={version:1,name:'テスト',history:[{role:'enny',text:'こんにちは。'}],dialogue:[{role:'enny',text:'こんにちは。'}],playerMemory:{nickname:'テスト'}};
storage.set('enny-memory-v1',JSON.stringify(first));
globalThis.document={hidden:false,getElementById:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement:()=>new Element(),addEventListener(){}};
globalThis.window={addEventListener(){}};globalThis.location={hostname:'fixture.invalid',search:'?nollm=1'};
globalThis.localStorage=globalThis.sessionStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
globalThis.Image=class{};Date.now=()=>time;
globalThis.setInterval=(fn,ms)=>{intervals.push({fn,ms});return 0;};
globalThis.setTimeout=(fn,ms)=>{time+=ms;queueMicrotask(fn);return 0;};globalThis.clearTimeout=()=>{};
globalThis.fetch=async()=>{providerCalls++;throw Error('network forbidden in local playtest');};
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
const result={mode:'actual app handlers in offline DOM fixture; virtual timing; no browser/human/live-model evaluation',providerCalls,rows};
fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({providerCalls,rows:rows.map(r=>({input:r.input,replies:r.replies}))}));
