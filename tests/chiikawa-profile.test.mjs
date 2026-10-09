import test from 'node:test';
import assert from 'node:assert/strict';
import {nameData} from '../src/name-data.js';
import {recognizeName} from '../src/names.js';
import {selectKnowledge} from '../src/fandom.js';
import {preparedReply} from '../src/routing.js';
import {identity,profile,profilePrompt,profileReply} from '../src/profile.js';
import {freshState,respond,restoreState} from '../src/engine.js';
import {readableText} from '../src/readable.js';
const hunter={knowledge:{work:'hunter'}};
test('expanded Chiikawa cues include the requested creators, island cast and objects',()=>{
 assert.ok(nameData.filter(n=>n.work==='chiikawa').length>=180);
 for(const word of ['トクマルシューゴ','トクマル・シューゴ','ナガノ先生','セイレーン','人魚','ヒトハ','フタバ','あの子','オリオンビール','チャルメラ','ちゃりめら','さすまた','ギョニソ','拾魔','むちゃうまヨーグルト']){
  assert.equal(recognizeName(word,{state:hunter})?.work,'chiikawa',word);
 }
 assert.equal(recognizeName('春海百乃').reading,'ハルミモモ');
 assert.equal(readableText('ハチワレのチャリメラ',null).replace(/\s/g,''),'ハチワレノチャリメラ');
});
test('Chiikawa exact and near cues lead over other works without inventing unrelated facts',()=>{
 for(const raw of ['ヒソカとチャルメラ','ジョジョの話だけどハチワロみたいだね','ドラクエを遊びながら桃が美味しい']){
  assert.equal(recognizeName(raw,{state:hunter}).work,'chiikawa',raw);
  assert.equal(selectKnowledge(raw,hunter).work,'chiikawa',raw);
 }
 assert.equal(recognizeName('ヒソカのバンジーガム',{state:hunter}).work,'hunter');
 assert.equal(selectKnowledge('ギョニソ',hunter).cards.length,0,'name alone must not select unrelated film summaries');
 assert.equal(recognizeName('パジャマを洗った',{state:hunter}),null);
 assert.equal(recognizeName('パジャマを洗った',{state:{knowledge:{work:'chiikawa'}}}).work,'chiikawa');
 assert.equal(recognizeName('今日は雨の匂いがした',{state:hunter}),null);
});
test('owned new notes answer only covered questions and honor refused and serious topics',()=>{
 const note=preparedReply('トクマルシューゴは何を担当？',hunter,{},{});
 assert.equal(note.topic,'chiikawa-name');assert.match(note.text,/音楽|作曲/);
 for(const raw of ['トクマルシューゴの最新の曲は？','ヒソカの能力は何？チャルメラ買った','ナガノ先生の最新話の結末は？'])
  assert.notEqual(preparedReply(raw,hunter,{}, {})?.topic,'chiikawa-name',raw);
 const refused={history:[{role:'user',text:'ちいかわ以外の話にして'}]};
 assert.notEqual(preparedReply('オリオンビールを買った',refused,{}, {})?.topic,'chiikawa-name');
 assert.notEqual(preparedReply('オリオンビールの話より、病気の相談がしたい',hunter,{}, {})?.topic,'chiikawa-name');
 assert.match(preparedReply('オリオンビール',hunter,{},{}).text,/缶の絵/);
});
test('one fixed identity answers personal questions without taking player facts as its own',()=>{
 assert.ok(Object.isFrozen(profile)&&Object.isFrozen(identity));
 const state=restoreState({...freshState(),name:'テスト',age:40,country:'アメリカ',profile:{home:'EVIL'},history:[{role:'user',text:'私はアメリカの40歳'}]});
 for(const raw of ['あなたは何歳？','エミチィの年齢は？'])assert.match(preparedReply(raw,state,{}, {kind:respond(raw,state).kind}).text,/17歳/);
 assert.match(profileReply('どこ出身？').text,/スウェーデン.*ヨーテボリ/);
 assert.match(profileReply('あなたは日本に来たことある？').text,/1度.*東京.*5日/);
 assert.match(profileReply('あなたの家族は？').text,/14歳の弟/);
 assert.match(profileReply('あなたは何が好き？').text,/漫画|ゲーム/);
 assert.equal(profileReply('私の家族は4人だよ'),null);
 assert.equal(profileReply('私の年齢を覚えてる？'),null);
 assert.equal(profileReply('ジョジョが好き'),null);
 assert.match(profilePrompt(),/耳知識/);assert.doesNotMatch(profilePrompt(),/EVIL|40歳|アメリカ/);
});

test('all self-name spellings get excited acknowledgement and a fixed personal answer',async()=>{
 const {selfMention,selfReaction}=await import('../src/profile.js');
 for(const name of ['えみちい','エミチイ','エミチィ','えみちぃ','emmichy','EMMICHY']){
  assert.equal(selfMention(name),true);assert.match(selfReaction(name,{turn:2}).gesture,/ワオ.*アタシのこと/);assert.match(selfReaction(name,{turn:2}).thanks,/うれしい/);
  assert.match(profileReply(name+'は何歳？').text,/17歳/);assert.match(profileReply(name).text,/スウェーデン.*17歳/);
 }
 assert.equal(selfMention('ハチワレ'),false);assert.equal(selfMention('otheremmichyapp'),false);
 assert.equal(selfReaction('えみちぃ、つらい相談だよ').thanks,null);
});
