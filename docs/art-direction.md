# Emmichy人物画

採用：`assets/emmichy-portrait.png`。2026-10-04、組み込みimage_genで生成。

最終指定：少しぽっちゃり、ロングヘアーの欧米人ティーン。日本のアニメ・マンガ風を避ける。写実に寄せすぎず、原作に近い単純化した欧米風のイラスト。原作添付画像は画風の参考としてツールに渡し、その画面やロゴをゲーム素材として流用していない。

生成原稿をゲームの描画時に248×168／デジタル8色へ制限する。ユーザーの追加指定により124×84への追加の縮小を撤去。絵柄は変更していない。ゲーム画面全体は640×200。高解像度の原稿をそのまま表示しない。

## 最終プロンプト

Generate only the LEFT portrait of an original character called Emmichy, using the attached 1984 computer game screenshot as a STYLE reference, not a character to copy. Match its awkward simple illustrated human face, crude limited palette, cheap handmade pixel appearance. A Western late-teen girl with slightly plump round cheeks, small natural-sized blue eyes, a simply drawn angular nose, small red lips, long loose golden hair, red sweater. Plain friendly face, youthful but NOT childish. Simplify each feature into a few lines and flat broad color areas: hair is 5 or 6 large wavy shapes, facial shading is just 2 flat regions with tiny ordered pixel dithering. Stylized European early-computer illustration, halfway between crude fashion illustration and caricature. No Japanese anime or manga features, no mascot proportions, no photorealism, no glamor makeup, no elaborate lighting. Head and shoulders portrait, 3:4 composition, solid black background, no text/UI/logo. VERY low resolution pixel art, effective 160 pixels wide by 200 display pixels high, eight pure digital colors maximum (black, red, yellow, white, cyan, blue, green, magenta); favor black yellow red cyan and white. Simple large color masses, little detail, rough outlines. Do not smooth or beautify it.

## 不採用案

`assets/enny-source.png` は最初のショートヘアー案、`assets/enny-longhair.png` はアニメ調になった案。どちらもゲームは読み込まない。


2026-10-06 最新指示：同じ採用原稿を496×672／8色で描画し、低解像度248×168から復元。元絵の再生成はなし。会話は24pxのDotGothic16（SIL OFLを同梱）で、可読性を保ちながらドット感を出す。
