// Reject the observed nonfan failure without another provider request.
const fanNames=/ちいかわ|チイカワ|chiikawa|ハチワレ|ジョジョ|バキ|刃牙/i;
const decline=/(?:漫画|マンガ|アニメ|ちいかわ|チイカワ).{0,16}(?:詳しくない|興味ない|興味がない|苦手|以外|やめ|じゃなく)|(?:別|他|ほか)の話/;
export function unwantedFanRedirect(text,input,state={}){
 const raw=String(input).normalize('NFKC');
 if(fanNames.test(raw)&&!decline.test(raw))return false;
 const users=(state.history||[]).filter(h=>h.role==='user').slice(-8).map(h=>String(h.text).normalize('NFKC'));
 users.push(raw);
 for(const line of users.reverse()){
  if(decline.test(line))return fanNames.test(text);
  if(fanNames.test(line))return false;
 }
 return false;
}
export async function requestChat(url,input,state,session,{fetcher=fetch,offline=false}={}) {
 if(!url||offline)return null;
 try {
  const r=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({input,state,session}),signal:AbortSignal.timeout(22000)});
  if(!r.ok)return null;
  const d=await r.json();
  if(typeof d.text!=='string'||!d.text.trim()||d.text.length>180||unwantedFanRedirect(d.text,input,state))return null;
  return {text:d.text,provider:['groq','gemini','workers-ai','local'].includes(d.provider)?d.provider:'AI'};
 }catch{return null;}
}
