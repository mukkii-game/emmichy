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
