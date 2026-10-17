import test from 'node:test';
import assert from 'node:assert/strict';
import {knowledgeFacts,knowledgeById,knowledgeQuestions,knowledgeConnections,validateKnowledgeCatalog} from '../src/knowledge-catalog.js';
import {specialistPacket,specialistFallback} from '../src/specialist.js';

test('runtime catalog requires provenance, unique IDs, supported questions and non-canon connection edges',()=>{
 assert.deepEqual(validateKnowledgeCatalog(),[]);
 assert.ok(knowledgeFacts.length>=40);assert.equal(typeof knowledgeById.set,'undefined');
 const source=knowledgeFacts[0];
 assert.ok(validateKnowledgeCatalog([source,source],[],[]).some(e=>e.startsWith('duplicate')));
 assert.ok(validateKnowledgeCatalog([{...source,evidence:'theory'}],[],[]).some(e=>e.startsWith('provenance')));
 assert.ok(validateKnowledgeCatalog(knowledgeFacts,[{...knowledgeQuestions[0],factIds:['invented']}],[]).some(e=>e.startsWith('question')));
 assert.ok(validateKnowledgeCatalog(knowledgeFacts,[],[{...knowledgeConnections[0],canonClaim:true}]).some(e=>e.startsWith('connection')));
});
test('each factual capability selects the answer to its example rather than a merely related fact',()=>{
 for(const q of knowledgeQuestions.filter(q=>q.kind==='fact'))for(const input of q.examples){
  const state=q.context?{specialist:specialistPacket(q.context).memory}:{};
  const packet=specialistPacket(input,state,new Date('2026-10-17'));
  assert.equal(packet.evidence[0]?.id,q.factIds[0],q.id+': '+input);
  assert.ok(packet.evidence.every(r=>q.factIds.includes(r.id)),'unrelated facts must not dilute a supported factual answer');
 }
});
test('a known gift question returns the gift, and an unsupported origin stays a boundary',()=>{
 const input='草むしり検定のお祝いに何を渡すの？';
 assert.match(specialistFallback(input,{}),/クッキー/);
 const state={specialist:specialistPacket(input).memory};
 assert.match(specialistFallback('そのクッキーは手作り？',state),/確かめられない/);
 assert.equal(specialistPacket('友達のお祝いに何を渡すの？').active,false);
 assert.equal(specialistPacket('そのクッキーは手作り？').active,false);
 const tv=specialistPacket('映画じゃなくテレビアニメのオープニング曲は？');
 assert.ok(!tv.evidence.some(e=>e.id==='reviewed:hachi:opening'));
 assert.equal(specialistPacket('日本語の勉強はどう？',{specialist:state.specialist}).active,false);
});
