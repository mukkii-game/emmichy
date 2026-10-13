import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineFallback} from '../src/fallback.js';
test('offline daily observations stay grounded, vary and survive history restore',()=>{
 for(const [input,topic] of [['今日は雨の匂いがした',/雨|傘/],['散歩した',/散歩|歩|道/],['絵を描いた',/絵|線|描/]]){
  let state={turn:0,history:[]};const texts=new Set();
  for(let i=0;i<3;i++){
   const r=offlineFallback(input,state);
   assert.match(r.text,topic);assert.doesNotMatch(r.text,/ちいかわ|ジョジョ|電気|通電|[?？]/);
   texts.add(r.text);state.history.push({role:'enny',text:r.text});state=JSON.parse(JSON.stringify(state));state.turn++;
  }
  assert.equal(texts.size,3);
 }
});
test('uncovered questions admit uncertainty without unsolicited fact or follow-up question',()=>{
 for(const input of ['FM音源の仕組みを説明して','雨の匂いは何で起きる？','散歩は何時がいい？']){
  const r=offlineFallback(input,{},'question');assert.match(r.text,/知らない|答え/);assert.doesNotMatch(r.text,/[?？]/);
 }
 const state={history:[{role:'enny',text:offlineFallback('仕組みを説明して',{},'question').text}]};
 const ack=offlineFallback('わかった',state);assert.ok(ack);assert.doesNotMatch(ack.text,/[?？]|どうしたい/);
});
test('fallback never overwrites authored, personal, emotional or authoritative responses',()=>{
 for(const kind of ['curated','bye','name','memory','arithmetic','comfort','age','identity'])assert.equal(offlineFallback('散歩した',{},kind),null);
 for(const input of ['散歩してない','散歩したけど事故で怖かった','絵を描いてない','雨の日は嫌い','パソコンは買ってない'])assert.equal(offlineFallback(input,{}),null);
 assert.equal(offlineFallback('未知の話題',{}),null);
});
