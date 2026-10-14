// Independently checked scene summaries. Reported sources remain reported;
// no manga transcript, dialogue quote, score or failure cause is inferred.
const examSource='https://times.abema.tv/articles/-/10171076';
export const sceneFacts=[
 {id:'exam:attempt',subject:'ちいかわとハチワレ',object:'草むしり検定5級',cues:['検定','受験','5級','5キュウ','試験'],fact:'アニメのこの回では、ちいかわの草むしり検定5級への挑戦を知ったハチワレも受験する。',spoken:'ちいかわが草むしり検定5級に挑戦して、ハチワレも受験するの。',source:examSource,evidence:'reported',scope:'anime:57-63',spoiler:'intro',limits:['漫画の同一演出を確認済みとしない','試験内容や難易度の数値を足さない']},
 {id:'exam:result',subject:'ちいかわとハチワレ',object:'異なる結果',cues:['結果','合否','落ち','オチ','不合格','受か','ウカ','合格','発表'],fact:'最初の草むしり検定5級の結果はハチワレが合格し、ちいかわが不合格になる。',spoken:'最初の5級の結果は、ハチワレが合格して、ちいかわは不合格だったの。',source:examSource,evidence:'reported',scope:'anime:61-62',spoiler:'intro',limits:['得点、正答、合格基準、不合格の原因を作らない','本人の再受験とこの回を混ぜない']},
 {id:'exam:celebrate',subject:'ちいかわ',object:'ハチワレの合格祝い',cues:['祝い','祝う','オイワイ','おめでとう','翌朝','次の日'],fact:'アニメ第63話「お祝い」では、ちいかわが草むしり検定5級に合格したハチワレをお祝いする。',spoken:'第63話で、ちいかわがハチワレの5級合格をお祝いするの。',source:'https://game.watch.impress.co.jp/docs/news/1498859.html',evidence:'reported',scope:'anime:63',spoiler:'intro',limits:['ちいかわが合格した祝いと逆転しない','落ち込む気持ちが全て消えたと断定しない']},
 {id:'exam:cookie',subject:'ちいかわ',object:'ハチワレに似た形のクッキー',cues:['クッキー','贈り物','プレゼント','形','包装','手渡'],fact:'第63話では、ちいかわがハチワレに似た形のラッピングされたクッキーを合格祝いに渡すとABEMA TIMESが紹介する。',spoken:'お祝いに渡すのは、ハチワレに似た形の、ラッピングされたクッキーだよ。',source:examSource,evidence:'reported',scope:'anime:63',spoiler:'intro',limits:['手作り、買った店、味、材料を推測しない','包装と後の別の話を混ぜない']},
 {id:'exam:episodes',subject:'ちいかわとハチワレ',object:'アニメ57〜63話',cues:['話数','何話','ナンワ','いつの回','アニメ'],fact:'フジテレビの制作担当者インタビューは、アニメ第57〜63話をちいかわとハチワレが草むしり検定を受ける話と説明する。',spoken:'アニメの草むしり検定のまとまりは、第57話から第63話だよ。',source:'https://www.fujitv.co.jp/company/fujitvwork/vol25.html',evidence:'official',scope:'anime:57-63',spoiler:'none',limits:['制作者自身の学習塾の経験を作中人物の経験にしない','同じ回が現在最新放送だとしない']}
].map(r=>Object.freeze({...r,checkedAt:'2026-10-14',scene:'examination',feeling:{
 'exam:attempt':'一緒に挑戦するって心強いけど、結果を聞く時はアタシも緊張しちゃう。',
 'exam:result':'アタシなら、友達のお祝いもしたいけど、自分の悔しさも消えないと思う。どっちの気持ちも大事にしたい。',
 'exam:celebrate':'アタシなら、悔しさとお祝いしたい気持ち、両方ありそう。そこを考えると胸がぎゅっとなる。',
 'exam:cookie':'アタシなら、そんなお祝いもらったら、食べる前にずっと眺めちゃう。',
 'exam:episodes':'受験前と結果が出た後、二人をどう見るか変わるのが、アタシは気になる。'
}[r.id]}));
