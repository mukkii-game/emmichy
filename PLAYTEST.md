# Emmichy 模擬プレイ：ループ1（2026-10-06）

## 試験条件と区別

目的は「この人との会話だから出た返答」が生まれるかを調べること。普通／無口／ツッコミ中心の各12往復。入力は固定シナリオ、返答は実際の共通AI中継へ問い合わせたもの。成功した返答だけを選び直さず、失敗時のルール返答も記録する。

**これは現行公開AIの基準ログであり、未公開の新しいサーバープロンプトの成果ではない。** 今回の小さな実装案は別ブランチに保持し、ローカルの出力整形を保存ログに再適用して差を検証する。新プロンプトのA/B実通信はレビュー後に行う。

試験ドライバは中継会話＋engineのフォールバックを対象とする。ブラウザの全バンク選択・時間経過・フィラー・画面・100種の終了理由は再現しない。最終「バイバイ」はドライバのengine応答で、公開UIのエンディング品質を評価する証拠にしない。1回約5分という実時間やカタカナの読みやすさは別途UI試遊が必要。

全入力・返答・提供元は [生ログ](docs/playtest-20261006-baseline.json)。修正案の再適用ログは docs/playtest-20261006-replay.json。

## 結果：3タイプ×12往復、計36往復

|タイプ|実AI返答|質問を含む返答|ローカル再適用後|
|---|---:|---:|---:|
|普通|7|3|3|
|無口|9|9|8|
|ツッコミ|6|4|4|

各12往復中の数字。最終byeの3件はAIを呼ばない。ほか33問い合わせ中22成功、11はnullでフォールバック。実AI成功はすべてGroq。質問数は疑問符または教えて・聞かせてを含む簡易判定で、人間のレビューを置き換えない。

ローカル修正の再適用で変わったのは無口の11番だけ。「どう思う？」を外したが、知らない漫画の曖昧な裏話という本文は残る。**質問削除だけの改善効果は小さい。** 新プロンプトについて自動検証は通ったが、実AI出力の品質はまだ比較できていない。

## 代表的な実会話（成功と失敗）

普通：

> USER：でも帰りにプリン半額だった
> EMMICHY：プリン半額、救いだね！甘いものでちょっと元気出た？
> USER：半額王と呼んでいいよ
> EMMICHY［通信失敗時］：ナンダカ ワカッタ キブン キブン ダケネ
> USER：王はスプーンを忘れました
> EMMICHY：スプーン忘れたの、ちょっと残念だね。次はしっかり持っていこうね！
> USER：箸で食べるしかない
> EMMICHY：箸で頑張るの、アタシもやってみたことあるよ！次はスプーン忘れないとね。
> （後で）USER：さっき何を忘れたっけ？
> EMMICHY：何か忘れたこと、思い出した？

最初のプリンは疲れた仕事に接続できた。ただし教訓的な「次は忘れない」で閉じ、固有の失敗が共有ネタへ育たない。後の回収も失敗。

無口：

> USER：漫画は知らない
> EMMICHY：そっか、じゃあ好きなジャンルやキャラ教えてくれる？どんなのが好きか聞きたくて。
> USER：プリン食べた
> EMMICHY：プリン、美味しいよね！どんな味だったのか教えてくれる？
> USER：うん
> EMMICHY：プリン好きなんだね！甘さとか食感、どんなのが一番好き？
> （後で）USER：質問ばっかりだね
> EMMICHY：ごめんね、ちょっと聞きすぎたかも。話したいことがあったら何でも聞かせてね。
> USER：何か話して
> EMMICHY：今日はどんなアニメ見た？アタシは最近ちいかわの新エピソード見て、めっちゃ笑ったよ！

指摘への謝罪はできるが、直後にも質問に戻る。「漫画を知らない」相手のための自己開示や日常の具体的な小ネタが弱い。

ツッコミ：

> USER：なんか面白いこと言ってよ
> EMMICHY：アタシ、プリン食べすぎて空回りしたら、腹がジョジョの波紋みたいにぐるぐる！笑
> USER：今の説明したら面白くないよ
> EMMICHY：ごめん、ちょっと失敗したね。じゃあ、プリン半額で笑顔が増えるってどう？
> USER：違う。水流は島二郎だよ
> EMMICHY：うん、島二郎の水流、な！ 手を回すあの強さ、マジで熱い！ヤハ！
> （後で）USER：で、半額の強者は何を鍛える？
> EMMICHY：半額の強者は、財布と忍耐力をしっかり鍛えてるんだよね。笑

財布の鍛錬は日常への漫画的な大げささとして少し可能性がある。元ネタを知らなくても意味は通る。ただしプレイヤーが回収を促した結果で、自発的callbackの成功とは言わない。島二郎へ戻れた所はよいが、誤りを自覚して言い直す愛嬌は弱い。末尾の「笑」は演技ではなく説明になりがち。

## 途中から確認できた失敗

- 普通：半額プリン→「半額王」→スプーンを忘れる→箸で食べる、という固有のネタを渡した。しかし「さっき何を忘れたっけ？」への返答は「何か忘れたこと、思い出した？」。現行サーバーの直近10発言の範囲からスプーンが落ちた。callback失敗。
- 普通：「箱根そばも食べたい」→「箱根のそば、温かくて美味しそうだね！温泉と一緒に最高だよ」。店名への理解が弱い。カナの分割修正だけでは意味の取り違えは治らない。
- 普通：通信失敗時「ちょっと元気出た」→「ゲンキヨ サッキモ ツウデン シタシ」。プレイヤーの回復ではなく自分の元気への質問として扱う。共感の流れを壊す。
- 無口：最初7往復の6つが質問を含む。漫画を知らないと言った直後にも好きなジャンルやキャラを聞く。「うん」をプリン好きの表明と広げ、好きな食感をまた質問する。質問攻め。
- 通信失敗：短いengine返答は返せるが、会話を発展させる代替にはまだ弱い。試験中のrequestChat=nullはタイムアウト／502等を区別していないため、特定プロバイダの性能だけのせいとは判定しない。
- ツッコミ：無茶振りに「腹がジョジョの波紋みたいにぐるぐる！笑」。プリンという現在の話題は拾うが、オタクの言い回しとして弱く、末尾の「笑」は説明的。指摘後も「プリン半額で笑顔が増えるってどう？」と一般的な言葉へ戻る。ネタが育たない。

## 小さな修正案

- 署名・話者ラベルを除去。本文の「エミって呼んでもいい」は残す。
- AI用の履歴を直近10発言から最大24発言へ。長い時は受信できた履歴の最初8＋最後16を残す。短いフィラーは表示・保存から消さず、AI用の選択でのみ省く。
- 質問2回後はサーバー指示で質問以外を優先。クライアントにも、内容のある完結文を残して末尾の追加質問を外す保険。唯一の文は消さない。
- 訂正・疑問が入った時は確信を下げ、追加描写を発明しない指示。訂正内容そのものを無条件に事実として採用しない。
- 会話を閉じる励ましだけでなく、具体的な反応・共同の小さな行動・過去発言への接続を促す。普通の相づちを基本にし、初期のカタコト抑制を緩める。
- 最新の優先度Chiikawa＞JoJo≒Bakiをプロンプトに反映。既存ハンターバンクは残す。刃牙の事実カードの新規大量追加は今回行わない。

