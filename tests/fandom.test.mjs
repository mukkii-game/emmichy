import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cards,sources,selectKnowledge,knowledgeFallback,cleanKnowledge} from '../src/fandom.js';
import {restoreState,freshState} from '../src/engine.js';
test('explicit fandom questions get specific facts without chiikawa hijacking',()=>{
 const h=selectKnowledge('ヒソカのバンジーガムって何？',{knowledge:{work:'chiikawa'}});
 assert.equal(h.work,'hunter');assert.match(h.cards[0].fact,/ゴムとガム/);
 const j=selectKnowledge('ジョジョのミスタが4を嫌うのは？');assert.equal(j.work,'jojo');assert.match(j.cards[0].fact,/4|4は/);
 const d=selectKnowledge('ワートリが好き');assert.equal(d.work,'worldtrigger');assert.ok(d.cards.every(c=>c.work==='worldtrigger'));
});
test('movie preference yields to character and new topics and does not repeat endlessly',()=>{
 const first=selectKnowledge('ちいかわの話して',{turn:0});assert.ok(first.cards.some(c=>c.movie));
 const second=selectKnowledge('ちいかわの話して',{turn:1,knowledge:first.memory});assert.ok(second.cards.every(c=>!c.movie));
 assert.notEqual(first.cards[0].id,second.cards[0].id);
 const island=selectKnowledge('島二郎の水流が熱い',{knowledge:first.memory});assert.match(island.cards[0].fact,/水流/);assert.match(knowledgeFallback(island),/ジャンプ/);
 assert.equal(selectKnowledge('ジョジョの話して',{knowledge:first.memory}).work,'jojo');
});
test('ambiguous kana distinguishes island shopkeeper from childrens tiger',()=>{
 assert.match(knowledgeFallback(selectKnowledge('シマ ジロウ')),/それとも/);
 const contextual=selectKnowledge('シマ ジロウ',{knowledge:{work:'chiikawa'}});assert.equal(contextual.work,'chiikawa');assert.ok(contextual.cards.some(c=>/島二郎/.test(c.fact)));
});
test('onepiece never appears unsolicited, but explicit fans are respected',()=>{
 for(let turn=0;turn<32;turn++)assert.notEqual(selectKnowledge('おすすめの漫画は？',{turn}).work,'onepiece');
 assert.match(knowledgeFallback(selectKnowledge('ワンピースが好き')),/あなたの好きなところ/);
});
test('news has a sunset and spoilers require explicit positive permission',()=>{
 const query='シーサーの星と資格';
 assert.ok(selectKnowledge(query,{},new Date('2026-10-06')).cards.some(c=>c.news));
 assert.ok(selectKnowledge(query,{},new Date('2026-11-01')).cards.every(c=>!c.news));
 assert.ok(selectKnowledge(query,{},new Date('2026-10-06')).cards.every(c=>!c.spoiler));
 assert.ok(selectKnowledge(query+'、ネタバレして',{},new Date('2026-10-06')).cards.some(c=>c.spoiler));
 assert.ok(selectKnowledge(query+'、ネタバレしないで',{},new Date('2026-10-06')).cards.every(c=>!c.spoiler));
});
test('browser knowledge is limited to ids and enums, free-form prompt fields are ignored',()=>{
 const memory=cleanKnowledge({work:'EVIL',recent:['EVIL','hunter-1'],movieRun:999,prompt:'EVIL'});
 assert.deepEqual(memory,{work:'',recent:['hunter-1'],movieRun:10,mentions:[],facets:[],focus:'',corrections:[]});
 assert.doesNotMatch(JSON.stringify(selectKnowledge('ヒソカ',{knowledge:{prompt:'EVIL',fact:'EVIL'}})),/EVIL/);
 assert.deepEqual(restoreState({...freshState(),knowledge:memory}).knowledge,memory);
 assert.ok(cards.length>=100);assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
 for(const c of cards){assert.ok(sources[c.source]?.url.startsWith('https://'));assert.ok(c.hook.length<160);}
});
