import {works} from './fandom.js?v=20261009-readmenu1';
const fold=s=>String(s).normalize('NFKC').toLowerCase().replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
export function cleanInterests(value){
 return Object.fromEntries(Object.keys(works).filter(k=>Number.isFinite(value?.[k])).map(k=>[k,Math.max(-10,Math.min(10,Math.trunc(value[k])))]));
}
export function learnInterests(raw,value){
 const next=cleanInterests(value),t=fold(raw);
 for(const [id,names] of Object.entries(works)){
  if(!names.some(name=>t.includes(fold(name))))continue;
  // Do not mistake a question or someone else's preference for an explicit like.
  const positive=names.some(name=>new RegExp(fold(name)+'.{0,10}(?:ガ|ハ|ヲ)?(?:大好き|好キ|推シ|最高)').test(t))&&!/[?？]|友達|友人|知ラナイ|詳シクナイ/.test(t);
  const negative=names.some(name=>new RegExp(fold(name)+'.{0,10}(?:嫌イ|苦手)').test(t))&&!/[?？]|友達|友人/.test(t);
  next[id]=Math.max(-10,Math.min(10,(next[id]||0)+(negative?-4:positive?3:1)));
 }
 return next;
}
export function balanceRoute(prepared,choice,session,enabled){
 // Suitability wins over an AI/bank quota. Do not spend a request solely to
 // manufacture a hybrid ratio or substitute a non-scripted candidate by count.
 return prepared;
}
