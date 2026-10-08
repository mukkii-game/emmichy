import test from 'node:test';
import assert from 'node:assert/strict';
import {contextualReply,contextualNote} from '../src/context.js';
import {conversationMove,MOVES} from '../src/moves.js';
test('short answers stay grounded without a new interview or invented meal',()=>{
 for(const input of ['うん','そう','まあ']){
  const r=conversationMove(input,{history:[{role:'user',text:'オムライス食べた'}]});
  assert.match(r.text,/オムライス/);assert.doesNotMatch(r.text,/[?？]|ちいかわ|教えて/);
 }
 const nonfood=conversationMove('そう',{history:[{role:'user',text:'パソコン買った'}]});
 assert.doesNotMatch(nonfood.text,/お腹|食べ|[?？]/);
 const tired=conversationMove('まあ',{history:[{role:'user',text:'仕事で疲れた'}]});
 assert.doesNotMatch(tired.text,/歓声|お腹|[?？]/);
 const culture=conversationMove('うん',{history:[{role:'user',text:'上履きは学校の靴だよ'}]});
 assert.match(culture.text,/靴箱|履き替/);
 const fan=conversationMove('そう',{history:[{role:'user',text:'ジョジョの好きな場面の話'}]});
 assert.match(fan.text,/手/);assert.doesNotMatch(fan.text,/[?？]/);
});
test('repeated short replies keep their topic and do not fall back to an AI interview',()=>{
 const history=[{role:'user',text:'オムライス食べた'}];
 for(const input of ['うん','そう','まあ','うん','そう']){
  const r=conversationMove(input,{history});
  assert.ok(r);assert.doesNotMatch(r.text,/[?？]|ちいかわ|喋りすぎ/);
  history.push({role:'user',text:input},{role:'enny',text:r.text});
 }
 assert.equal(conversationMove('うん？',{history}),null);
 const noFood=conversationMove('そう',{history:[{role:'user',text:'アニメ見ながらオムライス食べた'}]});
 assert.match(noFood.text,/オムライス/);assert.doesNotMatch(noFood.text,/アニメの話/);
});
test('five moves ground novel inputs and protect questions, denial and serious failure',()=>{
 const fixtures=[
  ['写真は詳しくない。今日はもう疲れた',{history:[{role:'enny',text:'好きな写真家は？'}]},'SELF_CORRECT'],
  ['うん',{history:[{role:'user',text:'オムライス食べた'}]},'NOTICE_WORDING'],
  ['傘を忘れたけど駅で借りた笑',{},'LIGHT_TEASE'],
  ['スプーンを忘れた',{conversation:{entries:[{id:'half-price-pudding'}]}},'SHARED_FRAME'],
  ['「ひと息」って休むという意味の言葉',{},'SMALL_SELF_DISCLOSURE']
 ];
 for(const [input,state,move] of fixtures){
  const r=conversationMove(input,state);assert.equal(r.move,move);assert.ok(MOVES.includes(r.move));
  assert.doesNotMatch(r.text,/[?？]|教えて|どうだった/);
  assert.notEqual(conversationMove(input,{...state,history:[...(state.history||[]),{role:'enny',text:r.text}]})?.text,r.text);
 }
 assert.equal(contextualReply('箸でうどんを食べる',{}),null);
 assert.equal(conversationMove('傘を忘れてないよ',{}),null);
 assert.equal(conversationMove('傘を忘れた',{}),null);
 assert.equal(conversationMove('傘を忘れた。どうしたらいい？',{}),null);
 assert.equal(conversationMove('傘を忘れてつらい',{}),null);
 assert.equal(conversationMove('スプーンを忘れた',{conversation:{entries:[{id:'half-price-pudding'}]},history:[{role:'enny',text:'プリンはあるのに、スプーンがないのね。'}]}),null);
 const noInventedApology=conversationMove('漫画は知らない。仕事でミスして疲れた',{});
 assert.equal(noInventedApology.move,'NOTICE_WORDING');assert.doesNotMatch(noInventedApology.text,/引っ込める|王/);
 const concrete=[
  conversationMove('うん',{history:[{role:'user',text:'オムライス食べた'}]}),
  conversationMove('机を「積読タワー」って呼んでる',{}),
  conversationMove('上履きって学校で履き替える靴だよ',{})
 ];
 assert.deepEqual(concrete.map(x=>x.move),['NOTICE_WORDING','NOTICE_WORDING','SMALL_SELF_DISCLOSURE']);
 for(const r of concrete)assert.doesNotMatch(r.text,/伝わる|輪郭|情景|深いね|味がある|[?？]/);
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
 const spoon=contextualReply('王はスプーンを忘れました',{conversation:{entries:[{id:'half-price-pudding',turn:3}]}});
 assert.doesNotMatch(spoon.text,/[?？]|次は忘れ/);assert.match(spoon.text,/王|スプーン/);
 const chopsticks=contextualReply('箸でプリンを食べるしかない',{});
 assert.doesNotMatch(chopsticks.text,/[?？]/);assert.match(chopsticks.text,/箸|王|流派|修行/);
});


test('light negated failure does not turn a food acknowledgement into distress',()=>{
 const r=conversationMove('うん',{history:[{role:'user',text:'箸でプリンを食べるしかない'},{role:'enny',text:'失敗じゃなくて、新しい流派ってことにしよう。'}]});
 assert.match(r.text,/プリン/);assert.doesNotMatch(r.text,/ゆっくり|短い返事/);
});
test('shared-name consent, correction and refusal have immediate grounded reactions',()=>{
 const state={conversation:{entries:[{id:'half-price-pudding'}]}};
 assert.doesNotMatch(conversationMove('半額王と呼んでいいよ',{}).text,/半額王/);
 assert.equal(conversationMove('王じゃなくて強者ね',state),null);
 assert.match(conversationMove('その呼び方はやめて',state).text,/やめる/);
 assert.match(conversationMove('その呼び方はやめて',{}).text,/やめる/);
 assert.equal(conversationMove('プリンは半額じゃない',{}),null);
});

test('explicit question fatigue is respected even when the last reply was not a question',()=>{
 const r=conversationMove('質問ばっかりだね',{history:[{role:'enny',text:'プリン売り場、急に修行場になった。'}]});
 assert.equal(r.move,'SELF_CORRECT');assert.doesNotMatch(r.text,/[?？]|引っ込める/);
});
