import {works} from './fandom.js?v=20261010-virtual1';
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
 // Keep the suitable authored fallback. The first successful model reply is
 // prioritized separately; later turns still have no fixed AI/bank ratio.
 return prepared;
}
export function needsFirstModelReply(session,{enabled=false,kind='',topic='',restart=false,fixedIdentity=false}={}){
 return enabled&&!restart&&!fixedIdentity&&!session?.finished&&!(session?.dialogueUse?.ai>0)
  &&!['bye','asleep','name','memory','arithmetic'].includes(kind)
  &&!['deflection','fandom-decline','greeting'].includes(topic);
}
export function shouldRequestModel(session,options={}){
 if(needsFirstModelReply(session,options))return true;
 const {enabled=false,kind='',topic='',restart=false}=options;
 if(!enabled||restart||session?.finished||['bye','asleep','name','memory','arithmetic'].includes(kind)||['profile','deflection','fandom-decline','greeting'].includes(topic))return false;
 // Prefer a good model continuation. The mix is observed, never a quota:
 // authored material supports waiting, failed replies and fandom enthusiasm.
 return true;
}
export function noteDialogueMix(session,{usedModel=false,usedBank=false,topic='',kind='',restart=false}={}){
 if(restart||['bye','asleep','name','memory','arithmetic'].includes(kind)||['profile','deflection','fandom-decline','greeting'].includes(topic))return;
 if(!usedModel&&!usedBank)return;
 const mix=session.dialogueMix||{ai:0,bank:0};
 session.dialogueMix={ai:(mix.ai||0)+(usedModel?1:0),bank:(mix.bank||0)+(usedModel?0:1)};
}
