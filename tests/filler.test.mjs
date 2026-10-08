import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseFiller,startFiller,retainAside,idleAside} from '../src/filler.js';
test('idle asides follow the current food topic rather than an old manga topic',()=>{
 const history=[{role:'user',text:'ジョジョが好き'},{role:'user',text:'吉野家のチーズ牛丼が好き'}];
 for(let i=0;i<3;i++){assert.doesNotMatch(idleAside(history,i),/漫画|マンガ|質問/);}
 assert.match(idleAside(history,0),/ご飯/);
 assert.doesNotMatch(idleAside([{role:'user',text:'今日は散歩した'}]),/ご飯|漫画/);
 assert.match(idleAside([{role:'user',text:'つらいから相談したい'}]),/急がなくて/);
});
test('saved waiting dialogue retains the user and both asides before the final answer',()=>{
 const initial=[{role:'user',text:'音楽を教えて'},{role:'enny',text:'pending'}];
 let history=retainAside(initial,'エト…',{pendingReply:true});
 history=retainAside(history,'もう少しだけ！',{pendingReply:true});
 const saved=JSON.parse(JSON.stringify(history.slice(0,-1)));
 assert.deepEqual(saved.map(x=>x.text),['音楽を教えて','エト…','もう少しだけ！']);
 history.at(-1).text='音楽のお話だね！';
 assert.deepEqual(history.map(x=>x.text),[...saved.map(x=>x.text),'音楽のお話だね！']);
 assert.equal(initial.length,2);
 const idle=retainAside(history,'もっといい話題しよっか');
 assert.equal(idle.at(-1).text,'もっといい話題しよっか');
});
test('listening filler starts after one second and cancellation prevents stale gestures',()=>{
 let callback,delay,cancelled,shown=0;
 const clock={schedule:(fn,ms)=>{callback=fn;delay=ms;return 7;},cancel:id=>cancelled=id};
 const stop=startFiller(()=>shown++,clock);
 assert.equal(delay,1000);assert.equal(shown,0);stop();callback();
 assert.equal(cancelled,7);assert.equal(shown,0);
 startFiller(()=>shown++,clock);callback();assert.equal(shown,1);
});
test('fillers avoid recent repetition and keep difficult conversations gentle',()=>{
 let recent=[];
 for(let i=0;i<5;i++){const line=chooseFiller('ジョジョが好き',recent);assert.ok(!recent.includes(line));recent.push(line);}
 assert.equal(chooseFiller('つらいから相談したい'),'うん、聞いてるよ。');
});
test('long wait speaks once at ten seconds and cancellation silences both timers',()=>{
 const tasks=[];let short=0,long=0;
 const stop=startFiller(()=>short++,{schedule:(fn,ms)=>{tasks.push({fn,ms});return tasks.length;},cancel:()=>{},later:()=>long++});
 assert.deepEqual(tasks.map(x=>x.ms),[1000,10000]);tasks[0].fn();tasks[1].fn();assert.equal(short,1);assert.equal(long,1);stop();tasks[1].fn();assert.equal(long,1);
});
