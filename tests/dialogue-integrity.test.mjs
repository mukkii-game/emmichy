import test from 'node:test';
import assert from 'node:assert/strict';
import {attributionRepair} from '../src/chiikawa-attribution.js';
import {recognizeName} from '../src/names.js';
import {feedbackIntent,updateDialogueControl} from '../src/conversation-repair.js';
import {groundModelReply} from '../src/dialogue-grounding.js';
import {dialogueSentences} from '../src/dialogue-sentences.js';
import {planContinuation} from '../src/continuation.js';

test('unquoted exclamations stay attached to the following thought or speech',()=>{
 for(const reaction of ['ヤハ！って思う。','おめでとう！ って言いたい。','エッ！？って思った。','ヤハ！ッテ オモウノ。']){
  assert.deepEqual(dialogueSentences(reaction),[reaction]);
  assert.equal(planContinuation(reaction).first,reaction);
 }
 assert.deepEqual(dialogueSentences('ヤハ！ 今日は嬉しい。'),['ヤハ！','今日は嬉しい。']);
 assert.ok(attributionRepair('ハチワレがヤハ！って言う場面が好き。'),'a missing quote must not hide a false attribution');
});

test('a grade is not Hunter character Kyuu, while the actual name still works',()=>{
 for(const input of ['5キュウ オチタ トキ','五キュウに落ちた','５キュウ オチタ'])assert.equal(recognizeName(input,{state:{knowledge:{work:'chiikawa'}}}),null);
 assert.equal(recognizeName('キュウ',{state:{knowledge:{work:'hunter'}}}).name,'キュウ');
});
test('katakana feedback is recognized without banning the current fandom topic',()=>{
 for(const input of ['オナジ コト、 クリカエシテ、 2ド モ','3カイ モ クリカエシテイルヨ。 ヤメテ','同じことを繰り返しているよ','オナジ ノ ガ ナンド モ クリカエサレテマスヨ'])assert.equal(feedbackIntent(input),'repeat');
 const control=updateDialogueControl(null,'3カイ モ クリカエシテイルヨ。 ヤメテ');
 assert.equal(control.quiet,true);assert.equal(control.avoidFandom,false);
 assert.equal(updateDialogueControl({avoidFandom:true},'ナンカ チイカワ ノ ハナシ デ モ ナニデモ イイ').avoidFandom,false);
});
test('her own catchphrase imitation is not attributed to a previously mentioned character',()=>{
 assert.equal(attributionRepair('ハチワレが好き。アタシも「ヤハ！」って言ってみると、気持ちが軽くなる気がする。'),null);
 assert.equal(attributionRepair('ハチワレの話をしよう。私が「ヤハ！」って言っても、真似しているだけ。'),null);
 assert.ok(attributionRepair('ハチワレが「ヤハ！」と叫ぶ場面が好き。'));
 assert.ok(attributionRepair('うさぎは元気だね。ハチワレの口癖は「ヤハ！」だよ。'),'another sentence mentioning Usagi must not whitelist a wrong attribution');
 assert.ok(attributionRepair('ハチワレの口癖は「ヤハ！」だよ。もしアタシだったら真似したい。'),'a later imagined sentence does not excuse a false speaker attribution');
});
test('quoted exclamations remain intact and character fantasies are not her own imagination',()=>{
 const valid='アタシも「ヤハ！」って言ってみると、気持ちが軽くなる気がする。';
 assert.deepEqual(dialogueSentences(valid),[valid]);
 assert.equal(groundModelReply(valid,'ちいかわの話',{knowledge:{work:'chiikawa'}}).text,valid);
 const falseScene='しかも、ちいかわが「プリンが降ってくる」って想像して、みんなで空想ごはんごっこしたんだ。';
 const repaired=groundModelReply(falseScene,'ちいかわの話',{knowledge:{work:'chiikawa'}});
 assert.equal(repaired.changed,true);assert.doesNotMatch(repaired.text,/プリンが降って|ごはんごっこ/);
 const wish='もしプリンが降ってきたら、アタシ、ハチワレと一緒に食べたいな。';
 assert.equal(groundModelReply(wish,'ちいかわの話',{knowledge:{work:'chiikawa'}}).text,wish);
});
test('one delivered reply does not contain the same sentence three times',()=>{
 const sentence='「ヤハ！」はうさぎの掛け声だよ！';
 const plan=planContinuation(sentence+' あの勢い、好き。 '+sentence+' '+sentence);
 assert.equal([plan.first,...plan.later].filter(s=>s===sentence).length,1);
});