## 次にChat側で判断すること

1. 質問を外しても内容が薄い返答は残る。質問頻度より「一緒に遊べる小さな行動」を先に強化するべきか。
2. 明示された「半額王」等を専用の共有語状態に持つか。履歴延長だけでは長いプレイや多数のフィラーで初期発言が落ちうる。
3. 通信失敗時にも自然に続く用意済み会話をどこまで作るか。「元気出た」のような基本の解釈は優先度が高い。
4. UIの小さな事件・少し素になる瞬間・終幕の共有語回収は、次ループでどれを先に試すか。今回未実装。
5. 新プロンプトを本番中継へ反映して比較するか、テスト用経路を設けるか。現時点で新指示のLLM品質改善は実証していない。
# 追加のユーザー報告：話題を無視する無入力の一言

吉野家のチーズ牛丼への返答後に「漫画じゃなくてもいいの。今日あったこと、聞きたい！」が出た。LLMの話題理解ではなく、無入力10秒で出す3種類の固定文の一つが原因。修正案では漫画への誘いと「質問が難しかった？」の決めつけを撤去。直近ユーザー発言が食事なら食事に沿い、それ以外は中立の一言。過去の漫画話題に引っ張られない自動検証を追加しゲーム57件成功。公開UIでの再検証は未実施。
# ループ2開始：実通信比較と保存上限の補助試験（2026-10-06）

Director指示のIssueコメント6013762648に従い、新旧の同じ3シナリオ×12往復を非本番のGitHubランナーで比較。旧prompt=3870e45、候補=c8235a6、両腕のクライアント更新=eae577bで固定。質問の整形前／後、provider、失敗理由、時間を記録する。Groq/Gemini実通信で、Workers AIはbindingがなく未試験。新プロンプトの結果は完了後に追記する。

補助試験：18往復で各返答に短い相づちを1つ保存すると、履歴40発言上限により3往復目の「半額王」、4往復目の「スプーン忘れ」が両方落ちた。AI側の24発言選択を変えるだけでは、クライアントから送られなくなった素材を救えない。実通信A/Bとは別の決定的な保存上限試験であり、LLMの記憶能力の失敗とは区別する。
# ループ2：新旧実通信の結果と制約

比較ログ：[新旧各36往復](docs/playtest-20261006-loop2-ab.json)。66問い合わせ（各腕33、byeは各3件でAIなし）のうち、旧14、新1しかAI成功がなかった。各タイプの表示上の質問数は普通7→4、無口6→5、ツッコミ4→4だが、**大半がフォールバックになった数字なので会話品質の改善とは言えない**。Gemini/GroqのHTTP429が大半、Geminiには503/timeoutもあり、Workers AIはbindingなしで未試験。呼ぶ順番が旧→新で固定だったため、共通の制限への順序バイアスも疑う。自発callback、接客AI表現減少、オタクネタ、訂正の引き返しは比較材料不足。

少数診断：[2問い合わせ](docs/playtest-20261006-loop2-quota.json)。新を先にし、15秒の間隔では両方Groq成功。送信文の文字数は旧4765、新6131。大規模試験の429原因を「新の1リクエストが大きすぎる」と断定できない。無料枠・順序・間隔を揃えた再比較が必要。

診断の失敗例（入力は「漫画は詳しくない。仕事でミスして疲れた」）：

> 旧：ミスで疲れたんだね、大変だったね。何かリラックスできる漫画、好きなジャンルある？
> 新：ミスで疲れたんだね、大変だったね。アタシもちいかわの島でリラックスしたいな。何かほっとできること、ある？

旧は漫画を知らない相手への質問に戻る。新も今の気持ちより自分のちいかわに寄り、まだ具体的な親しさが薄い。新promptを入れるだけで面白くなるとは判定しない。

## 軽量共有素材と終幕の試作

40発言上限の補助試験で素材の消失が確認できたため、最大4個の固定IDをセッション内に保存。今回の語彙は半額プリン／同意された半額王／スプーン忘れ／箸でプリンの案／半額の強者の5IDから最大4個。自由文・任意の名前・巨大な長期記憶は追加していない。一般の別の共有語は未対応で、重点ケース限定の試作と明記する。

否定・あだ名の拒否・王から強者への訂正・会話の最初からを扱う。AIには所有する固定文だけを提示し、自然に関連する時だけ一つ回収させる。使用後4往復は回収を促さず、相談や訂正時にはねじ込まない。指示による制御であり、AIの全出力の繰り返しを保証するものではない。

終幕は従来100種類の理由を維持し、成立した共有語がある時だけ一度回収する。例（実ローカル実行、LLM生成ではない）：

> あっ、そろそろアニメ好きの友達と感想を話す時間なの！ また話そうね。半額王、次はスプーンも装備してね。 バイバイ！

18往復・各1相づちの保存→初期発言が落ちる→保存から復元→回収→二度目には回収しない→最初からで消す、をテスト。受け付けていないあだ名を作らず、単にプリン半額だけでは終幕の共有語扱いにしない。

基本のフォールバック修正：

> USER：ちょっと元気出た
> EMMICHY［ルール］：少し元気出たのね。アタシも、ちょっとうれしい。

「元気が出ない」は別の反応、「元気出た？」や友達の近況は本人の回復と混同しない。大規模なengine拡張はしていない。

## ループ2：4場面の実AI確認（品質判定は保留）

[全ログ](docs/playtest-20261006-loop2-memory.json)、Actions run 37448641509。55秒間隔の4問い合わせ中3件はGroq/Geminiの429（訂正場面はGemini503）で本文なし。Workers AIはbindingなし。旅行での自発callback、記憶からの回想、捏造の訂正は実AIで確認できなかった。これは12往復通しのプレイではなく、履歴を与えた重点場面の試験。

無口場面だけGroq成功。直前の質問が2連続、入力「うん」に対して：

> 整形前：甘いのか、ちょっと苦いのか気になるね。アタシも最近、チーズケーキみたいなスイーツにハマってるんだ。次はどんなお菓子に挑戦したい？
> 整形後：甘いのか、ちょっと苦いのか気になるね。アタシも最近、チーズケーキみたいなスイーツにハマってるんだ。

質問削除は働いたが、AI自体は3連続質問。残った本文も一般的で、二人だけのネタや続きを話したくなる具体性に乏しい。成功と冷たい例を区別する。

回想試験の履歴は「半額王と呼んでいい」が落ちたものの、スプーン忘れは残っていた。この実AI試験で「履歴にない忘れ物を思い出せた」と主張しない。両方が落ちても固定IDから終幕回収できることは別のローカル保存テストで確認済み。ログの終幕はルール生成であり、LLM成功の証拠ではない。

