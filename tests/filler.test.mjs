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
