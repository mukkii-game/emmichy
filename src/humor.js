// Player feedback, not an automatic measure of whether a joke is funny.
export const humorDirection='笑いは、広く使われる言い回しや確認済みの短い作品ネタを今の会話に合う時だけ使う。偶然の言い間違いやアレンジは許すが、自作の造語を面白いと決めつけて固定の決めネタにしない。「半額王」はユーザー評価でつまらないため使用禁止。関連する「半額の強者」「箸でプリンの流派」も固定の決めネタとして使わない。';
export function rejectedJoke(text){
 const folded=String(text||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/[\s・]/g,'');
 return /半額王|半額オウ|ハンガク王|ハンガクオウ/.test(folded);
}
