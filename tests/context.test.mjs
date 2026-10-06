import test from 'node:test';
import assert from 'node:assert/strict';
import {contextualReply,contextualNote} from '../src/context.js';
test('Samon answers the preceding Giants question and a newer work replaces old context',()=>{
 const state={history:[{role:'enny',text:'巨人の星のどの試合が好き？'}]};
 assert.match(contextualReply('サモン',state).text,/左門豊作/);
 assert.equal(contextualReply('サモン',{}),null);
 assert.equal(contextualNote('サモン',{history:[...state.history,{role:'user',text:'ジョジョの話をしよう'}]}),'');
 const text=contextualReply('サモン',state).text;
 assert.notEqual(contextualReply('サモン',{history:[...state.history,{role:'enny',text}]}).text,text);
});
