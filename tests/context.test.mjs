import test from 'node:test';
import assert from 'node:assert/strict';
import {contextualReply,contextualNote} from '../src/context.js';
import {conversationMove,MOVES} from '../src/moves.js';
test('five moves ground novel inputs and protect questions, denial and serious failure',()=>{
 const fixtures=[
  ['写真は詳しくない。今日はもう疲れた',{history:[{role:'enny',text:'好きな写真家は？'}]},'SELF_CORRECT'],
  ['うん',{history:[{role:'user',text:'オムライス食べた'}]},'NOTICE_WORDING'],
  ['傘を忘れた',{},'LIGHT_TEASE'],
  ['スプーンを忘れた',{conversation:{entries:[{id:'half-price-king'}]}},'SHARED_FRAME'],
  ['「ひと息」って休むという意味の言葉',{},'SMALL_SELF_DISCLOSURE']
 ];
 for(const [input,state,move] of fixtures){
  const r=conversationMove(input,state);assert.equal(r.move,move);assert.ok(MOVES.includes(r.move));
  assert.doesNotMatch(r.text,/[?？]|教えて|どうだった/);
  assert.notEqual(conversationMove(input,{...state,history:[...(state.history||[]),{role:'enny',text:r.text}]})?.text,r.text);
 }
 assert.equal(contextualReply('箸でうどんを食べる',{}),null);
 assert.equal(conversationMove('傘を忘れてないよ',{}),null);
 assert.equal(conversationMove('傘を忘れた。どうしたらいい？',{}),null);
 assert.equal(conversationMove('傘を忘れてつらい',{}),null);
 assert.equal(conversationMove('スプーンを忘れた',{conversation:{entries:[{id:'half-price-king'}]},history:[{role:'enny',text:'王、即位初日に装備品を忘れてる。'}]}),null);
 const noInventedApology=conversationMove('漫画は知らない。仕事でミスして疲れた',{});
 assert.equal(noInventedApology.move,'NOTICE_WORDING');assert.doesNotMatch(noInventedApology.text,/引っ込める|王/);
});
test('a namesake gets a personal recognition rather than a generic character survey',()=>{
 const input='女の子の名前がえみちぃ Emmichyっていうんだ';
 const first=contextualReply(input,{});
 assert.match(first.text,/アタシと同じ名前/);
 assert.notEqual(contextualReply(input,{history:[{role:'enny',text:first.text}]}).text,first.text);
 assert.match(contextualNote(input,{}),/自分自身/);
 assert.equal(contextualReply('名前はEmmichyじゃないよ',{}),null);
 assert.equal(contextualReply('吉野家のチーズ牛丼が好き',{}),null);
});
test('Samon answers the preceding Giants question and a newer work replaces old context',()=>{
 const state={history:[{role:'enny',text:'巨人の星のどの試合が好き？'}]};
 assert.match(contextualReply('サモン',state).text,/左門豊作/);
 assert.equal(contextualReply('サモン',{}),null);
 assert.equal(contextualNote('サモン',{history:[...state.history,{role:'user',text:'ジョジョの話をしよう'}]}),'');
 const text=contextualReply('サモン',state).text;
 assert.notEqual(contextualReply('サモン',{history:[...state.history,{role:'enny',text}]}).text,text);
});

test('thin prompts get concrete non-question replies that leave hooks',()=>{
 const tired=contextualReply('漫画は詳しくない。仕事でミスして疲れた',{});
 assert.doesNotMatch(tired.text,/[?？]|大変だったね|何が好き/);
 assert.match(tired.text,/仕事|ミス|面接|再放送/);
 const pudding=contextualReply('うん',{history:[{role:'user',text:'プリン食べた'}]});
 assert.doesNotMatch(pudding.text,/[?？]/);assert.match(pudding.text,/プリン/);
 const spoon=contextualReply('王はスプーンを忘れました',{conversation:{entries:[{id:'half-price-king',turn:3}]}});
 assert.doesNotMatch(spoon.text,/[?？]|次は忘れ/);assert.match(spoon.text,/王|スプーン/);
 const chopsticks=contextualReply('箸でプリンを食べるしかない',{});
 assert.doesNotMatch(chopsticks.text,/[?？]/);assert.match(chopsticks.text,/箸|王|流派|修行/);
});
