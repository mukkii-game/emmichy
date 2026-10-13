import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudioDirector,bindAudioLifecycle} from '../src/audio.js';
test('sound OFF mutes already scheduled tones and restarting retains one music timer',async()=>{
 const oldWindow=globalThis.window,oldSet=globalThis.setInterval,oldClear=globalThis.clearInterval;
 const levels=[],timers=new Set();let id=0;
 class AudioContext{
  currentTime=0;destination={};
  createGain(){return {gain:{setValueAtTime:v=>levels.push(v),exponentialRampToValueAtTime(){}},connect(){}};}
  createOscillator(){return {frequency:{setValueAtTime(){}},connect(){},start(){},stop(){}};}
  async resume(){}
 }
 try{
  globalThis.window={AudioContext};globalThis.setInterval=()=>{timers.add(++id);return id;};globalThis.clearInterval=i=>timers.delete(i);
  const audio=createAudioDirector();assert.equal(audio.enabled,true);assert.equal(timers.size,0,'default ON waits for a player gesture');
  await audio.activate();assert.equal(audio.enabled,true);assert.equal(timers.size,1);
  await audio.activate();assert.equal(timers.size,1,'more gestures do not layer music timers');
  audio.stop();assert.equal(audio.enabled,false);assert.equal(levels.at(-1),0);assert.equal(timers.size,0);
  await audio.start();assert.equal(levels.includes(.18),true);assert.equal(timers.size,1);
  await audio.start();assert.equal(timers.size,1);audio.stop();
 }finally{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;globalThis.setInterval=oldSet;globalThis.clearInterval=oldClear;}
});

test('hidden and departing pages release sound immediately; restoration waits for a gesture and respects OFF',async()=>{
 const oldWindow=globalThis.window,oldSet=globalThis.setInterval,oldClear=globalThis.clearInterval;
 const timers=new Set(),contexts=[];let id=0;
 class Surface extends EventTarget{hidden=false;}
 const doc=new Surface(),win=new Surface();
 class AudioContext{
  state='suspended';currentTime=0;destination={};voices=[];levels=[];closed=0;disconnected=0;
  constructor(){contexts.push(this);}
  createGain(){return {gain:{setValueAtTime:v=>this.levels.push(v),cancelScheduledValues(){},exponentialRampToValueAtTime(){}},connect(){},disconnect:()=>this.disconnected++};}
  createOscillator(){const voice={frequency:{setValueAtTime(){}},connect(){},start(){},stop(){this.stopped=true;},disconnect(){this.disconnected=true;}};this.voices.push(voice);return voice;}
  async resume(){this.state='running';}
  async close(){this.closed++;this.state='closed';}
 }
 try{
  globalThis.window={AudioContext};globalThis.setInterval=()=>{timers.add(++id);return id;};globalThis.clearInterval=i=>timers.delete(i);
  const audio=createAudioDirector(),unbind=bindAudioLifecycle(audio,doc,win);
  await audio.activate();audio.se.ending();const first=contexts[0];assert.ok(first.voices.length>3);
  doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(timers.size,0);assert.equal(first.levels.at(-1),0);assert.equal(first.closed,1);assert.ok(first.voices.every(v=>v.stopped&&v.disconnected));assert.equal(audio.enabled,true);
  audio.se.reply();await audio.activate();assert.equal(contexts.length,1,'hidden typing cannot restart a context');
  doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(timers.size,0,'being shown is not a playback gesture');
  await audio.activate();assert.equal(contexts.length,2);assert.equal(timers.size,1);
  win.dispatchEvent(new Event('pagehide'));assert.equal(contexts[1].closed,1);assert.equal(timers.size,0);
  win.dispatchEvent(new Event('pageshow'));assert.equal(timers.size,0);audio.stop();await audio.activate();assert.equal(contexts.length,2,'OFF survives page restoration');
  await audio.toggle();assert.equal(timers.size,1);unbind();assert.equal(timers.size,0);assert.equal(contexts[2].closed,1);
 }finally{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;globalThis.setInterval=oldSet;globalThis.clearInterval=oldClear;}
});

test('pagehide during pending resume cannot resurrect music or use the closed context',async()=>{
 const oldWindow=globalThis.window,oldSet=globalThis.setInterval,oldClear=globalThis.clearInterval;
 let release,closed=0;const timers=new Set();
 class AudioContext{
  state='suspended';currentTime=0;destination={};
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
  resume(){return new Promise(resolve=>{release=()=>{resolve();};});}
  async close(){closed++;this.state='closed';}
 }
 try{
  globalThis.window={AudioContext};globalThis.setInterval=()=>{timers.add(1);return 1;};globalThis.clearInterval=i=>timers.delete(i);
  const audio=createAudioDirector(),pending=audio.activate();audio.setVisible(false);release();await pending;
  assert.equal(closed,1);assert.equal(timers.size,0);assert.equal(audio.enabled,true);await audio.activate();assert.equal(closed,1);
 }finally{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;globalThis.setInterval=oldSet;globalThis.clearInterval=oldClear;}
});
test('OFF chosen during audio activation is not undone by a pending browser resume',async()=>{
 const oldWindow=globalThis.window,oldSet=globalThis.setInterval,oldClear=globalThis.clearInterval;
 let release,resumes=0,created=0;const timers=new Set();let id=0;
 class AudioContext{
  state='suspended';currentTime=0;destination={};
  constructor(){created++;}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
  resume(){resumes++;return new Promise(resolve=>{release=()=>{this.state='running';resolve();};});}
 }
 try{
  globalThis.window={AudioContext};globalThis.setInterval=()=>{timers.add(++id);return id;};globalThis.clearInterval=i=>timers.delete(i);
  const audio=createAudioDirector();audio.se.send();assert.equal(created,0,'sounds do not create a blocked context before a gesture');
  const pending=audio.activate();assert.equal(resumes,1);audio.stop();release();await pending;
  assert.equal(audio.enabled,false);assert.equal(timers.size,0);await audio.activate();assert.equal(resumes,1,'later typing respects OFF');
 }finally{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;globalThis.setInterval=oldSet;globalThis.clearInterval=oldClear;}
});
