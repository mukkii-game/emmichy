import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseFiller,longFiller,startFiller,retainAside,idleAside,createIdleSequence} from '../src/filler.js';
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
test('two short gestures are three seconds apart, then one longer line leaves breathing room',()=>{
 const tasks=[];let time=0,recent=[],shown=[],long=[];
 const stop=startFiller(()=>{const line=chooseFiller('音楽',recent);recent.push(line);shown.push(line);},{schedule:(fn,ms)=>{tasks.push({fn,ms});return tasks.length;},cancel:()=>{},now:()=>time,later:()=>long.push(longFiller("音楽",long))});
 assert.equal(tasks[0].ms,1000);time=1000;tasks[0].fn();assert.equal(tasks[1].ms,3000);
 time=4000;tasks[1].fn();assert.notEqual(shown[0],shown[1]);assert.equal(tasks[2].ms,3000);
 time=7000;tasks[2].fn();assert.equal(shown.length,2);assert.equal(long.length,1);assert.ok(long[0].length>40);assert.equal(tasks.length,3);
 time=7050;assert.equal(stop(),250);
 const fast=startFiller(()=>assert.fail('fast answer must not show filler'),{schedule:(fn,ms)=>1,cancel:()=>{},now:()=>time});assert.equal(fast(),0);
});
test('inactivity uses three separate ten-second windows and typing resets the sequence',()=>{
 const idle=createIdleSequence(0);
 assert.equal(idle.poll(9999),null);assert.equal(idle.poll(10000),1);
 assert.equal(idle.poll(19999),null);assert.equal(idle.poll(20000),2);
 idle.touch(25000);assert.equal(idle.poll(34999),null);assert.equal(idle.poll(35000),1);
 assert.equal(idle.poll(45000),2);assert.equal(idle.poll(55000),3);assert.equal(idle.poll(65000),null);
 idle.touch(70000);assert.equal(idle.poll(80000),1);
});

test('idle farewell waits for the five-minute gate without extra asides',()=>{
 const idle=createIdleSequence(0);
 assert.equal(idle.poll(10000,{allowFinish:false}),1);
 assert.equal(idle.poll(20000,{allowFinish:false}),2);
 for(const time of [30000,60000,299999])assert.equal(idle.poll(time,{allowFinish:false}),null);
 idle.touch(295000);assert.equal(idle.poll(300000),null);
 assert.equal(idle.poll(305000),1);assert.equal(idle.poll(315000),2);assert.equal(idle.poll(325000),3);
});
test('expressive waiting reacts to player sounds without joking over distress',()=>{
 assert.equal(chooseFiller('ドッギャーン！'),'えっ、ドッギャーン！？');
 assert.equal(chooseFiller('ドッギャーン！',['えっ、ドッギャーン！？']),'！？');
 assert.equal(chooseFiller('つらい！！相談したい'),'うん、聞いてるよ。');
 const first=longFiller('ピアノの音楽が好き');assert.match(first,/曲|歌|音/);
 assert.notEqual(longFiller('ピアノの音楽が好き',[first]),first);
 assert.doesNotMatch(longFiller('つらい、相談したい'),/フフ|ドッギャーン/);
});
