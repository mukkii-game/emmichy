import test from 'node:test';
import assert from 'node:assert/strict';
import {chiikawaRelations,relatedChiikawa,relationPrompt,serialCoverage} from '../src/chiikawa-relations.js';
import {directReply} from '../src/dialogue-director.js';
import {selectChiikawaBridge} from '../src/chiikawa-theme.js';
test('every relation has independently inspectable fact, source, date and association boundaries',()=>{
 assert.equal(new Set(chiikawaRelations.map(r=>r.id)).size,chiikawaRelations.length);
 for(const r of chiikawaRelations){
  for(const key of ['subject','predicate','object','fact','feeling','source','checkedAt','scope','spoiler'])assert.ok(r[key],r.id+': '+key);
  assert.match(r.source,/^https:\/\//);assert.match(r.checkedAt,/^\d{4}-\d{2}-\d{2}$/);assert.ok(r.limits.length);
 }
});
test('concrete actor and facet outrank unrelated knowledge and survive anaphora',()=>{
 const photo=relatedChiikawa('ハチワレの写真');assert.equal(photo[0].cardId,'chiikawa-9');assert.ok(photo.every(r=>r.subject==='ハチワレ'));
 const follow=relatedChiikawa('そう、何でもない日も残したくなるね',{knowledge:{work:'chiikawa',focus:'chiikawa-9'}});assert.equal(follow[0].cardId,'chiikawa-9');
 assert.equal(relatedChiikawa('ちいかわ本人のどんなところが好き？')[0].subject,'ちいかわ');
 assert.equal(relatedChiikawa('ヒトハとフタバ')[0].object,'フタバ');
 assert.equal(relatedChiikawa('無関係な文字列').length,0);
});
test('an association never makes a new canon food or scene fact',()=>{
 const pudding=relatedChiikawa('プリンを買った')[0];assert.equal(pudding.subject,'ラッコ');assert.equal(pudding.match,'association');assert.doesNotMatch(pudding.fact,/プリン/);
 assert.match(relationPrompt('プリンを買った'),/入力の物が原作に登場したとは言わない/);
 const drive=selectChiikawaBridge('ドライブに行ってきた');assert.match(drive.text,/ラッコ/);assert.match(drive.fact,/運転免許/);
 const menu=relatedChiikawa('島二郎のフルーツパフェ')[0];assert.equal(menu.cardId,'chiikawa-25');assert.match(menu.limits.join(''),/作ると結び付けない/);
});
test('latest manga is explicitly unverified, separate from old reports and anime updates',()=>{
 assert.equal(serialCoverage.currentVerified,false);
 const prompt=relationPrompt('今連載しているシーサーはどうなった？');assert.match(prompt,/最新本文を取得できていない/);assert.doesNotMatch(prompt,/星を助け|免許証が現れ/);
 const out=directReply('最新話でシーサーは全部解決したよ。','ちいかわの最新話どうなった？',{},{source:'llm'});
 assert.equal(out.source,'authored');assert.match(out.text,/最新話の細部/);assert.doesNotMatch(out.text,/全部解決/);
 assert.doesNotMatch(directReply('新しい映画、楽しみだね。','今の映画の話をしよう',{},{source:'llm'}).text,/最新話の細部/);
});
