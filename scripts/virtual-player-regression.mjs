// Recheck only the player-discovered failures, without another AI reviewer or API call.
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const actions=[
 {type:'wait',seconds:8},
 {type:'say',text:'ハチワレの話して'},
 {type:'draft',text:'写真って'},
 {type:'wait',seconds:20},
 {type:'draft',text:''},
 {type:'wait',seconds:6},
 {type:'say',text:'シーサーが頑張ってると応援したくなるよね。えみちぃはハチワレも好き？'},
 {type:'wait',seconds:12},
 {type:'say',text:'へえ、ヨーテボリ生まれなの？ 今もそこに住んでる？'},
 {type:'wait',seconds:5},
 {type:'say',text:'今日はここまで。弟さんにもよろしく、バイバイ！'},
 {type:'wait',seconds:20},
 {type:'reset'},
 {type:'say',text:'今日は寝るね、またね'},
 {type:'wait',seconds:12},
 {type:'quit'}
];
const run=spawnSync(process.execPath,['scripts/virtual-player.mjs','docs/virtual-player-targeted-after.json'],{input:actions.map(a=>JSON.stringify(a)).join('\n')+'\n',encoding:'utf8'});
assert.equal(run.status,0,run.stderr);
const rows=run.stdout.trim().split(/\r?\n/).map(line=>JSON.parse(line));
assert.ok(rows.every(row=>!row.error),run.stdout);
const at=i=>rows[i+1];
assert.equal(at(3).messages.length,0,'no pending continuation while a nonempty draft remains');
assert.ok(at(5).messages.length>0,'pending continuation resumes after clearing the draft');
const preference=[...at(6).messages,...at(7).messages].filter(m=>m.role==='enny').map(m=>m.text).join(' ');
assert.match(preference,/ハチワレ/);assert.doesNotMatch(preference,/アタシのことだと思って|スキ!\?/);
const home=[...at(8).messages,...at(9).messages].filter(m=>m.role==='enny').map(m=>m.text).join(' ');
assert.match(home,/ヨーテボリ.*生まれ育った/);assert.match(home,/今も家族/);assert.doesNotMatch(home,/よく知らない/);
assert.equal(at(10).finished,true);assert.equal(at(11).messages.length,0,'no unsolicited talk after farewell');
assert.equal(at(13).finished,true);assert.equal(at(14).messages.length,0);
console.log('PASS: draft pause/resume, preference question, birthplace, two natural farewells, no post-ending chatter. No AI calls.');