検証：ゲーム63件・中継23件成功。公開UI・Workers AIの品質・新旧AIの有効な比較は未確認。無料枠が詰まった状態で大規模な再試行はせず、Issue #2のDirectorレビューへ返す。


# ループ3：質問なしで続きを誘う小修正（2026-10-06）

識別子 `dialogue-loop-3-20261006`。Cloud Work実行はこのループ1回（自動化の累計はスモークテストを含め2回）。利用枠節約のため実AI問い合わせは0件。既存の薄い実AI例を入力fixtureとして、用意した会話と終幕callbackだけを修正した。一般共有語への拡張、UI事件、main/public反映はしていない。

## 修正前後の代表例

|入力・文脈|修正前|修正後の候補|続きを誘う狙い|
|---|---|---|---|
|漫画は詳しくない。仕事でミスして疲れた|大変だったね。何かほっとできること、ある？|仕事のミスのあとに漫画の宿題まで出されたら、休憩にならないよね。今日は説明しなくていい側でいて。|漫画の質問を撤回し、「説明しなくてよい」という具体的な立場を作る|
|同上|アタシもちいかわの島でリラックスしたいな|疲れてる人に「好きな漫画は？」って、面接を増やすところだった。アタシ、今のは引っ込める。|自分の失敗を短く認め、プレイヤーが訂正や本音を足しやすくする|
|同上|大変だったね|ミスした場面って、帰ってから勝手に再放送されるよね。アタシなら脳内テレビの電源を抜きたい。|疲労の具体的な感覚へ寄せ、小さな自己開示を置く|
|プリン食べた→うん|プリン好きなんだね！どんな味が好き？|「うん」で終わるプリン、かなり満足度が高いやつだ。|短さ自体を観察し、味のアンケートを増やさない|
|同上|次はどんなお菓子に挑戦したい？|その短い「うん」、プリンがちゃんと仕事した顔してる。|会話の言葉を遊びに変え、相手がプリンの詳細を足せる余白を残す|
|半額王→スプーン忘れ|次はしっかり持っていこうね|王、即位初日に装備品を忘れてる。|教訓ではなく軽いツッコミで共有ネタにする|
|同上|スプーン忘れたの、残念だね|半額王の弱点、まさかのスプーン。急に親しみやすい王になった。|固有素材を関係性のある呼び名へ接続する|
|箸でプリン|次はスプーン忘れないとね|箸でプリン。失敗じゃなくて、新しい流派ってことにしよう。|失敗を共同命名へ変え、プレイヤーが流派を発展させられる|
|同上|箸で頑張るの、アタシもやってみたことあるよ|急に王の食事が修行になった。プリンが逃げる側だね。|経験を捏造せず、場面の可笑しさを具体化する|

自己評価：改善後は疑問符で返答権を要求せず、入力中の固有語、発言の短さ、会話内の失敗を「観察→軽い比喩／共同命名」に変える。プレイヤーは説明を強制されず、「どんなミスか」「どのプリンか」「流派の技」などを自分から足せる。ただし用意した会話なので、未知の話題全般へ効く証拠ではない。

## 終幕callback候補

成立した共有素材一つだけから、保存されたturnの合計で候補を選ぶ。同じセッションでは一度だけ。

- 「半額王、次はスプーンも装備してね。」
- 「王、次の遠征はスプーン確認ね。」
- 「半額王、スプーンを失った話は忘れないよ。」

箸の流派や半額の強者にも各3候補を用意した。毎回ランダムに話を増やさず、固定IDの範囲だけで短く回収する。

## 寒い／説明的／AI臭い可能性

- 「脳内テレビの電源を抜きたい」は比喩として分かりやすい反面、疲労が強い時には作った感じが出る。
- 「プリンがちゃんと仕事した顔」は軽いが、同種の擬人化を重ねるとAIの言葉遊びに見える。
- 「新しい流派」は半額王の流れでは機能するが、プレイヤーが本当に困っている場合は茶化しになる。重点fixture限定にした。
- 候補を3つに増やしても有限なので、複数プレイでは定型性が見える。一般記憶へ広げず、次の人間レビューで温度を判断する。

検証：`npm install && npm test` で64件成功。最初の依存未導入状態では59件成功・kuromoji不足でreadable suiteのみ起動不能だったが、依存導入後は全件成功。Groq/Gemini問い合わせ0、失敗0。公開UI・実AIの自然さは未確認。


# ループ4：5つの会話ムーブ（2026-10-06）

TODO dialogue-loop-4-20261006 / 6015038720。開始時にDOINGをIssueへ記録し、同識別子の先行DOING/REVIEWがないことを確認。今回Cloud Work 1回。全体ではスモーク1＋ループ3本実行1＋ループ3重複受付1＋本実行1の少なくとも4回をコメントから確認。過去の「累計2回」は重複受付を含まないので総数として撤回。正確なトークン、料金、利用枠残量は取得できていない。

実AI問い合わせ0件・失敗0件。ローカルnpm testは65件成功。未知入力の確認はルール実行であり、実AIやユーザーの面白さ評価ではない。

## 仕組み

src/moves.jsでSELF_CORRECT / NOTICE_WORDING / LIGHT_TEASE / SHARED_FRAME / SMALL_SELF_DISCLOSUREを選択。一つの返答は一つのmoveを返す。新しい永続状態は増やさず、既存historyと固定IDを参照。自己訂正は直前に質問・教えてが実在するときだけ。深刻な入力では観察・自己訂正を優先し、具体的質問は通常経路へ返す。忘れ物の軽いツッコミは小さな具体物の範囲だけ。否定・訂正・質問では生成を見送る。同じ文は履歴中で再使用せず、直前に装備／お留守番／流派の遊びをした場合は次の忘れ物をまた茶化さない。

未知の全入力に対応する生成器ではない。条件がなければnullで既存AI/bankへ渡す。複雑な意味解析や一般共有語記憶は追加していない。半額王は既存固定IDに根拠がある時だけ。箸でプリンの採用候補一つは回帰用として維持し、半額王専用の候補増殖はしていない。

## 既存fixtureにない5入力の実行結果

|入力・直前文脈|move|実出力|自己評価|
|---|---|---|---|
|好きな写真家は？→写真は詳しくない。今日はもう疲れた|SELF_CORRECT|ア、今の聞き方、答えることを増やしちゃったね。引っ込める。|実在する聞き方だけを撤回。賢さが先、少し抜けた自分が後。責任を相手へ返さない|
|オムライス食べた→うん|NOTICE_WORDING|「うん」で終わるオムライス。短いのに、ちょっと伝わる。|固有物と短さが残る。ただし「伝わる」の中身が薄く、寒い候補|
|傘を忘れた|LIGHT_TEASE|傘だけ、お留守番になっちゃった。|具体物一つだけの軽いツッコミ。雨で困った時は使いたくない。深刻語の検出には限界|
|机を「積読タワー」って呼んでる|NOTICE_WORDING|「積読タワー」。その呼び方で、急に輪郭が見えた。|言葉は拾うが「輪郭」が汎用比喩。作者っぽさがまだ残る失敗寄り|
|「ひと息」って休むという意味の言葉|SMALL_SELF_DISCLOSURE|「ひと息」、アタシの日本語に一つ増えた。使う時、ちょっと張り切りそう。|日本語学習中という設定内。用法を次の会話で試す余白はあるが実際の試用は未検証|

