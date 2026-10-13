import test from 'node:test';
import assert from 'node:assert/strict';
import {conversationRepair,updateDialogueControl,feedbackIntent,waitForPlayer} from '../src/conversation-repair.js';
import {directReply} from '../src/dialogue-director.js';
import {answerPlayerQuestion,learnPlayerMessage,questions,notePlayerQuestion} from '../src/player-memory.js';
import {freshState,restoreState} from '../src/engine.js';
import {startConversation,shouldEnd} from '../src/session.js';
import {recognizeName} from '../src/names.js';
import {profileAside,complimentReaction} from '../src/profile.js';
import {personalFanReply} from '../src/chiikawa-theme.js';
import {unwantedFanRedirect} from '../src/chat.js';

test('feedback is a conversation act before names, preferences and word activities',()=>{
 const s={turns:3};notePlayerQuestion(questions.find(q=>q.type==='word').text,s);
 const memory=answerPlayerQuestion(null,s,'ウンコウの話、これで5回目くらいかな？ ワンパターンすぎるよ');
 assert.equal(s.pendingQuestion,null);assert.deepEqual(memory.memory.answers,[]);assert.equal(memory.reply,undefined);
 assert.match(conversationRepair('ウンコウの話、これで5回目くらいかな？ ワンパターンすぎるよ').text,/同じ例.*もうやめる/);
 assert.equal(recognizeName('これで5回目くらいかな？',{state:{knowledge:{work:'chiikawa'}}}),null);
});
test('meaning of a previous self utterance never falls through to general ignorance',()=>{
 const state={history:[{role:'enny',text:'運行って言うつもりが、うんこになっちゃった。'}]};
 for(const input of ['ウンコウってあなたがいったのに、なぜ知らない？','ウンコウ']){
  const reply=directReply('そこはまだよく知らないの。',input,state,{source:'llm'});
  assert.match(reply.text,/電車|バス/);assert.doesNotMatch(reply.text,/よく知らない|覚えておく|ちいかわ/);
 }
 assert.equal(conversationRepair('許すよ。次はハチワレの話しない？',state),null,'answer the new question rather than defining an earlier word');
});
test('forgiveness is accepted, not treated as a preference or another interrogation',()=>{
 assert.match(conversationRepair('許すよ').text,/ありがとう/);
 assert.match(conversationRepair('許すって言葉を知らないのかい？').text,/責めるのをやめ/);
 const reply=directReply('ソウナノ ソレデ アナタハ ドウシタイノ?','許すよ',{},{});
 assert.doesNotMatch(reply.text,/[?？]|ちいかわ|覚えておく/);
});
test('concise and repeated-topic preferences survive restore and a new play',()=>{
 let memory=learnPlayerMessage(null,'一文が長すぎるよ。短くして');memory=learnPlayerMessage(memory,'弟の話は何度も聞いたよ');
 assert.equal(memory.conciseReplies,true);assert.ok(memory.suppressedTopics.includes('profile:family'));
 const restored=restoreState({...freshState(),playerMemory:memory,dialogueControl:{quiet:true,avoidFandom:true}});
 assert.equal(restored.dialogueControl.concise,true);
 const next=startConversation(restored).state;assert.equal(next.dialogueControl.quiet,false);
 assert.notEqual(profileAside([],0,{suppressed:memory.suppressedTopics}),'弟は14歳。アタシとゲームするの。');
});
test('quiet after feedback and a pending question does not mean changing topics',()=>{
 const control=updateDialogueControl(null,'あなたの会話、成り立ってない');
 assert.equal(control.quiet,true);assert.equal(control.avoidFandom,true);
 assert.equal(waitForPlayer({dialogueControl:control}),true);
 assert.equal(waitForPlayer({history:[{role:'enny',text:'どの番組だった？'}]}),true);
 assert.equal(unwantedFanRedirect('ちいかわの話にしよう','本当？',{dialogueControl:control}),true);
 const resumed=updateDialogueControl(control,'次はハチワレの話しない？');assert.equal(resumed.avoidFandom,false);
});
test('preference questions about a named character are not declarations of love for Emmichy',()=>{
 const input='シーサーって、頑張り屋なところが好き。えみちぃはどこが好き？';
 assert.equal(complimentReaction(input,{}),null);
 assert.match(personalFanReply(input).text,/シーサー.*頑張る/);
 assert.match(personalFanReply('シーサー、どうして読み返したくなるの？').text,/もう一回.*気持ち/);
 assert.equal(recognizeName('雨だからコーヒーを飲みながらテレビを見てるよ',{state:{knowledge:{work:'chiikawa'}}}),null);
});
test('a false authored scene attribution is repaired too',()=>{
 const reply=directReply('ちいかわのほっこりシーンで、みんなが「ヤハ」って笑うの好き。','ちいかわの話',{},{});
 assert.doesNotMatch(reply.text,/みんな.*ヤハ|ほっこりシーン/);assert.match(reply.text,/うさぎ/);
});
test('late feedback gets one bounded farewell grace period',()=>{
 assert.equal(shouldEnd({startedAt:0,turns:12,feedbackUntil:340000},320000),false);
 assert.equal(shouldEnd({startedAt:0,turns:12,feedbackUntil:340000},341000),true);
});
test('arbitrary ordinary criticism is recognized, not just the pasted wording',()=>{
 for(const text of ['会話が噛み合わないな','一言が長すぎるね','また同じネタ？','質問に答えていないよ'])assert.ok(feedbackIntent(text));
 assert.equal(feedbackIntent('シーサーが頑張る場面、好きだよ'), '');
});

