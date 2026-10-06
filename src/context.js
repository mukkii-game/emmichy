// Verified supplemental names and short-reply context. Facts checked 2026-10-06.
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
function focusedReply(input,state={}){
 const raw=String(input||'').normalize('NFKC').replace(/\s+/g,'');
 const recent=Array.isArray(state.history)?state.history.slice(-8):[];
 const lastUser=[...recent].reverse().find(h=>h.role==='user')?.text||'';
 const prior=recent.filter(h=>h.role==='enny').map(h=>h.text);
 const choose=lines=>lines.find(line=>!prior.includes(line))||lines[0];
 if(/(?:漫画|マンガ).*(?:詳しくない|知らない).*(?:仕事|ミス).*(?:疲れた|つかれた)|(?:仕事|ミス).*(?:疲れた|つかれた).*(?:漫画|マンガ).*(?:詳しくない|知らない)/.test(raw)){
  return {text:choose(['仕事のミスのあとに漫画の宿題まで出されたら、休憩にならないよね。今日は説明しなくていい側でいて。','疲れてる人に「好きな漫画は？」って、面接を増やすところだった。アタシ、今のは引っ込める。','ミスした場面って、帰ってから勝手に再放送されるよね。アタシなら脳内テレビの電源を抜きたい。']),topic:'focused-nonquestion'};
 }
 if(/^(?:うん|ウン|そう|ソウ)[。！!…]*$/.test(raw)&&/プリン/.test(String(lastUser))){
  return {text:choose(['「うん」で終わるプリン、かなり満足度が高いやつだ。','その短い「うん」、プリンがちゃんと仕事した顔してる。','アタシもプリンのあとだけ、語彙が「うん」になる。']),topic:'focused-nonquestion'};
 }
 if(/スプーン.*(?:忘れ|わすれ)/.test(raw)&&state.conversation?.entries?.some(e=>e.id==='half-price-king')){
  return {text:choose(['王、即位初日に装備品を忘れてる。','半額王の弱点、まさかのスプーン。急に親しみやすい王になった。','そこまで完璧だったのに、最後の一センチがスプーンだった。']),topic:'focused-running-joke'};
 }
 if(/(?:箸|はし).*(?:プリン|食べ)|プリン.*(?:箸|はし)/.test(raw)){
  return {text:choose(['箸でプリン。失敗じゃなくて、新しい流派ってことにしよう。','急に王の食事が修行になった。プリンが逃げる側だね。','スプーン不在から箸を選ぶの、諦め方が前向きすぎて好き。']),topic:'focused-running-joke'};
 }
 return null;
}
export function contextualReply(input,state={}){
 const focused=focusedReply(input,state);if(focused)return focused;
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
