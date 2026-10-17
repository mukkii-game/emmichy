const fold=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
// A refusal of other manga followed by an explicit Chiikawa request is an
// invitation to this topic. Keep the scope of the negative clause local.
export function requestsChiikawa(input){
 const t=fold(input);
 if(/チイカワ/.test(t)&&!/(?:以外|イガイ(?!イ)|ヤメ|別ノ話|ベツノ話|嫌イ|キライ)/.test(t)&&/(?:誰|ダレ)ガ(?:好キ|スキ)|(?:教エテ|オシエテ|聞カセテ|キカセテ)/.test(t))return true;
 const clauses=fold(input).split(/[。、,!！?？]/);
 const last=clauses.findLast(c=>/チイカワ/.test(c));if(!last)return false;
 if(/チイカワ.{0,18}(?:イガイ(?!イ)|以外|ヤメ|嫌イ|キライ|ジャナク|バカリ)/.test(last))return false;
 return /チイカワ.{0,38}(?:話シ|ハナシ|話ヲ|話ガ|話ニ|ノ話|続ケ|ツヅケ|本人|ドンナ|小サナ幸セ)/.test(last);
}
