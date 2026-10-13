import test from 'node:test';
import assert from 'node:assert/strict';
import {planContinuation,createContinuation,speechChunks} from '../src/continuation.js';
import {openingTiming} from '../src/openings.js';
import {fanRecovery} from '../src/fandom.js';
test('excited fan topics are separate beats and stop when the player starts typing',()=>{
 const body=fanRecovery('ちいかわの話して？',{}),plan=planContinuation(body,'ちいかわの話して？',{}, {enthusiastic:true});
 assert.doesNotMatch(plan.first,/ラッコ|シーサー/);assert.match(plan.later.join(' '),/ハチワレ.*ラッコ.*シーサー/);
 const queue=createContinuation();queue.start(plan.later,0,plan.timing);
 assert.equal(queue.peek(1999),null);assert.ok(queue.peek(2000));
 queue.typed(2000);assert.equal(queue.peek(7999),null);assert.equal(queue.peek(8000,{composing:true}),null);assert.ok(queue.peek(8000));
 queue.clear();assert.equal(queue.pending,false);
});
test('substance precedes delayed invitation and grounded topic development',()=>{
 const p=planContinuation('チイカワ ハ チイサクテ カワイイ コタチ ノ オハナシダヨ。 シマジロウ ノ スイリュウ、アツイネ! モット キキタイ コト アル?','ちいかわって何？');
 assert.doesNotMatch(p.first,/キキタイ/);assert.match(p.later[0],/スイリュウ/);assert.match(p.later.at(-1),/聞きたいこと/);
 const water=planContinuation('島二郎の水流、熱いよ！','島二郎の水流が好き');
 assert.equal(water.later.length,2);assert.match(water.later[0],/普段.*お店/);assert.doesNotMatch(water.later.join(''),/ひとり|泣|涙|腹から/);
 assert.equal(planContinuation('どの場面が好き？','ちいかわ').later.length,0);
 assert.equal(planContinuation('トラのしまじろうだね。','しまじろう').later.length,0);
 assert.equal(planContinuation('島二郎の水流、熱いよ！','その話はやめて').later.length,0);
 assert.equal(planContinuation('島二郎のあの手を回すところ、好き！','島二郎の水流が好き').later.length,2);
 assert.equal(planContinuation('島二郎の場面はわからないの。','島二郎の水流が好き').later.length,0);
 const custom=planContinuation(`今日は本を見つけたの。
表紙の猫に目が止まっちゃった。
まだ中は読んでないよ。`,'本の話');
 assert.deepEqual(custom.later,['表紙の猫に目が止まっちゃった。','まだ中は読んでないよ。']);
});
test('opening pauses for 1.5 seconds per beat and typing or a new turn interrupts it',()=>{
 const q=createContinuation();q.start(['今日も話そう！','念を考えてたの。条件がお菓子に甘い！','ちいかわの話も。'],0,openingTiming);
 assert.equal(q.peek(1499),null);assert.equal(q.peek(1500),'今日も話そう！');
 q.spoken(1800);assert.equal(q.peek(3299),null);assert.match(q.peek(3300),/念/);
 q.typed(3300);assert.equal(q.peek(9299),null);assert.equal(q.peek(9300,{composing:true}),null);
 assert.match(q.peek(9300),/念/);q.spoken(9300);
 assert.equal(q.peek(10799),null);assert.match(q.peek(10800),/ちいかわ/);
 q.clear();assert.equal(q.peek(99999),null);
 q.start(['新しい挨拶。'],11000,openingTiming);assert.equal(q.peek(12500),'新しい挨拶。');
 // A subsequent ordinary answer restores the existing slower topic development.
 q.start(['普通の続き。'],20000);assert.equal(q.peek(23999),null);assert.equal(q.peek(24000),'普通の続き。');
});
test('long replies breathe at clauses without losing the story or breaking a quote',()=>{
 // A supplied example tests presentation, not the truth of its story claims.
 const example='コウシキデ ハ ハチワレ ガ リョウリ シタ トキ ニ、 チョット シッパイ シタ ゴハン ヲ 「 イッショ ニ タベヨウ 」 ッテ イッテ クレル シーン ガ アル ンダ ケド、 ソコ カラ インスピレーション デ ツクッタ ニンギョウ ガ アル ミタイ。';
 const p=planContinuation(example);
 assert.equal(p.first,'コウシキデ ハ ハチワレ ガ リョウリ シタ トキ ニ、');
 assert.deepEqual(p.later,['チョット シッパイ シタ ゴハン ヲ 「 イッショ ニ タベヨウ 」 ッテ イッテ クレル シーン ガ アル ンダ ケド、','ソコ カラ インスピレーション デ ツクッタ ニンギョウ ガ アル ミタイ。']);
 assert.deepEqual(p.timing.delays,[1500,1500]);
 assert.equal([p.first,...p.later].join('').replace(/\s/g,''),example.replace(/\s/g,''));
 const q=createContinuation();q.start(p.later,0,p.timing);
 assert.equal(q.peek(1499),null);assert.equal(q.peek(1500),p.later[0]);q.spoken(1700);
 assert.equal(q.peek(3199),null);assert.equal(q.peek(3200),p.later[1]);
 const many=planContinuation('最初の話だよ。次にお店の話。帰り道の話もある。家で絵を描いたの。最後にお茶を飲んだよ。');
 assert.equal(many.later.length,4);assert.equal(many.later.at(-1),'最後にお茶を飲んだよ。');
 assert.deepEqual(many.timing.delays,[4000,5000,5000,5000]);
 const quoted=planContinuation('あの子が「今日は、ここで待つね。すぐに戻るよ！」って言ってね、アタシは少しほっとしたの。');
 assert.ok([quoted.first,...quoted.later].some(s=>s.includes('「今日は、ここで待つね。すぐに戻るよ！」')));
 assert.deepEqual(planContinuation('会えた！？ 嬉しい！').later,['嬉しい！']);
});
test('breath length follows the displayed reading and avoids cutting a proper noun',()=>{
 const raw='昨日は図書館に行ってね、帰り道に本屋にも寄ったんだけど、好きな漫画の新刊があったの。';
 const chunks=speechChunks(raw,{display:s=>s.repeat(2)});
 assert.ok(chunks.length>1);assert.equal(chunks.join(''),raw);
 const name='スーパーマリオブラザーズ';
 const kana=`キノウ ${name} ヲ アソンダヨ ${name} ノ オンガク ガ スキデ ${name} ノ エ ヲ カイタノ ${name} ノ ハナシ モ シタイ`;
 const pieces=speechChunks(kana);
 assert.ok(pieces.length>1);assert.equal(pieces.join(' ').replace(/\s/g,''),kana.replace(/\s/g,''));
 assert.equal(pieces.reduce((n,s)=>n+(s.match(new RegExp(name,'g'))||[]).length,0),4);
});
test('followups wait between beats, pause during IME, resume after typing stops, and expire on new topic',()=>{
 const q=createContinuation();q.start(['同じ話の続き。','もう一言。'],0);
 assert.equal(q.peek(3999),null);assert.equal(q.peek(4000),'同じ話の続き。');
 q.typed(4000);assert.equal(q.peek(9999),null);assert.equal(q.peek(10000,{composing:true}),null);
 q.typed(10000);assert.equal(q.peek(15999),null);assert.equal(q.peek(16000),'同じ話の続き。');
 q.spoken(16000);assert.equal(q.peek(20999),null);assert.equal(q.peek(21000),'もう一言。');
 q.clear();assert.equal(q.pending,false);assert.equal(q.peek(999999),null);
 q.start(['新しい話。'],22000);assert.equal(q.peek(26000),'新しい話。');
 q.spoken(26000);assert.equal(q.peek(999999),null);
});
