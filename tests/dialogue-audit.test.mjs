import test from 'node:test';
import assert from 'node:assert/strict';
import {auditDialogueTrace,modelRequestPolicy} from '../src/dialogue-audit.js';
test('diagnostics distinguish rule policy, disabled model and a temporary cooldown',()=>{
 assert.equal(modelRequestPolicy({offline:true}),'offline');
 assert.equal(modelRequestPolicy(), 'disabled');
 assert.equal(modelRequestPolicy({enabled:true}), 'fixed-rule');
 assert.equal(modelRequestPolicy({enabled:true,allowed:true,available:false}), 'cooldown');
 assert.equal(modelRequestPolicy({enabled:true,allowed:true}), 'request');
});
test('communication, retained model content and server-authored text are different counts',()=>{
 const rows=[
  {input:'private player text',source:'authored',policy:'fixed-rule'},
  {source:'llm',serverSource:'llm',modelRequested:true,outcome:'accepted',provider:'groq',plannedBeats:['first','unspoken'],deliveredBeats:['first']},
  {source:'mixed',serverSource:'llm',modelRequested:true,outcome:'accepted',provider:'gemini'},
  {source:'authored',serverSource:'mixed',modelRequested:true,outcome:'accepted',provider:'groq',reason:'unverified-scene'},
  {source:'authored',serverSource:'authored',modelRequested:true,outcome:'accepted',provider:'groq'},
  {source:'authored',modelRequested:true,outcome:'rate-limit'},
  {source:'authored',modelRequested:true,outcome:'rejected'}
 ];
 const a=auditDialogueTrace(rows);
 assert.equal(a.requested,6);assert.equal(a.accepted,4);assert.equal(a.modelRetained,2);assert.equal(a.modelReplaced,1);assert.equal(a.serverAuthored,1);assert.equal(a.failed,1);assert.equal(a.rejected,1);
 assert.equal(a.displayedBeats,1);assert.equal(a.unspokenBeats,1);
 assert.ok(!JSON.stringify(a).includes('private player text'));
 assert.deepEqual(auditDialogueTrace(null).sources,{});
});
