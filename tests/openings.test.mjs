import test from 'node:test';
import assert from 'node:assert/strict';
import {openingTopics,selectOpening,planOpening,openingTiming} from '../src/openings.js';
import {restoreState,freshState} from '../src/engine.js';
test('forty opening situations do not recur in a cycle and survive saved games',()=>{
 assert.equal(openingTopics.length,40);assert.equal(new Set(openingTopics).size,40);
 let state=freshState();const texts=new Set();
 for(let i=0;i<40;i++){const pick=selectOpening(state,true);assert.ok(!texts.has(pick.text));texts.add(pick.text);state=restoreState({...state,openingSeen:pick.seen});}
 assert.equal(state.openingSeen.length,39);
 assert.deepEqual(restoreState({...state,openingSeen:[999,'evil',-1,2]}).openingSeen,[2]);
});
test('returning greeting is split into short beats, with the two topic sentences kept together',()=>{
 const saved=Math.random;Math.random=()=>0;
 try{
  const pick=selectOpening({openingSeen:Array.from({length:40},(_,i)=>i).filter(i=>i!==21)},true);
  const plan=planOpening(pick);
  assert.equal(plan.first,'おかえり！');
  assert.deepEqual(plan.later,['今日も話そう！','念を一つ考える遊びをしてたの。アタシの条件、お菓子に甘すぎる！','ちいかわの話も、ついしたくなっちゃうの。']);
  assert.deepEqual(openingTiming,{firstDelay:1500,nextDelay:1500});
 }finally{Math.random=saved;}
});
