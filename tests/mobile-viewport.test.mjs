import test from 'node:test';
import assert from 'node:assert/strict';
import {viewportFrame,bindMobileViewport} from '../src/mobile-viewport.js';

test('keyboard height loss keeps the phone baseline and follows visual panning',()=>{
 const full=viewportFrame({width:390,height:844,scale:1});
 const keyboard=viewportFrame({width:390,height:430,offsetTop:160,scale:1},full,true);
 assert.equal(keyboard.keyboard,true);
 assert.equal(keyboard.fullHeight,844);
 assert.equal(keyboard.top,160);
 assert.equal(viewportFrame({width:390,height:844,scale:1},keyboard,true).keyboard,false);
 assert.equal(viewportFrame({width:390,height:770,scale:1},full,true).keyboard,false,'browser chrome changes alone are not keyboard mode');
 assert.equal(viewportFrame({width:390,height:430,scale:1},full,false).keyboard,false,'ordinary window resize without editing');
 assert.equal(viewportFrame({width:320,height:600,scale:1},keyboard).fullHeight,600,'actual width/orientation changes reset the baseline');
 assert.equal(viewportFrame({width:200,height:300,scale:2},keyboard,true),null,'do not chase or misclassify a pinch zoom');
});

test('resize, pan and focus events anchor the visible phone screen and can be unbound',()=>{
 const target=()=>({events:new Map(),addEventListener(k,f){this.events.set(k,f);},removeEventListener(k){this.events.delete(k);}});
 const visual=Object.assign(target(),{width:428,height:926,offsetTop:0,offsetLeft:0,scale:1});
 const properties={},attributes={};
 const root={style:{setProperty(k,v){properties[k]=v;}},setAttribute(k,v){attributes[k]=v;}};
 const doc=Object.assign(target(),{documentElement:root,activeElement:null});
 const win=Object.assign(target(),{visualViewport:visual});
 const cleanup=bindMobileViewport(win,doc);
 doc.activeElement={matches:()=>true};doc.events.get('focusin')();
 visual.height=360;visual.offsetTop=120;visual.events.get('resize')();
 assert.equal(attributes['data-keyboard'],'true');assert.equal(properties['--visual-height'],'360px');
 visual.offsetTop=180;visual.events.get('scroll')();assert.equal(properties['--visual-top'],'180px');
 doc.activeElement=null;doc.events.get('focusout')();assert.equal(attributes['data-keyboard'],'true','keep the face crop while the OS keyboard is still closing');
 visual.height=926;visual.offsetTop=0;visual.events.get('resize')();assert.equal(attributes['data-keyboard'],'false');
 cleanup();assert.equal(visual.events.size,0);assert.equal(doc.events.size,0);
});
