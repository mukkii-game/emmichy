import test from 'node:test';
import assert from 'node:assert/strict';

test('screen remains playable after dictionary failure and IME composition does not send',async()=>{
 const saved={};
 for(const key of ['document','window','location','localStorage','sessionStorage','Image','setInterval','setTimeout','clearTimeout'])saved[key]=globalThis[key];
 class Element{
  constructor(){this.children=[];this.listeners={};this.value='';this.textContent='';this.disabled=false;this.hidden=false;this.scrollHeight=0;}
  append(...items){this.children.push(...items);}
  replaceChildren(...items){this.children=items;}
  get firstChild(){return this.children[0];}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  async emit(type,event={}){for(const fn of this.listeners[type]||[])await fn({preventDefault(){},...event});}
  setAttribute(){} focus(){}
  getContext(){return {fillRect(){},save(){},scale(){},restore(){},drawImage(){}};}
 }
 const elements=new Map(),storage=new Map();
 const store={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 try{
  globalThis.document={getElementById:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement:()=>new Element(),addEventListener(){},hidden:false};
  globalThis.window={addEventListener(){}};globalThis.location={hostname:'preview.invalid',search:'?nollm=1'};
  globalThis.localStorage=store;globalThis.sessionStorage=store;globalThis.Image=class{};
  globalThis.setInterval=()=>0;
  // Advance only the app's typing delays, without waiting seconds per reply.
  globalThis.setTimeout=fn=>{queueMicrotask(fn);return 0;};globalThis.clearTimeout=()=>{};
  await import('../src/app.js');await Promise.resolve();
  const entry=elements.get('entry'),send=elements.get('send'),talk=elements.get('talk');
  assert.equal(send.disabled,false);assert.match(elements.get('status').textContent,/辞書/);
  entry.value='本を買った';await entry.emit('compositionstart');await talk.emit('submit');
  assert.equal(entry.value,'本を買った');
  assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.filter(h=>h.role==='user').length,0);
  await entry.emit('compositionend');await talk.emit('submit');
  const state=JSON.parse(storage.get('enny-memory-v1'));
  assert.equal(state.history.filter(h=>h.role==='user').length,1);
  assert.equal(state.history.find(h=>h.role==='user').text,'本を買った');
  assert.match(state.history.at(-1).text,/本/);assert.equal(send.disabled,false);
  assert.ok(elements.get('conversation').children.length>1);
 }finally{for(const [key,value] of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
