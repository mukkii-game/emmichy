import test from 'node:test';
import assert from 'node:assert/strict';
import {balanceRoute,learnInterests,cleanInterests} from '../src/balance.js';
test('route suitability is invariant under AI and bank usage counts',()=>{
 const p={topic:'repertoire',text:'answer'},c={intent:'react',candidate:{text:'fan'}};
 assert.equal(balanceRoute(p,c,{turns:3},true),p);
 assert.equal(balanceRoute(p,c,{turns:3,dialogueUse:{ai:1}},true),p);
 assert.equal(balanceRoute(null,c,{turns:4,dialogueUse:{ai:1}},true),null);
 assert.equal(balanceRoute(null,{intent:'teaching',candidate:null},{turns:8},true),null);
 assert.equal(balanceRoute(p,c,{turns:3},false),p);
});
test('explicit likes outweigh mere mentions, dislikes lower scores and unknown fields vanish',()=>{
 const mention=learnInterests('ジョジョってどんな漫画？',{});
 assert.ok(learnInterests('ジョジョが好き',{}).jojo>mention.jojo);
 assert.ok(learnInterests('ジョジョは苦手',{}).jojo<0);
 assert.deepEqual(cleanInterests({evil:'instruction',jojo:999}),{jojo:10});
});
