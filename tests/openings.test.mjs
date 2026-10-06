import test from 'node:test';
import assert from 'node:assert/strict';
import {openingTopics,selectOpening} from '../src/openings.js';
import {restoreState,freshState} from '../src/engine.js';
test('forty opening situations do not recur in a cycle and survive saved games',()=>{
 assert.equal(openingTopics.length,40);assert.equal(new Set(openingTopics).size,40);
 let state=freshState();const texts=new Set();
 for(let i=0;i<40;i++){const pick=selectOpening(state,true);assert.ok(!texts.has(pick.text));texts.add(pick.text);state=restoreState({...state,openingSeen:pick.seen});}
 assert.equal(state.openingSeen.length,39);
 assert.deepEqual(restoreState({...state,openingSeen:[999,'evil',-1,2]}).openingSeen,[2]);
});
