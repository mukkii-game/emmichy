// Original two-beat material: premise -> acknowledgement continuation.
// IDs persist through restart in the bounded repertoire memory.
const sets={
 music:[
 ['音楽の話、いいね。アタシ、曲の言葉が全部わからなくても鼻歌は先に覚える。','歌う時だけ、日本語がすらすら出た気になるの。'],
 ['音楽、アタシは同じ曲を何度も聴いちゃう。','覚えたつもりで歌うと、真ん中だけまだ曖昧なの。'],
 ['音楽の話にしよう。アタシ、好きな曲だと歩く速さが変わる。','急いでないのに、足だけ張り切るの。'],
 ['音楽、アタシは小さい音で聴くつもりが、好きなところで上げちゃう。','そこが終わると戻すの。ちょっと忙しい聴き方ね。'],
 ['音楽の話、好き。アタシ、曲が終わった後の静かなところも聴いちゃう。','まだ耳の中で続きをやってる感じ。'],
 ['音楽、アタシは口ずさんでから曲の名前を調べることがある。','先に仲良くなって、名前を聞くのが遅れるの。'],
 ['音楽の話にしよう。アタシ、イヤホンを付けると表情が忙しくなる。','周りの人には音が聞こえないの、時々忘れる。'],
 ['音楽、アタシは前奏だけで顔が変わる曲がある。','歌が始まる前に、もう好きになってるの。'],
 ['音楽の話、いいね。アタシ、覚えた曲を小さい声で確認しちゃう。','小さいつもりでも、好きなところだけ大きくなる。'],
 ['音楽、アタシは一曲だけ聴くつもりで、次も聴いちゃう。','一曲だけ、を何回も言ってるの。']
 ],
 computer:[
 ['新しいパソコン、アタシなら最初に壁紙を選んじゃう。','大事な設定より、まず毎日見る顔を決めたいの。'],
 ['パソコン買ったのね。箱を開けるところ、アタシも見たかった。','あの保護シート、はがす時だけすごく慎重になる。'],
 ['新しいパソコン。アタシ、起動の音だけで少し得意になりそう。','まだ何もしてないのに、できることが増えた気がするの。'],
 ['パソコンの箱、すぐ捨てられないよね。アタシならしばらく飾る。','本体より箱が大きいの、ちょっとした引っ越しだ。'],
 ['新しいパソコンの一日目、アタシならフォルダの名前を全部ちゃんと付ける。','二日目には「新しいフォルダ」が増えてると思う。'],
 ['パソコン買ったのね。アタシなら日本語の変換をまず試したい。','漫画で覚えた言葉、ちゃんと漢字が出るか確かめるの。'],
 ['新しいパソコン、画面が真っ白な時間もちょっと好き。','ここから好きなものを入れていくところ、楽しそう。'],
 ['パソコン買ったのね。アタシ、最初のパスワードで悩みそう。','ここで言っちゃだめなやつね。口に出す前に止まった。'],
 ['新しいパソコン。アタシなら机の上まで片付けたくなる。','パソコンだけ新しいと、横の紙の山が目立ちそうで。'],
 ['パソコン買ったのね。アタシ、最初の再起動を見守っちゃう。','動くってわかってても、戻ってくるとちょっと安心する。']
 ],
 meal:[
 ['{food}食べたのね。アタシ、聞いただけでお腹すいてきた。','話だけでお腹がすくの、食べた人より損してる。'],
 ['{food}。アタシ、今ちょっとメニューを見る目になった。','文字だけなのに、食べ物の名前は読むのが速い。'],
 ['{food}食べたのね。アタシも同じのを選びたくなる。','自分で決めた顔して、かなり影響されてる。'],
 ['{food}って聞いたら、おやつまで待つつもりが揺らいだ。','まだ食べてないのに、予定だけ変わるの早い。'],
 ['{food}。アタシ、日本語の食べ物の名前はすぐ覚える。','文法より先にメニューが読めるようになりそう。'],
 ['{food}食べたのね。アタシ、食べ物の話は声が明るくなる。','今の、たぶん隠せてない。'],
 ['{food}。アタシの頭の中、もう食卓になった。','お皿だけは用意できた。食べ物はまだない。'],
 ['{food}食べたのね。アタシ、次のご飯を考え始めちゃった。','まだ時間じゃないのに、気持ちだけ席についてる。'],
 ['{food}。聞くより、一口もらえる会話だったらいいのに。','今の日本語、食いしん坊って言うのかな。'],
 ['{food}食べたのね。アタシ、食べ物の話なら小さい声でも聞き逃さない。','聞く練習、ここだけ成績よさそう。']
 ],
 book:[
 ['本を買ったのね。アタシ、帰るまで待てずに表紙を何度も見る。','まだ読んでないのに、もう少し仲良くなった気がする。'],
 ['新しい本。アタシなら最初に厚さを確かめちゃう。','長く一緒にいられるか、手で測ってる。'],
 ['本を買ったのね。アタシ、しおりを選ぶところから張り切る。','読み始める準備だけ、ずいぶん早い。'],
 ['新しい本、置き場所を空ける時も楽しい。','アタシなら、そこだけきれいな棚になる。'],
 ['本を買ったのね。アタシ、最初のページだけそっと開く。','いきなり最後を見ないように、指をちゃんと止める。'],
 ['新しい本。アタシ、袋から出した時の音が好き。','読む前に好きなところが一つあるの、いいね。'],
 ['本を買ったのね。アタシなら、今日の予定に読む時間を足しちゃう。','他の予定を少し押すだけ。少しだけ、のつもり。'],
 ['新しい本。アタシ、わからない漢字用のメモも用意したくなる。','楽しみで買ったのに、勉強の道具が増えるのね。'],
 ['本を買ったのね。アタシ、持って帰る時だけバッグを丁寧に置く。','本の角って、急に気になる。'],
 ['新しい本。アタシなら、読み始める前にお茶を入れる。','お茶を用意してる間、ちょっとそわそわする。']
 ]
};
export const everydayReplies=Object.freeze(Object.entries(sets).flatMap(([topic,arcs])=>arcs.flatMap((lines,arc)=>lines.map((text,beat)=>Object.freeze({id:`everyday:${topic}:${arc}:${beat}`,topic,arc,beat,text,family:`everyday:${topic}:${arc}`})))));
const short=/^(?:うん|そう|まあ|まあね|へえ)[。！!…]*$/;
const blocked=/[?？]|なぜ|どうして|教えて|説明|意味|という|っていう|何|どこ|いつ|誰|どんな|おすすめ|違う|じゃない|ではない|やめ|買わ|食べてない|読んでない|失敗|ミス|疲れ|つら|困|病気|相談|怖|借金|壊れ|盗ま/;
function matchTopic(raw){
 if(blocked.test(raw))return null;
 if(/音楽(?:の話)?(?:は|が|を)?好き|音楽の話/.test(raw))return {topic:'music'};
 if(/パソコン(?:を)?(?:買った|買いました|購入した)/.test(raw))return {topic:'computer'};
 if(/本(?:を)?(?:買った|買いました|購入した)/.test(raw))return {topic:'book'};
 const food=raw.match(/([\p{Script=Katakana}ー]{2,12})(?:を)?(?:食べた|食べました)/u)?.[1];
 if(food&&!/半額/.test(raw))return {topic:'meal',food};
 return null;
}
export function everydayReply(raw,state={}){
 const input=String(raw).normalize('NFKC').trim(),history=state.history||[];
 const ids=new Set(state.repertoire?.ids||[]);
 const last=history.filter(h=>h.role==='enny').at(-1)?.text;
 const previous=history.filter(h=>h.role==='user'&&!short.test(h.text.trim())).at(-1)?.text||'';
 const target=matchTopic(short.test(input)?previous:input);if(!target)return null;
 const render=r=>r.text.replaceAll('{food}',target.food||'');
 if(short.test(input)){
  // Continue only a premise that was actually said, not a guessed prior beat.
  const premise=everydayReplies.find(r=>r.topic===target.topic&&r.beat===0&&render(r)===last);
  if(!premise)return null;
  const next=everydayReplies.find(r=>r.topic===target.topic&&r.arc===premise.arc&&r.beat===1&&!ids.has(r.id));
  return next?{...next,text:render(next),topic:'everyday'}:null;
 }
 // Exhausting novelty must not hand an explicit topic to unrelated fandom.
 const candidate=everydayReplies.find(r=>r.topic===target.topic&&r.beat===0&&!ids.has(r.id)&&!history.some(h=>h.role==='enny'&&h.text===render(r)))
  ||everydayReplies.find(r=>r.topic===target.topic&&r.beat===0&&!history.slice(-8).some(h=>h.role==='enny'&&h.text===render(r)))
  ||everydayReplies.find(r=>r.topic===target.topic&&r.beat===0);
 return candidate?{...candidate,text:render(candidate),topic:'everyday'}:null;
}


export function everydayEnding(state={}){
 const history=state.history||[],ids=new Set(state.repertoire?.ids||[]);
 for(const entry of [...history].reverse()){
  if(entry.role!=='user')continue;
  const target=matchTopic(entry.text);if(!target)continue;
  const spoken=everydayReplies.some(r=>r.topic===target.topic&&ids.has(r.id)&&history.some(h=>h.role==='enny'&&h.text===r.text.replaceAll('{food}',target.food||'')));
  if(!spoken)continue;
  return {computer:'新しいパソコンの話、また聞かせて。',book:'買った本、読む時間もちゃんと取れますように。',music:'次に曲を聴いたら、今の音楽の話を思い出しそう。',meal:`次に${target.food}を見たら、アタシ、今の話を思い出しそう。`}[target.topic];
 }
 return '';
}
