import test from 'node:test';
import assert from 'node:assert/strict';
import {balanceRoute,learnInterests,cleanInterests,shouldRequestModel,noteDialogueMix} from '../src/balance.js';
test('good AI continuation is not stopped by a mix quota, while control answers retain their route',()=>{
 const used={dialogueUse:{ai:1},dialogueMix:{ai:1,bank:0}};
 for(const topic of ['everyday','conversation-move','chiikawa-name','repertoire','japan-place','compliment']){
  assert.equal(shouldRequestModel(used,{enabled:true,kind:'curated',topic}),true,topic);
  assert.equal(shouldRequestModel({...used,dialogueMix:{ai:1,bank:1}},{enabled:true,kind:'curated',topic}),true,topic);
 }
 for(const topic of ['profile','deflection','fandom-decline','greeting'])assert.equal(shouldRequestModel(used,{enabled:true,kind:'curated',topic}),false,topic);
 assert.equal(shouldRequestModel({}, {enabled:true,kind:'curated',topic:'profile'}),true);
 assert.equal(shouldRequestModel({}, {enabled:true,kind:'curated',topic:'profile',fixedIdentity:true}),false);
 assert.equal(shouldRequestModel(used,{enabled:true,kind:'bye'}),false);
 assert.equal(shouldRequestModel(used,{enabled:false,kind:'curated',topic:'everyday'}),false);
 assert.equal(shouldRequestModel({...used,dialogueMix:{ai:5,bank:1}},{enabled:true,kind:'fallback'}),true,'an unanswered question is not forced into an unsuitable bank');
 const session={};
 noteDialogueMix(session,{usedModel:true,topic:'everyday'});noteDialogueMix(session,{usedBank:true,topic:'profile'});noteDialogueMix(session,{usedBank:true,topic:'everyday'});
 assert.deepEqual(session.dialogueMix,{ai:1,bank:1},'closed profile and fillers do not skew the normal-reply mix');
});
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
