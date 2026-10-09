import test from 'node:test';
import assert from 'node:assert/strict';
import {recognizeName,namedGesture,namedFollowup,oneEdit} from '../src/names.js';
import {chooseFiller} from '../src/filler.js';
import {nameData} from '../src/name-data.js';
import {gameNames} from '../src/game-names.js';
const hunter={knowledge:{work:'hunter'}},chii={knowledge:{work:'chiikawa'}};
test('proper nouns take priority over generic listening and retain the original input',()=>{
 for(const input of ['ヒソカ','ﾋｿｶ','ひそか']){const match=recognizeName(input,{state:hunter});assert.equal(match.name,'ヒソカ');assert.equal(chooseFiller(input,[],{match}),'ヒソカ！');}
 const raw='なんか今ハチワレみたいな言い方しちゃった';const match=recognizeName(raw,{state:hunter});assert.equal(namedGesture(match),'ハチワレ！');assert.match(namedFollowup(match,raw),/ハチワレみたい/);
 assert.equal(recognizeName('レオ リオ',{state:hunter}).name,'レオリオ');
 assert.equal(recognizeName('ハンターのバンジーガム',{state:hunter}).name,'バンジーガム');
 assert.equal(recognizeName('マイクラで遊んだ').name,'Minecraft');assert.equal(recognizeName('ELDEN RINGを遊んだ').work,'games');
 assert.equal(recognizeName('trust me'),null);assert.equal(recognizeName('今日は雨の匂いがした',{state:hunter}),null);
 assert.ok(nameData.length>500);assert.ok(gameNames.length>2500);
});
test('one-character misses and user-requested peach mishearing are bounded and never claim a canon fact',()=>{
 for(const input of ['ハチワロ','ハチワ','ハッチワレ','ハチレワ']){const match=recognizeName(input,{state:chii});assert.equal(match.name,'ハチワレ');assert.equal(match.soft,true);}
 for(const input of ['ももが美味しい','桃が美味しい']){const match=recognizeName(input);assert.equal(match.name,'モモンガ');assert.equal(match.soft,true);assert.match(namedFollowup(match),/聞こえちゃった/);}
 assert.equal(oneEdit('ヒソカ','ヒサカ'),true);assert.equal(oneEdit('ヒソカ','カエル'),false);
 assert.equal(recognizeName('つらいから相談したい'),null);
 for(const raw of ['ちいかわ以外の話をしようか','チイカワ イガイ ノ ハナシ ヲ シヨウ カ']){
  const declined=recognizeName(raw);assert.equal(declined.decline,true);assert.equal(namedGesture(declined),'チイカワ、ね。');assert.match(namedFollowup(declined),/別の話/);
 }
});

test('Usagi praise leads after JoJo rather than mishearing kakkoii as Secco',()=>{
 for(const state of [{},{knowledge:{work:'jojo'}},{knowledge:{work:'hunter'}}]){
  for(const input of ['ウサギ カッコイイヨネ','うさぎかっこいいよね','ウサギ']){
   const m=recognizeName(input,{state});assert.equal(m.name,'うさぎ');assert.equal(m.soft,false);assert.equal(namedGesture(m),'ウサギ！');
  }
 }
 assert.equal(recognizeName('うさぎを飼っている',{state:{knowledge:{work:'jojo'}}}),null);
 assert.equal(recognizeName('セッコかっこいいよね',{state:{knowledge:{work:'jojo'}}}).name,'セッコ');
});
