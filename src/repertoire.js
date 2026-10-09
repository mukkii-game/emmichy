import {unwantedFanRedirect} from './chat.js?v=20261009-pacing2';
import {rejectedJoke} from './humor.js?v=20261008-humor1';
import {everydayReplies} from './everyday.js?v=20261008-hybrid1';
import {cards,selectKnowledge,works} from './fandom.js?v=20261009-pacing2';
import {fanLines} from './fan-lines.js?v=20261006-mix1';
// 600 individually authored reactions + 600 factual-answer combinations.
// Counts describe reply candidates, not 1,200 distinct canon facts.
export const replies=Object.freeze(cards.flatMap(card=>{
 const lines=[card.hook,...(fanLines[card.id]||[])];
 return lines.flatMap((line,angle)=>[
  {id:`${card.id}:voice:${angle}`,cardId:card.id,work:card.work,angle,mode:'react',text:line,family:`${card.id}:${angle}`},
  {id:`${card.id}:fact:${angle}`,cardId:card.id,work:card.work,angle,mode:'fact',text:`${card.fact} ${line}`,family:`${card.id}:${angle}`}
 ]).map(Object.freeze);
}));
const byId=new Map([...replies,...everydayReplies].map(r=>[r.id,r]));
const fold=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/[\s。、!?！？「」…・]/g,'');
const fingerprint=t=>{let n=2166136261;for(const ch of fold(t)){n^=ch.codePointAt(0);n=Math.imul(n,16777619);}return (n>>>0).toString(36);};
export function cleanRepertoire(value){
 const v=value&&typeof value==='object'?value:{};
 return {ids:Array.isArray(v.ids)?[...new Set(v.ids.filter(id=>typeof id==='string'&&byId.has(id)))].slice(-240):[],
  prints:Array.isArray(v.prints)?v.prints.filter(p=>typeof p==='string'&&/^[a-z0-9]{1,8}$/.test(p)).slice(-120):[],
  lastTurn:Number.isSafeInteger(v.lastTurn)?Math.max(-10,Math.min(100000,v.lastTurn)):-10};
}
export function rememberReply(state,text,id=null,scripted=false){
 const old=cleanRepertoire(state.repertoire);
 return {...old,ids:id&&byId.has(id)?[...old.ids.filter(v=>v!==id),id].slice(-240):old.ids,
  prints:[...old.prints,fingerprint(text)].slice(-120),lastTurn:scripted?(Number(state.turn)||0):old.lastTurn};
}
const distress=/つらい|ツライ|苦しい|クルシイ|死に|シニ|殺す|コロス|自殺|いじめ|暴力|相談|失恋|病気|入院|事故|嫌い|キライ|やめて|ヤメテ|苦手|バカリ|ばかり|以外/;
export function dialogueIntent(raw){
 const t=String(raw).normalize('NFKC');
 if(distress.test(t))return 'sensitive';
 if(/(?:という意味|ということ|っていう意味|のことだよ|のことです|実は|じつは|仕組みは|だから.+なんだ|つまり|要するに|と呼ぶ|って呼ぶ)/.test(t))return 'teaching';
 if(/[?？]|なぜ|ナゼ|どうして|ドウシテ|どうやって|教えて|オシエテ|何|いつ|誰|どこ|どんな|どれ|違い|考察|弱点|攻略|仕組み/.test(t))return 'question';
 if(/もっと|モット|ほか|ホカ|他にも|続き|ツヅキ/.test(t))return 'more';
 if(/好き|スキ|最高|サイコウ|熱い|アツイ|いいね|イイネ|かっこ|カッコ|面白|オモシロ|推し|オシ|心配|シンパイ/.test(t))return 'react';
 return 'talk';
}
function coveredQuestion(raw,card){
 const t=fold(raw),tags=card.tags.map(fold),fact=fold(card.fact);
 // Closed facts only. Analysis, tactics, relationships and unfamiliar questions go to AI.
 if(/ナゼ|ドウシテ|ドウヤッテ|弱点|攻略|比較|違イ|考察|結末|最新|今.*上映|配信|説明シテ/.test(t))return false;
 if(/公開.*イツ|イツ.*公開|公開日/.test(t))return /公開サレタ/.test(fact)&&tags.includes('公開');
 if(/監督|脚本|制作|音楽/.test(t)&&/誰|ダレ|担当|ドコ|何|ナニ/.test(t))return tags.some(tag=>['監督','脚本','制作','音楽'].includes(tag)&&t.includes(tag));
 if(/バンジーガム|ドッキリテクスチャー|ジャジャン拳|ザハンド|ザ・ハンド|クレイジー|ゴールド.*エクスペリエンス|ヘブンズ|ストーン.*フリー/.test(t)&&/何|ナニ|能力|性質|ドウイウ|デキル/.test(t))return tags.some(tag=>tag.length>=3&&t.includes(tag))&&/性質|偽装|技ハ|空間|直シ|生命|本トシテ|糸ニ/.test(fact);
 if(/ピストルズ.*番号|番号.*ピストルズ/.test(t))return /番号ニ4/.test(fact);
 return false;
}
function similarity(a,b){const x=fold(a),y=fold(b);if(x===y)return 1;const grams=s=>new Set(Array.from({length:Math.max(0,s.length-2)},(_,i)=>s.slice(i,i+3)));const gx=grams(x),gy=grams(y);let both=0;for(const g of gx)if(gy.has(g))both++;return both/Math.max(1,Math.min(gx.size,gy.size));}
function topicRelevant(raw,selection){
 const t=fold(raw);
 return selection.cards.some(c=>c.tags.some(tag=>fold(tag).length>=3&&t.includes(fold(tag))))||works[selection.work]?.some(w=>t.includes(fold(w)));
}
export function chooseRepertoire(raw,state={},now=new Date()){
 const intent=dialogueIntent(raw),mem=cleanRepertoire(state.repertoire);
 // Factual questions must keep the best matching fact even if that card was used before.
 let selection=selectKnowledge(raw,intent==='question'?{...state,knowledge:{...state.knowledge,recent:[]}}:state,now);
 const plain=fold(raw),generic=new Set(['映画','名前','能力','漫画','マンガ','アニメ','ご飯','家','住ム','資格','心配','不安','好き','音楽','強イ','父','本','性質','話','次','条件','六','水']);
 // A named facet such as water flow or a camera stays on that facet, even after use.
 const facets=cards.filter(c=>c.work===selection.work&&c.tags.slice(1).some(tag=>!generic.has(fold(tag))&&(fold(tag).length>=2||tag==='4')&&plain.includes(fold(tag))));
 if(facets.length){const eligible=new Set(selectKnowledge(raw,{...state,knowledge:{...state.knowledge,recent:[]}},now).cards.map(c=>c.id));const precise=facets.filter(c=>eligible.has(c.id));if(precise.length)selection={...selection,cards:precise};}
 if(['sensitive','teaching'].includes(intent)||!selection.cards.length)return {intent,selection,candidate:null,scripted:false};
 if(intent==='question')selection={...selection,cards:selection.cards.filter(c=>coveredQuestion(raw,c))};
 if(!selection.cards.length||(!topicRelevant(raw,selection)&&intent!=='more'))return {intent,selection,candidate:null,scripted:false};
 const mode=intent==='question'?'fact':'react',recentHistory=Array.isArray(state.history)?state.history.filter(h=>h.role==='enny').slice(-6).map(h=>h.text):[];
 const families=new Set(mem.ids.map(id=>byId.get(id)?.family));
 let candidates=selection.cards.flatMap((c,rank)=>replies.filter(r=>r.cardId===c.id&&r.mode===mode).map(r=>({...r,rank})))
  .filter(r=>r.text.length<=180&&!mem.ids.includes(r.id)&&!families.has(r.family)&&!mem.prints.includes(fingerprint(r.text))&&recentHistory.every(t=>similarity(t,r.text)<.72));
 // An exhausted topic is handed to AI; offline does not pretend a repeated line is new.
 const turn=Number(state.turn)||0;
 const score=r=>r.rank*8+(r.angle===3?7:0)+((r.angle+turn)%5);
 candidates.sort((a,b)=>score(a)-score(b));
 // Repetition avoidance is for reactions, not truth. Repeated covered factual
 // questions keep the same accurate answer instead of spending an AI request.
 const candidate=candidates[0]||(intent==='question'?replies.find(r=>r.mode==='fact'&&selection.cards.some(c=>c.id===r.cardId)):null)||null;
 const scripted=Boolean(candidate&&(intent==='question'||intent==='more'||(intent==='react'&&turn-mem.lastTurn>=2&&turn%3!==1)));
 return {intent,selection,candidate,scripted};
}
export function polishReply(text,raw,state={},choice=null){
 if(rejectedJoke(text))return {text:'ウン。その呼び方は使わないね。',id:null,replaced:true};
 let out=String(text).normalize('NFKC').trim().replace(/[\r\n]+/g,' ').replace(/\s{2,}/g,' ');
 out=out.replace(/^(?:EMMICHY|EMMY|エミチ[ィイ]|エミ)\s*[:：>]\s*/i,'');
 out=out.replace(/([。！!？?])\s*(?:エミ(?:チ[ィイ]|ちぃ)?|Emmichy)\s*$/i,'$1');
 out=out.replace(/([よね])[。！!]\s*(?:ね|よ)[。！!]$/,'$1。').replace(/([!?！？])\1{2,}/g,'$1$1');
 const previous=Array.isArray(state.history)?state.history.filter(h=>h.role==='enny'&&!/^(?:ウ、ウン…。|ヤハ…。|エト、エト…。|ンショ…。|フムッ…。|ウンッ…。|ウンウン…。|アッ…。|フフ…。|ウン！|ンー…。)$/.test(h.text)).slice(-2):[];
 if(previous.length===2&&previous.every(h=>/[?？]|教えて(?:くれる|ほしい|ね)|聞かせて/.test(h.text))){
  // Keep a complete substantive reaction; never delete the only sentence.
  const split=out.match(/^([\s\S]+[。！!])\s*[^。！!]*[?？]$/);
  if(split&&split[1].trim().length>=12)out=split[1].trim();
 }
 if(/島二郎|シマ\s*ジロウ/.test(raw)&&state.knowledge?.work==='chiikawa')out=out.replace(/しまじろう/g,'島二郎');
 const mem=cleanRepertoire(state.repertoire),recent=Array.isArray(state.history)?state.history.filter(h=>h.role==='enny').slice(-3).map(h=>h.text):[];
 if(choice?.candidate&&unwantedFanRedirect(choice.candidate.text,raw,state))choice=null;
 const repeated=mem.prints.includes(fingerprint(out))||recent.some(t=>similarity(t,out)>.94);
 const islandError=/島二郎/.test(raw)&&/(?:トラ|虎|幼児|子供たちのヒーロー|お腹から|腹から|口から)/.test(out);
 // Substitute only if our candidate actually answers a covered question or is a direct reaction.
 if((repeated||islandError)&&choice?.candidate&&['react','more'].includes(choice.intent))return {text:choice.candidate.text,id:choice.candidate.id,replaced:true};
 if(repeated&&choice?.candidate&&choice.intent==='question')return {text:choice.candidate.text,id:choice.candidate.id,replaced:true};
 return {text:out,id:null,replaced:false};
}
