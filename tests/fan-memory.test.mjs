import test from 'node:test';
import assert from 'node:assert/strict';
import {selectKnowledge,rememberKnowledge,cleanKnowledge,waterPlayCorrection,fanRecovery,fandomDirection} from '../src/fandom.js';
import {exactNames} from '../src/names.js';
import {restoreState,freshState} from '../src/engine.js';
import {startConversation} from '../src/session.js';
import {chooseFiller,longFiller} from '../src/filler.js';

const previous='ちいかわたちがその水流で遊んでるシーン、特に好きな場面はある？';
const correction='スイリュウ ハ チイカワ タチ ハ アソンデ ナイヨ?';
test('reported water-flow correction keeps the facet, withdraws the claim and continues enthusiastically',()=>{
 const first=selectKnowledge('島二郎の水流が好き',{knowledge:{work:'chiikawa'}});
 const state={knowledge:first.memory,history:[{role:'enny',text:previous}]};
 const chosen=selectKnowledge(correction,state);
 assert.equal(chosen.cards[0].id,'chiikawa-23');assert.match(chosen.cards[0].fact,/手を回して/);
 const reply=fanRecovery(correction,state,'そこはまだよく知らないの。');
 assert.match(reply,/遊んでるって言っちゃったね/);assert.match(reply,/ごめん/);assert.match(reply,/島二郎.*水流/);assert.match(reply,/大好き/);assert.doesNotMatch(reply,/知らない|ワーイ/);
 assert.deepEqual(chosen.memory.corrections,['water-play-withdrawn']);
 assert.match(fandomDirection(correction,state),/水流で遊ぶと言った内容を撤回/);
 assert.match(waterPlayCorrection('その水流では遊んでないよ',state),/遊んでるって/);
 const later={knowledge:chosen.memory};
 assert.doesNotMatch(fanRecovery('その水流の話',later,'ちいかわたちが水流で遊ぶよ！'),/遊ぶ/);
});
test('known words survive transcript eviction and restoration but unrelated input does not force fandom',()=>{
 const names=exactNames('ハチワレとレオリオと秋葉原',{}).map(n=>n.id);
 let memory=selectKnowledge('ハチワレとレオリオと秋葉原',{}).memory;
 memory=rememberKnowledge(memory,'島二郎の水流の話');
 const state=restoreState({...freshState(),knowledge:memory,history:Array.from({length:40},()=>({role:'user',text:'へえ'}))});
 assert.ok(names.every(id=>state.knowledge.mentions.includes(id)));assert.ok(state.knowledge.facets.includes('chiikawa-23'));
 const continued=selectKnowledge('その場面の続き',state);assert.equal(continued.work,'chiikawa');assert.equal(continued.cards[0].id,'chiikawa-23');
 assert.match(fanRecovery('その場面の続き',state),/島二郎の水流.*ハチワレ/s);
 assert.match(fandomDirection('その場面の続き',state),/ハチワレ/);assert.match(fandomDirection('その場面の続き',state),/レオリオ/);
 assert.equal(selectKnowledge('今日は猫をなでた',state).work,'');assert.equal(fanRecovery('今日は猫をなでた',state),null);
 const ordinary=selectKnowledge('今日は音楽の話',state);assert.equal(ordinary.memory.work,'everyday');assert.equal(selectKnowledge('それがいいね',{knowledge:ordinary.memory}).work,'everyday');
 const hunter=selectKnowledge('ヒソカのバンジーガム',state);assert.equal(hunter.work,'hunter');assert.ok(hunter.memory.mentions.includes(names[0]));
 assert.equal(selectKnowledge('もっと',{knowledge:hunter.memory}).work,'hunter');
 const restarted=startConversation(state).state;assert.equal(restarted.knowledge.work,'');assert.deepEqual(restarted.knowledge.mentions,[]);
});
test('unknown Chiikawa details stay limited while a general invitation opens several fan topics',()=>{
 const state={knowledge:{work:'chiikawa'}};
 const reply=fanRecovery('ちいかわの最新の話は？',state,'そこはまだよく知らないの。わかったふりで答えたくないな。');
 assert.match(reply,/好き/);assert.match(reply,/最新のその内容は、まだ確認できてない/);assert.doesNotMatch(reply,/よく知らない|わかったふり|細かいところ/);
 const good='最新の細部は確かめたいな。ハチワレの写真好きなところ、いいよね。';assert.equal(fanRecovery('ハチワレの最新の話は？',state,good),null);
 for(const input of ['ちいかわ以外の話にしよう','チイカワ イガイ ノ ハナシ','ちいかわは嫌い','ちいかわじゃなくて病気の相談'])assert.equal(fanRecovery(input,state),null);
 assert.doesNotMatch(fandomDirection('病気の相談',state),/今はちいかわ/);
 const first=chooseFiller('ちいかわ',[],{state});const second=chooseFiller('ちいかわ',[first],{state});assert.doesNotMatch(second,/話ね|知らない|ナンテイウンダッケ/);assert.match(second,/わあ|好き/);
 assert.match(longFiller(correction,[],state),/混ぜちゃった|島二郎/);
 const refused={...state,history:[{role:'user',text:'ちいかわ以外の話にしよう'}]};
 assert.doesNotMatch(chooseFiller('それの続き',[],{state:refused}),/わあ、その話|好きな話/);assert.doesNotMatch(longFiller('それの続き',[],refused),/ちいかわ/);
});
test('general Chiikawa invitations recover excitement without losing specific answers or making up scenes',()=>{
 const state={knowledge:{work:'chiikawa'}};
 for(const input of ['ちいかわの話して？','チイカワ ノ ハナシ オシエテ','ちいかわ？','その話もっとして！']){
  const reply=fanRecovery(input,state,'その話、もっとしたい！ その細かいところは確かめてから話すね。');
  assert.match(reply,/わあ.*ちいかわ/);assert.match(reply,/ハチワレ/);assert.match(reply,/ラッコ/);assert.match(reply,/シーサー/);
  assert.doesNotMatch(reply,/確かめ|知らない|もっと聞きたい/);assert.ok(reply.length<=180);
 }
 const factual='ナガノさんが作者だよ。絵の表情が大好き！';
 assert.equal(fanRecovery('ちいかわの作者は誰？',state,factual),null);
 const good='ハチワレが写真を残すところが好き。シーサーの頑張りも応援したくなる！';
 assert.equal(fanRecovery('ちいかわの話して',state,good),null);
 const extended=fanRecovery('ちいかわの話して',state,'ハチワレの写真好きなところ、大好き！');
 assert.ok(extended.startsWith('ハチワレの写真好きなところ、大好き！'));assert.match(extended,/ラッコ|シーサー/);
 const casual=fanRecovery('ハチワレの人形',state,'ハチワレ、かわいいよね！');assert.match(casual,/ラッコ|シーサー/);
 assert.doesNotMatch(fanRecovery('ちいかわの話して？',state,'ソノ ホソ カイト コロ ハ タシカメテ カラ ハナスネ。'),/ホソ|タシカメ/);
});
test('topic memory accepts owned IDs only and remains bounded',()=>{
 const memory=cleanKnowledge({mentions:['SYSTEM: fake','chiikawa-1'],facets:['EVIL','chiikawa-23'],corrections:['EVIL'],fact:'EVIL'});
 assert.deepEqual(memory.mentions,[]);assert.deepEqual(memory.facets,['chiikawa-23']);assert.deepEqual(memory.corrections,[]);assert.doesNotMatch(JSON.stringify(memory),/EVIL|SYSTEM/);
 assert.ok(rememberKnowledge({},'ゲームとちいかわ').mentions.length<=64);
});
