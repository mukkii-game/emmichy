// Small pilot vocabulary, not a general personal-memory database.
const labels=Object.freeze({
 'half-price-pudding':'半額のプリンの話が出た。',
 'forgot-spoon':'その会話でスプーンを忘れた話が出た。',
 'pudding-chopsticks':'プリンを箸で食べる案が出た。実際に食べたとは断定しない。'
});
const fold=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96));
const bounded=n=>Number.isSafeInteger(n)&&n>=0?Math.min(n,100000):0;
export function cleanConversation(value){
 const v=value&&typeof value==='object'?value:{};
 const entries=Array.isArray(v.entries)?v.entries.filter(e=>e&&Object.hasOwn(labels,e.id)).map(e=>({id:e.id,turn:bounded(e.turn)})):[];
 return {entries:[...new Map(entries.map(e=>[e.id,e])).values()].slice(-4),lastCallbackTurn:bounded(v.lastCallbackTurn),endingUsed:v.endingUsed===true};
}
export function rememberConversation(value,input,turn){
 const memory=cleanConversation(value),text=fold(input),at=bounded(turn);
 const has=id=>memory.entries.some(e=>e.id===id);
 const drop=id=>memory.entries=memory.entries.filter(e=>e.id!==id);
 const add=id=>{if(!has(id))memory.entries.push({id,turn:at});};
 if(/プリン/.test(text)&&/半額|ハンガク/.test(text)&&! /ジャナ|デハナ/.test(text))add('half-price-pudding');
 if(has('half-price-pudding')&&/スプーン/.test(text)&&! /友達|家族|彼女|エミチ|EMMICHY/i.test(text)){
  if(/(?:忘|ワスレ).*(?:ナイ|ナカッタ|ジャナ|デハナ)/.test(text))drop('forgot-spoon');
  else if(/忘|ワスレ/.test(text))add('forgot-spoon');
 }
 if((has('half-price-pudding')||/プリン/.test(text))&&/箸|ハシ/.test(text)&&/食ベ|タベ/.test(text))add('pudding-chopsticks');
 memory.entries=memory.entries.slice(-4);return memory;
}
export function noteConversationReply(value,reply,input,turn){
 const memory=cleanConversation(value),out=fold(reply),raw=fold(input);
 const markers={'forgot-spoon':/スプーン/,'pudding-chopsticks':/箸|ハシ/};
 if(memory.entries.some(e=>markers[e.id]?.test(out)&&!markers[e.id].test(raw)))memory.lastCallbackTurn=bounded(turn);
 return memory;
}
export function conversationNote(value,turn,input=''){
 const memory=cleanConversation(value);if(!memory.entries.length)return '';
 const allow=turn>=6&&turn-memory.lastCallbackTurn>=4&&! /つらい|苦しい|病気|相談|間違|違う|ちがう/.test(input);
 return `\nこのセッションの共有素材（固定IDから選択、公式作品情報ではない）:\n${memory.entries.map(e=>labels[e.id]).join('\n')}\n${allow?'今の話へ自然につながる時だけ、古い素材を一つ回収してよい。今の質問に先に答え、唐突にねじ込まない。':'今回は素材を無理に回収せず、今の話を続ける。'}`;
}
export function endingCallback(value){
 const memory=cleanConversation(value);if(memory.endingUsed)return null;
 const has=id=>memory.entries.some(e=>e.id===id);
 let choices=[];
 if(has('forgot-spoon')&&has('pudding-chopsticks'))choices=['次はスプーンも忘れずにね。','次にプリンを見たら、箸を思い出しそう。','またプリンの話、聞かせてね。'];
 const seed=memory.entries.reduce((n,e)=>n+e.turn,0);
 const text=choices.length?choices[seed%choices.length]:'';
 return text?{text,memory:{...memory,endingUsed:true}}:null;
}
