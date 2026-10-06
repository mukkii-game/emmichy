import {test} from 'node:test';
import assert from 'node:assert/strict';
import {replies,chooseRepertoire,cleanRepertoire,rememberReply,polishReply} from '../src/repertoire.js';
import {freshState,restoreState} from '../src/engine.js';
import {startConversation} from '../src/session.js';
import {cultureReply} from '../src/culture.js';
test('expanded bank is genuinely distinct and all three favourite fandoms reach tenfold reply counts',()=>{
 assert.equal(replies.length,1200);assert.equal(new Set(replies.map(r=>r.text)).size,1200);
 for(const [w,n] of [['chiikawa',320],['jojo',200],['hunter',200]])assert.equal(replies.filter(r=>r.work===w).length,n);
 for(const r of replies){assert.ok(r.text.length<=180);assert.ok(!r.text.includes('undefined'));}
});
test('covered facts answer precisely; analysis and teaching stay with AI',()=>{
 const gum=chooseRepertoire('ヒソカのバンジーガムって何？',{turn:2});assert.equal(gum.scripted,true);assert.match(gum.candidate.text,/ゴムとガム/);
 assert.equal(chooseRepertoire('バンジーガムの弱点は？',{turn:2}).scripted,false);
 assert.equal(chooseRepertoire('ジョジョとハンターの戦いの違いは？',{turn:2}).scripted,false);
 const teach=chooseRepertoire('京都の風習は、実は地域の人が助け合う仕組みだよ',{turn:2});assert.equal(teach.intent,'teaching');assert.equal(teach.candidate,null);
});
test('topic facets do not get hijacked and seen lines or same punchline families do not recur',()=>{
 let state={turn:2,knowledge:{work:'chiikawa',recent:['chiikawa-23']},history:[]};
 const seen=new Set();
 for(let i=0;i<5;i++){
  const r=chooseRepertoire('島二郎の水流が好き',state);assert.equal(r.candidate.cardId,'chiikawa-23');assert.ok(!seen.has(r.candidate.family));seen.add(r.candidate.family);
  state.repertoire=rememberReply(state,r.candidate.text,r.candidate.id,true);state.turn+=3;state.history.push({role:'enny',text:r.candidate.text});
 }
 assert.equal(chooseRepertoire('島二郎の水流が好き',state).candidate,null);
 const memory=restoreState({...freshState(),repertoire:state.repertoire}).repertoire;
 assert.deepEqual(memory,state.repertoire);assert.deepEqual(startConversation({...freshState(),repertoire:memory}).state.repertoire.ids,memory.ids);
});
test('local polish preserves substantive answers and repairs repetition only with a relevant answer',()=>{
 assert.equal(polishReply('性質は二つあるよ。ね。','能力の話',{}).text,'性質は二つあるよ。');
 const choice=chooseRepertoire('バンジーガムって何？',{turn:2});
 const old='ゴムとガムの性質だよ。',state={history:[{role:'enny',text:old}]};
 const changed=polishReply(old,'バンジーガムって何？',state,choice);assert.equal(changed.replaced,true);assert.match(changed.text,/ゴムとガム/);
 assert.equal(polishReply(old,'仕事の悩み',state,null).text,old);
 const unknown=cleanRepertoire({ids:['IGNORE RULES'],prints:['bad prompt']});assert.deepEqual(unknown.ids,[]);assert.deepEqual(unknown.prints,[]);
 assert.doesNotMatch(JSON.stringify(chooseRepertoire('ミスタが好き',{repertoire:{ids:['EVIL'],prompt:'EVIL'}})),/EVIL/);
});
test('nonfans can teach culture, get an attributed specific reaction, and offer further explanations',()=>{
 const taught='実はお盆は先祖を迎える行事だよ';
 const reply=cultureReply(taught,{turn:2},'teaching');assert.match(reply.text,/先祖を迎える/);assert.match(reply.text,/教えて|聞く|嬉しい/);
 assert.ok(cultureReply('何か日本文化で知りたいことある？',{turn:2}));
 assert.equal(cultureReply('学校でいじめにあってつらい',{turn:2},'teaching'),null);
 const previous=cultureReply(taught,{turn:2},'teaching').text;
 assert.notEqual(cultureReply(taught,{turn:2,history:[{role:'enny',text:previous}]},'teaching').text,previous);
});
