const fold=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
export const familiarJapanese=[
 ['ありがとう','お礼の言葉'],['こんにちは','昼のあいさつ'],['おはよう','朝のあいさつ'],['こんばんは','夜のあいさつ'],
 ['おやすみ','寝る前のあいさつ'],['さようなら','別れのあいさつ'],['すみません','謝ったり呼びかけたりする言葉'],['ごめん','謝る言葉'],
 ['いただきます','食べ始める時の言葉'],['ごちそうさま','食べ終わった時のお礼'],['はい','肯定や返事'],['いいえ','否定の返事'],
 ['わからない','理解できていないこと'],['大丈夫','問題ないことや安心させる言葉'],['おいしい','食べ物をほめる言葉'],['かわいい','見た目や様子をほめる言葉'],
 ['友達','仲良くする相手'],['学校','勉強する場所'],['お菓子','甘い物などのおやつ'],['ご飯','食事や炊いたお米'],
 ['ひらがな','日本語を書く文字'],['カタカナ','外来語などにも使う文字'],['漢字','形や読みを少しずつ覚える文字'],['敬語','丁寧に話す表現'],
 ['長音','音を長く伸ばすこと'],['促音','小さい「っ」で少し止まる音'],['日本語','アタシがいま勉強している言葉']
].map(([word,meaning])=>({word,meaning,key:fold(word)}));
export function learnerReply(raw,{force=false}={}){
 const t=fold(raw),jp=/日本語|ニホンゴ/.test(t);
 const others=/(?:私|僕|俺|ワタシ|ボク|オレ|友達|彼).{0,4}(?:ハ|ガ|モ|ノ)/.test(t);
 if(jp&&(!/チイカワ|ハチワレ|ウサギ|シーサー/.test(t)||/勉強|ベンキョウ|覚|学/.test(t)))return {topic:'profile',id:'profile:languages',text:others?'アタシも日本語を勉強中！ 漫画とアニメ、それからこういう会話で覚えてるの。':'うん、日本語を勉強してるよ！ 漫画とアニメ、それからこういう会話で覚えてるの。長い音と小さい「っ」は、まだ難しいの。'};
 const entry=familiarJapanese.find(e=>t.includes(e.key)&&e.key.length>=3);
 if(!entry||/チイカワ|ハチワレ|ウサギ|シーサー|ジョジョ|ハンター/.test(t))return null;
 if(!force&&!/[?？]|意味|イミ|ワカル|知ッテル|何|ナニ|漢字|敬語|ヒラガナ|カタカナ|長音|促音/.test(t))return null;
 return {topic:'japanese-word',id:`japanese:${entry.word}`,text:`「${entry.word}」は${entry.meaning}だよ。これ、アタシも覚えた！ 会話で使えると、ちょっと嬉しいの。`};
}
export function learnerPrompt(input){
 const reply=learnerReply(input,{force:true});return reply?`\n日本語学習者として常備する内容（本人設定・基本語）: ${reply.text} 自分の日本語学習を「知らない」で切らず、質問された言葉に応じる。`:'';
}
