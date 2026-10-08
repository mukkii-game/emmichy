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
 const elements=new Map(),storage=new Map(),intervals=[];
 const originalNow=Date.now;let time=originalNow();
 const store={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 try{
  globalThis.document={getElementById:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement:()=>new Element(),addEventListener(){},hidden:false};
  globalThis.window={addEventListener(){}};globalThis.location={hostname:'preview.invalid',search:'?nollm=1'};
  globalThis.localStorage=store;globalThis.sessionStorage=store;globalThis.Image=class{};
  Date.now=()=>time;
  globalThis.setInterval=(fn,ms)=>{intervals.push({fn,ms});return 0;};
  // Advance only the app's typing delays, without waiting seconds per reply.
  let expectPersisted=null,persistedBeforeAnimation=false;
  globalThis.setTimeout=fn=>{if(expectPersisted){const memory=JSON.parse(storage.get('enny-memory-v1')||'null');if(memory?.history?.at(-1)?.text.includes(expectPersisted))persistedBeforeAnimation=true;}queueMicrotask(fn);return 0;};globalThis.clearTimeout=()=>{};
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
  entry.value='漫画じゃなくて散歩の話にしよう';await talk.emit('submit');
  const switched=JSON.parse(storage.get('enny-memory-v1'));
  assert.doesNotMatch(switched.history.at(-1).text,/ちいかわ|チイカワ|島二郎|ジョジョ|ハチワレ|バキ/);
  assert.equal(switched.history.filter(h=>h.role==='user').length,2);
  expectPersisted='雨';entry.value='今日は雨の匂いがした';await talk.emit('submit');
  assert.equal(persistedBeforeAnimation,true);
  const rainy=JSON.parse(storage.get('enny-memory-v1'));
  assert.match(rainy.history.at(-1).text,/雨/);assert.doesNotMatch(rainy.history.at(-1).text,/クロイ ソラ|電気/);
  const idleTick=intervals.find(x=>x.ms===1000).fn;
  let count=JSON.parse(storage.get('enny-memory-v1')).history.length;
  entry.value='途中の下書き';await entry.emit('input');time+=9999;await idleTick();
  assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,count);
  time++;await idleTick();assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,count+1);
  await entry.emit('compositionstart');time+=20000;await idleTick();
  assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,count+1);
  await entry.emit('compositionend');time+=10000;await idleTick();
  const firstIdle=JSON.parse(storage.get('enny-memory-v1')).history.at(-1).text;
  time+=10000;await idleTick();assert.notEqual(JSON.parse(storage.get('enny-memory-v1')).history.at(-1).text,firstIdle);
  time+=10000;await idleTick();const ended=JSON.parse(storage.get('enny-memory-v1'));
  assert.equal(ended.ended,true);assert.match(ended.history.at(-1).text,/そろそろ帰るね.*バイバイ/);
  assert.equal(entry.value,'途中の下書き');
  elements.get('restart-chat').onclick();assert.equal(talk.hidden,true);assert.equal(elements.get('start-choice').hidden,false);
  elements.get('new-chat').onclick();assert.equal(talk.hidden,false);assert.equal(elements.get('start-choice').hidden,true);
  assert.equal(JSON.parse(storage.get('enny-memory-v1')).ended,false);
 }finally{Date.now=originalNow;for(const [key,value] of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
