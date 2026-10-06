// Everyday curiosity for players who do not know manga. Player explanations
// remain attributed to the player; these responses do not certify their truth.
const topics=[
 {id:'food',match:/いただきます|イタダキマス|ごちそうさま|ゴチソウサマ|食事/,ask:['いただきますって、食べる前の言葉なのね。誰への気持ちが入ってるの？','ごちそうさま、料理した人にも言うんだよね。お店ではどんな時に言う？'],joy:['食べる前の一言にそんな気持ちが入るのね！ 次に言う時、アタシも思い出すよ。','ご飯の時間の言葉まで教えてもらえて嬉しい！ おいしいだけじゃないね。']},
 {id:'gift',match:/おみやげ|お土産|オミヤゲ|手土産/,ask:['日本のおみやげ、箱のお菓子が多い印象なの。渡す人に合わせて選ぶコツある？','みんなに分けるおみやげと、一人への贈り物って選び方が違う？'],joy:['渡す相手まで考えて選ぶのね！ アタシ、全部自分の食べたい物にしそうだった。','選ぶ理由を聞けるの嬉しい！ 次におみやげを見る時、渡す人の顔まで考えちゃう。']},
 {id:'festival',match:/祭り|お祭|マツリ|盆踊り|ボンオドリ/,ask:['お祭り、屋台だけでもわくわくする！ 地元の人はどんな楽しみ方をするの？','盆踊り、初めて行った人も輪に入っていいの？'],joy:['地域で一緒に楽しむ感じ、素敵ね！ アタシも見てるだけじゃなく参加したくなる。','それ聞くと、お祭りの見え方が変わるね！ ただにぎやかなだけじゃないんだ。']},
 {id:'season',match:/お盆|オボン|正月|ショウガツ|初詣|ハツモウデ|七夕|タナバタ/,ask:['日本の季節の行事、暮らしの中でどう迎えるか知りたい。あなたの家では何をする？','初詣、お願いだけじゃなく新しい年を迎える感じもあるのかな？'],joy:['家によって過ごし方も違うのね！ あなたの家の話で聞けるの、嬉しい。','その日に何を思うかまで聞くと、カレンダーの言葉が暮らしになるね！']},
 {id:'school',match:/学校|ガッコウ|給食|キュウショク|掃除当番|ソウジトウバン/,ask:['学校の掃除を生徒がする話、聞いたことある。どんなふうに分担するの？','給食、食べ物の好き嫌いがある時はどうしてた？'],joy:['実際に通った人の話、そこが知りたかった！ 教科書に載らない暮らしの感じね。','その工夫、面白い！ 自分の学校と比べてみたくなるよ。']},
 {id:'words',match:/方言|ホウゲン|敬語|ケイゴ|日本語|ニホンゴ|送り仮名/,ask:['同じ意味でも、方言だと親しさが変わるのかな？ あなたがよく使う言葉ある？','敬語、正しい形より使う相手で迷うの。親しい人にも使う時ってある？'],joy:['なるほど、言葉だけじゃなく使う場面も大事なのね！ それ知りたかった！','アタシ、その言い方を覚える！ 漫画の勢いだけで使う前に、一回考えるね。']},
 {id:'games',match:/同人|ドウジン|コミケ|FM音源|レトロゲーム|中古ゲーム/,ask:['日本の小さいゲーム、作者の変なこだわりを見つけるの好き。あなたのおすすめある？','FM音源の音は好き。曲を作る人はどこを工夫するの？'],joy:['そこまで工夫してるのね！ 今度遊ぶ時、前より細かく見ちゃいそう。','その仕組みを聞くの嬉しい！ 好きな音や場面に、作る人の顔が見えてくるね。']}
];
export function cultureReply(raw,state={},intent='talk'){
 const text=String(raw).normalize('NFKC'),turn=Number(state.turn)||0;
 if(/つらい|苦しい|いじめ|死に|病気|暴力|嫌い|やめて/.test(text))return null;
 const topic=topics.find(t=>t.match.test(text));
 const prior=state.history?.filter(h=>h.role==='enny').slice(-6).map(h=>h.text)||[];
 if(intent==='teaching'){
  // React to the explanation itself, not an unrelated canned cultural fact.
  const content=text.replace(/^(?:実は|じつは|ちなみに)[、,\s]*/,'').replace(/[。！!]+$/,'').slice(0,65);
  const options=[`なるほど、「${content}」って教えてくれたのね！ そういう話、アタシ好き。`,
   `「${content}」って聞くと、見え方が変わるね！ その理由も知りたくなっちゃう。`,
   `教えてくれて嬉しい！ 「${content}」っていうところ、アタシ覚えておきたい。`];
  const available=options.filter(v=>!prior.includes(v));return available.length?{text:available[turn%available.length],kind:'teaching'}:null;
 }
 if(/日本.*(?:文化|暮らし).*知りたい|何か.*(?:聞きたい|知りたい)|ニホン.*ブンカ.*シリタイ/.test(text)){
  const choices=topics.flatMap(t=>t.ask).filter(v=>!prior.includes(v));
  return choices.length?{text:choices[turn%choices.length],kind:'curiosity'}:null;
 }
 if(topic&&/教えてあげ|教えよう|知ってる|シッテル/.test(text)&&!/[?？]/.test(text)){
  const choices=topic.ask.filter(v=>!prior.includes(v));return choices.length?{text:choices[turn%choices.length],kind:'curiosity'}:null;
 }
 return null;
}
