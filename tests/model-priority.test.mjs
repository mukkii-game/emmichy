import test from 'node:test';
import assert from 'node:assert/strict';

test('actual screen requests AI for its first ordinary bank turn, retries failure and resets per conversation',async()=>{
 const keys=['document','window','location','localStorage','sessionStorage','Image','setInterval','setTimeout','clearTimeout','fetch'];
 const saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]])),realNow=Date.now;
 class Element{
  constructor(){this.children=[];this.listeners={};this.value='';this.textContent='';}
  append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}
  get firstChild(){return this.children[0];}addEventListener(t,fn){(this.listeners[t]??=[]).push(fn);}
  async emit(t){for(const fn of this.listeners[t]||[])await fn({preventDefault(){}});}
  setAttribute(){}focus(){}getContext(){return {fillRect(){},save(){},scale(){},restore(){}};}
 }
 const elements=new Map(),storage=new Map(),requests=[],intervals=[];let now=1000000,fail=false;
 const store={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 try{
  globalThis.document={hidden:false,getElementById:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement:()=>new Element(),addEventListener(){}};
  globalThis.window={addEventListener(){}};globalThis.location={hostname:'preview.invalid',search:''};
  globalThis.localStorage=store;globalThis.sessionStorage=store;globalThis.Image=class{};
  globalThis.setInterval=(fn,ms)=>{intervals.push({fn,ms});return 0;};globalThis.setTimeout=(fn,ms)=>{if(ms<2000)queueMicrotask(fn);return 0;};globalThis.clearTimeout=()=>{};Date.now=()=>now;
  globalThis.fetch=async(url,options)=>{const payload=JSON.parse(options.body);requests.push(payload);return fail?new Response('',{status:503}):Response.json({text:payload.input.includes('プリン')?'プリン、ひと口ずつ食べたいね。アタシなら途中で我慢できなくなっちゃう。':'その街の話、聞けてうれしい！ 地図を一緒に見たいな。',provider:'groq'});};
  await import('../src/app.js?first-model-test');await Promise.resolve();
  const send=async raw=>{elements.get('entry').value=raw;await elements.get('talk').emit('submit');};
  const session=()=>JSON.parse(storage.get('emmichy-session'));
  const draw=intervals.find(x=>x.ms===160).fn,idle=intervals.find(x=>x.ms===250).fn;
  assert.equal(elements.get('remaining-time').textContent,'5:00');
  await send('スウェ ー デン ウマレナ ノ?');assert.equal(requests.length,0,'her fixed birthplace is answered immediately before the first AI turn');
  assert.match(JSON.parse(storage.get('enny-memory-v1')).history.at(-1).text,/生まれ育った/);
  now+=1000;draw();assert.equal(elements.get('remaining-time').textContent,'4:59');
  await send('アキハバラ');
  assert.equal(requests.length,1,'a prepared place reply no longer prevents the first AI call');
  assert.equal(session().dialogueUse.ai,1);
  assert.match(JSON.parse(storage.get('enny-memory-v1')).history.at(-1).text,/その街/);
  await send('あなたは何歳？');assert.equal(requests.length,1,'after success a closed profile answer stays local');
  await send('プリンを食べたよ');assert.equal(requests.length,2,'an ordinary prepared answer keeps using AI after the first success');
  assert.equal(session().dialogueUse.ai,2);assert.match(JSON.parse(storage.get('enny-memory-v1')).history.at(-1).text,/ひと口ずつ/);
  elements.get('restart-chat').onclick();elements.get('new-chat').onclick();
  assert.equal(session().dialogueUse,undefined);
  fail=true;await send('アキハバラ');assert.equal(requests.length,3);assert.equal(session().dialogueUse.ai,0);
  assert.match(JSON.parse(storage.get('enny-memory-v1')).history.at(-1).text,/アニメとゲーム/,'connection failure retains the relevant prepared reply');
  await send('あなたは何歳？');assert.equal(requests.length,3,'failure cooldown is honored');
  now+=60001;fail=false;await send('あなたは何歳？');assert.equal(requests.length,4);assert.equal(session().dialogueUse.ai,1);
  elements.get('restart-chat').onclick();elements.get('new-chat').onclick();
  await send('エッチ');assert.equal(requests.length,4,'sensitive redirection stays authored even before any AI success');
  // Cancel the old continuation with an ordinary turn, then let it finish.
  await send('あなたは何歳？');
  for(let i=0;i<6;i++){now+=6000;await idle();}
  const count=()=>JSON.parse(storage.get('enny-memory-v1')).history.length;
  now=session().startedAt+(session().lastChiikawaElapsed||0)+120000;
  elements.get('entry').value='途中の入力';await elements.get('entry').emit('input');
  let prior=count();await idle();assert.equal(count(),prior,'draft typing prevents an unsolicited topic reminder');
  elements.get('entry').value='';await elements.get('entry').emit('input');
  now+=6000;prior=count();await idle();assert.equal(count(),prior+1);
  assert.match(JSON.parse(storage.get('enny-memory-v1')).history.at(-1).text,/ちいかわ/);
  assert.equal(session().chiikawaReminders,1);assert.equal(requests.length,5,'the reminder never spends an extra AI request');
 }finally{Date.now=realNow;for(const key of keys)if(saved[key]===undefined)delete globalThis[key];else globalThis[key]=saved[key];}
});
