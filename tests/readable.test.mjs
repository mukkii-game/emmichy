import {test} from 'node:test';
import assert from 'node:assert/strict';
import kuromoji from 'kuromoji';
import {readableText,loadReadings} from '../src/readable.js';
import {respond,freshState} from '../src/engine.js';
import {requestChat} from '../src/chat.js';
const tokenizer=await new Promise((resolve,reject)=>kuromoji.builder({dicPath:'assets/dict/'}).build((error,value)=>error?reject(error):resolve(value)));

test('shared proper-name dictionary protects Leorio and related names from internal word breaks',()=>{
 for(const input of ['レオリオが好き','れおりおが好き','レオ リオが好き']){assert.match(readableText(input,tokenizer),/レオリオ ガ ?スキ/);assert.doesNotMatch(readableText(input,tokenizer),/レオ リオ/);}
 assert.match(readableText('ヒソカとクラピカ',tokenizer),/ヒソカ ト クラピカ/);
 assert.match(readableText('空条承太郎と東方仗助',tokenizer),/クウジョウジョウタロウ ト ヒガシカタジョウスケ/);
});
test('kanji and hiragana render as spaced full-width kana with voiced marks',()=>{
 const text=readableText('明日は仕事が忙しい。',tokenizer);
 assert.match(text,/アシタ ハ シゴト ガ イソガシイ/);
 assert.doesNotMatch(text,/[一-龠ぁ-ゖ?]/);
 assert.match(readableText('映画を観たい',tokenizer),/エイガ ヲ/);
 assert.match(readableText('ちいかわの話を知りたかった',tokenizer),/チイカワ ノ ハナシ ヲ シリタカッタ/);
 assert.match(readableText('えみちぃだよ',tokenizer),/エミチィ/);
 assert.match(readableText('仕組みを知ってる？',tokenizer),/シッテル/);
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
test('shop names, polite prefixes and question endings remain readable units',()=>{
 for(const spelling of ['箱根そば','はこねそば','ハコネソバ'])assert.equal(readableText(spelling+'がうまいよ',tokenizer),'ハコネソバ ガ ウマイヨ');
 const text=readableText('どこのお店で食べたのか教えてくれる？',tokenizer);
 assert.match(text,/オミセ/);assert.match(text,/ノカ/);assert.doesNotMatch(text,/オ ミセ|ノ カ/);
 assert.match(readableText('お茶とご飯',tokenizer),/オチャ ト ゴハン/);
});
test('contracted and progressive verbs stay together without swallowing the next clause',()=>{
 assert.equal(readableText('ゲームを作ってた',tokenizer),'ゲーム ヲ ツクッテタ');
 assert.equal(readableText('ゲームを作っていた',tokenizer),'ゲーム ヲ ツクッテイタ');
 assert.equal(readableText('ご飯を食べてた',tokenizer),'ゴハン ヲ タベテタ');
 assert.equal(readableText('映画を見ていた',tokenizer),'エイガ ヲ ミテイタ');
 assert.equal(readableText('食べてから帰った',tokenizer),'タベテ カラ カエッタ');
 assert.equal(readableText('歩いて行った',tokenizer),'アルイテ イッタ');
});

test('a missing or broken dictionary loader resolves to usable display fallback',async()=>{
 const previous=globalThis.kuromoji;
 try{
  delete globalThis.kuromoji;assert.equal(await loadReadings(),null);
  globalThis.kuromoji={builder(){throw new Error('bad dictionary');}};
  assert.equal(await loadReadings(),null);
  assert.equal(readableText('日本語で話そう',null),'日本語デ話ソウ');
 }finally{if(previous===undefined)delete globalThis.kuromoji;else globalThis.kuromoji=previous;}
});

test('everyday dialogue uses serifu and keeps the hiragana permission verb together',()=>{
 assert.match(readableText('漫画の好きな台詞を普段の会話で使って、友達に笑われたの！',tokenizer),/スキナ セリフ ヲ/);
 assert.doesNotMatch(readableText('好きな台詞',tokenizer),/ダイシ/);
 for(const input of ['好きなことはなしていいよ','好きなこと話していいよ'])assert.equal(readableText(input,tokenizer),'スキナ コト ハナシテ イイヨ');
 assert.equal(readableText('映画の台詞',null),'映画ノ セリフ');
});

 test('self-name aliases remain one readable name',()=>{for(const name of ['えみちい','エミチイ','エミチィ','えみちぃ','emmichy'])assert.equal(readableText(name+'は何歳？',tokenizer),'エミチィ ハ ナンサイ?');});

test('colloquial contractions and conditional particles keep their readable units',()=>{
 assert.equal(readableText('シーサーの話、心配になっちゃう。好きな子だと落ち着かないね。',tokenizer),'シーサー ノ ハナシ、 シンパイ ニ ナッチャウ。 スキナ コ ダト オチツカナイネ。');
 assert.match(readableText('食べちゃう',tokenizer),/タベチャウ/);
});

test('small tsu never starts a separated interior word, including pre-spaced kana',()=>{
 for(const input of ['モモンガ、見た目はとってもキュートなのに、ちょっと意地悪なところがあるって聞いたことあるよ。','モモンガ 、 ミタメ ハ トッテモ キュートナ ノニ、 チョット イジワルナ トコロ ガ アル ッテ キイタ コト アルヨ。']){
  const text=readableText(input,tokenizer);assert.match(text,/アルッテ/);assert.doesNotMatch(text,/ ッ/);
 }
 assert.equal(readableText('ソウ ッテ イッタ',null),'ソウッテ イッタ');
});

test('small kana stay attached before and after reading conversion without merging separate words',()=>{
 for(const input of ['しゃべりかたがへんよ','シ ャベリカタガヘンヨ','シ ャベリカタ ガ ヘンヨ','喋り方が変よ']){
  assert.equal(readableText(input,tokenizer),'シャベリカタ ガ ヘンヨ');
 }
 for(const [input,want] of [['シ ャベル ノ','シャベル ノ'],['キ ュウ ケイ','キュウ ケイ'],['シ ョウガ スキ','ショウガ スキ'],['テ ィー ヲ ノム','ティー ヲ ノム'],['フ ァン ダヨ','ファン ダヨ'],['こ ゃく','コャク'],['ｼ ｬﾍﾞﾘｶﾀ ｶﾞ ﾍﾝﾖ','シャベリカタ ガ ヘンヨ']]){
  assert.equal(readableText(input,tokenizer),want);assert.equal(readableText(input,null),want);
 }
 assert.equal(readableText('キャラ ガ スキ',tokenizer),'キャラ ガ スキ');
 assert.equal(readableText('ダレカ イル\nユックリ シ ャベル',null),'ダレカ イル\nユックリ シャベル');
});
test('reported hokkori and spaced self-name preserve words and the following particle',()=>{
 assert.equal(readableText('この三つ編み',tokenizer),'コノ ミツアミ');
 for(const raw of ['ほっこり','ホッ コリ','ホッコリ'])assert.equal(readableText(raw,tokenizer),'ホッコリ');
 for(const raw of ['えみちいと話していると、楽しいよ','エ ミチ イト ハナシテイル ト、 タノシイヨ']){
  assert.match(readableText(raw,tokenizer),/^エミチィ ト /);
  assert.doesNotMatch(readableText(raw,tokenizer),/エ ミチ|チ イト/);
 }
 assert.equal(readableText('秋葉原と銀山温泉',tokenizer),'アキハバラ ト ギンザンオンセン');
});
