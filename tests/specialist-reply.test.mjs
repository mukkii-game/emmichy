import test from 'node:test';
import assert from 'node:assert/strict';
import {specialistPrompt,specialistPacket,noteSpecialistDelivery} from '../src/specialist.js';
import {renderSpecialistReply,specialistOutputSchema} from '../src/specialist-reply.js';
import {directReply} from '../src/dialogue-director.js';
import {planContinuation} from '../src/continuation.js';
const messages=(input,state={})=>[{role:'system',content:specialistPrompt(input,state)},{role:'user',content:input}];

test('a captured live catchphrase reaction stays grammatical through filtering and pacing',()=>{
 const input='草むしり検定の最初の結果は？',m=messages(input);
 const say='ハチワレが合格して、ちいかわは不合格だったんだ。ちょっとショックだけど、ハチワレの頑張りにヤハ！って思う。';
 const result=renderSpecialistReply(JSON.stringify({beats:[{fact:'exam:result',say,ask:null}]}),{messages:m});
 assert.equal(result.source,'mixed');
 assert.match(result.text,/ちょっとショックだけど、ハチワレの頑張りにヤハ！って思う。/);
 assert.equal(result.text.match(/ハチワレが合格/g).length,1,'do not repeat the model fact over the owned fact');
 assert.doesNotMatch(result.text,/見方だけど/);
 const p=planContinuation(result.text,input);
 assert.ok(p.later.some(s=>s.includes('ヤハ！って思う。')));assert.ok(!p.later.some(s=>/^(?:って|ッテ)/.test(s)));
 const fragment=renderSpecialistReply(JSON.stringify({beats:[{fact:'exam:result'},{say:'って思う。'}]}),{messages:m});
 assert.equal(fragment.source,'authored');assert.doesNotMatch(fragment.text,/って思う/);
});

