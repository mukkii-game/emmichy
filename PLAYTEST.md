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
