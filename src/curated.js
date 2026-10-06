// Authored, reviewed lines for simple exchanges. Follow-up questions stay with AI.
const pools = [
 {topic:'greeting',match:/^(コンニチ[ハワ]|コンバンハ|オハヨウ)$/,lines:['コンニチハ！ キョウ ハ ドンナ ヒ ダッタ？','ア、キテクレタ！ ナニカ オモシロイ コト アッタ？']},
 {topic:'shisa',match:/^(?:チイカワノ)?シーサー(?:ガ|ハ|ノコトガ)?(?:心配|シンパイ|気ニナル|キニナル|大丈夫カナ|ダイジョウブカナ)(?:ダヨ|ダネ|ナノ)?$/,lines:['アタシモ シーサー ガ シンパイ。ツヅキ ヲ ミタイノニ、ミルノ ガ コワイヨ。','シーサー ニ ブジ デ イテホシイ。アタシ、オチツカナクテ オチャ バッカリ ノンデル。','シーサー ガ キニナッテ、ホカノ コト ガ アタマ ニ ハイラナイヨ。マッテル ジカン、ナガイネ。']},
 {topic:'story',match:/^(?:チイカワ|CHIIKAWA)(?:ノ)?(?:話|オ話|ハナシ|オハナシ|ストーリー)(?:ガ|ハ)?(?:気ニナル|キニナル|好き|スキ|面白イ|オモシロイ)$/,lines:['カワイイノニ、キュウニ コワクナルヨネ。アタシ、シーサー ガ シンパイ デ オチツカナイヨ。','アノ コ タチ ガ ガンバッテルノ ヲ ミルト、オウエン シタクナル。アタシモ ガンバル…アシタ カラ！','ツヅキ ガ キニナルヨネ。タノシイ ハナシ ダト オモッタラ、キュウニ ドキドキ スルノ。']},
 {topic:'movie',match:/^(?:映画|エイガ)(?:ノ)?(?:チイカワ|CHIIKAWA)(?:ガ|ハ|ヲ)?(?:気ニナル|キニナル|好き|スキ|見タイ|観タイ|ミタイ|タノシミ|楽シミ)$/,lines:['チイカワ ノ エイガ、タノシミ！ アタシ、オナジ ハナシ デモ ナンドモ ミタクナルノ。','エイガ ノ コト ヲ カンガエルト、ニヤニヤ シチャウ。ポップコーン、オオキイノ ガ イイナ。']}
];
export function curatedReply(raw,state) {
 const input=String(raw).normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).toUpperCase().replace(/[\s。！？!?、,]/g,'');
 const pool=pools.find(p=>p.match.test(input));if(!pool)return null;
 const previous=state.history?.filter(h=>h.role==='enny').at(-1)?.text;
 const choices=pool.lines.filter(line=>line!==previous);
 return {text:choices[(state.turn||0)%choices.length],topic:pool.topic};
}