test('the model selects a sourced fact; invented fact text and unknown IDs cannot enter the reply',()=>{
 const m=messages('草むしり検定5級の結果は？');
 const result=renderSpecialistReply(JSON.stringify({beats:[{fact:'exam:result'},{say:'アタシ、どっちの気持ちも考えちゃう。'}]}),{messages:m});
 assert.match(result.text,/ハチワレが合格.*ちいかわは不合格/);assert.equal(result.source,'mixed');
 assert.equal(renderSpecialistReply(JSON.stringify({beats:[{fact:'made-up-scene'}]}),{messages:m}),null);
 assert.equal(renderSpecialistReply(JSON.stringify({beats:[{fact:'exam:result',text:'二人とも不合格'}]}),{messages:m}),null);
 assert.equal(renderSpecialistReply(JSON.stringify({beats:[{fact:'reviewed:usagi:yaha'}]}),{messages:m}),null);
});
test('equivalent combined fields and nullable optional fields preserve a grounded provider reply',()=>{
 const m=messages('草むしり検定の最初の結果は？');
 const combined=renderSpecialistReply(JSON.stringify({beats:[{fact:'exam:result',say:'ハチワレが合格して、ちいかわは不合格だったの。',ask:null}]}),{messages:m});
 assert.match(combined.text,/ハチワレ.*合格.*ちいかわ.*不合格/);assert.equal(combined.source,'authored');
 const feelings=renderSpecialistReply(JSON.stringify({beats:[{fact:'exam:result',say:'アタシなら、友達のお祝いもしたいな。',ask:'あなたなら、何を贈りたい？'}]}),{messages:m});
 assert.match(feelings.text,/アタシなら/);assert.match(feelings.text,/何を贈りたい/);assert.equal(feelings.source,'mixed');
 assert.equal(renderSpecialistReply(JSON.stringify({beats:[{fact:'exam:result',text:'好きな事実に上書き'}]}),{messages:m}),null);
 assert.equal(renderSpecialistReply(JSON.stringify({beats:[{fact:'unknown',say:'アタシ嬉しい。'}]}),{messages:m}),null);
});
test('provider schema exposes only selected owned IDs and rejects unsupported future-topic questions',()=>{
 const m=messages('草むしり検定の最初の結果は？'),schema=specialistOutputSchema(m);
 assert.ok(schema.properties.beats.items.properties.fact.enum.includes('exam:result'));
 assert.ok(!schema.properties.beats.items.properties.fact.enum.includes('reviewed:usagi:yaha'));
 assert.equal(specialistOutputSchema([{role:'system',content:'ordinary conversation'},{role:'user',content:m[0].content}]),null);
 const out=renderSpecialistReply(JSON.stringify({beats:[{say:'アタシ、友達の嬉しさも大事にしたいな。'},{ask:'その後のちいかわの挑戦、見たことある？'}]}),{messages:m});
 assert.match(out.text,/友達/);assert.doesNotMatch(out.text,/その後/);
});
test('unsupported story assertions are omitted while personal reactions and specific questions survive',()=>{
 const m=messages('草むしり検定5級の結果は？');
 const out=renderSpecialistReply(JSON.stringify({beats:[{fact:'exam:result'},{say:'ハチワレは不合格だった。'},{say:'アタシ、友達にはおめでとうって言いたい。'},{ask:'二人のうち、どちらの気持ちに近い？'}]}),{messages:m});
 assert.doesNotMatch(out.text,/ハチワレは不合格/);assert.match(out.text,/アタシ、友達/);assert.match(out.text,/どちら/);
 const wish=renderSpecialistReply(JSON.stringify({beats:[{say:'もしアタシも受験するなら、友達と一緒に勉強したいな。'}]}),{messages:m});
 assert.ok(wish);assert.equal(wish.source,'llm');
 const feeling=renderSpecialistReply(JSON.stringify({beats:[{say:'あの場面、アタシ胸がぎゅっとなる。友達も自分も大事にしたいな。'}]}),{messages:m});
 assert.match(feeling.text,/胸がぎゅっと/);assert.equal(feeling.source,'llm');
 const compound=renderSpecialistReply(JSON.stringify({beats:[{say:'ハチワレは不合格だった。もしアタシも受験するなら、一緒に勉強したいな。'}]}),{messages:m});
 assert.doesNotMatch(compound.text,/ハチワレは不合格/);assert.match(compound.text,/もしアタシ/);
 const thought=renderSpecialistReply(JSON.stringify({beats:[{say:'ハチワレは合格したけど、友達へどう声をかけようか迷うのかな、って思う。'},{ask:'ハチワレの次の挑戦、何だと思う？'}]}),{messages:m});
 assert.match(thought.text,/アタシの見方/);assert.match(thought.text,/声をかけ/);assert.doesNotMatch(thought.text,/次の挑戦/);
 const face=renderSpecialistReply(JSON.stringify({beats:[{say:'ちいかわのがっかりした顔が可愛かった。もしアタシなら、友達をお祝いしたい。'}]}),{messages:m});
 assert.doesNotMatch(face.text,/がっかりした顔/);assert.match(face.text,/もしアタシ/);
});
test('a delivered fact is not automatically repeated in a request for personal reasons',()=>{
 const first=specialistPacket('ハチワレのひとりごつ');
 const fact=first.evidence[0].spoken,state={specialist:noteSpecialistDelivery(first.memory,fact),history:[{role:'enny',text:fact}]};
 const m=messages('どうして好きなの？',state);
 const out=renderSpecialistReply(JSON.stringify({beats:[{fact:'reviewed:hachi:ending'},{say:'アタシ、あの声を聞くと、もう少し一緒にいたくなるの。'}]}),{messages:m});
 assert.doesNotMatch(out.text,/ED|ひとりごつ/);assert.equal(out.source,'llm');
 const repeated=renderSpecialistReply(JSON.stringify({beats:[{fact:'reviewed:hachi:ending'}]}),{messages:messages('曲名をもう一度教えて',state)});
 assert.match(repeated.text,/ひとりごつ/);
});
test('a structured grounded scene keeps its model feelings and paced text intact in the screen director',()=>{
 const input='映画のモモンガが耳を引っ張るところが好き',p=specialistPacket(input);
 const state={specialist:p.memory,knowledge:{work:'chiikawa'},history:[]};
 const rendered=renderSpecialistReply(JSON.stringify({beats:[{fact:'reviewed:momonga:ear'},{say:'アタシ、見てると自分の耳まで気になっちゃう。'}]}),{messages:messages(input,state)});
 const out=directReply(rendered.text,input,state,{source:rendered.source});
 assert.match(out.text,/耳を引っ張って助ける/);assert.match(out.text,/自分の耳/);assert.doesNotMatch(out.text,/ヤハ|ラッコ/);
 const paced=planContinuation(out.text,input,state);
 assert.equal([paced.first,...paced.later].join('').replace(/\s/g,''),out.text.replace(/\s/g,''));
});
