// Verified supplemental names and short-reply context. Facts checked 2026-10-06.
import {works} from './fandom.js?v=20261006-mix1';
export const samonSource='https://www.tms-e.co.jp/alltitles/1960s/005101.html';
const fold=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/[\s・]/g,'').toLowerCase();
export function isGiantsContext(input,state={}){
 const t=fold(input);if(/巨人ノ星|キョジンノホシ/.test(t))return true;
 if(Object.values(works).some(names=>names.some(name=>t.includes(fold(name)))))return false;
 for(const h of (Array.isArray(state.history)?state.history.slice(-6):[]).toReversed()){
  const text=fold(h.text);
  if(/巨人ノ星|キョジンノホシ/.test(text))return true;
  if(Object.values(works).some(names=>names.some(name=>text.includes(fold(name)))))return false;
 }
 return false;
}
export function contextualReply(input,state={}){
 if(!isGiantsContext(input,state))return null;
 const t=fold(input).replace(/[。!?！？]/g,'');
 if(!/^(?:サモン|左門|左門豊作)(?:ガ好き|ガスキ|好き|スキ)?$/.test(t))return null;
 const lines=['左門豊作ね！ 飛雄馬のライバルの。左門が印象に残ってるのね。どんなところが好き？','あ、左門豊作のことね！ 巨人の星の話、ちゃんと続いてるよ。左門のどの場面を思い出した？'];
 const prior=state.history?.filter(h=>h.role==='enny').slice(-4).map(h=>h.text)||[];
 const text=lines.find(x=>!prior.includes(x));return text?{text,topic:'context-name'}:null;
}
export function contextualNote(input,state={}){
 return isGiantsContext(input,state)?`直前の作品は「巨人の星」。左門豊作（サモン）は星飛雄馬のライバル。サモンをゲームの召喚へ取り違えない。出典:${samonSource}`:'';
}
