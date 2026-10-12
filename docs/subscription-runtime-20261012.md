# 月額プランと公開ゲームのLLM利用（2026-10-12確認）

ユーザーは既存のClaude・Gemini・GPT月額枠を、上限付きで活用してよいと許可した。開発支援の利用と、公開ゲームからのAPI呼出を区別する。今回の比較は既存Groq／Gemini APIキーのみ、実生成試行8回・最初の429で停止する上限を設けた。月額アカウントをゲームに接続する変更はしていない。

| 対象 | 確認できた条件 | このプロジェクトでの扱い |
|---|---|---|
| ChatGPT／Codex | ChatGPTサインインは月額枠、APIキーは使用量課金。API価格は月額利用と別。 | この開発セッションに月額枠を使える。月額枠をそのまま公開ゲームの一般API枠と扱わない。 |
| Claude | ClaudeアプリとConsole APIは別。現在の公式説明ではMax／Teamに月ごとのAPIクレジットがあり、Console組織への紐付けが必要。 | ユーザーの契約種類・紐付け・残額は未確認。対象プランならAPI用月額クレジットを使う検討余地がある。Proのアプリ枠をAPI枠と扱わない。 |
| Gemini | Gemini APIはCloud Billingの無料／有料階層とAPI用上限で管理。Google Oneのアプリ特典だけで公開ゲームのAPI上限が増えるとは確認できない。 | 既存無料APIを継続。AI Studio／Antigravityの開発利用とゲーム本番APIの無料枠を区別する。 |

有料APIを採用するなら、提供側の予算制限に加え、中継で日／月の利用量・最大出力・同時要求・ユーザーごとの速度を制限し、上限に達したらDB返答へ戻す。現状はIP×ゲームの20要求/分、要求7200ms、各モデル3500ms、最大出力1024トークンの制限がある。日／月の支出を確実に止める永続的カウンタは未実装。提供側の計測遅延による超過を考慮し、予算通知だけを課金の停止装置と呼ばない。

## 公式資料

- [OpenAI Pricing](https://learn.chatgpt.com/docs/pricing) と [Authentication](https://learn.chatgpt.com/docs/auth)
- [Claude月額プランとAPIの違い](https://support.claude.com/en/articles/9876003-i-have-a-paid-claude-subscription-pro-max-team-or-enterprise-plans-why-is-claude-api-usage-billed-separately-from-my-paid-claude-plan)
- [Claude Max／TeamのAPIクレジット](https://support.claude.com/en/articles/8977456-how-do-i-pay-for-my-claude-api-usage)
- [Gemini API Billing](https://ai.google.dev/gemini-api/docs/billing) と [Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Google One特典の制限](https://support.google.com/googleone/answer/16105039?hl=en)

公式ページの条件を確認した記録であり、ユーザーのアカウントがAPIクレジットを取得済みだという報告ではない。Claude連携はユーザー仲介へ切り替え、自動Issue依頼・再試行を停止する。