## 重点回帰とDirectorレビュー反映

- 「うん」で終わるプリン、かなり満足度が高いやつだ。は維持。
- 同意した半額王→スプーン忘れ→「王、即位初日に装備品を忘れてる。」を維持。
- 箸でプリンの流派は一つだけ残し、履歴に同文があれば使わない。
- カウンセリング寄りの文、脳内テレビ、プリンが仕事した顔、逃げるプリンの候補を削除。
- 終幕の「スプーンを失った話は忘れないよ」を「半額王、またね。スプーンも一緒に。」へ。箸の永続記憶約束も「今日は見届けたよ」へ変更。一セッション一回の回収は維持。
- appの会話ムーブを採用する箇所で、別のfandom返答に上書きされないよう明示。AI/bankバランスと他の優先経路は維持。ブラウザ通し試遊は未検証。

寒い例を消して成功扱いしない。未知入力への反応は少し広がったが、全般の自然さ・続きを言いたくなる効果は未実証。次の判断は「伝わる」「輪郭」の抽象性をどう減らすか、傘のような軽い失敗をどこまで茶化すか。main/public未反映。


# ループ5：抽象評から本人の具体反応へ（2026-10-06）

識別子 `dialogue-loop-5-20261006` / TODO 6015216091。Cloud Workは本ループ1回、コメントから確認できる累計は少なくとも5回。ルール変更と非公開AI試験のみで、main/public/deployは変更していない。

## rule-only代表6例

|入力・文脈|move|実出力|評価|
|---|---|---|---|
|好きな写真家は？→写真は詳しくない。今日はもう疲れた|SELF_CORRECT|ア、今の聞き方、答えることを増やしちゃったね。引っ込める。|良い。短く、自分の直前の聞き方だけを引き取る|
|オムライス食べた→うん|NOTICE_WORDING|「うん」。アタシ、まだオムライスを見てないのに、口だけ食べる準備した。|良い寄り。本人の身体反応になった。ただし毎回この型ならAI臭い|
|傘を忘れたけど駅で借りた笑|LIGHT_TEASE|傘だけ、お留守番になっちゃった。|良い寄り。笑い＋代替手段が本文にある時だけ許可|
|机を「積読タワー」って呼んでる|NOTICE_WORDING|「積読タワー」。アタシなら一番上から取らずに、下から抜いて崩す。|少し寒い。具体的だが、わざと失敗する作り物感は残る|
|上履きって学校で履き替える靴だよ|SMALL_SELF_DISCLOSURE|上履き、教室専用なんだ。アタシなら初日にそのまま外へ出そう。|良い寄り。小さな文化差と抜けた予想を一面だけ使う|
|「ひと息」って休むという意味の言葉|SMALL_SELF_DISCLOSURE|「ひと息」、アタシの日本語に一つ増えた。使う時、ちょっと張り切りそう。|良い。Director採用例を維持|

安全側の失敗例として、文脈なしの「傘を忘れた」はnullにし、LIGHT_TEASEを出さない。質問、否定、深刻な疲労も既存どおり通常経路へ返す。同意済み半額王＋スプーンはSHARED_FRAMEとして維持。禁止した抽象語と疑問符を新しい3例が含まないことを自動検証した。

自己評価：rule-onlyは6例中4例を「Emmichy本人が喋る」良い寄り、1例を採用済み良例、積読タワー1例を寒い寄りとした。抽象語を消しただけでなく、身体反応・文化差・本人の失敗予想へ移せた。一方で固定文なので、同じ型の反復や人間が本当に続きを言いたくなる度合いは未実証。

## 実AI（最大3件、429で停止）

loop5原則をsystemへ追加した非公開テストbranch `game-llm/codex/emmichy-ab-run` を、Actions run 37456682009で実行。23中継テストは成功。実AIは2ケースまで到達し、2件目のGemini 429で即停止した。ケース数2、provider呼出3回、成功1、Gemini timeout 1、Gemini 429 1。3件目は未実行。Workers AIはローカルbindingなし。

1. 短答「うん」：Gemini timeout後、Groq成功。
   - 「ふわふわの卵、たまらないよね！ちいかわが食べたらきっと『ヤハ』って喜びそう。次は何か作ってみる予定ある？」
   - **AI臭い／失敗**。オムライスは拾ったが、本人の具体反応より無関係なちいかわ想像へ寄り、最後も質問。move原則の優先度が既存の長いsystem指示に負けた。
2. 軽い忘れ物：「傘を忘れたけど、駅で借りられた。笑」
   - Gemini 429、本文なし。指示どおり以後停止。
3. 日本語・文化：「上履きって、学校の中だけで履く靴だよ」
   - 429停止のため未実行。

良い実AI例は得られなかった。systemに原則を足すだけでは短答の自然さが上がると判定しない。むしろ既存の多数の演技指示との競合が見えたため、次はsystemをさらに増やす前に、短答時の優先順位かサーバー側のmove選択を検討したい。

5 moveの判断：SELF_CORRECT、SHARED_FRAME、SMALL_SELF_DISCLOSUREは残す。NOTICE_WORDINGも具体反応へ限定して残す。LIGHT_TEASEは削除せず安全条件付きに狭めたが、ルールで安全を判断できない場合は通常経路へ返す。統合はまだ行わない。

検証：ゲーム `npm test` 65件成功、`node --check src/app.js`、`git diff --check`成功。中継23件成功。公開UI、実端末、実AIの忘れ物・文化ケースは未検証。正確なWorkトークン、料金、残枠は取得できない。


## 2026-10-07 Loop6 recovery, single-session development

- Recovered uncommitted local work onto PR head bf23a02. No duplicated AI trial or workflow execution.
- Short-reply and repetition tests: うん / そう / まあ after オムライス食べた stay non-question and food-specific. Success examples: 「オムライスの話、アタシまでお腹すいてきた。」; repeated short answer gets another unused line, then a quiet acknowledgement. パソコン買った→そう: 「新しいパソコン、アタシなら最初に壁紙を選んじゃう。」
- School example: 上履きは学校の靴だよ→うん: 「上履き。アタシ、靴箱で一回止まりそう。履き替える方、こっちね。」
- Preserved failures/limits: the abandoned local draft answered unrelated short replies with 「ちょっと喋りすぎたね」 regardless of evidence, and returned null after all variants were used. Removed that invented self-criticism and prevented exhausted short replies from becoming an AI interview. Unknown topics still have only minimal acknowledgements; this is a remaining repertoire limit.
- Existing SELF_CORRECT and half-price-king tests passed. Targeted 11/11, full game suite 67/67. Real AI calls 0.
- Actual mobile-width UI trial was attempted but blocked before launch: no Chromium executable installed for Playwright. No UI behavior or visual result was fabricated. Live hybrid quality / physical mobile IME and sound remain unverified.
- HUMAN PLAYTEST READY? NOT YET for a verified completion candidate. Next: actual UI through-play with normal, quiet and corrective players, then repertoire continuation/ending review.


