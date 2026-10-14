import test from 'node:test';
import assert from 'node:assert/strict';
import {browserEnvironment,externalBrowserTarget,bindBrowserLauncher} from '../src/browser-launcher.js';
const ios='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const android='Mozilla/5.0 (Linux; Android 14; Phone; wv) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36';
test('embedded browsers are suggested while ordinary Safari, Chrome and desktop are not',()=>{
 for(const ua of [ios,ios+' Instagram 330',ios+' FBAN/Messenger',android])assert.equal(browserEnvironment({userAgent:ua},'https://example.com/').embedded,true);
 for(const ua of [ios+' Version/18.0 Safari/604.1',android.replace('; wv',''),'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0'])assert.equal(browserEnvironment({userAgent:ua},'https://example.com/').embedded,false);
 assert.equal(browserEnvironment({userAgent:ios},'javascript:alert(1)').url,'');
 const env=browserEnvironment({userAgent:android},'https://example.com/game/?test=1#part');
 assert.equal(env.url,'https://example.com/game/?test=1');
 assert.match(externalBrowserTarget(env),/^intent:\/\/example.com\/game\/\?test=1#Intent;scheme=https;/);
 assert.match(externalBrowserTarget(env),/browser_fallback_url=https%3A/);
});
function fixture(){
 const elements=new Map();
 const get=id=>{if(!elements.has(id))elements.set(id,{hidden:true,value:'',textContent:'',events:{},focus(){},select(){},addEventListener(k,f){this.events[k]=f;}});return elements.get(id);};
 const storage=new Map();let opened=0,closed=0;
 const doc={getElementById:get,activeElement:null,execCommand:()=>false};
 const nav={userAgent:ios,clipboard:{writeText:async()=>{throw Error('blocked');}}};
 const win={location:{href:'https://example.com/game/'},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};
 const options={doc,nav,win,onOpen:()=>opened++,onClose:()=>closed++};
 return {get,win,nav,doc,options,counts:()=>({opened,closed})};
}
test('suggestion appears once per tab, offers a stay action and remains manually accessible',()=>{
 const f=fixture();bindBrowserLauncher(f.options);
 assert.equal(f.get('browser-guide').hidden,false);assert.equal(f.win.location.href,'https://example.com/game/','no automatic external navigation');
 f.get('browser-stay').onclick();assert.equal(f.get('browser-guide').hidden,true);assert.equal(f.counts().closed,1);
 bindBrowserLauncher(f.options);assert.equal(f.counts().opened,1);
 f.get('browser-launch').onclick();assert.equal(f.get('browser-guide').hidden,false);
});
test('a blocked external launch still exposes menu instructions, URL and copy fallback',async()=>{
 const f=fixture();bindBrowserLauncher(f.options);f.get('browser-open').onclick();
 assert.equal(f.get('browser-open-help').hidden,false);assert.match(f.get('browser-menu-help').textContent,/Safari/);
 assert.equal(f.get('browser-url').value,'https://example.com/game/');
 assert.equal(f.win.location.href,'x-safari-https://example.com/game/');
 await f.get('browser-copy').onclick();assert.match(f.get('browser-copy-status').textContent,/長押し/);
 f.nav.clipboard.writeText=async()=>{};
 await f.get('browser-copy').onclick();assert.match(f.get('browser-copy-status').textContent,/コピーしました/);
});
