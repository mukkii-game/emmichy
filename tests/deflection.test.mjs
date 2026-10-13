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
test('quiet moments vary concrete Japanese difficulties',()=>{
 const examples=new Set();for(let i=0;i<japaneseExamples.length;i++)examples.add(idleAside(Array.from({length:i},()=>({role:'user',text:'今日は晴れ'})),1));
 assert.equal(examples.size,japaneseExamples.length);assert.ok([...examples].some(t=>/運行.*うんこ/.test(t)));assert.ok([...examples].some(t=>/おばさん.*おばあさん/.test(t)));
});

test('an explicit Usagi cue keeps a previous-work joke from replacing its own reply',()=>{
 const raw='ウサギ カッコイイヨネ',state={turn:2,knowledge:{work:'jojo'}};
 const reply=preparedReply(raw,state,{},{gap:{text:'前のジョジョの台詞',topic:'gap'},repertoire:chooseRepertoire(raw,state),modelEnabled:true});
 assert.notEqual(reply?.topic,'gap');assert.doesNotMatch(reply?.text||'',/前のジョジョ/);
});
