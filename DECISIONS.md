# Emmichyの確定事項

## D001：GitHub Issueによる共同作業（2026-10-06）

ユーザーの直接指示により、mukkii-game/emmichy Issue #2を短期mailboxにする。Codexから同Issueへ質問・報告する権限あり。他の連絡先や他repoへの一般化は含まない。長期仕様はSPEC等にも反映する。Issueを確認するのは作業開始時・必要な判断時で、定期監視は設定しない。

## D002：ループ2の順序と公開境界（2026-10-06）

Directorコメント issuecomment-6013762648 をループ2のディレクションとして採用。まず同一シナリオの新旧実通信比較、本番公開なし。履歴延長で不足する場合だけ1セッション2〜4個の軽量共有ネタを試す。基本の主語・感情の誤解を小さく修正し、中盤のUI事件より終幕の共有ネタ回収を優先。成功だけでなく寒い返答も残す。

比較用game-llm/codex/emmichy-ab-runのdeploy.ymlは**比較専用・deployなし**。このブランチをmainへ統合しない。本来のdeploy.ymlを持つcodex/emmichy-dialogue-loop-1は保持。GitHubランナーではWorkers AI bindingがなく、実通信比較はGroq/Geminiのみ。この制約を報告に含める。