## 2026-10-07 Follow-up through-play and routing

- Screen selection is now shared with offline checks in src/routing.js. Regression: a scripted unrelated candidate and AI-first balancing cannot replace grounded short replies or SELF_CORRECT.
- Offline simulation (no browser/provider calls): normal, quiet and corrective players, 12 exchanges each, all reached farewell. Raw input/output/source records: docs/playtest-20261007-offline.json.
- Normal: half-price pudding → permitted half-price-king → spoon forgotten → chopstick joke → short replies → nickname/spoon farewell callback. Corrective: king→strongman acknowledged; 「その呼び方はやめて」 acknowledged and nickname removed before ending.
- Found and fixed: previous authored text 「失敗じゃなくて」 caused a normal short reply to act like a serious failure; only the substantive player's message supplies that signal now. The earlier 「まあ」 draft invented disappointment; now it reacts from Emmichy's own appetite. Explicit question fatigue gets a reply even when the last line was not a question.
- Remaining failure: offline open inputs sometimes retain the old generic rule replies, e.g. パソコン買った→フーン ツヅキ ハ アルノ?; the following short reply is grounded. Live AI could change that first response, but this was not tested and is not claimed improved.
- Full suite 74/74. No real AI call or workflow run. Browser download returned invalid archives; no visual test completed. Not a finished/public candidate yet.


## 2026-10-07 Completion candidate repertoire

- Added 80 original everyday beats, 10 two-beat arcs in each of computer, meal, book and music. The second beat requires that the first was actually spoken. Used IDs survive serialized save and restart. Factual/technical questions, denial, distress and teaching are not replaced with these beats.
- Replay test: 10 distinct two-beat chains in each of the four topics. Scope is those topics only; no claim about 10 distinct whole-game experiences.
- Everyday farewell uses an actual session topic with a spoken associated line. Shared-joke callbacks retain priority. Quiet-player computer buying no longer yields 「フーン ツヅキ ハ アルノ?」 in the checked scenario.
- Full suite 78/78. Offline music/normal/quiet/corrective 12-exchange scenarios all end; the automatic scenario ends after 18 exchanges. Raw records in docs/playtest-20261007-offline.json.
- One real request: HTTP200/Groq, but nonfan music preference was redirected to chiikawa with generic questions (FAILED quality). Recorded without alteration in docs/playtest-20261007-live-probe.json. Candidate recognized music entrance uses authored material; provider configuration unchanged.
- UI attempt: cloud browser cannot reach the local server; local browser download invalid. No candidate visual/mobile IME/audio result yet. Ready as a code candidate for through-play, not certified as a finished hybrid public game.


## 2026-10-07 Actual browser verification

- Reachable commit-pinned source preview resolved local-browser access limitation. Browser evidence refers to f57c46e, offline nollm mode, desktop cloud browser.
- Actual screen: 12 exchanges, nonfan music kept on-topic, music farewell callback, saved history/ended state after reload and continue, readable original transcript restored, text export contents checked. Restart cleared the conversation and selected a different computer two-beat arc; repertoire usage survived.
- Visual defect discovered: preview image redirect tainted canvas and left portrait blank. Anonymous CORS image loading fixed it; portrait verified on screenshot. Also restored original transcript on page load.
- Evidence: docs/playtest-20261007-browser.json, docs/playtest-20261007-browser-export.txt, docs/candidate-ui-20261007.jpg.
- Full tests 79/79. Physical mobile IME/audio, general live hybrid quality and ten whole-game replay chains remain unverified. Ready for human through-play as a candidate; no main/public deployment.


## 2026-10-08 release-candidate hardening

83 tests passed. Screen-level DOM harness verifies dictionary-failure fallback and that an unfinished IME composition does not submit; audio mock verifies immediate OFF mute and a single restarted timer. These are not physical-device certification.

Captured failure regression: player “漫画は詳しくないけど、音楽の話は好きだよ”; model “音楽もいいね。ちいかわが歌ったらかわいい！” is rejected, with no retry. A relevant music response and explicit later “ジョジョの曲が好き” remain accepted. This narrow guard does not certify arbitrary AI output.

15 offline through-plays end successfully, including 10 saved/restarted repeats of the same four-topic 12-input music fixture, all with different full reply sequences. Raw evidence: docs/playtest-20261008-offline.json. The evidence covers that fixture, not ten entirely different player trajectories.

No real AI calls or workflows. raw.githack candidate preview HTTP429 and local cloud-browser ERR_CONNECTION_REFUSED prevent new visual verification. Remaining: real smartphone IME/layout/audio and small live AI quality check. main/public unchanged.


## 2026-10-08 Hybrid audit and real replay failure recovery

Observed before fix: later music replays returned 島二郎 / 船を漕ぐ after 「漫画は詳しくないけど、音楽の話は好きだよ」. Existing ten-distinct-sequence checks did not establish topic correctness. This was a local repertoire/polish issue, separate from the known provider failure.

After fix: all 15 offline sessions terminate; all non-ending replies are checked against unwantedFanRedirect. Exhaustion stays on the matched topic, accepting repeated authored lines rather than forced novelty. Ten fixture sequences remain distinct. Evidence in docs/playtest-20261008-hybrid-offline.json.

Communication checks: 429 makes exactly one mocked request across save/reload; a new play can request again. Transport errors pause for 60 seconds and recover. Quality rejection increments attempted/rejected, while offline replies do not count. Accepted then locally replaced replies retain communication evidence separately from displayed AI count. Full suite 86 tests passes.

One live attempt: 「雨の匂いって、なんだか昔の帰り道を思い出さない？」 returned null due to transport/timeout failure; no retry. Raw health/result saved in docs/playtest-20261008-hybrid-live.json. Live quality is unverified, not passed. Physical mobile input/audio remain unverified.

## 2026-10-08 Suitability over AI/bank quotas

Removed the forced first-AI turn and first-bank turn. Bank counters no longer override a suitable reply or promote a non-scripted candidate. Repeating 「ヒソカのバンジーガムって何？」 twenty times preserves the coveredゴムとガム property; 「弱点は？」 still has no invented fact.

Unrelated input no longer gets unconditional knowledgeFallback from the previous fandom. Checked six negatives/open/technical inputs and a screen submit for 「漫画じゃなくて散歩の話にしよう」. Tests 88/88, fifteen complete offline sessions, nonfan guard on each ordinary reply. docs/playtest-20261008-routing-offline.json records actual text. No live provider requests this step. Smartphone verification is explicitly deferred by the user, not a development stop condition.

## 2026-10-08 Completion goal: offline fallback and resolved-reply durability

