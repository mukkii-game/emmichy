import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanPlayerMemory,learnPlayerMessage,answerPlayerQuestion,notePlayerQuestion,choosePlayerQuestion,playerRecall,nameQuestion,questions} from '../src/player-memory.js';
import {learnerReply} from '../src/japanese-learner.js';
import {profileReply} from '../src/profile.js';
import {directReply} from '../src/dialogue-director.js';
test('name elicitation accepts a nickname, keeps a real question first, and can be declined',()=>{
 const session={turns:0};notePlayerQuestion(nameQuestion,session);
 assert.equal(answerPlayerQuestion(null,session,'日本語勉強してるの？').reply,undefined);
 const out=answerPlayerQuestion(null,session,'名前はマッキーです');assert.equal(out.name,'マッキー');assert.equal(out.memory.nickname,'マッキー');assert.equal(session.pendingQuestion,null);
 notePlayerQuestion(nameQuestion,session);assert.equal(answerPlayerQuestion(out.memory,session,'名前は言いたくない').name,'');
});
test('one word activity per play, ambiguity gets one clarification, then gives space',()=>{
 const session={turns:2};const q=choosePlayerQuestion(null,session);notePlayerQuestion(q.text,session);
 assert.equal(choosePlayerQuestion(null,session),null);assert.match(answerPlayerQuestion(null,session,'わからない').reply,/誰かな/);
 const out=answerPlayerQuestion(null,session,'うさぎかな');assert.match(out.reply,/うさぎに似て/);assert.equal(out.memory.answers[0].value,'うさぎ');assert.equal(choosePlayerQuestion(out.memory,session),null);
 const next=choosePlayerQuestion(out.memory,{turns:2});assert.notEqual(next.id,q.id);
});
test('yes/no synonyms are resolved; unknown answer is clarified once',()=>{
 const q=questions.find(q=>q.type==='yes-no'),s={turns:3};notePlayerQuestion(q.text,s);
 assert.match(answerPlayerQuestion(null,s,'うーん').reply,/はい.*いいえ/);assert.match(answerPlayerQuestion(null,s,'今は気分じゃない').reply,/別の話/);
});
test('an unrelated sentence or fandom refusal is not captured as an activity answer',()=>{
 const s={turns:3};notePlayerQuestion(questions.find(q=>q.type==='word').text,s);
 assert.equal(answerPlayerQuestion(null,s,'今日は雨の中を散歩してきた').reply,undefined);
 notePlayerQuestion(questions[0].text,s);assert.equal(answerPlayerQuestion(null,s,'ちいかわ以外の話をしたい').reply,undefined);assert.equal(s.pendingQuestion,null);
 notePlayerQuestion(questions.find(q=>q.type==='word').text,s);assert.equal(answerPlayerQuestion(null,s,'バイバイ').reply,undefined);assert.equal(s.pendingQuestion,null);
});
test('explicit creation and preferences survive cleaning; personal contact data and rejected joke are excluded',()=>{
 let memory=learnPlayerMessage(null,'ハチワレが好き');memory=learnPlayerMessage(memory,'僕の念能力は砂糖シールド');assert.ok(memory.likes.includes('ハチワレ'));assert.equal(playerRecall(cleanPlayerMemory(memory),'前に作った能力覚えてる？').includes('砂糖シールド'),true);
 assert.equal(cleanPlayerMemory({nickname:'半額王',creations:['電話番号は09012345678']}).nickname,'');assert.equal(cleanPlayerMemory({creations:['電話番号は09012345678']}).creations.length,0);
});

test('a question about a creation cannot replace its remembered name',()=>{
 const initial=learnPlayerMessage(null,'僕の念能力は砂糖シールド');
 const asked=learnPlayerMessage(initial,'前に作った能力覚えてる？');
 assert.deepEqual(asked.creations,['砂糖シールド']);
 assert.match(playerRecall(asked,'前に作った能力覚えてる？'),/砂糖シールド/);
});

test('a changed preference removes the conflicting remembered like',()=>{
 const before=learnPlayerMessage(null,'ハチワレが好き');
 const after=learnPlayerMessage(before,'ハチワレは好きじゃない');
 assert.deepEqual(after.likes,[]);assert.deepEqual(after.dislikes,['ハチワレ']);
 const changed=learnPlayerMessage(after,'ハチワレが好き');assert.deepEqual(changed.dislikes,[]);
});
test('player corrections remain unverified suggestions rather than official knowledge',()=>{
 const memory=learnPlayerMessage(null,'ヤハはハチワレじゃなく、うさぎの口癖だよ');assert.equal(memory.knowledgeSuggestions[0].category,'chiikawa');assert.equal('facts' in memory,false);
});
test('implicit Japanese study and basic Japanese queries cannot fall into whole-topic ignorance',()=>{
 for(const input of ['日本語勉強してるの？','ニホンゴ ベンキョウ シテルノ?','日本語'])assert.match(profileReply(input).text,/勉強してる/);
 assert.match(learnerReply('ありがとうって意味わかる？').text,/お礼/);
 assert.match(directReply('そこはよくわからないの。','日本語勉強してるの？',{},{source:'llm'}).text,/勉強してる/);
});
test('Yaha speaker and fake opening title repairs apply to any source without blocking Emmichy imitation',()=>{
 for(const source of ['llm','authored']){
  assert.match(directReply('ちいかわの口癖はヤハ！だよ。','ヤハの話',{},{source}).text,/うさぎの掛け声/);
  assert.match(directReply('オープニング曲「ヤハ！」が好き。','アニメの曲',{},{source}).text,/ひとりごつ/);
 }
 assert.equal(directReply('ヤハ！ アタシも元気になっちゃう。','元気だね',{},{source:'llm'}).text,'ヤハ! アタシも元気になっちゃう。');
});
