// Offline replay of recorded provider responses; never sends a generation request.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import game from '../../game-llm/games/emmichy.js';
import {directReply} from '../src/dialogue-director.js';
import {specialistPacket,noteSpecialistDelivery} from '../src/specialist.js';
const captured=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let state={history:[],knowledge:{work:'chiikawa'}};
const turns=captured.turns.map(turn=>{
 const packet=specialistPacket(turn.input,state);
 const messages=game.buildMessages({input:turn.input,state,session:{turns:state.history.length/2}});
 assert.ok(Array.isArray(messages),'This fixture must not trigger network lookup.');
 const raw=turn.rawOutputs?.[0]?.raw;
 const validated=game.validate(raw,{messages});
 assert.ok(validated&&typeof validated==='object');
 const reply=directReply(validated.text,turn.input,state,{source:validated.source});
 assert.doesNotMatch(reply.text,/次の挑戦|がっかりした顔/);
 state={...state,specialist:noteSpecialistDelivery(packet.memory,reply.text,state.history),history:[...state.history,{role:'user',text:turn.input},{role:'enny',text:reply.text}]};
 return {input:turn.input,raw,original:turn.result,validated,reply};
});
assert.match(turns[1].reply.text,/思う|気持ち|気遣い|声をかけ/);
fs.writeFileSync('docs/specialist-captured-replay-20261014.json',JSON.stringify({mode:'offline replay of captured real outputs; revised validator and director; all chunks assumed delivered; no new provider calls',capturedCommit:captured.commit,capturedAt:captured.at,providerCalls:0,turns},null,2)+'\n');
console.log(JSON.stringify(turns.map(t=>({input:t.input,reply:t.reply}))));
