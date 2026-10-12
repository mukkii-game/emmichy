import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewedChiikawa} from '../src/chiikawa-reviewed.js';
import {relatedChiikawa,relationPrompt} from '../src/chiikawa-relations.js';
import {selectChiikawaBridge} from '../src/chiikawa-theme.js';

test('reviewed music and expressions preserve speaker and medium boundaries',()=>{
 assert.match(relationPrompt('ハチワレのオープニングの歌'),/映画OP「くつずれ」/);
 assert.match(relationPrompt('ヤハは誰の口癖？'),/うさぎ.*掛け声/s);
 const phrase=reviewedChiikawa.find(r=>r.id==='reviewed:hachi:nantoka');
 assert.match(phrase.limits.join(''),/第14話.*断定しない/);
 assert.equal(reviewedChiikawa.some(r=>r.scope==='current-serial'),false);
});
test('scene evidence and default spoiler exclusion survive relation lookup',()=>{
 const bag=relatedChiikawa('お気に入りのポシェット').find(r=>r.id==='reviewed:chiikawa:pochette');
 assert.ok(bag);assert.match(bag.fact,/第28話/);assert.match(bag.limits.join(''),/最新話/);
 assert.equal(relatedChiikawa('モモンガの耳を引っ張る場面').some(r=>r.id==='reviewed:momonga:ear'),false);
 assert.ok(relatedChiikawa('モモンガの耳を引っ張る場面',{}, {allowSpoilers:true}).some(r=>r.id==='reviewed:momonga:ear'));
});
test('previous-play reply memory prevents a repeated authored connection',()=>{
 const first=selectChiikawaBridge('お気に入りのポシェット');assert.ok(first);
 const second=selectChiikawaBridge('お気に入りのポシェット',{playerMemory:{recentReplies:[first.text]}});
 assert.ok(second);assert.notEqual(second.text,first.text);
 assert.equal(selectChiikawaBridge('お気に入りのポシェット',{playerMemory:{recentReplies:[first.text,second.text]}}),null);
});
