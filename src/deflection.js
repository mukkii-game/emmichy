// User-requested fixed embarrassment and topic change, without explicit elaboration.
export function topicDeflection(raw,state={}){
 const t=String(raw).normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'').replace(/セックス[・]?ピストルズ|ピエロ|エッチング/g,'');
 if(!/エロ|エッチ|セックス|オッパイ|性交|性的/.test(t))return null;
 const lines=['え、えっと…。アタシ、ちょっと照れちゃう。別の話にしよ。','わ、急にその言葉！ アタシ、お茶をひと口…。ね、別の話にしない？','あっ、えっと…。日本語のノート、いったん閉じるね。好きなゲームの話にしよ？'];
 return {topic:'deflection',gesture:'ワ、ワオ!?',text:lines[(Number(state.turn)||0)%lines.length]};
}
