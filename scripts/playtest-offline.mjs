// No provider calls. Screen selection logic is shared via preparedReply.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {unwantedFanRedirect} from '../src/chat.js';
import {offlineFallback} from '../src/fallback.js';
import {freshState,restoreState,respond,normalize} from '../src/engine.js';
import {chiikawaReply} from '../src/topics.js';
import {advancePerformance} from '../src/performance.js';
import {selectKnowledge} from '../src/fandom.js';
import {chooseRepertoire,polishReply,rememberReply} from '../src/repertoire.js';
import {cultureReply} from '../src/culture.js';
import {selectGap} from '../src/gap.js';
import {preparedReply} from '../src/routing.js';
import {learnInterests} from '../src/balance.js';
import {noteConversationReply} from '../src/conversation.js';
import {finishSession,shouldEnd,startConversation} from '../src/session.js';
const cases={
 disconnected:['今日は雨の匂いがした','うん','散歩した','そう','絵を描いた','うん','FM音源の仕組みを説明して','わかった','今日は雨上がりだった','散歩してきた','絵を描いた','バイバイ'],
 music:['漫画は詳しくないけど、音楽の話は好きだよ','うん','パソコン買った','そう','本を買った','うん','オムライス食べた','そう','上履きは学校の靴だよ','うん','音楽が好き','バイバイ'],
 automatic:['本を買った','うん','パソコン買った','そう','オムライス食べた','うん','音楽が好き','そう','上履きは学校の靴だよ','うん','プリン半額だった','半額王と呼んでいいよ','王はスプーンを忘れました','箸でプリンを食べるしかない','そう','質問ばっかりだね','うん','まあ'],
 normal:['仕事でミスして疲れた','帰りにプリン半額だった','半額王と呼んでいいよ','王はスプーンを忘れました','箸でプリンを食べるしかない','うん','そう','まあ','ちょっと元気出た','上履きは学校で履き替える靴だよ','そう','バイバイ'],
 quiet:['オムライス食べた','うん','そう','まあ','うん','パソコン買った','そう','上履きは学校の靴だよ','うん','ジョジョの好きな場面の話','そう','バイバイ'],
 corrective:['ジョジョが好き','プリン半額だった','半額王と呼んでいいよ','王はスプーンを忘れました','箸でプリンを食べるしかない','王じゃなくて強者ね','質問ばっかりだね','うん','上履きは学校で履き替える靴だよ','そう','その呼び方はやめて','バイバイ']
};
const results=[];
let replayState=freshState();
const entries=[...Object.entries(cases),...Array.from({length:10},(_,i)=>[`replay-${i+1}`,cases.music])];
for(const [type,inputs] of entries){
 let state=freshState(),session={startedAt:Date.now(),turns:0,finished:false,dialogueUse:{ai:0,bank:0}};
 if(type.startsWith('replay-'))state=startConversation(restoreState(JSON.parse(JSON.stringify(replayState)))).state;
 const rows=[];
 for(const raw of inputs){
  session.turns++;
  const before=advancePerformance(state,raw,session.turns);
  let result=chiikawaReply(normalize(raw),respond(raw,state),undefined,raw);
  if(result.kind==='bye'){
   const end=finishSession({...result.state,history:result.state.history.slice(0,-1)},session);
   result.text=end.text;result.state=end.state;session=end.session;
  }
  result.state.interests=learnInterests(raw,state.interests);
  result.state.performance=before.performance;result.state.speechStyle=before.speechStyle;
  if(result.kind!=='bye')result.state.conversation=before.conversation;
  const knowledge=selectKnowledge(raw,before),repertoire=chooseRepertoire(raw,before),culture=cultureReply(raw,before,repertoire.intent);
  const fandom=culture?.text||repertoire.candidate?.text;
  result.state.knowledge=knowledge.memory;
  if(fandom&&!/嫌い|キライ|苦手|やめ|ヤメ|以外|イガイ|ばかり|バカリ/.test(raw)&&!['bye','asleep','name','memory','arithmetic','comfort','contradiction','repeat'].includes(result.kind))result.text=fandom;
  const gap=selectGap(raw,state);
  const prepared=preparedReply(raw,state,session,{gap,culture,repertoire,modelEnabled:false,kind:result.kind});
  if(gap)result.state.gap=gap.memory;
  if(prepared){result.text=['everyday','conversation-move','context-name','greeting','island-water','gap','repertoire','culture'].includes(prepared.topic)?prepared.text:fandom||prepared.text;result.kind='curated';}
  if(!['bye','asleep','name','memory','arithmetic'].includes(result.kind)){
   const fallback=!prepared&&!fandom?offlineFallback(raw,before,result.kind):null;
   if(fallback)result.text=fallback.text;
   const polished=polishReply(result.text,raw,before,repertoire);result.text=polished.text;
   const replyId=polished.id||prepared?.id||(prepared?.topic==='repertoire'||(repertoire.candidate&&result.text===repertoire.candidate.text)?repertoire.candidate?.id:null);
   result.state.repertoire=rememberReply(before,result.text,replyId,Boolean(prepared||polished.replaced));
  }
  result.state.history.at(-1).text=result.text;
  if(result.kind!=='bye')result.state.conversation=noteConversationReply(result.state.conversation,result.text,raw,session.turns);
  if(result.kind!=='bye')assert.equal(unwantedFanRedirect(result.text,raw,before),false,`${type}: ${raw} redirected to fandom`);
  state=result.state;
  rows.push({turn:session.turns,input:raw,text:result.text,source:prepared?'authored':'rule',question:/[?？]/.test(result.text)});
  if(state.ended)break;
  // Account for the five-minute floor without a five-minute wall-clock test.
  const fixtureNow=session.startedAt+session.turns*17000;
  if(shouldEnd(session,fixtureNow)){const end=finishSession(state,session);state=end.state;session=end.session;rows.push({input:'[auto-end]',elapsedMs:fixtureNow-session.startedAt,text:end.text});break;}
 }
 if(type.startsWith('replay-'))replayState=state;
 results.push({type,rows,ended:state.ended});
}
const path=process.argv[2]||'docs/playtest-20261007-offline.json';
await fs.writeFile(path,JSON.stringify({mode:'offline simulation; 17 seconds per exchange fixture, not browser UI or live AI',results},null,2)+'\n');
const replays=results.filter(r=>r.type.startsWith('replay-'));
if(!results.every(r=>r.ended)||new Set(replays.map(r=>r.rows.map(row=>row.text).join('\n'))).size!==10)throw new Error('Through-play or ten-session variation failed');
for(const result of results){console.log(result.type);for(const row of result.rows)console.log(`${row.input} → ${row.text}`);console.log(`ended=${result.ended}`);}
