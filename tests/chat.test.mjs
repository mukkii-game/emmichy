import {test} from 'node:test';
import assert from 'node:assert/strict';
import {requestChat} from '../src/chat.js';
import {advancePerformance} from '../src/performance.js';
import {freshState} from '../src/engine.js';
import {rejectedJoke} from '../src/humor.js';

test('player-rejected nickname cannot reappear from a provider, including kana and spaced forms',async()=>{
 for(const text of ['半額王、またね。','ハンガク オウ！','ﾊﾝｶﾞｸ ｵｳ','はんがくおう','半額 オウ']){
  assert.equal(rejectedJoke(text),true);let calls=0;const session={};
  const result=await requestChat('/chat','プリンを買った',{},session,{fetcher:async()=>{calls++;return Response.json({text,provider:'groq'});}});
  assert.equal(result,null);assert.equal(calls,1);assert.equal(session.chatHealth.rejected,1);
 }
 assert.equal(rejectedJoke('王道のプリンが半額だった。'),false);
 assert.ok(await requestChat('/chat','プリンを買った',{}, {},{fetcher:async()=>Response.json({text:'プリン、アタシも食べたくなった。',provider:'groq'})}));
});
test('provider and the complete state contract reach the relay',async()=>{
 let payload;const state=advancePerformance(freshState(),'好きなゲーム',8);
 const got=await requestChat('https://relay/api/chat/emmichy','ゲーム',state,{turns:8},{fetcher:async(u,o)=>{payload=JSON.parse(o.body);return Response.json({text:'ナニ デ アソンデル？',provider:'groq'});}});
 assert.equal(got.provider,'groq');assert.deepEqual(Object.keys(payload),['input','state','session']);assert.equal(payload.state.speechStyle,'quoted_noun');assert.equal(payload.system,undefined);
});
test('unavailable, rate-limited, bad responses and disconnected network return fallback signal',async()=>{
 for(const fetcher of [async()=>new Response('',{status:502}),async()=>new Response('',{status:429}),async()=>{throw new TypeError('offline');},async()=>Response.json({text:42}),async()=>Response.json({text:'x'.repeat(181)})])assert.equal(await requestChat('https://relay','hi',{}, {},{fetcher}),null);
 let called=false;assert.equal(await requestChat('https://relay','hi',{}, {},{offline:true,fetcher:async()=>{called=true;}}),null);assert.equal(called,false);
});
test('plain Japanese from the relay can be converted locally instead of burdening the model',async()=>{
 const text='かわいいのに、急にこわくなるよね。';
 const got=await requestChat('/chat','ちいかわの話',{}, {},{fetcher:async()=>Response.json({text,provider:'gemini'})});assert.equal(got.text,text);
});
test('teaching raises curiosity and excitement without changing factual history',()=>{
 const state=freshState(),next=advancePerformance(state,'実はその名前は昔のゲームの元ネタなんだ',6);
 assert.ok(next.performance.curiosity>advancePerformance(state,'こんにちは',6).performance.curiosity);
 assert.ok(next.performance.hype>0);assert.deepEqual(next.history,[]);
});

test('explicit nonfan topic switch rejects unsolicited fan redirection without a retry',async()=>{
 const input='漫画は詳しくないけど、音楽の話は好きだよ';
 let calls=0;
 const fetcher=async()=>{calls++;return Response.json({text:'音楽もいいね。ちいかわが歌ったらかわいい！',provider:'groq'});};
 assert.equal(await requestChat('/chat',input,{}, {},{fetcher}),null);
 assert.equal(calls,1);
 const state={history:[{role:'user',text:input}]};
 assert.equal(await requestChat('/chat','ギターも好き',state,{}, {fetcher}),null);
 assert.ok(await requestChat('/chat','ジョジョの曲が好き',state,{}, {fetcher}));
 assert.ok(await requestChat('/chat',input,{}, {},{fetcher:async()=>Response.json({text:'アタシ、好きな曲だと歩く速さが変わる。',provider:'groq'})}));
 assert.ok(await requestChat('/chat','ギターも好き',{}, {},{fetcher}));
});

test('429 stops provider requests for this play and survives saved-session restore',async()=>{
 const session={turns:4};let calls=0;
 const fetcher=async()=>{calls++;return new Response('',{status:429});};
 await requestChat('/chat','自由な話',{},session,{fetcher,now:1000});
 const restored=JSON.parse(JSON.stringify(session));
 await requestChat('/chat','別の話',{},restored,{fetcher,now:999999});
 assert.equal(calls,1);assert.equal(restored.chatHealth.failed,1);
 assert.equal(restored.chatHealth.lastOutcome,'rate-limit');
 const fresh={};await requestChat('/chat','新しいプレイ',{},fresh,{fetcher,now:999999});
 assert.equal(calls,2);
});
test('network failure cools down, then recovers with separate communication counters',async()=>{
 const session={};let calls=0;
 const failed=async()=>{calls++;throw new TypeError('offline');};
 await requestChat('/chat','a',{},session,{fetcher:failed,now:1000});
 await requestChat('/chat','b',{},session,{fetcher:failed,now:2000});
 assert.equal(calls,1);
 const success=async()=>{calls++;return Response.json({text:'それ、気になるね。',provider:'groq'});};
 assert.ok(await requestChat('/chat','c',{},session,{fetcher:success,now:61000}));
 assert.equal(calls,2);assert.equal(session.chatHealth.attempts,2);
 assert.equal(session.chatHealth.failed,1);assert.equal(session.chatHealth.accepted,1);
});
test('quality rejection is counted as communication, offline replies are not',async()=>{
 const session={};const fetcher=async()=>Response.json({text:'ちいかわ！',provider:'groq'});
 await requestChat('/chat','漫画は詳しくない。別の話がいい',{},session,{fetcher});
 assert.equal(session.chatHealth.attempts,1);assert.equal(session.chatHealth.rejected,1);
 assert.equal(session.chatHealth.accepted,0);
 await requestChat('/chat','hello',{},session,{offline:true,fetcher});
 assert.equal(session.chatHealth.attempts,1);
});