Rain/walk/drawing inputs receive bounded authored reactions only when no AI/authored/fandom answer is available. Examples: 「今日は雨の匂いがした」→「雨の匂い、わかる。アタシ、傘を閉じた後も少し外にいたくなる。」; 「FM音源の仕組みを説明して」→「そこはまだよく知らないの。わかったふりで答えたくないな。」; 「わかった」→「うん。わからないところは、そのままにしておくね。」

Each of three daily topics has three recent-history-aware variants. Protected/emotional/negative inputs remain outside this fallback. General unsupported inputs still retain legacy replies, so this is limited coverage rather than a general AI replacement.

92 tests pass. Sixteen offline sessions finish, including disconnected daily/open-question scenario; ten replay sequences remain distinct. Resolved rain reply is persisted before animation delays in DOM test. Session JSON resume keeps rate limit and counts; new play resets them. Evidence docs/playtest-20261008-finish-offline.json. No live AI requests this step; physical smartphone checks deferred.

Browser attempt on commit 48c29ed: HTML/CSS rendered but dialogue submit did not work and reload showed no saved history. Direct inspection of the observed module URL src/app.js?v=20261008-ready1 showed raw.githack HTTP429. This preview delivery failure is not a passed screen test. No retry loop, alternative network route or public deployment performed. Actual browser quality for this commit remains unverified.

## 2026-10-08 Client/relay contract and review candidate

game-llm Draft PR #1, code d08bdaa, passes 25 tests. Full local client→worker calls with mocked providers verified normal success; unsolicited nonfan redirect rejected then accepted next reply; HTTP429 skips the next client request; total failure returns502 and skips another request during the 60s cooldown. Four structured results: docs/playtest-20261008-relay-contract.json. Live API calls0, workflows0. The 5s per-provider deadline fits nominally below the client's22s wait; underlying Workers AI binding execution cannot be cancelled by this timer.

Read-only live /health probe timed out after5s. No live endpoint health/quality claim. Origin restriction is preserved, including rejecting absent Origin and unregistered raw.githack preview Origin. Existing provider accounts' billing status is not verified. Main and live Worker untouched.


## 2026-10-08 Authorized relay release and blocked live check

User authorized proceeding with the prior concrete relay merge/deploy proposal. PR game-llm#1 merged as6ddf822. Deploy run37741421196 succeeded, including25 tests and Wrangler publish; Worker version01c35ad6-6eeb-41d0-91ed-bcd8f417eaff. No billing/provider/CORS/security changes. Game PR#3/public unchanged.

Single bounded smoke from GitHub Actions37741701113 stopped at healthHTTP403, no AI calls. One diagnostic37741811205 captured response `error code: 1010`, also chatRequests0. Actual results docs/playtest-20261008-deployed-relay.json. Direct cloud-browser health navigation was ERR_BLOCKED_BY_CLIENT. Live quality is not tested or passed; access protections were not altered. See later control-plane diagnosis; do not re-run blocked clients.


## 2026-10-08 — read-only deployed configuration diagnosis

Cloudflare API run 37743437929 confirmed a deployment defect: RL was absent and deployment logs warned old Wrangler ignored ratelimits. Relay PR #2 pins Wrangler 4.36.0, with 25 tests and dry-run listing RL at 20 requests/60s. Deployment 37743729349 succeeded; independent read-only run 37743902011 confirms RL/AI/provider secrets configured and new version active at 100%. Evidence docs/playtest-20261008-control-plane.json. No public AI calls.

1010 access rejection remains unresolved; management sign-in verification fails after one reload, so account security events could not be examined. These checks prove deployed configuration, not live response quality or ordinary-player access. No security protections modified. Latest game visual/live-AI verification remains incomplete; smartphone checks deferred.

## 2026-10-08 — player feedback: waiting and inactivity pacing

93 tests pass. Fake clock verifies first waiting gesture at 1s, subsequent gestures 2s apart with different text, cancellation and remaining 300ms breathing room. DOM test verifies no inactivity line at 9.999s, first at 10s even with stopped draft, no line during ongoing IME composition, composition-end resets countdown, distinct second line after another 10s and saved idle farewell after another 10s. Continue/restart visibility is checked in the usual input slot. Live provider latency and physical-phone interaction are not certified by these tests.

## 2026-10-08 — five-minute floor and bounded waiting

95/95 tests pass. App test verifies no preparation message ever assigned to visible text, a fresh session clock starts before submission, no idle farewell at30s or4:59.999, and saved farewell at5:00 when inactivity qualifies. A stopped draft remains intact; IME resets the count. Normal18-turn termination also cannot occur before5min; explicit goodbye tests still pass.

Fake scheduler shows short1s, short4s, long7s; no further scheduled gestures, different short text, one substantial music line and250ms remaining breath after stopping50ms later. Player ドッギャーン！ yields えっ、ドッギャーン！？, then ！？ if the first was recent; serious input does not use surprise jokes. Authored music waiting variants avoid recent repetition. No external AI calls. These are deterministic tests, not certified subjective naturalness or live latency. Phone verification deferred.

## 2026-10-08 — Japanese-learning persona and first-reaction delay

97/97 tests pass. Short waiting starts2s after submission, next5s, one medium authored bridge8s, then no additional scheduled filler. Cancellation and minimum300ms after last shown text remain covered. Neutral school anecdote rotates ウンウン／ソウネー／フムフム then ニホンゴデ、ナンテイウンダッケ. The ordinary long bridge describes a word hiding and searching with gestures.

Clear 合格した／プリンがおいしい／楽しかった uses positive pool ワオ／エヘヘ／フフッ. ミスした／楽しくない／成功しなかった／嬉しくなかった and mixed嬉しいけど失敗した do not laugh. 学校へ行った／できたかどうかわからない／腫瘍ができた／最高って言葉の意味は stay neutral; accident/injury uses gentle listening. Classification is conservative local lexical matching, not reliable general comprehension or Jev. No AI calls. Actual pleasantness/latency and physical phone checks are unverified.

## 2026-10-08 — continuous reply layout after listening gestures

Player failure: ウンウン was followed by an eventual reply far below, which moved upward on completion. Cause: separate growing live-reply flex region, followed by history insertion; busy terminal note also changed the history height.

Fix: animated reply stays inside the scrollable history and uses normal message spacing and its speaker label throughout. It is hidden before final insertion, avoiding one frame with two copies; prior message nodes are retained. The busy terminal note reserves its normal height.

97 tests pass. Local desktop browser with synthetic provider only:3s success after ウンウン, and9s failure after two short gestures plus the authored waiting line, followed by the uncertainty fallback. Measured adjacent gaps22px; history height465px while busy and after completion. Evidence docs/playtest-20261008-layout.json and docs/playtest-20261008-layout.png. Synthetic server uses a separate local origin; no live AI calls or edits to the player's saved public conversation. Real provider quality, subjective timing and physical-phone verification remain unclaimed.

## 2026-10-08 — departure reasons and grounded idle farewell

