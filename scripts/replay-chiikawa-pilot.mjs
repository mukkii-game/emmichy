// Replay the six recorded player sends and two captured provider outputs offline.
// This is a regression replay, not a new subjective review or a live LLM test.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {directReply} from '../src/dialogue-director.js';
import {selectKnowledge} from '../src/fandom.js';
import {planContinuation} from '../src/continuation.js';

const player=JSON.parse(fs.readFileSync('docs/pilot-chiikawa-20261011-player.json','utf8'));
const actions=player.actions.map(row=>row.action).filter(a=>!['start','quit'].includes(a.type));
actions.push({type:'wait',seconds:12},{type:'quit'});
assert.equal(actions.filter(a=>a.type==='say').length,6);
const run=spawnSync(process.execPath,['scripts/virtual-player.mjs','docs/pilot-chiikawa-20261011-replay.json'],{
 input:actions.map(a=>JSON.stringify(a)).join('\n')+'\n',encoding:'utf8',windowsHide:true
});
assert.equal(run.status,0,run.stderr);
const rows=run.stdout.trim().split(/\r?\n/).map(line=>JSON.parse(line));
assert.ok(rows.every(row=>!row.error),run.stdout);

const evidence=JSON.parse(fs.readFileSync('docs/pilot-chiikawa-20261011-live/emmichy-quality-check.json','utf8'));
let state={history:[],knowledge:{work:'chiikawa'}};
const turns=evidence.turns.filter(t=>t.result.text).map(turn=>{
 const result=directReply(turn.result.text,turn.input,state,{source:'llm'});
 assert.doesNotMatch(result.text,/空を見上げ|カメラを構えて|「ヤハ」|もっと聞きたいこと/);
 const pacing=planContinuation(result.text,turn.input,state);
 state={history:[...state.history,{role:'user',text:turn.input},{role:'enny',text:result.text}],knowledge:selectKnowledge(turn.input,state).memory};
 return {input:turn.input,generated:turn.result.text,result,pacing};
});
fs.writeFileSync('docs/pilot-chiikawa-20261011-grounded-replay.json',JSON.stringify({
 mode:'local replay of captured real outputs; 0 new provider calls; all planned chunks assumed delivered',turns
},null,2)+'\n');
console.log('Replayed 6 offline sends and 2 captured outputs. No provider calls or new subjective evaluation.');
