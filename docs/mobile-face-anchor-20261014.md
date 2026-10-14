# スマホで入力しても顔の倍率と上端を変えない

人間の追加報告：外部ブラウザで入力時に絵が小さくなり、SNS内では顔の上下が黒く隠れる。以前の端末サイズシミュレーションだけでは実機の問題を解消したとは言えなかった。

既存のkeyboardモードは、絵をtranslateYで上へずらし、縮めたportrait枠で切り取っていた。これを廃止。通常時から顔中心の構図にし、canvasの倍率と上端は画面幅だけで決める。390/428幅では320px、360幅は280px、320幅は260pxを入力前から維持する。通常の表示枠は260px高、短い画面では顔の高さと会話の最低限の余地を基準に胸元を省く。非常に短い画面では顎の端まで完全に残せる保証はない。

入力時の数pxのvisual viewport幅の揺れは倍率へ反映しない。30pxを超える幅変更は引き続き回転/新しい幅として扱う。pinch zoomは追わず、拡大操作を禁止しない。表示位置はVisualViewportのoffsetへ追従する。会話の文字は22px、入力16pxを維持。

キーボードで会話欄が小さくなると、以前は最新の行が下へ隠れていた。ResizeObserverで末尾を読んでいた時だけ末尾へ追従する。過去の発言を手動で読んでいた時は戻さない。

## 外部ブラウザ案内

参考はmukkii-game/metoponのxemetous/index.html、HEAD 1d2fcbe、1792行付近。GitHubのHEADと手元の一致を確認。実装コードの転載や依存追加はせず、SNS検出→ユーザー操作による外部起動→すぐ手動案内/URLコピーを出す流れを参考にした。

SNSのUA、Android WebView、Safari印のないiOS WebViewでは初回の案内を出す。「このまま遊ぶ」もあり、案内中は時計・自発発話・送信を一時停止する。設定にも「ブラウザで開く」を置く。UAが通常ブラウザと同じSNSは自動検出できないため設定から利用する。

Androidはユーザークリック時のintentとfallback URL、iOSはmetoponと同じx-safari schemeを試す。各SNS/iOSの実起動は未検証で保証しない。起動前にメニューからの開き方、URLとコピーを表示するため、起動がブロックされても案内は残る。Clipboard失敗は選択/長押しコピーへ。別ブラウザでは保存領域も別になることを案内する。

参考一次資料：[VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport)、[Chrome Android Intents](https://developer.chrome.com/docs/android/intents)。

## 検証

245件のローカルテスト合格。新規検証はUAの案内判定、外部URLの組み立て、ユーザー操作なしでは起動しないこと、案内を一度閉じても設定から再表示、起動/コピーの失敗時案内、既読位置を保つスクロール、IMEの幅揺れ。中継は変更せず、LLM生成0回。

実Chromiumのviewportシミュレーション（実OS/SNSではない）：

| 画面 | 入力前→入力時の絵幅 | 絵の上端 | 入力時の会話高さ |
|---|---|---|---|
|390×844→430|320→320|8.57→8.57|94.57px|
|360×640→340|280→280|8.57→8.57|60.18px|
|428×926→360|320→320|8.57→8.57|50.97px|
|320×568→300|260→260|8.57→8.57|42.57px|

全組でpageScroll0、transformなし、入力欄は表示範囲内。1280×900は既存2列配置。手動のブラウザ案内を開いて3:56のまま停止し、閉じると入力可能・同じ残り時間から再開。会話末尾のgapは0.15px未満。Console error0。初回SNS案内はUAを渡した単体検証であり、実SNS起動の確認とは区別する。

記録：mobile-face-browser-20261014.json。画像：mobile-face-normal/typing/small-20261014.jpgとmobile-browser-guide-20261014.jpg。実機のOSキーボード・SNS固有の画面調整は人間の再確認が必要。

公開確認：PR55/main0c3d366（候補a874012）、Cloudflare38561288125成功。変更5配信ファイルがGit blobと完全一致。public-mobile-face-20261014.json。検証用viewport reset、タブclose、作成した1984/1985サーバー終了。
