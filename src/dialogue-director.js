import {ownedFollowup} from './fallback.js?v=20261013-talk1';
import {fanRecovery} from './fandom.js?v=20261013-talk1';
import {polishReply} from './repertoire.js?v=20261013-talk1';
import {unwantedFanRedirect} from './chat.js?v=20261013-talk1';
import {selectChiikawaBridge,personalFanReply} from './chiikawa-theme.js?v=20261013-talk1';
import {groundModelReply} from './dialogue-grounding.js?v=20261013-talk1';
import {asksCurrentSerial} from './chiikawa-relations.js?v=20261013-talk1';
import {attributionRepair} from './chiikawa-attribution.js?v=20261013-talk1';
import {learnerReply} from './japanese-learner.js?v=20261013-talk1';
import {conversationRepair} from './conversation-repair.js?v=20261013-talk1';

// The screen owns final content selection. The relay validates transport/output
// shape; it does not silently substitute a different authored conversation.
export function directReply(text,input,state={}, {source='authored',choice=null,allowBridge=true}={}){
 const repair=conversationRepair(input,state);
 if(repair)return {text:repair.text,source:'authored',reason:repair.id,id:repair.id,replaced:source==='llm',recovered:false};
 const owned=ownedFollowup(input,state);
 if(owned&&(source==='authored'||/よく知らない|わかったふり|よくわからない/.test(text)))return {text:owned.text,source:'authored',reason:'owned-followup',replaced:source==='llm',recovered:false};
 const attributed=attributionRepair(text);
 if(attributed&&(!/シーン|場面|瞬間|エピソード/.test(text)||source==='authored'))return {text:attributed.text,source:'authored',reason:attributed.reason,id:null,replaced:source==='llm',recovered:false};
 const learner=learnerReply(input,{force:true});
 if(learner&&/よく知らない|よくわからない|ソコ.{0,8}シラナイ/.test(text))return {text:learner.text,source:'authored',reason:'learner-known-word',id:learner.id,replaced:source==='llm',recovered:false};
 let out=String(text||''),origin=source,reason='';
 const allowed=!unwantedFanRedirect('ちいかわ',input,state);
 if(allowed&&asksCurrentSerial(input,state))return {text:'今の最新話の細部は、まだ手元で確かめられてないの。読んだところの話は大好き！ どの場面のこと？',source:'authored',reason:'latest-serial-unverified',id:null,replaced:source==='llm',recovered:false};
 if(allowed&&source!=='authored'){
  const grounded=groundModelReply(out,input,state);
  if(grounded.changed){out=grounded.text;origin=grounded.replaced?'authored':source==='unreported'?'unreported':'mixed';reason='unverified-scene';}
 }
 const personal=allowed?personalFanReply(input,state):null;
 if(source!=='authored'&&personal){
  const focused=out.replace(/(?:もっと|他に|ほかに).{0,22}(?:聞きたいこと|気になるキャラ|好きなキャラ|質問).{0,18}[?？]\s*$/,'').trim();
  if(focused.length>=16&&focused!==out){out=focused;origin='mixed';reason='keep-question-focus';}
  const recent=(state.history||[]).filter(h=>h.role==='enny').slice(-4).map(h=>h.text).join(' ');
  if(/ヤハ/.test(recent)&&/ヤハ[!！]\s*$/.test(out)){out=out.replace(/ヤハ[!！]\s*$/,'').trim();origin='mixed';}
 }
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
