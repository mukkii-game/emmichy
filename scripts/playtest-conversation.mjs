// Real relay replies, full input/output saved for review. No fabricated AI results.
import fs from 'node:fs/promises';
import {freshState,respond} from '../src/engine.js';
import {advancePerformance} from '../src/performance.js';
import {polishReply,chooseRepertoire,rememberReply} from '../src/repertoire.js';
import {requestChat} from '../src/chat.js';
import {CHAT_API_URL} from '../src/config.js';
const cases={
 ordinary:['漫画は詳しくない。仕事でミスして疲れた','でも帰りにプリン半額だった','半額王と呼んでいいよ','王はスプーンを忘れました','箸で食べるしかない','ちょっと元気出た','週末は箱根に行く','箱根そばも食べたい','王の旅行だね','さっき何を忘れたっけ？','また話したい','バイバイ'],
 quiet:['漫画は知らない','うん','別に','プリン食べた','うん','別に','仕事は疲れた','まあね','質問ばっかりだね','何か話して','ふふ','バイバイ'],
 heckler:['ジョジョと刃牙が好き','プリン半額だった','半額は強者の証ってことにしよう','なんか面白いこと言ってよ','今の説明したら面白くないよ','ちいかわが水流を出したって本当？','違う。水流は島二郎だよ','勝手に新しい場面作らないで','で、半額の強者は何を鍛える？','さっきの王じゃなくて強者ね','質問なしで返して','バイバイ']
};
const output=process.argv[2]||'docs/playtest-20261006-baseline.json';
const results=[];
for(const [type,inputs] of Object.entries(cases)){
 let state=freshState();const rows=[];
 for(const input of inputs){
  const before=advancePerformance(state,input,state.turn+1);
  const result=respond(input,state),choice=chooseRepertoire(input,before);
  let data=null;
  if(result.kind!=='bye')data=await requestChat(CHAT_API_URL,input,before,{turns:state.turn+1,startedAt:Date.now()},{fetcher:(url,options)=>fetch(url,{...options,headers:{...options.headers,Origin:'https://mukkii-game.github.io'}})});
  const text=polishReply(data?.text||result.text,input,before,choice).text;
  state={...result.state,performance:before.performance,speechStyle:before.speechStyle};state.history.at(-1).text=text;state.repertoire=rememberReply(state,text);
  const row={turn:state.turn,input,text,provider:data?.provider||'rule-fallback',question:/[?？]|教えて(?:くれる|ほしい|ね)|聞かせて/.test(text)};rows.push(row);console.log(JSON.stringify({type,...row}));
  await fs.writeFile(output,JSON.stringify([...results,{type,rows}],null,2));
  await new Promise(r=>setTimeout(r,3200));
 }
 results.push({type,rows});
}
await fs.writeFile(output,JSON.stringify(results,null,2));
