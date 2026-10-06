export async function requestChat(url,input,state,session,{fetcher=fetch,offline=false}={}) {
 if(!url||offline)return null;
 try {
  const r=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({input,state,session}),signal:AbortSignal.timeout(22000)});
  if(!r.ok)return null;
  const d=await r.json();
  if(typeof d.text!=='string'||!d.text.trim()||d.text.length>180)return null;
  return {text:d.text,provider:['groq','gemini','workers-ai','local'].includes(d.provider)?d.provider:'AI'};
 }catch{return null;}
}
