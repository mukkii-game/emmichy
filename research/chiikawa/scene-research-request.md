# Claude / Gemini 追加依頼：まず深い場面資料を作る

目的：名前に反応するだけで終わるEmmichyを、同じ場面の質問・訂正・感想で6〜8往復できるファンへ直す。大量の用語を増やすより、根拠をもつ小さな場面の組を作る。

このファイルを読んだら質問待ちせず調査し、担当ファイルへ納品する。対象repoはmukkii-game/emmichy、PCではE:\ゲーム企画\Emmy。既存research/chiikawa/claude-handoff.mdとcodex-corrections.csvがあれば訂正を優先。相手のファイルやゲームコード/mainは変更しない。

分担：Claudeは草むしり検定・5級の結果とその前後・ちいかわとハチワレの励ましや訂正されやすい場面を12〜20事実。Geminiは島/映画の人物関係、島二郎の店の食べ物、水流、媒体差を12〜20事実。各担当が両方できる場合もまず担当分を完成させる。でかつよ/モモンガの入れ替わりは考察として扱う。

出典：読める公式原作投稿→公式アニメ本文/映像/あらすじ→公式映画本文/インタビュー→信頼できる報道→Wiki/個人まとめ。Xで原作を読めなかったら本文未確認と記録し、検索要約だけで一次確認済みにしない。映画の場面を原作でも同じと断定しない。投稿や映像の全文転載、絵の保存・転載、長い原作台詞の収集はしない。

納品先：research/chiikawa/claude-scenes-deep.json または gemini-scenes-deep.json。UTF-8 JSON。固定構造：

```json
{
  "researcher": "claude または gemini",
  "checkedAt": "YYYY-MM-DD",
  "records": [{
    "id": "安定した場面と事実のID",
    "sceneId": "同じ場面をまとめるID",
    "subject": "誰",
    "predicate": "何をする",
    "object": "誰/何に",
    "media": "manga/anime/film",
    "location": "話数/投稿日時/本文の場所",
    "fact": "180字以下の自分の要約",
    "sourceUrl": "実際に読んだURL",
    "status": "official-body-checked/secondary-only/unverified",
    "interpretation": "考察なら出典と考察である理由。なければなし",
    "limits": ["この資料だけで言ってはいけないこと"],
    "relatedIds": ["前後/同じ人物の確認済み事実ID"],
    "playerQuestions": ["この事実で回答できる短い質問"],
    "misconceptions": ["間違いやすい具体例と、根拠のある訂正"],
    "spoiler": "none/minor/major/不明"
  }],
  "testConversation": [{"player": "入力", "expectedFacts": ["回答に必要なID"], "mustNotClaim": ["誤答/推測/繰り返してほしくない内容"]}],
  "remainingGaps": ["未確認箇所と止まった理由"]
}
```

不明は「不明」、目標件数に届かなくても確認した分を納品し不足を明記。根拠がなければfactを作らない。testConversationは同じ場面で6〜8入力：最初の質問→別表現の追質問2個→プレイヤーの訂正→本人の感想→同じ説明への不満→次の関連質問。望ましい「楽しさ」は設計評価であり、原作の事実や実プレイ結果ではない。

完了条件：根拠を読めた12事実以上と6〜8入力の検査材料、媒体差と混同禁止が揃うこと。取得制限なら確認済み分と不足で完了。最後に成果ファイル内remainingGapsと最終報告へ担当・全件数・一次本文確認件数・未確認・保存先を書く。Codexが元資料と矛盾を検証して実行用データへ統合する。調査JSONをそのままゲームへ入れない。有料契約・新Relay・無期限の自動研究は追加しない。
