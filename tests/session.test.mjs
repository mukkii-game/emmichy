import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldEnd,finishSession,SESSION_MS,SESSION_TURNS,checkpointSession,resumeSession,startConversation} from '../src/session.js';
import {freshState,restoreState,respond} from '../src/engine.js';
import {everydayReply} from '../src/everyday.js';
test('excited conversation gets a bounded grace period',()=>{const s={startedAt:1000,turns:18,lastMood:'excited'};assert.equal(shouldEnd(s,1000+SESSION_MS),false);assert.equal(shouldEnd({...s,turns:20},1000+SESSION_MS),true);assert.equal(shouldEnd(s,1000+SESSION_MS+60000),true);});
test('automatic endings wait at least five minutes even after eighteen exchanges',()=>{const s={startedAt:1000,turns:10,finished:false};assert.equal(shouldEnd(s,1000+SESSION_MS-1),false);assert.equal(shouldEnd(s,1000+SESSION_MS),true);assert.equal(shouldEnd({...s,turns:SESSION_TURNS},1001),false);assert.equal(shouldEnd({...s,turns:SESSION_TURNS},1000+SESSION_MS),true);assert.equal(shouldEnd({...s,finished:true},1000+SESSION_MS),false);assert.equal(shouldEnd(null),false);});
test('anime ending preserves learned memory and closes session',()=>{const s=freshState();s.name='タロウ';const r=finishSession(s,{startedAt:1,turns:18});assert.equal(r.state.name,'タロウ');assert.equal(r.state.ended,true);assert.equal(r.session.finished,true);assert.equal(r.mode,'fandom');assert.match(r.text,/バイバイ/);assert.equal(r.state.history.at(-1).role,'enny');});
test('movie fan leaves for another movie viewing',()=>{const s=freshState();s.fan.excitement=4;const r=finishSession(s,{startedAt:1,turns:18});assert.equal(r.mode,'fandom');assert.match(r.text,/バイバイ/);});
test('returning later preserves played time rather than ending while away',()=>{
 const saved=checkpointSession({startedAt:1000,turns:4,finished:false},61000);
 const resumed=resumeSession(JSON.parse(JSON.stringify(saved)),361000);
 assert.equal(361000-resumed.startedAt,60000);assert.equal(resumed.turns,4);assert.equal(shouldEnd(resumed,361000),false);
 const migrated=resumeSession({startedAt:1,turns:4},999999);assert.equal(shouldEnd(migrated,999999),false);assert.equal(migrated.turns,4);
});
test('starting over clears dialogue and timer while retaining learned preferences',()=>{
 const old={...freshState(),name:'タロウ',likes:{ネコ:1},turn:18,ended:true,history:[{role:'enny',text:'バイバイ'}]};
 const next=startConversation(old,1234);assert.equal(next.state.name,'タロウ');assert.deepEqual(next.state.likes,{ネコ:1});assert.equal(next.state.ended,false);assert.deepEqual(next.state.history,[]);assert.equal(next.session.turns,0);assert.equal(next.session.startedAt,1234);
 assert.equal(old.history.length,1);
});
test('save-resume retains request cooldown and usage but new play resets both',()=>{
 const health={attempts:2,accepted:1,failed:1,rateLimited:true,retryAt:100000};
 const session=checkpointSession({startedAt:1000,turns:4,chatHealth:health,dialogueUse:{ai:1,bank:2}},2000);
 const restored=resumeSession(JSON.parse(JSON.stringify(session)),5000);
 assert.deepEqual(restored.chatHealth,health);assert.deepEqual(restored.dialogueUse,{ai:1,bank:2});
 const fresh=startConversation(freshState(),5000).session;
 assert.equal(fresh.chatHealth,undefined);assert.equal(fresh.dialogueUse,undefined);
});

import {endingReasons} from '../src/endings.js';
test('five minutes never cuts off fewer than ten exchanges; 100 endings avoid repeats',()=>{
 assert.equal(shouldEnd({startedAt:1,turns:9},SESSION_MS*3),false);
 assert.equal(shouldEnd({startedAt:1,turns:10},SESSION_MS*3),true);
 assert.equal(endingReasons.length,100);assert.equal(new Set(endingReasons).size,100);
 let s=freshState();const seen=new Set();for(let i=0;i<100;i++){const r=finishSession(s,{turns:10});assert.ok(!seen.has(r.text));seen.add(r.text);s=r.state;}
});

test('idle departures give a varied reason, avoid repeats across restore and save the complete farewell',()=>{
 let state=freshState();const reasons=new Set(),voices=new Set();
 for(let i=0;i<100;i++){
  const end=finishSession(state,{turns:2},{reason:'idle'});
  const id=end.state.endingSeen.at(-1),reason=endingReasons[id];
  assert.ok(end.text.includes(reason),'idle goodbye must state its selected departure reason');
  assert.ok(!reasons.has(reason));reasons.add(reason);voices.add(id%5);
  assert.ok(end.text.length<=160,'saved farewell must not be truncated on reload');
  assert.notEqual(end.text,'ア、そろそろ帰るね。バイバイ！');
  assert.equal(end.session.finished,true);
  state=restoreState(JSON.parse(JSON.stringify(end.state)));
  assert.equal(state.history.at(-1).text,end.text);
 }
 assert.equal(reasons.size,100);assert.equal(voices.size,5);
});

test('idle farewell recalls one shared joke and respects a refused nickname',()=>{
 let state=freshState();
 for(const line of ['プリン半額だった','半額王と呼んでいいよ','王はスプーンを忘れました'])state=respond(line,state).state;
 const end=finishSession(state,{turns:3},{reason:'idle'});
 assert.match(end.text,/半額王|王、/);assert.match(end.text,/スプーン/);
 assert.equal(end.state.conversation.endingUsed,true);
 assert.equal((end.text.match(/バイバイ/g)||[]).length,1);
 state=respond('その呼び方はやめて',state).state;
 const refused=finishSession(state,{turns:4},{reason:'idle'});
 assert.doesNotMatch(refused.text,/半額王|王、/);
});

test('idle farewell retains a daily callback only when that conversation was actually spoken',()=>{
 const input='音楽が好き',reply=everydayReply(input,freshState());
 const state={...freshState(),history:[{role:'user',text:input},{role:'enny',text:reply.text}],repertoire:{ids:[reply.id]}};
 assert.match(finishSession(state,{turns:1},{reason:'idle'}).text,/今の音楽の話/);
 assert.doesNotMatch(finishSession({...state,history:[{role:'user',text:input}]},{turns:1},{reason:'idle'}).text,/今の音楽の話/);
});
