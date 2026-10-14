import test from 'node:test';
import assert from 'node:assert/strict';
import {freshReplySentences} from '../src/reply-repetition.js';
import {directReply} from '../src/dialogue-director.js';
import {specialistPacket} from '../src/specialist.js';
test('repeated explanations are removed without deleting a new personal reason',()=>{
 const sentence='「ヤハ！」はうさぎの掛け声だよ。';
 const state={history:[{role:'enny',text:sentence+' あの勢い、好き。'}]};
 const result=freshReplySentences(sentence+' アタシ、思わず立ち上がりたくなる。','何か面白い話して',state);
 assert.equal(result.text,'アタシ、思わず立ち上がりたくなる。');assert.equal(result.changed,true);
 assert.equal(freshReplySentences(sentence,'うさぎの掛け声をもう一度教えて',state).changed,false);
});
test('referencing a known scene with a new feeling does not restart its explanation',()=>{
 const input='その場面どう思う？',p=specialistPacket('モモンガが耳を引っ張る映画の話');
 const state={specialist:p.memory,knowledge:{work:'chiikawa'},history:[]};
 const line='あの場面、アタシ自分の耳まで気になっちゃう。';
 const out=directReply(line,input,state,{source:'llm'});
 assert.equal(out.text,line);assert.equal(out.source,'llm');
});
