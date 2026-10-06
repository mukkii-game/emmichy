import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseFiller,startFiller} from '../src/filler.js';
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
