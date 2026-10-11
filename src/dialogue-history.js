const roles=new Set(['user','enny']);
const genericFillers=new Set([
 'ウンウン…。','ソウネー…。','フムフム…。','ンー…。','エト…コノコトバ…。',
 'ニホンゴデ、ナンテイウンダッケ…。','うん、聞いてるよ。','そっか…。',
 'うん…。','エエッ…。','！？','ワオ！','フフッ。'
]);

function sourceHistory(stateOrArray){
 if(Array.isArray(stateOrArray))return stateOrArray;
 if(!stateOrArray||typeof stateOrArray!=='object')return [];
 return Array.isArray(stateOrArray.dialogue)?stateOrArray.dialogue:(Array.isArray(stateOrArray.history)?stateOrArray.history:[]);
}

function clean(history){
 const out=[];
 for(const item of history){
  if(!item||!roles.has(item.role)||typeof item.text!=='string')continue;
  const text=item.text.trim();
  if(!text||(item.role==='enny'&&(item.kind==='gesture'||genericFillers.has(text))))continue;
  const previous=out.at(-1);
  if(item.role==='enny'&&previous?.role==='enny'&&previous.text.length+text.length+1<=600)previous.text+=` ${text}`;
  else out.push({role:item.role,text:text.slice(0,600)});
 }
 const recent=[];let chars=0;
 for(let i=out.length-1;i>=0&&recent.length<20;i--){
  const message=out[i],size=message.text.length;
  if(chars+size>6000)continue;
  recent.unshift(message);chars+=size;
 }
 return recent;
}

export function substantiveHistory(stateOrArray){return clean(sourceHistory(stateOrArray));}

export function appendDialogue(state,role,text,{kind}={}){
 if(!state||typeof state!=='object'||!roles.has(role)||typeof text!=='string')return state;
 const dialogue=Array.isArray(state.dialogue)?state.dialogue:clean(state.history||[]);
 const entry={role,text};
 if(typeof kind==='string')entry.kind=kind;
 state.dialogue=clean([...dialogue,entry]);
 return state;
}
