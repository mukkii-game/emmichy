import test from 'node:test';
import assert from 'node:assert/strict';
import {planContinuation,createContinuation} from '../src/continuation.js';
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