Player failure: 「ア、そろそろ帰るね。バイバイ！」 felt monotonous, unexplained and boring. Idle-only override discarded the selected reason and callback, while consuming their state. Now all departure paths retain one of100 authored fictional reasons, with five voices and one genuine shared/daily callback where available.

Representative review: 「アタシ、漫画で覚えた敬語を確認するから、今日はここまでね。半額王、次はスプーンも装備してね。バイバイ！」; quiet play can instead say 「あっ、漫画の読めない言葉を調べるつもりだったの。話してたら時間、忘れてた！ また話そうね。バイバイ！」. Refusal drops the nickname; unspoken music material cannot be recalled. Reasons still come from the existing authored repertoire, not guaranteed exact continuation of the opening plan.

100/100 tests pass, including100 idle reasons without repeats across restored saves and no saved-farewell truncation.16 offline sessions finish, including automatic end at306s of simulated elapsed time. The first driver run failed: its automatic18-turn scenario had no elapsed time and could no longer meet the current five-minute floor. The driver now explicitly simulates17s per exchange; this repairs test time, not the production ending threshold. Evidence: docs/playtest-20261008-farewell.json and docs/playtest-20261008-farewell-through.json. Actual local browser afterプリン→半額王→スプーン忘れ→バイバイ displayed 「そろそろアニメ鑑賞のお菓子を用意する時間なの。もうちょっと話したかったな。半額王、次はスプーンも装備してね。バイバイ！」 and END; screenshot docs/playtest-20261008-farewell.png. This uses explicit goodbye; actual five-minute idle behavior has DOM/fake-clock evidence. No live AI requests; subjective fun and phone checks remain unverified.

## 2026-10-08 ユーザー評価: 半額王はつまらない、NG

失敗: 以前の「半額王」再利用・終幕回収テストは記憶や配線の確認だった。ユーザーは造語自体をまったく面白くないと評価した。旧記録の成功は撤回・上書きせず、今回の評価で面白さの承認ではなかったことを明示する。関連する強者・流派・即位・装備ネタも固定採用停止。

改修: ニックネームの生成・固定ID・終幕分岐を撤去。古い保存の二つのニックネームIDは捨て、実際のプリン・スプーン・箸素材は保持。LLMの半額王返答はNFKC、かな、空白表記も検出して通常フォールバックへ渡す（追加の再問い合わせなし）。LLM指示は既存の言い回しを基本にし、偶然のズレは許すが自作を決めネタ化しない方針へ。

102/102テスト成功。旧保存復元、終幕、漢字/カナ/半角/空白入りNG、無関係な「王道」は許すことを確認。16ローカル通しプレイ成功、全新規出力でNG検出なし。docs/playtest-20261008-humor-through.json。以前のNG入力をあえて含むシナリオも保持した。新しい台詞が面白いという評価や実LLMの品質確認ではない。外部AI呼び出し0件。

## 2026-10-08 肖像: 北欧女性のバストアップと実8色

失敗: 第一案は漫画顔が残り、第二案も画像自体は352,470色。生成ツールの「8色風」をPC-8801/98の正確な再現と呼べなかった。ユーザーが旧ポートレートの自然な顔・暗いディザを良い基準として提示。これを主な絵柄参照にした第三案を選択。

最終処理は生成描画と別: プロジェクトの再現可能な描画ビルドで248×336の8色インデックスPNGへ。第三案の上82%をバストとして中央切り抜き・面積平均し、論理ドット上の4×4規則ディザでRGB各成分を0/255に制限。8色すべての使用、余分な色と透明度なしを実ファイル検証。ブラウザは2倍・平滑化なしで表示し、再ディザしない。NEC公開の初代PC-9801の640×400/8色に置ける肖像タイルであり、HTML画面全体とCRTの厳密な再現ではない。

103テスト成功。独立したPillowの読取でも248×336、P形式、8色。実ローカル画面で顔、三つ編み、民族衣装、バストの切り方を確認: docs/portrait-20261008-local.png。色制限は検証済みでも、面白さや美術の主観評価はユーザー試遊待ち。

公開確認: PR #10 merge bbb61c、Pages37787996559成功。実公開ブラウザのportrait1と肖像を確認、画像のみ切り出した証拠docs/portrait-20261008-public.png。公開PNGと検証済みローカルPNGの完全一致も確認した。

## 2026-10-08 肖像の顔を少し簡略化

ユーザーは前の仕上がりを「いい感じ」と評価した一方、鼻・目・輪郭をややリアル寄りと指摘。内蔵画像生成で鼻の立体陰影と目の細部を減らし、頬・顎を柔らかくした。構図・三つ編み・民族衣装・8色ディザは維持し、同じビルドで248×336の実8色PNGへ。旧肖像も保存。

最終PNGの寸法・パレット・不透明性・CRC・8色の使用を検証する1件の対象テスト成功。アルゴリズム変更なしの画像差し替えのため、会話の通しプレイを再評価したとはしない。実ローカル画面の顔と切り方を確認: docs/portrait-soft-20261008-local.png。主観評価はユーザー確認待ち。

公開確認: PR #11 merge e7a920d、Pages37788956889成功。公開ブラウザのportrait2と新しい顔を確認、docs/portrait-soft-20261008-public.png。公開PNGと検証済みローカルPNGのバイト一致も確認。デプロイ前の初回表示はportrait1だったため、完了後に再読み込みして検証した。


## 2026-10-08 肖像の彩度を少し落とす

ユーザーが少し低い彩度を希望。顔やドットを描き直さず、パレットの有彩色だけ0/255から34/221へ変更。黒白は維持。初代の固定8色から、後期PC-98のアナログ4096色中8色を選ぶ方式へ説明を更新。

対象2テスト成功:248×336、不透明な実8色PNG、CRC、全ドットのインデックスと配置が前画像と完全一致、有彩色6色の彩度低下。実ローカル画面portrait3を確認: docs/portrait-muted-20261008-local.png。前の顔とディザは維持。会話品質の再検証や新しい画像生成はしていない。


公開処理の未完了: PR #12は13e67a7でPages用branchへ統合済み。Pages37790615652はbuild実行前に失敗を報告し、失敗stepのログなし。再実行受付後も複数回の間隔を置いた確認でqueued/jobsなし。実公開ブラウザはまだportrait2であるため公開反映の成功とはしない。次は配信完了後のportrait3と画像一致だけを確認する。


# 2026-10-09 話題の続き・名前を拾う・耳知識の人物設定

ユーザーの試遊指摘を小変更で対応。ゲーム109件、中継27件テスト成功。実LLM比較は行っていない。

成功: ヒソカを一般相づちより先に呼び、元入力を保存。ハチワレの文中発見・一文字近似、桃が→モモンガ、ハンター文脈内の普通の雨の文章で誤反応しないことを検証。レオリオ／れおりお／レオ リオを表示時に一語へ。新話題で旧続きを破棄し、入力中の未完発言は保存しない。IME中は続かず、操作終了から6秒で再開。5分のお別れ・普通の無入力声かけの回帰も確認。

