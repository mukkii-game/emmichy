import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldEnd,finishSession,SESSION_MS,SESSION_TURNS} from '../src/session.js';
import {freshState} from '../src/engine.js';
test('excited conversation gets a bounded grace period',()=>{const s={startedAt:1000,turns:18,lastMood:'excited'};assert.equal(shouldEnd(s,1000+SESSION_MS),false);assert.equal(shouldEnd({...s,turns:20},1000+SESSION_MS),true);assert.equal(shouldEnd(s,1000+SESSION_MS+60000),true);});
test('ends after five minutes or eighteen exchanges, never before',()=>{const s={startedAt:1000,turns:1,finished:false};assert.equal(shouldEnd(s,1000+SESSION_MS-1),false);assert.equal(shouldEnd(s,1000+SESSION_MS),true);assert.equal(shouldEnd({...s,turns:SESSION_TURNS},1001),true);assert.equal(shouldEnd({...s,finished:true},1000+SESSION_MS),false);assert.equal(shouldEnd(null),false);});
test('anime ending preserves learned memory and closes session',()=>{const s=freshState();s.name='タロウ';const r=finishSession(s,{startedAt:1,turns:18});assert.equal(r.state.name,'タロウ');assert.equal(r.state.ended,true);assert.equal(r.session.finished,true);assert.equal(r.mode,'movie');assert.match(r.text,/10カイメ ミニイク/);assert.equal(r.state.history.at(-1).role,'enny');});
test('movie fan leaves for another movie viewing',()=>{const s=freshState();s.fan.excitement=4;const r=finishSession(s,{startedAt:1,turns:18});assert.equal(r.mode,'movie');assert.match(r.text,/10カイメ ミニイク/);});
