import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectGap,cleanGap} from '../src/gap.js';
import {freshState,restoreState} from '../src/engine.js';
test('harmless daily topics get user requested quote and sound parodies occasionally',()=>{
 for(const [input,id] of [['新宿にいきたい','shinjuku'],['宿題をさっさと終わらせる','already'],['ゲームに負けた','lost'],['その技かっこいい','admire'],['細かい違い見つけた','notice']])assert.equal(selectGap(input,{turn:2}).id,id);
 assert.equal(selectGap('新宿にいきたい',{turn:1}),null);
 assert.equal(selectGap('新宿にいきたい',{turn:3}),null);
 const first=selectGap('新宿にいきたい',{turn:2});
 assert.equal(selectGap('新宿にいきたい',{turn:6,gap:first.memory}),null);
 assert.equal(selectGap('ゲームに負けた',{turn:6,gap:first.memory}).id,'lost');
});
test('real distress, threats and factual quote questions are not overwritten with a joke',()=>{
 for(const input of ['宿題がつらい、相談したい','上司を殺すと決めた','ゲームに負けた。死にたい','新宿で事故にあった','新宿ってどこ？','このセリフの元ネタを教えて','先生を片付ける'])assert.equal(selectGap(input,{turn:2}),null);
 assert.deepEqual(cleanGap({id:'EVIL',lastTurn:'EVIL'}),{id:'',lastTurn:-10,seen:[]});
 assert.deepEqual(restoreState({...freshState(),gap:{id:'lost',lastTurn:2}}).gap,{id:'lost',lastTurn:2,seen:[]});
});
