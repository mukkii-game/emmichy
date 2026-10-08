import test from 'node:test';
import assert from 'node:assert/strict';
import {everydayReply,everydayReplies,everydayEnding} from '../src/everyday.js';
import {rememberReply} from '../src/repertoire.js';
import {freshState,restoreState} from '../src/engine.js';
import {startConversation} from '../src/session.js';
import {preparedReply} from '../src/routing.js';
test('ten replayed two-beat daily arcs remain distinct after serialization and restart',()=>{
 for(const input of ['パソコン買った','オムライス食べた','本を買った','漫画は詳しくないけど、音楽の話は好きだよ']){
  let state=freshState();const chains=new Set();
  for(let play=0;play<10;play++){
   state=startConversation(restoreState(JSON.parse(JSON.stringify(state)))).state;
   const first=preparedReply(input,state,{turns:1},{modelEnabled:true});
   assert.equal(first.topic,'everyday');assert.doesNotMatch(first.text,/[?？]|ツヅキ/);
   state.repertoire=rememberReply(state,first.text,first.id,true);
   state.history=[{role:'user',text:input},{role:'enny',text:first.text}];
   const next=preparedReply('うん',state,{turns:2},{modelEnabled:true});
   assert.equal(next.topic,'everyday');assert.doesNotMatch(next.text,/[?？]/);
   state.repertoire=rememberReply(state,next.text,next.id,true);
   chains.add(first.text+'\n'+next.text);
  }
  assert.equal(chains.size,10);
  assert.equal(everydayReply(input,startConversation(state).state).topic,'everyday');
 }
});
test('unknown, distressing, denied and factual questions do not get invented daily beats',()=>{
 for(const input of ['パソコン買った？','パソコン買ってない','パソコン買ったけど壊れた','本を買った。どうして高いの？','オムライス食べた。失敗した','食べた','本を買ったという意味の言葉','パソコン買った。どんな設定が必要'])assert.equal(everydayReply(input,{}),null);
 assert.equal(everydayReply('うん',{history:[{role:'user',text:'本を買った'},{role:'enny',text:' unrelated reply'}]}),null);
});
test('no continuation is inferred from an opener that was never spoken',()=>{
 const state={history:[{role:'user',text:'パソコン買った'},{role:'enny',text:'別の話'}]};
 assert.equal(everydayReply('そう',state),null);
 assert.ok(everydayReplies.every(r=>r.text.length<180));
});


test('nonfans keep their requested music topic, with a genuine spoken ending callback',()=>{
 const input='漫画は詳しくないけど、音楽の話は好きだよ';
 const r=preparedReply(input,{}, {turns:1},{modelEnabled:true});
 assert.equal(r.topic,'everyday');assert.doesNotMatch(r.text,/ちいかわ|[?？]/);
 const state={history:[{role:'user',text:input},{role:'enny',text:r.text}],repertoire:{ids:[r.id]}};
 assert.match(everydayEnding(state),/音楽|曲/);
 assert.equal(everydayEnding({history:[{role:'user',text:input}],repertoire:{ids:[r.id]}}),'');
});
