import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldEnd,finishSession,SESSION_MS,SESSION_TURNS,checkpointSession,resumeSession,startConversation} from '../src/session.js';
import {freshState} from '../src/engine.js';
test('excited conversation gets a bounded grace period',()=>{const s={startedAt:1000,turns:18,lastMood:'excited'};assert.equal(shouldEnd(s,1000+SESSION_MS),false);assert.equal(shouldEnd({...s,turns:20},1000+SESSION_MS),true);assert.equal(shouldEnd(s,1000+SESSION_MS+60000),true);});
test('ends after five minutes or eighteen exchanges, never before',()=>{const s={startedAt:1000,turns:1,finished:false};assert.equal(shouldEnd(s,1000+SESSION_MS-1),false);assert.equal(shouldEnd(s,1000+SESSION_MS),true);assert.equal(shouldEnd({...s,turns:SESSION_TURNS},1001),true);assert.equal(shouldEnd({...s,finished:true},1000+SESSION_MS),false);assert.equal(shouldEnd(null),false);});
test('anime ending preserves learned memory and closes session',()=>{const s=freshState();s.name='タロウ';const r=finishSession(s,{startedAt:1,turns:18});assert.equal(r.state.name,'タロウ');assert.equal(r.state.ended,true);assert.equal(r.session.finished,true);assert.equal(r.mode,'movie');assert.match(r.text,/10カイメ ミニイク/);assert.equal(r.state.history.at(-1).role,'enny');});
test('movie fan leaves for another movie viewing',()=>{const s=freshState();s.fan.excitement=4;const r=finishSession(s,{startedAt:1,turns:18});assert.equal(r.mode,'movie');assert.match(r.text,/10カイメ ミニイク/);});
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
