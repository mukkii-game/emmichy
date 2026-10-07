// Verified supplemental names and short-reply context. Facts checked 2026-10-06.
import {conversationMove} from './moves.js?v=20261007-loop6';
import {works} from './fandom.js?v=20261006-mix1';
export const samonSource='https://www.tms-e.co.jp/alltitles/1960s/005101.html';
const fold=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/[\s・]/g,'').toLowerCase();
function sharesOwnName(input){
 const t=fold(input);
 return /エミチ[ィイ]|emmichy/.test(t)&&/名前|ナマエ|名付|ナヅケ/.test(t)&&! /ジャナイ|デハナイ|違ウ|チガウ/.test(t);
}
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
 const move=conversationMove(input,state);if(move)return move;
 if(/(?:箸|はし).*(?:プリン|食べ)|プリン.*(?:箸|はし)/.test(input)&&(/プリン/.test(input)||state.conversation?.entries?.some(e=>e.id==='half-price-pudding'))&&!/[?？]|違う|じゃない|忘れてない|つら|疲れ/.test(input)){
  const text='箸でプリン。失敗じゃなくて、新しい流派ってことにしよう。';
  if(!(state.history||[]).some(h=>h.role==='enny'&&h.text===text))return {text,topic:'conversation-move',move:'SHARED_FRAME'};
 }
 if(sharesOwnName(input)){
  const lines=['エッ、アタシと同じ名前！ その子の話なのに、ちょっと照れちゃった。なんか他人の気がしないの。','アタシと同じ名前なのね！ もう勝手に親近感。名前だけで仲間にするの、ちょっと早かった？','エミチィ！ ア、呼ばれたかと思った。その女の子のことだったのね。アタシ、名前に反応よすぎ。'];
  const prior=state.history?.filter(h=>h.role==='enny').map(h=>h.text)||[];
  const text=lines.find(x=>!prior.includes(x));
  return text?{text,topic:'context-name'}:null;
 }
 if(!isGiantsContext(input,state))return null;
 const t=fold(input).replace(/[。!?！？]/g,'');
 if(!/^(?:サモン|左門|左門豊作)(?:ガ好き|ガスキ|好き|スキ)?$/.test(t))return null;
 const lines=['左門豊作ね！ 飛雄馬のライバルの。左門が印象に残ってるのね。どんなところが好き？','あ、左門豊作のことね！ 巨人の星の話、ちゃんと続いてるよ。左門のどの場面を思い出した？'];
 const prior=state.history?.filter(h=>h.role==='enny').slice(-4).map(h=>h.text)||[];
 const text=lines.find(x=>!prior.includes(x));return text?{text,topic:'context-name'}:null;
}
export function contextualNote(input,state={}){
 if(sharesOwnName(input))return '相手が紹介した名前は自分の名前Emmichy（エミチィ）と同じ。まず自分自身として同名に気付いて、驚き・親近感・軽い照れで反応する。一般的なキャラ設定アンケートへ戻らない。そのキャラと自分が同一人物だとは決めつけない。';
 return isGiantsContext(input,state)?`直前の作品は「巨人の星」。左門豊作（サモン）は星飛雄馬のライバル。サモンをゲームの召喚へ取り違えない。出典:${samonSource}`:'';
}
