// Reject the observed nonfan failure without another provider request.
import {rejectedJoke} from './humor.js?v=20261014-view1';
import {substantiveHistory} from './dialogue-history.js?v=20261014-view1';
import {requestsChiikawa} from './topic-intent.js?v=20261017-link1';
import {cleanDialogueControl,feedbackIntent} from './conversation-repair.js?v=20261017-link1';
const fanNames=/ちいかわ|チイカワ|chiikawa|ハチワレ|ジョジョ|バキ|刃牙/i;
export const CHAT_REPLY_BUDGET_MS=8000;
const decline=/(?:漫画|マンガ|アニメ|ちいかわ|チイカワ).{0,16}(?:詳しくない|興味ない|興味がない|苦手|以外|イガイ|いがい|やめ|ヤメ|じゃなく|ジャナク)|(?:別|他|ほか)の話/;
export function unwantedFanRedirect(text,input,state={}){
 const raw=String(input).normalize('NFKC');
 if(feedbackIntent(raw)||cleanDialogueControl(state.dialogueControl).avoidFandom&&!requestsChiikawa(raw))return fanNames.test(text);
 if(fanNames.test(raw)&&!decline.test(raw))return false;
 const users=(state.history||[]).filter(h=>h.role==='user').slice(-8).map(h=>String(h.text).normalize('NFKC'));
 users.push(raw);
 for(const line of users.reverse()){
  if(requestsChiikawa(line))return false;
  if(decline.test(line))return fanNames.test(text);
  if(fanNames.test(line))return false;
 }
 return false;
}
export function chatAvailable(session,now=Date.now()){
 // Old saves may have rateLimited=true with no retryAt. Never latch forever.
 return !(session?.chatHealth?.retryAt>now);
}
function noteAttempt(session,outcome,now,retrySeconds=60){
 if(!session)return;
 const health=session.chatHealth||{};
 session.chatHealth={...health,attempts:(health.attempts||0)+1,
  accepted:(health.accepted||0)+(outcome==='accepted'?1:0),
  rejected:(health.rejected||0)+(outcome==='rejected'?1:0),
  failed:(health.failed||0)+(['error','rate-limit'].includes(outcome)?1:0),
  lastOutcome:outcome,rateLimited:outcome==='rate-limit',
  retryAt:['error','rate-limit'].includes(outcome)?now+retrySeconds*1000:0};
}
function retryDelay(response,now){
 const raw=response.headers.get('retry-after');
 if(raw===null)return 60;
 const seconds=Number(raw),delay=Number.isFinite(seconds)?seconds:(Date.parse(raw)-now)/1000;
 return Number.isFinite(delay)?Math.max(1,Math.min(86400,Math.ceil(delay))):60;
}
export async function requestChat(url,input,state,session,{fetcher=fetch,offline=false,now=Date.now()}={}) {
 if(!url||offline)return null;
 if(!chatAvailable(session,now))return null;
 try {
  const r=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({input,state:{...state,history:substantiveHistory(state),dialogue:undefined,heardHistory:undefined},session}),signal:AbortSignal.timeout(CHAT_REPLY_BUDGET_MS)});
  if(!r.ok){noteAttempt(session,r.status===429?'rate-limit':'error',now,retryDelay(r,now));return null;}
  const d=await r.json();
  if(typeof d.text!=='string'||!d.text.trim()||d.text.length>180||rejectedJoke(d.text)||unwantedFanRedirect(d.text,input,state)){noteAttempt(session,'rejected',now);return null;}
  noteAttempt(session,'accepted',now);
  return {text:d.text,source:['llm','mixed','authored'].includes(d.source)?d.source:'unreported',provider:['groq','gemini','workers-ai','local'].includes(d.provider)?d.provider:'AI'};
 }catch{noteAttempt(session,'error',now);return null;}
}
