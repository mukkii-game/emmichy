import test from 'node:test';
import assert from 'node:assert/strict';
import {recognizeName} from '../src/names.js';
import {placeNames,placeReply} from '../src/places.js';
import {remainingTime,resumeSession} from '../src/session.js';
import {noteChiikawa,chiikawaReminder} from '../src/chiikawa-reminder.js';
import {complimentReaction} from '../src/profile.js';
import {preparedReply} from '../src/routing.js';

test('Japan names recognize kana, kanji and aliases after Chiikawa priority',()=>{
 assert.ok(placeNames.length>100);
 for(const input of ['秋葉原','アキハバラ','あきはばら','アキバ','akihabara']){
  const match=recognizeName(input);assert.equal(match.name,'秋葉原',input);
  assert.match(placeReply(match,input).text,/アニメとゲーム/);
  assert.doesNotMatch(placeReply(match,input).text,/^秋葉原[！!]/,'the body does not repeat the name gesture');
 }
 for(const input of ['京都','札幌','箱根','名古屋','銀山温泉','宇都宮'])assert.equal(recognizeName(input)?.work,'japan',input);
 assert.equal(recognizeName('秋葉原でハチワレを買った')?.name,'ハチワレ');
 for(const input of ['ならね','それはみえない'])assert.notEqual(recognizeName(input)?.work,'japan');
 assert.equal(placeReply(recognizeName('秋葉原'),'秋葉原への行き方を教えて'),null);
});
test('praise echoes its word and responds personally instead of a combat metaphor',()=>{
 for(const [raw,word] of [['カミ ガタ ガ カワイイネ','カワイイ'],['きれい','キレイ'],['キュート','キュート'],['若いね','ワカイ'],['エ ミチ イト ハナシテイル ト、 タノシイヨ','タノシイ']]){
  const praise=complimentReaction(raw);assert.equal(praise?.gesture,`${word}!?`,raw);assert.match(praise.text,/うれしい/);
  assert.equal(preparedReply(raw,{},{}).topic,'compliment');
 }
 for(const raw of ['ウサギ カッコイイヨネ','ハチワレかわいい','友達がかわいい','かわいいわけない','病気の相談があるけどかわいい'])assert.equal(complimentReaction(raw),null,raw);
});
test('ambiguous affection is heard as personal joy, explicit favourites retain their subject',()=>{
 for(const [raw,word] of [['スキダヨ','スキ'],['好きだよ','スキ'],['すきだよ','スキ'],['大好き','ダイスキ'],['だいすき','ダイスキ'],['愛','アイ'],['愛してる','アイシテル'],['あいしてる','アイシテル'],['好みだよ','コノミ'],['俺は好きだよ','スキ']]){
  const r=complimentReaction(raw);assert.equal(r?.gesture,`${word}!?`,raw);assert.equal(r.target,undefined);
  assert.match(r.text,/うれしい/);assert.match(r.text,/にやけ|跳ね|大きく/);
  assert.equal(preparedReply(raw,{},{}).topic,'compliment');
 }
 for(const [raw,target] of [['ハチワレが好き','ハチワレ'],['秋葉原が好き','秋葉原'],['京都が好み','京都']]){
  const r=complimentReaction(raw);assert.equal(r.target?.name,target);assert.equal(r.thanks,null);assert.equal(r.text,null);
  assert.match(r.gesture,/スキ|コノミ/);assert.notEqual(preparedReply(raw,{}, {})?.topic,'compliment');
 }
 assert.equal(complimentReaction('えみちいとハチワレが好き').target,undefined);
 assert.equal(complimentReaction('音楽が好き').target.name,'音楽');
 assert.equal(complimentReaction('猫が好き').target.reading,'ネコ');
 for(const raw of ['好きじゃない','スキ ジャ ナイ','愛してない','好みじゃない','あなたは何が好き？','好きなキャラは？','愛知','愛媛','あいさつ','ラブライブ'])assert.equal(complimentReaction(raw),null,raw);
 assert.match(complimentReaction('ラブライブが好き').gesture,/スキ!\?/);
 for(const raw of ['シーサーが頑張ってると応援したくなるよね。えみちぃはハチワレも好き？','あなたはハチワレが好き？','エミチィはプリンが好きなの？'])assert.equal(complimentReaction(raw),null,raw);
});
test('timer ticks by visible played seconds, clamps zero and resumes without away time',()=>{
 const s={startedAt:1000,lastSavedAt:11000,turns:2};
 assert.equal(remainingTime(null,0),'5:00');assert.equal(remainingTime(s,1000),'5:00');assert.equal(remainingTime(s,2000),'4:59');
 assert.equal(remainingTime(s,301000),'0:00');assert.equal(remainingTime(s,999999),'0:00');
 assert.equal(remainingTime(resumeSession(s,1000000),1000000),'4:50');
 assert.equal(remainingTime({...s,finished:true},2000),'0:00');
});
test('Chiikawa reminder waits two played minutes, respects refusal and resets on actual topic',()=>{
 const s={startedAt:1000,turns:4};
 noteChiikawa(s,'ハチワレが好きなの。',3000);
 assert.equal(chiikawaReminder({},s,122999),null);
 assert.match(chiikawaReminder({},s,123000),/ちいかわ/);
 noteChiikawa(s,'あ、ちいかわのこと思い出した。',123000);
 assert.equal(chiikawaReminder({},s,124000),null);
 for(const raw of ['ちいかわ以外の話をしよう','チイカワ イガイ ノ ハナシ ヲ シヨウ','病気の相談'])assert.equal(chiikawaReminder({history:[{role:'user',text:raw}]},s,300000),null,raw);
 const continued=resumeSession({...s,lastSavedAt:123000},1000000);
 assert.equal(chiikawaReminder({},continued,1000000),null);
});
