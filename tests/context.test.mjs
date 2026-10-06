import test from 'node:test';
import assert from 'node:assert/strict';
import {contextualReply,contextualNote} from '../src/context.js';
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
