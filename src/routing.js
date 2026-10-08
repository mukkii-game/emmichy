import {everydayReply} from './everyday.js?v=20261008-hybrid1';
import {contextualReply} from './context.js?v=20261007-loop7';
import {curatedReply} from './curated.js?v=20261006-mix1';
import {balanceRoute} from './balance.js?v=20261008-route2';

// Shared by the screen and offline through-play checks.
export function preparedReply(raw,state,session,{gap=null,culture=null,repertoire={},modelEnabled=false,kind=null}={}){
 if(['bye','asleep','name','memory','arithmetic'].includes(kind))return null;
 const legacy=contextualReply(raw,state)||curatedReply(raw,state);
 const daily=everydayReply(raw,state);
 const prepared=daily|| (legacy?.topic==='conversation-move'?legacy:
  gap?{text:gap.text,topic:'gap'}:
  culture?.kind==='curiosity'?{text:culture.text,topic:'culture'}:
  repertoire.scripted?{text:repertoire.candidate.text,topic:'repertoire'}:
  legacy&&(!repertoire.candidate||legacy.topic==='greeting')?legacy:null);
 return balanceRoute(prepared,repertoire,session,modelEnabled);
}
