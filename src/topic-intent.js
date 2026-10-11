const fold=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
// A refusal of other manga followed by an explicit Chiikawa request is an
// invitation to this topic. Keep the scope of the negative clause local.
export function requestsChiikawa(input){
 const clauses=fold(input).split(/[。、,!！?？]/);
 const last=clauses.findLast(c=>/チイカワ/.test(c));if(!last)return false;
 if(/チイカワ.{0,18}(?:イガイ|以外|ヤメ|嫌イ|キライ|ジャナク|バカリ)/.test(last))return false;
 return /チイカワ.{0,38}(?:話シ|ハナシ|話ヲ|話ガ|話ニ|ノ話|続ケ|ツヅケ|本人|ドンナ|小サナ幸セ)/.test(last);
}
