import test from 'node:test';
import assert from 'node:assert/strict';
import {preparedReply} from '../src/routing.js';
import {chooseRepertoire} from '../src/repertoire.js';
import {balanceRoute} from '../src/balance.js';

test('short replies keep grounded moves ahead of scripted bank and AI quota targets',()=>{
 const state={turn:6,history:[{role:'user',text:'オムライス食べた'}]};
 const repertoire={intent:'react',scripted:true,candidate:{text:'別の話も聞かせて？'}};
 for(const raw of ['うん','そう','まあ']){
  const reply=preparedReply(raw,state,{turns:6,dialogueUse:{ai:0}},{repertoire,modelEnabled:true});
  assert.match(reply.text,/オムライス/);assert.doesNotMatch(reply.text,/[?？]/);
  assert.equal(reply.topic,'conversation-move');
 }
});
test('grounded self-correction survives other authored opportunities',()=>{
 const state={history:[{role:'enny',text:'好きな漫画は？'}]};
 const r=preparedReply('漫画は知らない。質問ばっかりだね',state,{turns:4},
  {gap:{text:'new joke'},repertoire:{scripted:true,candidate:{text:'new question?'}},modelEnabled:true});
 assert.equal(r.move,'SELF_CORRECT');assert.match(r.text,/引っ込める/);
});
test('open-ended questions retain the AI path and ordinary bank balancing survives',()=>{
 const raw='FM音源の仕組みを説明して',repertoire=chooseRepertoire(raw,{turn:4});
 assert.equal(preparedReply(raw,{turn:4},{turns:4},{repertoire,modelEnabled:true}),null);
 assert.equal(balanceRoute({topic:'repertoire',text:'bank'},{},{turns:3},true),null);
});
