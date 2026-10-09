import test from 'node:test';
import assert from 'node:assert/strict';

test('screen remains playable after dictionary failure and IME composition does not send',async()=>{
 const saved={},displayed=[];
 for(const key of ['document','window','location','localStorage','sessionStorage','Image','setInterval','setTimeout','clearTimeout'])saved[key]=globalThis[key];
 class Element{
  constructor(){this.children=[];this.listeners={};this.value='';this.textContent='';this.disabled=false;this.hidden=false;this.scrollHeight=0;}
  set textContent(value){this.text=value;displayed.push(value);} get textContent(){return this.text;}
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
  let expectPersisted=null,persistedBeforeAnimation=false,typingFrames=0,lastTyped='',interruptNextFrame=false;
  const delays=[];
  globalThis.setTimeout=(fn,ms)=>{
   delays.push(ms);
   if(expectPersisted){const memory=JSON.parse(storage.get('enny-memory-v1')||'null');if(memory?.history?.at(-1)?.text.includes(expectPersisted))persistedBeforeAnimation=true;}
   const pending=elements.get('live-reply'),body=elements.get('live-body'),log=elements.get('conversation');
   if(body?.textContent){typingFrames++;lastTyped=body.textContent;assert.equal(log.children.at(-1),pending,'typing stays inside the history after the preceding message');assert.equal(pending.hidden,false);}
   if(interruptNextFrame){interruptNextFrame=false;queueMicrotask(()=>elements.get('entry').emit('input'));}
   queueMicrotask(fn);return 0;
  };globalThis.clearTimeout=()=>{};
  await import('../src/app.js');await Promise.resolve();
  assert.ok(displayed.every(text=>!String(text).includes('ジュンビ')));
  const startedAt=JSON.parse(storage.get('emmichy-session')).startedAt;
  const entry=elements.get('entry'),send=elements.get('send'),talk=elements.get('talk');
  const firstOpening=JSON.parse(storage.get('enny-memory-v1')).history.find(h=>h.role==='enny').text;
  assert.ok(firstOpening.length<30,'opening starts with a short greeting only');
  const idleTick=intervals.find(x=>x.ms===250).fn;
  let openingCount=JSON.parse(storage.get('enny-memory-v1')).history.length;
  time+=1499;await idleTick();assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,openingCount);
  time++;await idleTick();assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,openingCount+1);
  for(let i=0;i<3;i++){time+=1500;await idleTick();}
  assert.match(JSON.parse(storage.get('enny-memory-v1')).history.filter(h=>h.role==='enny').map(h=>h.text).join(' '),/ちいかわ|チイカワ|chiikawa|ハチワレ|シーサー|モモンガ/i);
  assert.equal(send.disabled,false);assert.match(elements.get('status').textContent,/辞書/);
  entry.value='本を買った';await entry.emit('compositionstart');await talk.emit('submit');
  assert.equal(entry.value,'本を買った');
  assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.filter(h=>h.role==='user').length,0);
  const openingNode=elements.get('conversation').children[0];
  await entry.emit('compositionend');await talk.emit('submit');
  const state=JSON.parse(storage.get('enny-memory-v1'));
  assert.equal(state.history.filter(h=>h.role==='user').length,1);
  assert.equal(state.history.find(h=>h.role==='user').text,'本を買った');
  assert.match(state.history.at(-1).text,/本/);assert.equal(send.disabled,false);
  assert.ok(elements.get('conversation').children.length>1);
  assert.ok(typingFrames>0);
  assert.equal(elements.get('conversation').children[0],openingNode,'existing messages retain their DOM nodes');
  assert.equal(elements.get('live-reply').hidden,true,'completion leaves no duplicate typing row');
  assert.equal(elements.get('live-body').textContent,'');
  assert.equal(elements.get('conversation').children.filter(p=>p.children[1]?.textContent===lastTyped).length,1);
  entry.value='漫画じゃなくて散歩の話にしよう';await talk.emit('submit');
  const switched=JSON.parse(storage.get('enny-memory-v1'));
  assert.doesNotMatch(switched.history.at(-1).text,/ちいかわ|チイカワ|島二郎|ジョジョ|ハチワレ|バキ/);
  assert.equal(switched.history.filter(h=>h.role==='user').length,2);
  expectPersisted='雨';entry.value='今日は雨の匂いがした';await talk.emit('submit');
  assert.equal(persistedBeforeAnimation,true);
  const rainy=JSON.parse(storage.get('enny-memory-v1'));
  assert.match(rainy.history.at(-1).text,/雨/);assert.doesNotMatch(rainy.history.at(-1).text,/クロイ ソラ|電気/);
  // One accepted reply unfolds with no extra user turn or request. Unspoken
  // continuations are not already present in saved history.
  let pacedCount=JSON.parse(storage.get('enny-memory-v1')).history.length;
  const turnCount=JSON.parse(storage.get('emmichy-session')).turns;
  time+=3999;await idleTick();assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,pacedCount);
  time++;interruptNextFrame=true;await idleTick();
  assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,pacedCount,'interrupted partial line is not saved');
  assert.equal(elements.get('live-reply').hidden,true);
  time+=5999;await idleTick();assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,pacedCount);
  await entry.emit('compositionstart');time+=20000;await idleTick();assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,pacedCount);
  await entry.emit('compositionend');time+=6000;await idleTick();
  assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,pacedCount+1);
  assert.equal(JSON.parse(storage.get('emmichy-session')).turns,turnCount);
  assert.equal(elements.get('live-reply').hidden,true);
  const beforeName=displayed.length;
  entry.value='ヒソカ';const pendingName=talk.emit('submit');
  assert.ok(!displayed.slice(beforeName).includes('ヒソカ！'),'name is not echoed at the instant of submission');
  await pendingName;
  const heard=JSON.parse(storage.get('enny-memory-v1')).history;
  const nameIndex=heard.findLastIndex(h=>h.role==='user');
  assert.equal(heard[nameIndex+1].text,'ヒソカ！','name is heard before answer animation');
  assert.ok(delays.includes(750),'name reaction gives the player a short human pause');
  assert.equal(heard[nameIndex].text,'ヒソカ','original player input is retained');
  entry.value='チイカワ イガイ ノ ハナシ ヲ シヨウ カ';await talk.emit('submit');
  const declined=JSON.parse(storage.get('enny-memory-v1')).history;
  const declineAt=declined.findLastIndex(h=>h.role==='user');
  assert.equal(declined[declineAt+1].text,'チイカワ、ね。');
  assert.equal(declined[declineAt+2].text,'うん、別の話にしよう。');
  entry.value='2+2';await talk.emit('submit');
  pacedCount=JSON.parse(storage.get('enny-memory-v1')).history.length;
  time+=6000;await idleTick();assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,pacedCount,'new turn cancels old continuation');
  let count=JSON.parse(storage.get('enny-memory-v1')).history.length;
  entry.value='途中の下書き';await entry.emit('input');time+=9999;await idleTick();
  assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,count);
  time++;await idleTick();assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,count+1);
  await entry.emit('compositionstart');time+=20000;await idleTick();
  assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,count+1);
  await entry.emit('compositionend');time+=10000;await idleTick();
  const firstIdle=JSON.parse(storage.get('enny-memory-v1')).history.at(-1).text;
  time+=10000;await idleTick();assert.notEqual(JSON.parse(storage.get('enny-memory-v1')).history.at(-1).text,firstIdle);
  time+=10000;await idleTick();assert.equal(JSON.parse(storage.get('enny-memory-v1')).ended,false);
  const waitingCount=JSON.parse(storage.get('enny-memory-v1')).history.length;
  time=startedAt+299999;await idleTick();assert.equal(JSON.parse(storage.get('enny-memory-v1')).history.length,waitingCount);
  time++;await idleTick();const ended=JSON.parse(storage.get('enny-memory-v1'));
  assert.equal(ended.ended,true);assert.match(ended.history.at(-1).text,/バイバイ/);
  assert.notEqual(ended.history.at(-1).text,'ア、そろそろ帰るね。バイバイ！');
  assert.equal(entry.value,'途中の下書き');
  elements.get('restart-chat').onclick();assert.equal(talk.hidden,true);assert.equal(elements.get('start-choice').hidden,false);
  elements.get('new-chat').onclick();assert.equal(talk.hidden,false);assert.equal(elements.get('start-choice').hidden,true);
  assert.equal(JSON.parse(storage.get('enny-memory-v1')).ended,false);
 }finally{Date.now=originalNow;for(const [key,value] of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