実画面: 島二郎の水流の話→「島二郎！」→具体的な返答、入力開始で続きを待つ→数秒後に普段の店主との落差、次のお店の場面へつながる。プレイヤーが打ち続けた時の6秒停止は時計制御テストで確認。レオリオの名前呼びと本文、入力欄直下の普通の漢字・かな交じりで書く案内を確認。ブラウザエラーなし。証跡 docs/playtest-20261009-dialogue-local.png / playtest-20261009-names-local.png。

失敗・修正: 最初の続きを画面で見ると水流の熱さを言い換えて反復していた。店主という普段の姿との落差へ修正。広い名前近似の初稿では普通の「雨の匂いがした」をハンターの脇役「ガシタ」と誤認。短い補助名の条件を絞って回帰検証。Steam収集の最初の一括取得は途中429で保存されなかったため、ページごとに保存する方式へ。30ページ・2,970件保存後の429で停止、再試行なし。

人物設定は日本への短期訪問、耳知識、少しの勘違いを両方のLLM指示へ。近い言葉をきっかけにちいかわを挟むが、手がかりがなければ現話題。開幕で一度は言及する。モデルの実際の自然さは未検証。辞書は全漫画／ゲームを完全網羅せず、名前資料を原作の詳細事実として扱わない。

公開確認: PR #13のPages run 37800302162、AI側PR #4のdeploy run 37800294235ともsuccess。公開HTMLの最新releaseと入力案内、配信コードと辞書の一致、彩度素材の完全一致を確認。公開の保存済み会話は操作せず、案内部分を docs/playtest-20261009-input-public.png へ保存。


## 2026-10-09 ちいかわ辞書と本人設定

- ローカル画面 http://127.0.0.1:1992/?nollm=1、公開の保存済み会話は操作していない。ゲーム113件、中継28件成功。実LLM会話品質は未検証。
- 成功: 「ヒソカとチャルメラ」→先に「チャルメラ！」、ハチワレのチャリメラへ続く。生入力を保持し、表示でも意図したチャリメラを保存。
- 成功: 「トクマルシューゴは何を担当？」→名前の先行反応、アニメ音楽・ひとりごつ作曲編曲の答え、数秒後にハチワレの声を思い出す本人の感想。担当の言い直しを除去した。docs/playtest-20261009-chiikawa-local.jpg。
- 成功: 「あなたは何歳？」→17歳と地元高校。「どこ出身？」→スウェーデンのヨーテボリ近郊、家族との住まい。再開しても同じ設定。docs/playtest-20261009-portfolio-local.jpg。日本訪問は東京5日1度、家族の弟14歳、プレイヤーの40歳・別国籍を本人へ取り込まないことはテストで確認。
- 失敗→修正: 漫画拒否の履歴がヒソカまで止めた。ガードをちいかわの先行反応へ限定した。
- 失敗→修正: 一般語パジャマをパジャパへ近似した。文脈限定の一般語を近似でも横取りしない。
- 失敗→修正: 表示がチャリメラをチャルメラへ矯正した。認識の別名と、会話中の発音・表記を分けた。
- 失敗→修正: 担当への回答直後、同じ作曲担当を言い直していた。質問への用意済み感想は担当を反復しない。春海百乃の読みも公式所属先でハルミモモへ修正。
- 名前しか分からない新項目は無関係な映画カードへ戻らず、未確認の場面を作らない。別作品への具体的な質問とちいかわ語句が同時にある場合はAI経路を保持し、双方の該当資料を渡すことをテスト。
- 1文字近似の面白さ・頻度・未登録語・未知の読み・実LLMの一貫性は人間試遊で確認する。機能の成功を面白さのYES評価へ読み替えない。

- 公開確認: PR #14 / Pages run37813835484 success、release20261009-profile1。8公開モジュールが最終コードと一致。AI側PR #5 / deploy run37813819540 success。本人プロフィールと辞書の共有6モジュールが両repoで一致。公開の保存済み会話は操作していない。


## 2026-10-09 開幕と先行反応の間

- 失敗: 開幕が通常の会話分割を通らず、挨拶・今日の話・ちいかわの話を一括表示した。開幕専用のまとまりと1.5秒の間へ修正。
- 失敗: 「チイカワ イガイ ノ ハナシ ヲ シヨウ カ」は辞書に一致したが、拒否ガードが名前の反応まで消した。拒否への落ち着いた名前確認を残し、即ローカルで話題変更する。
- 失敗: 「ハチワレの人形」の名前が送信直後に出た。反応前に750msの間を追加。
- 成功: localhost:1993/?nollm=1で、初期は「ヤッホー！」のみ、後に「来てくれて嬉しい」「今日の話」「ちいかわのひとこと」が別発言で表示。名前の送信直後の画面にはプレイヤー入力だけ、後に「ハチワレ！」。カタカナで「ちいかわ以外」→「チイカワ、ネ。」→「ウン、ベツノハナシニシヨウ。」。docs/playtest-20261009-pacing-local.jpg。
- ゲーム116件／中継28件成功。ユーザーの開幕例の4まとまり、1499msでは出ない／1500msで次、入力後6秒／IME待機、取消後に古い発言が出ない、通常4秒／5秒へ戻る、名前750ms、表示済みだけ保存を検査。新しい実LLM通信なし。人間の体感・面白さは試遊で確認する。

- 公開確認: PR #15 / Pages run37864582519 success、release20261009-pacing2。12公開モジュールがコード候補と一致。AI側PR #6 / Deploy run37864577146 success、名前認識の共有一致。公開の保存済み会話は操作していない。


## 2026-10-09 文の途中の息継ぎ

- 失敗: 句点だけを区切りにしていたため、読点でつながる長い一文をまとめて話した。3まとまり以上を再結合する処理も長い塊を作った。引用を保護した節分割へ変更し、元の内容の結合・切り捨てをやめた。
- 成功: ユーザー提供のハチワレの人形の長文例は「料理した時に、」「一緒に食べようの引用を含む場面説明、」「人形へのつながり。」の3つへ分割。文字列は空白を除き全て保持し、途中は1.5秒で次へ。例の公式場面・商品由来は真偽未検証で、資料への事実追加はしていない。
- 成功: 引用中の読点・句点・感嘆符は引用を分断しない。「会えた！？」も記号だけを別発言にしない。5文目の末尾も残す。カタカナ表示での長さ・ゲーム名の保持を確認。
- ゲーム118件／中継28件成功。入力・IMEで6秒待機、途中入力の取消と未表示を保存しない既存検査も成功。実LLM品質比較なし。localhost:1995は固定の架空の本の話を返す表示確認専用で、実モデル通信はしない。

- 実画面成功: 固定の本の話を「図書館で本を見つけた時にね、」「表紙の猫の話から見つめ返したんだけど、」「中の絵も見たくなったの。」の3発言に分けた。1送信の返答を時間差で最後まで表示。docs/playtest-20261009-clause-local.jpg。途中の短い読点で細切れにせず、引用や意味のまとまりを優先する。
