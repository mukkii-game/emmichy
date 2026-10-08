import test from 'node:test';
import assert from 'node:assert/strict';
import {preparedReply} from '../src/routing.js';
import {chooseRepertoire} from '../src/repertoire.js';
import {balanceRoute} from '../src/balance.js';
import {cultureReply} from '../src/culture.js';
import {selectGap} from '../src/gap.js';
import {freshState,respond} from '../src/engine.js';

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
 const answer={topic:'repertoire',text:'bank'};
 assert.equal(balanceRoute(answer,{},{turns:3},true),answer);
});


test('authored ordinary chat cannot overwrite authoritative name, memory, math or farewell',()=>{
 for(const kind of ['bye','asleep','name','memory','arithmetic'])
  assert.equal(preparedReply('パソコン買った',{}, {turns:1},{kind}),null);
});
test('denied, unfamiliar and analytical inputs do not inherit the previous fandom bank',()=>{
 for(const raw of ['パソコンは買ってない','漫画じゃなくて散歩の話にしよう','音楽は好きじゃない','本を買ったけど盗まれた','今日は雨の匂いがした','FM音源の仕組みを説明して']){
  const state={...freshState(),turn:5,knowledge:{work:'chiikawa',recent:[]},history:[{role:'user',text:'ちいかわが好き'}]};
  const repertoire=chooseRepertoire(raw,state),kind=respond(raw,state).kind;
  assert.equal(repertoire.candidate,null,raw);
  assert.equal(preparedReply(raw,state,{turns:5},{modelEnabled:true,kind,repertoire,culture:cultureReply(raw,state,repertoire.intent),gap:selectGap(raw,state)}),null,raw);
 }
});
