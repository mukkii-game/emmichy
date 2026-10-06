import {test} from 'node:test';
import assert from 'node:assert/strict';
import {requestChat} from '../src/chat.js';
import {advancePerformance} from '../src/performance.js';
import {freshState} from '../src/engine.js';
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
