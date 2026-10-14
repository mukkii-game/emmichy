import test from 'node:test';
import assert from 'node:assert/strict';
import {notePlayerQuestion,answerPlayerQuestion,choosePlayerQuestion} from '../src/player-memory.js';
test('a generated conversation question waits for the answer without treating it as a name',()=>{
 const session={turns:4};notePlayerQuestion('二人のうち、どちらの気持ちに近い？',session);
 assert.equal(session.pendingQuestion.type,'conversation');assert.equal(session.wordQuestionAsked,true);
 assert.equal(choosePlayerQuestion({},session),null);
 const out=answerPlayerQuestion({},session,'ハチワレかな');
 assert.equal(session.pendingQuestion,null);assert.equal(out.reply,undefined);assert.equal(out.memory.nickname,'');
});
test('a generated favourite question can learn a short answer; a correction remains dialogue',()=>{
 const session={turns:4};notePlayerQuestion('好きな子は誰？',session);
 const liked=answerPlayerQuestion({},session,'ハチワレ');assert.ok(liked.memory.likes.includes('ハチワレ'));
 notePlayerQuestion('好きな子は誰？',session);
 const corrected=answerPlayerQuestion({},session,'同じことを繰り返さないで');assert.deepEqual(corrected.memory.likes,[]);
});
