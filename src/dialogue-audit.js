// Diagnostics for the saved local playtest only. No text leaves the browser.
// A retained generated reply may still have an interrupted, unspoken tail.
export function modelRequestPolicy({offline=false,enabled=false,allowed=false,available=true}={}){
 return offline?'offline':!enabled?'disabled':!allowed?'fixed-rule':!available?'cooldown':'request';
}
export function auditDialogueTrace(value){
 const rows=Array.isArray(value)?value:[],out={turns:rows.length,requested:0,accepted:0,failed:0,rejected:0,modelRetained:0,modelReplaced:0,serverAuthored:0,displayedBeats:0,unspokenBeats:0,sources:{},policies:{},reasons:{},providers:{}};
 const count=(bucket,key)=>{if(typeof key==='string'&&key)bucket[key]=(bucket[key]||0)+1;};
 for(const row of rows){
  if(!row||typeof row!=='object')continue;
  count(out.sources,row.source);count(out.policies,row.policy||'legacy-unknown');count(out.reasons,row.reason);
  if(Array.isArray(row.plannedBeats)&&Array.isArray(row.deliveredBeats)){out.displayedBeats+=row.deliveredBeats.length;out.unspokenBeats+=Math.max(0,row.plannedBeats.length-row.deliveredBeats.length);}
  if(!row.modelRequested)continue;
  out.requested++;count(out.providers,row.provider);
  if(row.outcome==='accepted'){
   out.accepted++;
   if(row.serverSource==='authored')out.serverAuthored++;
   if(['llm','mixed'].includes(row.source))out.modelRetained++;
   if(['llm','mixed'].includes(row.serverSource)&&row.source==='authored')out.modelReplaced++;
  }else if(row.outcome==='rejected')out.rejected++;
  else if(['error','rate-limit'].includes(row.outcome))out.failed++;
 }
 return out;
}
