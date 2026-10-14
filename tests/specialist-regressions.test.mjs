import test from 'node:test';
import assert from 'node:assert/strict';
import {specialistPacket} from '../src/specialist.js';
import {directReply} from '../src/dialogue-director.js';
import {recognizeName} from '../src/names.js';
import {notePlayerQuestion} from '../src/player-memory.js';
import {complimentReaction,profileReply} from '../src/profile.js';
import {unwantedFanRedirect} from '../src/chat.js';
test('a title does not take the character question, and the correction changes the answer facet',()=>{
 const input='ちいかわの世界で、ハチワレってどんなところが魅力だと思う？';
 assert.equal(recognizeName(input).name,'ハチワレ');
 const p=specialistPacket(input);assert.equal(p.memory.subject,'ハチワレ');assert.equal(p.evidence[0].id,'relation:hachi-friend');
 assert.match(directReply('そこはよく知らない',input,{}).text,/ハチワレ.*友達/);
 const next=specialistPacket('私が聞きたかったのは、ハチワレの性格の話だよ',{specialist:p.memory});
 assert.equal(next.evidence[0].id,'relation:hachi-friend');
});
test('a novice invitation gets an answer and its pronoun retains her favourite',()=>{
 const input='ちいかわはあまり詳しくないんだけど、エミーちゃんは誰が好き？';
 assert.equal(unwantedFanRedirect('ハチワレの話',input),false);
 assert.equal(unwantedFanRedirect('ハチワレの話','ちいかわは詳しくない。別の話をしよう'),true);
 const p=specialistPacket(input);assert.equal(p.memory.subject,'ハチワレ');
 assert.match(directReply('そこはよく知らない',input,{}).text,/ハチワレの気遣い/);
 assert.match(directReply('そこはよく知らない','その子ってどんなところが好きなの？',{specialist:p.memory,knowledge:{work:'chiikawa'}}).text,/ハチワレ.*友達/);
});
test('reactions do not become unanswered questions; requests are not compliments',()=>{
 for(const line of ['カワイイ!?','ウサギ、スキ!?','ワオ、アタシのこと!?']){const session={};notePlayerQuestion(line,session);assert.equal(session.pendingQuestion,undefined);}
 const session={};notePlayerQuestion('好きな子は誰？',session);assert.equal(session.pendingQuestion.type,'conversation');
 assert.equal(complimentReaction('うさぎの好きなところも聞かせて'),null);
 assert.ok(complimentReaction('かわいいね'));
});
test('a method question and a snack pivot answer the known identity rather than the last lesson',()=>{
 assert.match(profileReply('スウェーデンでは日本語をどうやって勉強してるの？').text,/ノート.*会話/);
 assert.match(profileReply('ところで、最近よく食べるおやつってある？').text,/シナモンロール/);
});
test('an anaphoric water question, menu change, and no-spoiler preference keep the right scope',()=>{
 const p=specialistPacket('島二郎の水流って何？'),state={specialist:p.memory,knowledge:{work:'chiikawa'}};
 assert.equal(specialistPacket('ちいかわたちがそこで遊んでたの？',state).memory.scene,'water');
 assert.match(directReply('知らない','ちいかわたちがそこで遊んでたの？',state).text,/遊んでいた、とは言わない/);
 const menu=specialistPacket('島二郎のお店では何を出すの？',state);
 assert.equal(menu.memory.scene,'island-menu');assert.match(menu.evidence[0].fact,/カツカレーと貝汁/);
 const ear=specialistPacket('映画でモモンガがちいかわの耳を引っ張るところは？');
 const no=specialistPacket('ここから先はネタバレしないでね',{specialist:ear.memory});
 assert.equal(no.memory.spoilers,false);assert.equal(no.evidence.length,0);
 const next=specialistPacket('映画の耳のところをもう一度教えて',{specialist:no.memory});
 assert.equal(next.evidence.length,0);
});
