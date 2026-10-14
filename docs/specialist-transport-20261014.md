# 専門返答の通信形式をAPIでも指定

## 根拠と修正

公開中継6782d00、CI38512386796、2回の実Groq生成。合否の返答は790msでmixed採用、心情の返答は571msでJSONの閉じ文字が「」になり全拒否。Gemini/Workersは2呼出し上限のため未実行。429なし。生出力はspecialist-live-formatcheck-20261014.json。心情の内容は本人の見方として使えそうだったが、形式が崩れたまま再利用はしない。

専門会話の時だけ、サーバーが今回選んだ所有根拠IDから返答Schemaを作る。Groqの対応モデル（GPT-OSS20B/120B、Qwen3.8-27B）ではstrict json_schemaを送る。その他のGroqモデルはjson_object。Geminiには既存RESTのresponseMimeType=application/jsonを指定し、内容の根拠検証は共通rendererへ残す。通常会話と他作品はSchemaなしの従来通信を維持する。プロバイダー順・費用設定・タイムアウトは変更なし。

所有事実・本人の感想・任意の質問をnullable欄にする。根拠IDのenumと追加欄禁止をAPIへ渡すが、意味の正しさ・反復・過剰な事実数は引き続きアプリ側で検証する。「その後の挑戦は？」という、まだ話していない場面への質問も専門出力から除く。

## 出典と検証

2026-10-14確認の一次資料：
- Groq https://console.groq.com/docs/structured-outputs （対応モデル、strict、additionalProperties:false、required）
- Groq https://console.groq.com/docs/api-reference （response_format）
- Gemini https://ai.google.dev/api/generate-content （generationConfig.responseMimeType、application/json。Schema設定は最新APIの移行差があるため今回Geminiへは送らない）

フロント236件／中継59件合格。実POSTを捕まえるローカル試験で、専門ターンに許されたIDだけのSchemaを付け、通常会話へは付かないことを確認。対応Groq/他Groq/Geminiの送信形式も確認。API設定変更後の実生成は未確認。このターンの追加実生成は上記2回で打ち切り。新しいAPI設定の実通信と人間の試遊は残る。

公開済み：PR50/main9ee26ae（候補42b8c8c）と中継PR23/main2b4403f（候補ea962c5）。Cloudflare38512882810/38512877931成功。変更公開モジュールの完全一致を確認、生成0回。docs/public-specialist-json-20261014.json。
