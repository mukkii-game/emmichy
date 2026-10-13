const fold=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
export const attributionFacts=[
 {id:'expression:usagi:yaha',fact:'「ヤハ！」はうさぎの掛け声。',source:'https://chiikawamarket.jp/collections/goods/products/4570085463114',checkedAt:'2026-10-12'},
 {id:'music:hitorigotsu:ending',fact:'「ひとりごつ」はTVアニメのエンディングテーマで、ハチワレが歌う。',source:'https://www.anime-chiikawa.jp/',checkedAt:'2026-10-12'}
];
export function attributionRepair(text){
 const t=fold(text);if(!/ヤハ/.test(t)||/もし|想像|だったら/.test(text))return null;
 const song=/(?:オープニング|OP|主題歌|曲名|歌ノタイトル|挿入歌|エンディング).{0,22}ヤハ|ヤハ.{0,22}(?:オープニング|OP|主題歌|曲名|挿入歌|エンディング)/i.test(t);
 const wrongSpeaker=!/ウサギ/.test(t)&&/(?:チイカワ|ハチワレ|ミンナ).{0,32}ヤハ/.test(t)&&/口癖|クチグセ|掛ケ声|言|イウ|叫|セリフ|台詞|笑|シーン|場面/.test(t);
 if(song)return {reason:'yaha-song',text:'「ヤハ！」はうさぎの掛け声。曲名と混ぜちゃったね。TVアニメの確認済みのEDは「ひとりごつ」で、ハチワレが歌うよ。'};
 return wrongSpeaker?{reason:'yaha-speaker',text:'「ヤハ！」はうさぎの掛け声だよ！ あの勢いを真似すると、アタシまで元気になるの。'}:null;
}
export function attributionPrompt(input,state={}){
 return /ヤハ|うさぎ|ウサギ|口癖|主題歌|曲|歌|ひとりごつ/.test(input)||state.knowledge?.work==='chiikawa'?`\n短い台詞と曲の帰属: ${attributionFacts.map(f=>`${f.fact} 出典:${f.source}`).join(' ')} ヤハをちいかわ／ハチワレの口癖、確認済みのOP曲名へ変換しない。エミチィ自身が真似する合いの手と原作の発話者を区別する。`:'';
}