test('follow-up answers the latest question rather than repeating the earlier preference',()=>{
 const question='シーサーはラーメン屋さんで働いてるんだよね。えみちぃ、さっき好きなところ話してたけど、どうして読み返したくなるの？';
 assert.match(personalFanReply(question).text,/もう一回.*気持ち/);
 assert.match(personalFanReply('シーサーが資格を取るまで頑張るって言ってたよね。えみちぃも誰かを応援するの好き？').text,/うん、好き.*頑張ってる人/);
 const meal=personalFanReply('ハチワレのご飯、失敗しても一緒に食べたいって、どうして？').text;
 assert.match(meal,/アタシの想像/);assert.doesNotMatch(meal,/公式|シーン|写真/);
});
test('owned feelings can be explained and reassurance accepted without inventing facts',()=>{
 const state={history:[{role:'enny',text:'雨の匂い、わかる。アタシ、傘を閉じた後も少し外にいたくなる。'}]};
 const out=directReply('そこはまだよく知らないの。','どんな雨の匂いを思い浮かべてるの？',state,{source:'llm'});
 assert.match(out.text,/濡れた土/);assert.doesNotMatch(out.text,/ちいかわ|知らない/);
 const good='濡れた葉っぱの匂い。窓を開けた時の空気、好きなの。';
 assert.equal(directReply(good,'どんな雨の匂い？',state,{source:'llm',allowBridge:false}).text,good);
 assert.equal(conversationRepair('どんな雨の匂い？',{}),null);
 assert.match(conversationRepair('知らないことは知らないって言ってくれたら大丈夫だよ',{history:[{role:'enny',text:'わかったふりで答えたくないな。'}]}).text,/ありがとう/);
});

test('an elliptical preference question does not turn a third-person compliment into self praise',()=>{
 assert.equal(complimentReaction('ジョジョが好き。特にジョセフの口がうまいところ。えみちぃは？'),null);
 assert.ok(complimentReaction('えみちぃが好きだよ！').text);
});

test('a good generated reason survives while its unrelated trailing question is removed',()=>{
 const input='シーサー、どうして読み返すの？';
 const text='読んでいると自分も少し頑張ろうって気持ちになるの。ヤハ！他に気になるキャラはいますか？';
 const out=directReply(text,input,{history:[{role:'enny',text:'シーサー、応援しちゃう。ヤハ！'}]},{source:'llm'});
 assert.match(out.text,/自分も少し頑張ろう/);assert.doesNotMatch(out.text,/他に|キャラは|ヤハ/);assert.equal(out.source,'mixed');
});

test('a displayed word reaction remains available for local explanation even when filtered out of model history',()=>{
 const r=conversationRepair('キセイってなに？',{dialogue:[{role:'enny',text:'聞いてるよ。'}],heardHistory:[{role:'enny',text:'キセイ！',kind:'gesture'}]});
 assert.match(r.text,/単語だけ言って/);assert.doesNotMatch(r.text,/よく知らない/);
});

test('the offline otaku answer uses the described trait instead of pretending the compliment is about Emmichy',async()=>{
 const {offlineFallback}=await import('../src/fallback.js');
 const out=offlineFallback('ジョジョが好き。特にジョセフの口がうまいところ。えみちぃは？',{},'question');
 assert.match(out.text,/ジョセフの口がうまい/);assert.match(out.text,/駆け引き/);assert.doesNotMatch(out.text,/知らない|三つ編み/);
});

test('captured real reasons keep personal feelings without a replacement topic introduction',async()=>{
 const fs=await import('node:fs');
 const captured=JSON.parse(fs.readFileSync(new URL('../docs/conversation-repair-live-20261013.json',import.meta.url)));
 const state={history:[],knowledge:{work:'chiikawa'}};
 for(const t of captured.turns.filter(t=>t.result?.text)){
  const out=directReply(t.result.text,t.input,state,{source:'llm'});
  assert.doesNotMatch(out.text,/もっと聞きたいこと|他に気になるキャラ|シーサーは郎で働く資格を得た助手/);
  assert.match(out.text,/応援したくなる|頑張ろう/);
  if(state.history.length)assert.doesNotMatch(out.text,/ヤハ/);
  state.history.push({role:'user',text:t.input},{role:'enny',text:out.text});
 }
});
