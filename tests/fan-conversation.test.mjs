import test from 'node:test';
import assert from 'node:assert/strict';
import {specialistPacket,noteSpecialistDelivery,specialistPrompt} from '../src/specialist.js';
import {fanConversationReply} from '../src/fan-conversation.js';
import {directReply} from '../src/dialogue-director.js';
import {personalFanReply} from '../src/chiikawa-theme.js';

const sceneState=focus=>{
 const packet=specialistPacket(focus==='exam:cookie'?'草むしり検定のお祝いのクッキー':'草むしり検定の結果');
 const fact=packet.evidence.find(r=>r.id===focus);
 return {knowledge:{work:'chiikawa'},specialist:noteSpecialistDelivery(packet.memory,fact.spoken),dialogue:[{role:'enny',text:fact.spoken}]};
};
test('player opinions continue the examination instead of rotating to another fact',()=>{
 const state=sceneState('exam:result'),input='私は自分だけ受かったら、言いづらくなると思う';
 const packet=specialistPacket(input,state);
 assert.equal(packet.active,true);assert.equal(packet.memory.scene,'examination');assert.equal(packet.memory.focus,'exam:result');
 const answer=directReply('ちいかわも受験するの。',input,state);
 assert.match(answer.text,/言いづらくなるんだね/);assert.doesNotMatch(answer.text,/も受験/);
 assert.match(specialistPrompt(input,state),/player-view.*相手が自分の気持ちや選択/);
});
test('a player choice and a question to Emmichy stay on the gift even without lexical knowledge',()=>{
 const state=sceneState('exam:cookie');state.knowledge={};
 const input='私は食べずに写真を残したい派';
 const answer=personalFanReply(input,state);
 assert.match(answer.text,/食べずに写真で残したいんだね/);
 state.dialogue.push({role:'user',text:input},{role:'enny',text:answer.text});
 const follow=specialistPacket('えみちいならどうする？',state);
 assert.equal(follow.active,true);assert.equal(follow.memory.focus,'exam:cookie');
 const own=directReply('そこはまだよく知らないの。','えみちいならどうする？',state);
 assert.match(own.text,/アタシなら.*ココア/);assert.doesNotMatch(own.text,/知らない|写真を見返す楽しみ/);
});
test('only delivered personal angles affect the next response; matching model phrasing also counts',()=>{
 const state=sceneState('exam:cookie'),input='えみちぃならどうする？';
 const a=fanConversationReply(input,state);
 assert.equal(fanConversationReply(input,state).text,a.text);
 state.dialogue.push({role:'enny',text:'アタシなら、写真を撮ってから食べるかな。'});
 const next=fanConversationReply(input,state);
 assert.doesNotMatch(next.text,/一枚撮ってから食べる/);assert.match(next.text,/ココア/);
});
test('opinions never override fact questions, explicit profile questions, another character or refusals',()=>{
 const state=sceneState('exam:cookie');
 for(const input of ['手作りしたの？','私はラッコの甘い物の話が好き','えみちいはスウェーデン生まれなの？','ちいかわ以外の話をしたい','私は事故でつらい'])assert.equal(fanConversationReply(input,state),null,input);
 assert.equal(fanConversationReply('ちいかわがその後お祝いしたんだよね',sceneState('exam:result')),null);
 assert.equal(specialistPacket('日本語の勉強はどうするの？',state).active,false);
 assert.equal(specialistPacket('えみちいはスウェーデン生まれなの？',state).memory.scene,'');
});
test('a useful generated personal response is retained rather than replaced by the authored example',()=>{
 const state=sceneState('exam:cookie'),input='私は食べずに写真を残したい派';
 const text='写真を残したいんだね。アタシなら、あとで見返す時の楽しみまで想像しちゃう。';
 const result=directReply(text,input,state,{source:'llm'});
 assert.equal(result.text,text);assert.equal(result.source,'llm');
});
