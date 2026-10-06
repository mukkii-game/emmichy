import {test} from 'node:test';
import assert from 'node:assert/strict';
import kuromoji from 'kuromoji';
import {readableText} from '../src/readable.js';
import {respond,freshState} from '../src/engine.js';
import {requestChat} from '../src/chat.js';
const tokenizer=await new Promise((resolve,reject)=>kuromoji.builder({dicPath:'assets/dict/'}).build((error,value)=>error?reject(error):resolve(value)));
test('kanji and hiragana render as spaced full-width kana with voiced marks',()=>{
 const text=readableText('明日は仕事が忙しい。',tokenizer);
 assert.match(text,/アシタ ハ シゴト ガ イソガシイ/);
 assert.doesNotMatch(text,/[一-龠ぁ-ゖ?]/);
 assert.match(readableText('映画を観たい',tokenizer),/エイガ ヲ/);
 assert.match(readableText('ちいかわの話を知りたかった',tokenizer),/チイカワ ノ ハナシ ヲ シリタカッタ/);
 assert.match(readableText('えみちぃだよ',tokenizer),/エミチィ/);
 assert.match(readableText('ねえ Chiikawa って知ってる？',tokenizer),/Chiikawa/);
 assert.equal(readableText('ドンナ エイガ ヲ ミタイ ノ？',tokenizer),'ドンナ エイガ ヲ ミタイ ノ?');
});
test('original Japanese survives memory and the AI request without reading conversion',async()=>{
 const input='明日は仕事が忙しい';
 assert.equal(respond(input,freshState()).state.history.at(-2).text,input);
 let body;await requestChat('/chat',input,{}, {},{fetcher:async(u,o)=>{body=JSON.parse(o.body);return Response.json({text:'タイヘン ダネ',provider:'groq'});}});
 assert.equal(body.input,input);
});
test('missing display dictionary never replaces unknown kanji with question marks',()=>{
 assert.equal(readableText('ほげ 薔薇'), 'ホゲ 薔薇');
});
