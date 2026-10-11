import {fanRecovery} from './fandom.js?v=20261012-chii1';
import {polishReply} from './repertoire.js?v=20261012-chii1';
import {unwantedFanRedirect} from './chat.js?v=20261012-chii1';
import {selectChiikawaBridge,personalFanReply} from './chiikawa-theme.js?v=20261012-chii1';
import {groundModelReply} from './dialogue-grounding.js?v=20261012-chii1';
import {asksCurrentSerial} from './chiikawa-relations.js?v=20261012-chii1';

// The screen owns final content selection. The relay validates transport/output
// shape; it does not silently substitute a different authored conversation.
export function directReply(text,input,state={}, {source='authored',choice=null,allowBridge=true}={}){
 let out=String(text||''),origin=source,reason='';
 const allowed=!unwantedFanRedirect('ちいかわ',input,state);
 if(allowed&&asksCurrentSerial(input,state))return {text:'今の最新話の細部は、まだ手元で確かめられてないの。読んだところの話は大好き！ どの場面のこと？',source:'authored',reason:'latest-serial-unverified',id:null,replaced:source==='llm',recovered:false};
 if(allowed&&source!=='authored'){
  const grounded=groundModelReply(out,input,state);
  if(grounded.changed){out=grounded.text;origin=grounded.replaced?'authored':source==='unreported'?'unreported':'mixed';reason='unverified-scene';}
 }
 const personal=allowed?personalFanReply(input,state):null;
 if(personal&&source==='authored'){out=personal.text;reason='personal-fan-answer';}
 const recovered=allowed&&!personal?fanRecovery(input,state,out,{enrich:source==='authored'}):null;
 if(recovered&&recovered!==out){origin=out&&recovered.includes(out)&&origin==='llm'?'mixed':'authored';out=recovered;reason='fan-recovery';}
 const polished=polishReply(out,input,state,origin==='authored'?choice:null);
 out=polished.text;
 if(polished.replaced){origin='authored';reason='repair';}
 // Prefer a generated connection. A small local connection fills a missed,
 // concrete cue without discarding a useful answer or overwhelming a question.
 if(allowBridge&&allowed&&!personal&&!/[?？]$/.test(out)&&!/ちいかわ|チイカワ|ハチワレ|シーサー|ラッコ|モモンガ|古本屋|うさぎ/.test(out)){
  const bridge=selectChiikawaBridge(input,state);
  if(bridge&&out.length+bridge.text.length+1<=180){out+=` ${bridge.text}`;origin=origin==='llm'?'mixed':origin;reason='chiikawa-connection';}
 }
 return {text:out,source:origin,reason,id:polished.id,replaced:origin==='authored'&&source==='llm',recovered:Boolean(recovered)};
}
