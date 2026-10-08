// Authored conversational material for a slow answer, not factual answers or retries.
export const waitingDatabase=[
 {topic:'serious',match:/つらい|苦しい|相談|病気|入院|死に|いじめ|怖い|こわい/,lines:[
  'うん。アタシ、こういう話をすぐ軽い冗談にしたくないの。言ってくれたこと、ちゃんと受け取りたい。',
  'すぐに気の利いたことは言えないけど、聞かなかったことにはしないよ。今は、さっきの言葉のところにいる。'
 ]},
 {topic:'music',match:/音楽|ピアノ|曲|歌|ギター|楽器/,lines:[
  'アタシ、歌詞が全部わからなくても、気に入った曲は鼻歌で先に覚えちゃう。あとで言葉がわかると、二回好きになれるの。',
  '好きな曲を小さく口ずさんで歩くと、いつもの道でもちょっと違うの。でも人とすれ違う時だけ、急に静かになる。'
 ]},
 {topic:'food',match:/ご飯|ごはん|牛丼|食べ|料理|お菓子|おやつ|プリン|そば|ラーメン/,lines:[
  '食べ物の名前って、覚えたらすぐ役に立つ日本語だね。アタシ、メニューで読める言葉を見つけると、ちょっと得意な顔になる。',
  'アタシ、ひと口目がおいしいと、あとを少しずつ食べたくなるの。長く楽しめると思うのに、結局すぐなくなっちゃう。'
 ]},
 {topic:'walk',match:/散歩|歩い|歩く|道|雨|天気/,lines:[
  '散歩してると、看板の日本語まで読んじゃう。遠くから読めた気がして、近づいたら全然違う言葉だったりするの。',
  'アタシ、帰り道で小さいお店を見つけるのが好き。行きは気づかなかったのに、反対から歩くと見えることがあるね。'
 ]},
 {topic:'drawing',match:/絵|描|イラスト|漫画/,lines:[
  'アタシ、絵を見る時は少し離してから、また近くで見るの。細い線を見つけると、描いた人の手が動いたところまで想像しちゃう。',
  'ノートのすみに描いた絵って、あとから見るとその日の気分まで思い出すね。きれいに描けてなくても、消すのは惜しいの。'
 ]},
 {topic:'japanese',match:/日本語|言葉|ことば|漢字|英語|意味|翻訳/,lines:[
  'アタシ、覚えた言葉を小さいノートに書いてるの。きれいに書けた字より、何回も間違えた字のほうが、あとでよく覚えてる。',
  '日本語を声に出して覚えると、文字だけで見た時とはちょっと違うね。アタシ、口が先に覚えて、字はあとから追いかけることがある。'
 ]},
 {topic:'ordinary',match:null,lines:[
  'アタシ、新しく知ったことをノートに書くのが好き。でも読み返すと、真面目なメモの隣に変な落書きがある。そっちまで覚えちゃう。',
  '聞いた話をあとで思い出すと、何でもない小さいところが残ってることがあるの。アタシ、自分でもそこを覚えてたんだ、ってなる。'
 ]}
];

export function waitingReply(input,recent=[]){
 const raw=String(input).normalize('NFKC');
 // Negative or corrective statements should not trigger an upbeat topic anecdote.
 const negative=/嫌い|苦手|やめ|じゃない|ではない|失敗|事故/.test(raw);
 const item=waitingDatabase.find(x=>x.topic==='serious'&&x.match.test(raw))||
  (!negative&&waitingDatabase.find(x=>x.match?.test(raw)))||waitingDatabase.at(-1);
 return item.lines.find(line=>!recent.includes(line))||item.lines.find(line=>line!==recent.at(-1))||item.lines[0];
}
