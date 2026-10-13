import test from 'node:test';
import assert from 'node:assert/strict';
import {directReply} from '../src/dialogue-director.js';
import {selectChiikawaBridge} from '../src/chiikawa-theme.js';
import {selectKnowledge} from '../src/fandom.js';
import {requestsChiikawa} from '../src/topic-intent.js';
import {unwantedFanRedirect} from '../src/chat.js';
import {recognizeName} from '../src/names.js';
import fs from 'node:fs';

test('captured real-provider scene inventions are repaired locally, without a new call',()=>{
 const evidence=JSON.parse(fs.readFileSync(new URL('../docs/pilot-chiikawa-20261011-live/emmichy-quality-check.json',import.meta.url)));
 let state={history:[],knowledge:{work:'chiikawa'}};
 for(const turn of evidence.turns.filter(t=>t.result.text)){
  const out=directReply(turn.result.text,turn.input,state,{source:'llm'});
  assert.equal(out.source,'mixed');assert.doesNotMatch(out.text,/空を見上げ|カメラを構えて|「ヤハ」|もっと聞きたいこと/);
  assert.match(out.text,/ハチワレ.*写真|ハチワレ.*撮って/);assert.ok(out.text.length<=180);
  if(state.history.length)assert.doesNotMatch(out.text,/ハチワレは写真撮影が好き/,'do not restart the same topic introduction');
  state={history:[...state.history,{role:'user',text:turn.input},{role:'enny',text:out.text}],knowledge:selectKnowledge(turn.input,state).memory};
 }
 const imagination='ハチワレに写真を撮ってもらうなら、笑いすぎた瞬間も残したいな。';
 assert.equal(directReply(imagination,'ハチワレの写真の話をしよう',state,{source:'llm'}).text,imagination);
});

test('the six-turn fan review keeps preference, character focus and scoped refusal',()=>{
 const state={knowledge:{work:'chiikawa'},history:[{role:'enny',text:'島編のハチワレの話をしてたの。'}]};
 const preference=directReply('島編の話しよう。','ちいかわ好きなんだって？ 私も好き！ エミチーはいちばん誰が好き？',state);
 assert.match(preference.text,/ハチワレの気遣い/);assert.doesNotMatch(preference.text,/島編/);
 const input='いまは島編の話じゃなくて、ちいかわ本人の好きなところを聞きたいよ。別のキャラに変えないで、ちいかわの話を続けて。';
 const focused=directReply('うさぎのチラシが好き。',input,state);
 assert.match(focused.text,/ごめん/);assert.match(focused.text,/ちいかわ本人/);assert.doesNotMatch(focused.text,/うさぎ|ハチワレ|島編/);
 const dessert=directReply('島二郎の水流が好き。','ちいかわもごほうびうれしそうだよね。エミチーもプリン好き？',state);
 assert.match(dessert.text,/アタシもプリン好き/);assert.doesNotMatch(dessert.text,/島二郎/);
 const invitation='もう別の漫画の話はやめてね。プリンを一緒に食べながら、ちいかわの小さな幸せの話をしたいな。';
 assert.equal(requestsChiikawa(invitation),true);assert.equal(unwantedFanRedirect('ちいかわ',invitation,state),false);assert.ok(!recognizeName(invitation,{state})?.decline);
 assert.match(directReply('別の話にしよう。',invitation,state).text,/小さな幸せの話、しよう/);
 for(const no of ['ちいかわ以外の話をしたい','ちいかわの話はやめて','ちいかわじゃなく、ほかの話をしよう'])assert.equal(requestsChiikawa(no),false);
});

test('a good single-character LLM answer remains intact, with truthful origin',()=>{
 const text='ハチワレの話、アタシはずっとしていられるよ。好きなところを一つに決めるのが難しいの。あなたがハチワレを好きなら、どんなところが好きか教えてほしいな。そこから一緒に話したい！';
 const out=directReply(text,'ちいかわの話して',{},{source:'llm'});
 assert.equal(out.text,text.normalize('NFKC'));assert.equal(out.source,'llm');assert.equal(out.replaced,false);
});
test('a specific follow-up survives earlier questions and a bank does not override model text',()=>{
 const state={history:[{role:'enny',text:'何が好き？'},{role:'user',text:'パン'},{role:'enny',text:'どこで買った？'}]};
 const out=directReply('パン屋を見つけたんだね。何パンを買ったの？','散歩でパン屋を見つけた',state,{source:'llm',choice:{intent:'react',candidate:{text:'別の話だよ'}}});
 assert.equal(out.text,'パン屋を見つけたんだね。何パンを買ったの?');assert.equal(out.source,'llm');
});
test('missed everyday cue can add a grounded connection without replacing the answer',()=>{
 const text='プリン、いいね。アタシもひと口ずつ食べたい。';
 const out=directReply(text,'プリンを食べたよ',{},{source:'llm'});
 assert.ok(out.text.startsWith(text));assert.match(out.text,/ラッコ/);assert.equal(out.source,'mixed');
 const no=directReply(text,'ちいかわ以外で、プリンの話しよう',{},{source:'llm'});
 assert.equal(no.text,text);assert.equal(no.source,'llm');
 assert.equal(selectChiikawaBridge('試験に落ちてつらい、相談したい'),null);
});
test('stalled Chiikawa output is authored recovery, while corrections keep the current scene',()=>{
 const knowledge=selectKnowledge('島二郎の水流',{knowledge:{work:'chiikawa'}}).memory;
 const state={knowledge,history:[{role:'enny',text:'ちいかわが水流で遊ぶ場面が好き。'}]};
 const out=directReply('そこはまだよく知らないの。','水流では遊んでないよ',state,{source:'llm'});
 assert.equal(out.source,'authored');assert.match(out.text,/ごめん/);assert.match(out.text,/手を回して/);assert.doesNotMatch(out.text,/よく知らない/);
 const menu=directReply('島二郎が作るのは島二郎のフルーツパフェだよ。','島二郎の料理は？',state,{source:'llm'});
 assert.match(menu.text,/カツカレーと貝汁/);assert.equal(menu.source,'authored');
});
test('local named invitations stay with that character; bridge variants do not loop',()=>{
 const out=directReply('ハチワレ、好き。','ハチワレの話して',{},{source:'authored'});
 assert.match(out.text,/ハチワレ/);assert.doesNotMatch(out.text,/ラッコ|シーサー/);assert.ok(out.text.length>40);
 const first=selectChiikawaBridge('写真を撮った');const second=selectChiikawaBridge('写真を撮った',{history:[{role:'enny',text:first.text}]});
 assert.notEqual(first.text,second.text);assert.equal(selectChiikawaBridge('写真を撮った',{history:[{role:'enny',text:first.text},{role:'enny',text:second.text}]}),null);
});
