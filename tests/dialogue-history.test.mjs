import test from 'node:test';
import assert from 'node:assert/strict';
import {appendDialogue,substantiveHistory} from '../src/dialogue-history.js';
import {restoreState} from '../src/engine.js';

test('legacy migration keeps user wording and substantive replies while excluding generic asides',()=>{
 const raw='ウンウン…。';
 const restored=restoreState({version:1,history:[
  {role:'user',text:raw},{role:'enny',text:'ウンウン…。'},
  {role:'enny',text:'今日は雨の匂いがしたね。'}
 ]});
 assert.deepEqual(restored.dialogue,[
  {role:'user',text:raw},{role:'enny',text:'今日は雨の匂いがしたね。'}
 ]);
 assert.equal(restored.history.length,3,'legacy visible transcript remains intact');
});

test('explicit gesture metadata is filtered and adjacent delivered assistant chunks coalesce',()=>{
 const state={};
 appendDialogue(state,'user','本を買った');
 appendDialogue(state,'enny','うん、聞いてるよ。',{kind:'gesture'});
 appendDialogue(state,'enny','どんな本を買ったの？');
 appendDialogue(state,'enny','表紙を見て選んだの？');
 assert.deepEqual(state.dialogue,[
  {role:'user',text:'本を買った'},
  {role:'enny',text:'どんな本を買ったの？ 表紙を見て選んだの？'}
 ]);
 assert.deepEqual(substantiveHistory(state),[
  {role:'user',text:'本を買った'},
  {role:'enny',text:'どんな本を買ったの？ 表紙を見て選んだの？'}
 ]);
});

test('history keeps separate user turns, the latest four-turn window, and complete recent messages',()=>{
 const state={};
 for(let turn=1;turn<=12;turn++){
  appendDialogue(state,'user',`質問 ${turn}`);
  appendDialogue(state,'enny',`返事 ${turn} 前半`);
  appendDialogue(state,'enny',`返事 ${turn} 後半`);
 }
 const history=substantiveHistory(state);
 assert.equal(state.dialogue.length,20,'stored dialogue is bounded immediately');
 assert.equal(history.length,20);
 assert.deepEqual(history.slice(-8).filter(x=>x.role==='user').map(x=>x.text),['質問 9','質問 10','質問 11','質問 12']);
 assert.equal(history.at(-1).text,'返事 12 前半 返事 12 後半');
 assert.ok(history.every(x=>x.text.length<=600));
 assert.ok(history.reduce((n,x)=>n+x.text.length,0)<=6000);
});

test('restore roundtrip prefers dialogue while preserving the legacy visible history',()=>{
 const restored=restoreState({version:1,history:[{role:'user',text:'legacy'}],dialogue:[
  {role:'user',text:'新しい質問'},{role:'enny',text:'新しい返事'}
 ]});
 assert.deepEqual(substantiveHistory(restored),[
  {role:'user',text:'新しい質問'},{role:'enny',text:'新しい返事'}
 ]);
 assert.deepEqual(restored.history,[{role:'user',text:'legacy'}]);
 assert.deepEqual(substantiveHistory(restoreState(restored)),substantiveHistory(restored));
});
