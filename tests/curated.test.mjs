import {test} from 'node:test';
import assert from 'node:assert/strict';
import {curatedReply} from '../src/curated.js';
test('short fan topics get readable authored lines without repeated replies',()=>{
 const first=curatedReply('シーサーが心配',{turn:1,history:[]});
 assert.equal(first.topic,'shisa');assert.doesNotMatch(first.text,/[一-龠ぁ-ゖ]/);
 assert.notEqual(curatedReply('シーサーが心配',{turn:1,history:[{role:'enny',text:first.text}]}).text,first.text);
 assert.equal(curatedReply('ちいかわのストーリーが気になる',{}).topic,'story');
 assert.equal(curatedReply('映画ちいかわが楽しみ',{}).topic,'movie');
});
test('follow-ups, corrections and concrete questions are left to AI',()=>{
 for(const input of ['どうして？','シーサーが心配。何が起きたの？','ちいかわのストーリーのどこが好き？','映画ちいかわの公開日は？','仕事で疲れた。上司に何て言えばいい？'])assert.equal(curatedReply(input,{}),null);
});
