import test from 'node:test';
import assert from 'node:assert/strict';
import {topicDeflection} from '../src/deflection.js';
import {preparedReply} from '../src/routing.js';
import {chooseRepertoire} from '../src/repertoire.js';
import {japaneseExamples} from '../src/profile.js';
import {idleAside} from '../src/filler.js';
test('requested sexual terms get a prepared surprised topic change',()=>{
 for(const raw of ['エロ','エロイ','エッチ','セックス','おっぱい','えみちぃはエロい？']){
  const reply=preparedReply(raw,{turn:2},{},{modelEnabled:true,repertoire:chooseRepertoire(raw,{turn:2})});
  assert.equal(reply.topic,'deflection');assert.match(reply.gesture,/ワオ/);assert.match(reply.text,/別の話|ゲームの話/);
 }
 for(const raw of ['ピエロの絵','エッチングの絵','ジョジョのセックスピストルズ'])assert.equal(topicDeflection(raw),null);
});
test('quiet moments do not repeat the long-vowel gag outside a language topic',()=>{
 const history=[{role:'user',text:'今日は晴れ'}],examples=new Set();
 for(let i=0;i<4;i++){const line=idleAside(history,0);examples.add(line);history.push({role:'enny',text:line});}
 assert.equal(examples.size,4);assert.ok([...examples].every(t=>t.length<=24&&!/運行|うんこ|おばさん/.test(t)));
});

test('an explicit Usagi cue keeps a previous-work joke from replacing its own reply',()=>{
 const raw='ウサギ カッコイイヨネ',state={turn:2,knowledge:{work:'jojo'}};
 const reply=preparedReply(raw,state,{},{gap:{text:'前のジョジョの台詞',topic:'gap'},repertoire:chooseRepertoire(raw,state),modelEnabled:true});
 assert.notEqual(reply?.topic,'gap');assert.doesNotMatch(reply?.text||'',/前のジョジョ/);
});
