import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudioDirector} from '../src/audio.js';
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
