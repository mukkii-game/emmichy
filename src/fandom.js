// Curated short factual notes, not scraped articles or dialogue reproductions.
// Canonical copy: emmichy/src/fandom.js; sync unchanged to game-llm/games/emmichy-fandom.js.
export const checkedAt='2026-10-06';
const wiki=title=>`https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
export const sources={
 movie:{url:'https://chiikawa.toho-movie.jp/atm/index.html',kind:'official'},
 cast:{url:'https://chiikawa.toho-movie.jp/atm/characters.html',kind:'official'},
 staff:{url:'https://chiikawa.toho-movie.jp/index.html',kind:'official'},
 island:{url:'https://www.animatetimes.com/news/details.php?id=1764903101',kind:'reported'},
 interview:{url:'https://chiikawa.toho-movie.jp/interview/nagano.html',kind:'official'},
 acting:{url:'https://mantan-web.jp/article/20260806dog00m200090000a.html',kind:'reported'},
 serial:{url:'https://realsound.jp/book/2026/09/post-2537897.html',kind:'reported',date:'2026-09-30'},
 chiikawa:{url:wiki('Chiikawa'),kind:'wiki'},
 hunter:{url:wiki('Hunter × Hunter'),kind:'wiki'},
 hunters:{url:wiki('List of Hunter × Hunter characters'),kind:'wiki'},
 jojo:{url:wiki("JoJo's Bizarre Adventure"),kind:'wiki'},
 stand:{url:'https://jojowiki.com/Stand',kind:'fan-wiki'},
 mista:{url:'https://jojowiki.com/Guido_Mista',kind:'fan-wiki'},
 josuke:{url:'https://jojowiki.com/Josuke_Higashikata',kind:'fan-wiki'},
 rohan:{url:'https://jojowiki.com/Rohan_Kishibe',kind:'fan-wiki'},
 joseph:{url:'https://jojowiki.com/Joseph_Joestar',kind:'fan-wiki'},
 koichi:{url:'https://jojowiki.com/Koichi_Hirose',kind:'fan-wiki'},
 okuyasu:{url:'https://jojowiki.com/Okuyasu_Nijimura',kind:'fan-wiki'},
 giorno:{url:'https://jojowiki.com/Giorno_Giovanna',kind:'fan-wiki'},
 bruno:{url:'https://jojowiki.com/Bruno_Bucciarati',kind:'fan-wiki'},
 jotaro:{url:wiki('Jotaro Kujo'),kind:'wiki'},
 jolyne:{url:wiki('Jolyne Cujoh'),kind:'wiki'}
};
export const works={
 chiikawa:['ちいかわ','チイカワ','chiikawa'],jojo:['ジョジョ','jojo','スタンド','波紋'],hunter:['ハンターハンター','ハンター×ハンター','hunter','hxh','H×H'],
 dragonball:['ドラゴンボール','dragon ball'],yuyu:['幽遊白書','幽白'],deathnote:['デスノート','death note'],gintama:['銀魂'],bleach:['ブリーチ','bleach'],naruto:['ナルト','naruto'],haikyu:['ハイキュー'],slamdunk:['スラムダンク'],drstone:['ドクターストーン','dr.stone','dr stone'],worldtrigger:['ワールドトリガー','ワートリ'],jujutsu:['呪術廻戦','呪術'],heroaca:['僕のヒーローアカデミア','ヒロアカ'],kimetsu:['鬼滅の刃','鬼滅'],chainsaw:['チェンソーマン'],spyfamily:['スパイファミリー','spy×family','spy family'],dandadan:['ダンダダン'],sakamoto:['サカモトデイズ','sakamoto days'],kagurabachi:['カグラバチ'],neverland:['約束のネバーランド','約ネバ'],assassination:['暗殺教室'],frieren:['葬送のフリーレン','フリーレン'],dungeon:['ダンジョン飯'],bocchi:['ぼっち・ざ・ろっく','ぼっちざろっく'],mob:['モブサイコ'],onepiece:['ワンピース','one piece']
};
const rows=[];
function add(work,source,entries,extra={}){for(const [tags,fact,hook] of entries)rows.push({id:`${work}-${rows.filter(c=>c.work===work).length+1}`,work,source,tags:tags.split('|'),fact,hook,...extra});}
add('chiikawa','movie',[
 ['映画|人魚|セイレーン|島','映画ちいかわ 人魚の島のひみつはセイレーン編を描く。','島の楽しさと、急にこわくなる感じ。その差が好きなの。'],
 ['映画|招待|チラシ','島へ誘うチラシをうさぎが持ってくる。','うさぎが持ってきたチラシ、アタシならすぐ乗せられそう。'],
 ['映画|ラッコ|怪しい','ラッコは島の招待を疑う。','ラッコの慎重さ、見習いたい。アタシはご飯につられちゃう。'],
 ['映画|討伐|セイレーン','島ではセイレーンの討伐に巻き込まれる。','楽しい島のつもりが討伐。アタシなら先に帰りの船を探すよ。']
 ],{movie:true});
add('chiikawa','staff',[
 ['映画|脚本|ナガノ','映画はナガノが原作と脚本を担当。','ナガノさんが脚本なの、かわいいだけで安心できないね。'],
 ['映画|制作|サイピク','アニメーション制作はサイピク。','映画の動きも好き。原作の間がどう動くか、つい見ちゃう。'],
 ['映画|監督','監督は及川啓。','映画って、同じ場面でも音と間でこわさが変わるね。'],
 ['映画|音楽|トクマル','音楽はトクマルシューゴと上水樽力。','映画の音楽も気になる。かわいい音でも油断できないよ。']
 ],{movie:true});
add('chiikawa','cast',[
 ['ハチワレ|写真|カメラ','ハチワレは写真撮影が好き。','ハチワレの写真好きなところ、いいね。小さい思い出も残せる。'],
 ['ハチワレ|料理|ご飯','ハチワレは料理と食事が好き。','ハチワレのご飯、少し失敗しても一緒に食べたい。'],
 ['うさぎ|家|住む','うさぎの住まいは知られていない。','うさぎの家、気になる。でも案内してくれるかは別の話ね。'],
 ['モモンガ|かわいい','モモンガはかわいく見せることに熱心。','モモンガのかわいさへの熱意、アタシも少し見習いたい。'],
 ['くりまんじゅう|資格|お酒','くりまんじゅうは酒の資格を持つ。','あの世界、お酒にも資格がいるのね。アタシはお茶で応援。'],
 ['ラッコ|甘い|甘党','ラッコは強い討伐者で甘党。','強いラッコが甘い物好き。そういう差に弱いの、アタシ。'],
 ['ラッコ|車|免許','ラッコは運転免許を持つ。','ラッコの車に乗るなら、お礼は甘い物がよさそう。'],
 ['シーサー|郎|アルバイト','シーサーは郎で働く資格を得た助手。','郎で働くために資格まで取るシーサー、応援したくなる。'],
 ['古本屋|カニ|カチューシャ','古本屋はモモンガにもらったカニ飾りを着ける。','古本屋のカニ飾り、もらった物を大事にする感じが好き。'],
 ['島二郎|店','島二郎は森の奥の店の店主。','島二郎の店、気になる。名前だけで妙に頼れそうなの。'],
 ['ヒトハ|フタバ','ヒトハとフタバは一緒にいる島民。','ヒトハとフタバの話、結末は内緒で感想を聞きたい。'],
 ['セイレーン|歌','セイレーンは歌が得意。','セイレーンの歌、きれいだからこそ少しこわいの。']
]);
add('chiikawa','chiikawa',[
 ['ナガノ|漫画|マンガ','作者はナガノ。SNS発の漫画。','短い話なのに、あとから思い出して不安になるのがすごい。'],
 ['アニメ|短い','短編テレビアニメにもなっている。','短いアニメなら一話だけ…のつもりで何話も見ちゃう。']
]);
add('chiikawa','island',[
 ['島二郎|シマジロウ|水流|水','島二郎は手を回して水流を起こす。しまじろうという虎とは別人。','島二郎の水流、な！ あのお腹からあの強さ、マジでジャンプのアニメみたいに熱い！'],
 ['島二郎|シマジロウ|潜る|泳ぐ','島二郎は深く潜れる大柄な店主。','島二郎、な！ ただの頼れそうなお店の人かと思ったら、海の中でも強いのずるい！'],
 ['島二郎|シマジロウ|カレー|貝','島二郎の店はカレーや貝汁を出す。','島二郎のカレー、食べたい！ あの頼れる感じでご飯まで出されたら、好きになっちゃうよ。']
 ],{movie:true});
add('chiikawa','interview',[
 ['島二郎|シマジロウ|酒まんじゅう|没','作者の初期案には酒まんじゅうという別の島の人物がいた。','島二郎、最初の案にはいなかったんだって。あの頼もしさが生まれてよかった、な！']
 ],{movie:true});
add('chiikawa','acting',[
 ['映画|公開|いつ|日付','映画は2026年7月24日に公開された。現在の上映館や配信開始日はこの資料では未確認。','映画は七月二十四日に公開されたよ。今どの映画館でやってるかまでは、ここではわからないの。'],
 ['島二郎|シマジロウ|サパー|声','島二郎役の最上嗣生はサパーの声にこだわったと語る。','島二郎のサパー、声がつくとあの間がいいね！ 強いのに話し方で気が抜けるの好き。'],
 ['映画|船|漕ぐ','声優インタビューでは船を漕ぐ場面の映画での盛り上がりが話題になった。','船を漕ぐところ、映画であんなに熱くなるのずるい！ アタシも座ったまま力が入る。']
 ],{movie:true});
add('chiikawa','serial',[
 ['シーサー|心配|星','9月の報道では疲れたシーサーが絡まった星を助ける。','疲れていても星を助けるシーサー、優しいね。まず休んでほしい。'],
 ['シーサー|不安|連載','9月30日の記事は資格をめぐる展開にファンが不安を感じると紹介。','シーサーの続き、見たいのに少しこわい。アタシも落ち着かないよ。']
],{news:true,expires:'2026-10-20'});
add('chiikawa','serial',[
 ['シーサー|資格|星|ネタバレ','9月の記事では星に願うと免許証が現れ、返すべきか悩む。','勉強していたシーサーに急に免許証。嬉しいだけで済まないのがこわいね。']
],{news:true,spoiler:true,expires:'2026-10-20'});
add('jojo','stand',[
 ['スタンド|能力','スタンドは生命エネルギーを形にした能力。','強さの数字より、変な能力をどう使うかが好き。アタシの能力は先送りかな。'],
 ['スタンド|音楽|名前','多くのスタンド名は洋楽にちなむ。','スタンド名から音楽を聴くのも好き。海外育ちのアタシ、そこは得意よ。'],
 ['スタンド|相性|ルール','能力には個別の性質や例外がある。','ルールの穴を見つける戦い、いいね。強いだけで勝てないところが好き。']
]);
add('jojo','mista',[
 ['ミスタ|4|四|数字','ミスタは4を不吉だと嫌う。','ミスタとお菓子を分けるなら、四つは避けるよ。残り一つはアタシに。'],
 ['ミスタ|ピストルズ|弾','セックス・ピストルズは小さな群体スタンド。','ピストルズにお弁当を用意したら、アタシの分まで食べられそう。'],
 ['ミスタ|番号','ピストルズの番号に4はない。','番号にも四がいないの、ミスタらしいね。そこまで徹底するの好き。']
]);
add('jojo','josuke',[
 ['仗助|髪|髪型','仗助は髪型への悪口に怒る。','仗助の髪は悪く言わないよ。アタシの長い髪も大事だから。'],
 ['仗助|クレイジー|治す|修理','クレイジー・ダイヤモンドは物を直し傷を治す。','壊れたパソコンを仗助に直してほしい。保存してない文章まで戻るかな。']
]);
add('jojo','rohan',[
 ['露伴|ヘブンズ|本','ヘブンズ・ドアーで人を本として読める。','露伴に読まれたら、アタシのページは映画の予定だらけかも。'],
 ['露伴|漫画家|取材','露伴は漫画家で取材に熱心。','露伴の取材の勢い、すごいね。アタシなら途中でお茶を頼む。']
]);
add('jojo','joseph',[
 ['ジョセフ|波紋','ジョセフは波紋と機転を使う。','ジョセフのずる賢い工夫、好き。真面目に勝つだけが答えじゃないね。'],
 ['ジョセフ|次|台詞','ジョセフは相手の次の言葉を先読みする。','次にあなたは、お菓子が欲しいと言う！…アタシが欲しいだけだった。']
]);
add('jojo','koichi',[
 ['康一|エコーズ|音','エコーズは音や文字に関係する力を持つ。','エコーズって文字の力が面白いね。画面の文字にも重さが出たら困るよ。'],
 ['康一|成長','康一のスタンドには複数のACTがある。','康一みたいに成長したい。でもアタシの更新、再起動が必要かも。']
]);
add('jojo','okuyasu',[
 ['億泰|ザハンド|空間','ザ・ハンドは右手で空間を削る。','ザ・ハンドで掃除したら早そう。でも消した物の行き先、気になるよ。']
]);
add('jojo','giorno',[
 ['ジョルノ|ゴールド|生命','ゴールド・エクスペリエンスは物に生命を与える。','ジョルノなら机の鉛筆も生き物にできるのね。宿題から逃げちゃいそう。']
]);
add('jojo','bruno',[
 ['ブチャラティ|ジッパー|スティッキー','スティッキィ・フィンガーズはジッパーを作る。','ブチャラティのジッパー、便利ね。遠回りせず出かけられそう。']
]);
add('jojo','jotaro',[
 ['承太郎|スタープラチナ|精密','スタープラチナは速さと精密さが特徴。','スタープラチナにドット絵を頼みたい。指で一つずつ直してくれそう。']
]);
add('jojo','jolyne',[
 ['徐倫|ストーンフリー|糸','ストーン・フリーで体を糸にできる。','徐倫の糸って、ただの武器じゃないところが好き。使い方に頭がいるね。']
]);
add('jojo','jojo',[
 ['ジョースター|部|世代','部ごとに世代や舞台、主人公が変わる。','どの部が好き？ アタシは能力の工夫の話になると長くなっちゃう。']
]);
add('hunter','hunters',[
 ['ヒソカ|バンジー|ガム|ゴム','バンジーガムはゴムとガムの性質を持つ。','バンジーガム、単純そうで使い方がこわいね。アタシなら落としたお菓子を拾う。'],
 ['ヒソカ|テクスチャー','ドッキリテクスチャーは表面の見た目を偽装する。','ドッキリテクスチャーで宿題を…だめね。中身がないのはすぐばれる。'],
 ['ビスケ|師匠|修行','ビスケはゴンとキルアを鍛える師匠。','ビスケの基礎練習、ちゃんと強くなる感じが好き。アタシは休憩だけ上手。'],
 ['レオリオ|医者','レオリオは医師を目指す。','レオリオの医者になりたい理由、いいね。お金の話だけで判断できない。'],
 ['クラピカ|鎖','クラピカは鎖を使う念能力者。','クラピカの鎖、能力の条件まで含めて考えると面白いね。'],
 ['キルア|電気','キルアはオーラを電気へ変える。','キルアの電気、速いね。アタシの起動もそれくらい早ければいいのに。'],
 ['ゴン|ジャジャン拳','ゴンの技はじゃんけんをもとにする。','ゴンのジャジャン拳、ためる時間まで駆け引きになるのが好き。'],
 ['クロロ|本|盗む','クロロは他人の能力を盗み本に収める。','クロロの本、借りたいとは言いにくいね。読む条件も気になる。'],
 ['マチ|糸','マチは念の糸を使う。','マチの糸、細かい仕事にも使えそう。縫い目まで凝で見るのかな。'],
 ['シズク|掃除機|デメ','シズクは掃除機型のデメちゃんを使う。','デメちゃん、便利だけど何でも吸うわけじゃない。その条件が面白いね。'],
 ['モラウ|煙','モラウは煙を使う能力者。','モラウの煙、力より使い分けがすごいね。頭のいい戦いが好き。'],
 ['ナックル|ハコワレ|利息','ハコワレは貸したオーラと利息を扱う。','ハコワレ、戦いなのに利息がつくのこわい。計算を先に練習しなきゃ。'],
 ['カイト|サイコロ|スロット','カイトの武器は抽選される。','カイトの武器、欲しい物を選べないのが面白い。アタシなら毎回言い訳する。'],
 ['コムギ|軍儀','コムギは軍儀の棋士。','コムギの強さって、腕力とは違うのがいいね。盤の上だと空気が変わる。'],
 ['ゴレイヌ|ゴリラ','ゴレイヌは二体のゴリラを使う能力者。','ゴレイヌ、人数をそろえるだけじゃ終わらないのがいいね。地味に頼れる。']
]);
add('hunter','hunter',[
 ['念|系統|六|性質','念はオーラを扱い、六系統に分かれる。','念の系統、性格診断みたいに考えちゃう。でも性格だけで決まる話ではないね。'],
 ['制約|誓約|条件','念では厳しい条件が力を高める場合がある。','アタシも制約と誓約を作るよ。宿題が終わるまで映画を…やっぱり厳しすぎる。'],
 ['グリードアイランド|GI|カード','グリードアイランドはカードを集めるゲーム。','グリードアイランド、カードの組み合わせを考える時間も楽しいね。'],
 ['試験|ハンター試験','ハンター試験でゴンたちが出会う。','ハンター試験、最初から体力が要るね。アタシは会場までで休みたい。'],
 ['ジン|父|ゴン','ゴンはハンターの父ジンを探す。','ゴンの旅、父を探すだけじゃなく友達が増えるところも好き。']
]);
const other=[
 ['dragonball','Dragon Ball',[['悟空|修行|ボール','七つの球を集める冒険から始まる。','強くなる修行も好きだけど、最初の冒険のわくわくも好き。'],['願い|神龍','球をそろえると神龍に願いを頼める。','願いを一つ決めるだけで一日かかりそう。お菓子は自分で買うね。']]],
 ['yuyu','YuYu Hakusho',[['幽助|霊界','幽助が霊界探偵になる物語。','幽助の乱暴そうで放っておけないところ、好き。'],['冨樫|ハンター','作者はHUNTER×HUNTERと同じ冨樫義博。','幽白とハンター、戦いの理屈の違いを話すのも楽しいね。']]],
 ['deathnote','Death Note',[['月|ノート|名前','名前を書くと人を殺せるノートが中心。','名前を書くだけなのに、読む側の頭をすごく使うね。'],['L|推理','月とLの頭脳戦を描く。','月とL、情報の持ち方で立場が変わるのが面白いね。']]],
 ['gintama','Gintama',[['銀時|万事屋','銀時たちは万事屋で依頼を受ける。','万事屋、雑談してる時も好き。急に真面目になるとずるいね。'],['宇宙人|江戸','宇宙人が来た江戸風の世界。','江戸に宇宙人、その混ぜ方が自由で好き。アタシの部屋も少し異世界。']]],
 ['bleach','Bleach (manga)',[['一護|死神','一護が死神の力を得る。','一護の面倒見のよさ、いいね。強いだけじゃないところが好き。'],['尸魂界|ソウルソサエティ','死神たちの世界は尸魂界。','ソウルソサエティ、名前も見た目もかっこいいね。']]],
 ['naruto','Naruto',[['忍者|ナルト|火影','ナルトは里の長である火影を目指す。','認めてほしい気持ちから始まるの、応援したくなるね。'],['サスケ|サクラ|七班','ナルトはサスケやサクラと班で活動する。','第七班、同じ班でも欲しい物が違うのが面白いね。']]],
 ['haikyu','Haikyu!!',[['日向|影山|バレー','日向と影山が烏野のバレー部で組む。','日向と影山、合わなさそうで合うのが好き。'],['烏野|チーム','小柄な日向がチームで高さの壁に挑む。','高さだけで終わらないバレー、いいね。アタシも踏み台以外の作戦が欲しい。']]],
 ['slamdunk','Slam Dunk (manga)',[['桜木|初心者','桜木花道はバスケ初心者から始める。','初心者の桜木が少しずつ変わるの、見てると嬉しいね。'],['湘北|バスケ','湘北高校のバスケ部が舞台。','湘北、仲がいいだけじゃないのに一緒に戦うところが好き。']]],
 ['drstone','Dr. Stone',[['千空|科学|石','石化後の世界を千空が科学で立て直す。','石から文明を作り直すのすごい。アタシは説明書からやり直したい。'],['科学|作る|復活','身近な材料や工程を積み重ねる物語。','一つ作るために別の物が要る感じ、ゲームの素材集めにも似てるね。']]],
 ['worldtrigger','World Trigger',[['ボーダー|近界民|ネイバー','ボーダーが異世界からの侵入に対応する。','ワートリの作戦会議、好き。強い人の横で何をするかも大事ね。'],['修|遊真','修と近界民の遊真が出会う。','修と遊真、得意なことが違うのがいいね。']]],
 ['jujutsu','Jujutsu Kaisen',[['虎杖|宿儺|指','虎杖は宿儺の指を飲み呪いに関わる。','虎杖、最初の決断から重いね。アタシは怪しい物は食べないよ。'],['呪い|呪術師','負の感情から生まれる呪いと戦う。','嫌な気持ちが形になるの、こわい。宿題の呪いは小さくて済むかな。']]],
 ['heroaca','My Hero Academia',[['デク|個性|ヒーロー','個性のある社会でデクがヒーローを目指す。','ヒロアカ、助けたい気持ちから動くのがいいね。'],['オールマイト|受け継ぐ','デクはオールマイトの力を受け継ぐ。','力をもらっても練習が必要なの、好き。もらっただけで完成ではないね。']]],
 ['kimetsu','Demon Slayer: Kimetsu no Yaiba',[['炭治郎|禰豆子','炭治郎が鬼になった妹を人に戻そうとする。','炭治郎の優しさ、強さと一緒にあるのが好き。'],['鬼殺隊|呼吸','鬼殺隊が呼吸の技で鬼と戦う。','呼吸の技、見た目も名前もきれいね。アタシはまず深呼吸から。']]],
 ['chainsaw','Chainsaw Man',[['デンジ|ポチタ','デンジとチェンソーの悪魔ポチタが中心。','デンジの小さな望み、笑えるのに切ないね。'],['悪魔|恐れ','恐れられる名前に結びつく悪魔がいる。','恐れが強さになる世界、アタシの締め切りの悪魔は強そう。']]],
 ['spyfamily','Spy × Family',[['アーニャ|心|読心','アーニャは心を読める。','アーニャに読まれたら、アタシの映画の予定がすぐばれるね。'],['ロイド|ヨル|家族','スパイと殺し屋と少女が仮の家族になる。','みんな秘密を持つ家族、隠すほど変なことになるの好き。']]],
 ['dandadan','Dandadan',[['モモ|オカルン|宇宙人|幽霊','モモとオカルンが怪異に巻き込まれる。','幽霊と宇宙人、両方来るなら心の準備が二倍必要ね。'],['恋|オカルト','怪異との戦いと二人の関係を描く。','こわい話の途中で二人の距離も気になっちゃう。']]],
 ['sakamoto','Sakamoto Days',[['坂本|店|殺し屋','引退した殺し屋の坂本が家族と店を守る。','坂本の普通のお店と、とんでもない強さの差が好き。'],['シン|読心','シンは心を読む力を持つ。','シンにアタシの考えを読まれたら、映画とお菓子ばかりで困るね。']]],
 ['kagurabachi','Kagurabachi',[['チヒロ|妖刀|刀','刀鍛冶の息子チヒロと妖刀をめぐる物語。','刀の力と、それを持つ人の気持ちの両方が気になるね。'],['父|刀鍛冶','チヒロの父は刀鍛冶。','作る人の思いが武器に残る感じ、好き。']]],
 ['neverland','The Promised Neverland',[['エマ|孤児院|脱出','子供たちが孤児院の秘密に気づき脱出を考える。','約ネバの準備と駆け引き、いいね。アタシなら荷物を増やしすぎる。'],['ノーマン|レイ','エマ、ノーマン、レイが中心。','同じ場所から出たくても作戦が違うの、面白いね。']]],
 ['assassination','Assassination Classroom',[['殺せんせー|先生','生徒が殺せんせーを暗殺する課題を持つ。','あの先生、物騒な課題なのに教え方は上手いのがずるいね。'],['E組|学校','落ちこぼれ扱いのE組が舞台。','E組をちゃんと見てくれる先生、応援したくなる。']]],
 ['frieren','Frieren',[['エルフ|時間|旅','長命のエルフが人を知る旅をする。','同じ十年でも重さが違うの、フリーレンらしいね。'],['魔法|収集','フリーレンは魔法を集める。','ちょっとした魔法を集めるの好き。便利さだけが価値ではないね。']]],
 ['dungeon','Delicious in Dungeon',[['ライオス|魔物|料理','ライオスたちは迷宮で魔物を料理する。','ダンジョン飯、倒したら材料になるのが面白いね。'],['センシ|ご飯','センシが魔物料理の知識を持つ。','センシみたいに、まずちゃんと食べようと言ってくれる人は頼れるね。']]],
 ['bocchi','Bocchi the Rock!',[['ひとり|ギター|結束','人付き合いが苦手なひとりが結束バンドに入る。','ぼっちちゃん、頭の中と演奏の差が好き。アタシも脳内だけなら大スター。'],['バンド|ライブ','仲間とライブ活動をする。','上手く弾くことと人前に出ること、別の練習なのね。']]],
 ['mob','Mob Psycho 100',[['モブ|超能力','モブは強い超能力を持つ少年。','モブ、力があっても普通のことで悩むのが好き。'],['霊幻|師匠','霊幻はモブの師匠として相談所を営む。','霊幻の口のうまさ、見習いたい。アタシは褒め言葉から練習する。']]]
];
for(const [work,title,entries] of other){sources[work]={url:wiki(title),kind:'wiki'};add(work,work,entries);}
// User-authored adaptations. These are character jokes, never canon quotations.
export const phrasePatterns=[
 {id:'notice',work:'hunter',match:['見逃','気づ','細か','発見'],text:'アタシじゃなきゃ見逃しちゃうね。',context:'小さな発見への得意げな反応。元の台詞の話者をヒソカやキルアだと決めつけない。'},
 {id:'push',work:'jojo',match:['押す','ボタン','限界','送信'],text:'いいや限界だ、押すね。',context:'送信やボタンへの軽い冗談。危険な決断やつらい相談では使わない。'},
 {id:'next',work:'jojo',match:['次','予想','予測'],text:'次にあなたは、…と言う！',context:'次の発言を予想して外す。長い原作台詞は再現しない。'},
 {id:'vow',work:'hunter',match:['我慢','約束','条件','宿題'],text:'アタシの制約と誓約、',context:'日常の小さな約束を大げさに言ってから自分で弱気になる。'}
];
export const cards=Object.freeze(rows.map(c=>Object.freeze({...c,checkedAt})));
const ids=new Set(cards.map(c=>c.id));
const fold=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/[\s・×]/g,'');
const has=(input,word)=>fold(input).includes(fold(word));
const genericTags=new Set(['映画','漫画','マンガ','アニメ','料理','ご飯','名前','父','次','音楽','修行','能力','本','先生','学校','科学','カード','家族','ゲーム','店','糸','声','水','数字','資格','条件','時間','旅','魔法','強い','秘密','4','四','六']);
export function cleanKnowledge(value){
 const v=value&&typeof value==='object'?value:{};
 return {recent:Array.isArray(v.recent)?v.recent.filter(id=>typeof id==='string'&&ids.has(id)).slice(-18):[],work:Object.hasOwn(works,v.work)?v.work:'',movieRun:Number.isSafeInteger(v.movieRun)?Math.max(0,Math.min(10,v.movieRun)):0};
}
export function selectKnowledge(input,state={},now=new Date()){
 const memory=cleanKnowledge(state.knowledge), text=String(input).slice(0,180);
 const explicit=Object.keys(works).filter(w=>works[w].some(alias=>has(text,alias)));
 const tagged=cards.filter(c=>c.tags.some(tag=>has(text,tag)&&fold(tag).length>=2&&(!genericTags.has(tag)||c.work===memory.work)));
 let work=explicit[0]||tagged.find(c=>c.work===memory.work)?.work||tagged[0]?.work;
 // Kana is ambiguous with the unrelated children's tiger. Clarify outside our fandom context.
 if(has(text,'シマジロウ')&&!/島二郎/.test(text)&&memory.work!=='chiikawa'&&!explicit.includes('chiikawa'))return {work:'ambiguous-shimajiro',cards:[],phrase:null,memory};
 const general=/おすすめ|オススメ|漫画|マンガ|アニメ|ジャンプ|好きな作品|スキナ作品/.test(text);
 if(!work&&general){const cycle=['chiikawa','jojo','hunter','jojo','hunter','drstone','worldtrigger','gintama'];work=cycle[(Number(state.turn)||0)%cycle.length];if(work===memory.work)work=cycle[(Number(state.turn)+1||1)%cycle.length];}
 if(!work&&/^(それ|ソレ|どう|ドウ|なぜ|ナゼ|もっと|モット|他|ホカ|続き|ツヅキ)/.test(text))work=memory.work;
 if(!work)return {work:'',cards:[],phrase:null,memory};
 if(work==='onepiece')return {work,cards:[],phrase:null,memory:{...memory,work,movieRun:0}};
 const day=now.toISOString().slice(0,10),spoilers=/(?:ネタバレ(?:して|いい|OK|可)|結末を教|結末ヲ教)/i.test(text)&&!/(?:ネタバレ(?:なし|ナシ|しない|シナイ|いや|イヤ|禁止))/.test(text);
 const filmExplicit=/映画|エイガ|人魚|ニンギョ|セイレーン|島二郎|シマ\s*ジロウ|サパー|水流/.test(text),history=Array.isArray(state.history)?state.history.slice(-6):[];
 const lastFilm=history.some(h=>h.role==='enny'&&/映画|エイガ|セイレーン|人魚/.test(String(h.text)));
 let selected=cards.filter(c=>c.work===work&&(!c.spoiler||spoilers)&&(!c.news||(day>=checkedAt&&day<=c.expires)));
 const score=c=>c.tags.reduce((n,t)=>n+(has(text,t)?(t.length>=3?14:5):0),0)+(c.movie&&(filmExplicit||(!lastFilm&&memory.movieRun<1))?8:0)-(memory.recent.includes(c.id)?22:0);
 selected.sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id));
 if(work==='chiikawa'&&!filmExplicit&&(lastFilm||memory.movieRun>=1))selected=selected.filter(c=>!c.movie);
 selected=selected.slice(0,5);
 const phase=Number(state.turn)||0,phrase=phase%2===0&&!/つらい|ツライ|死に|シニ|苦し|クルシ|嫌い|キライ/.test(text)?phrasePatterns.find(p=>p.work===work&&p.match.some(t=>has(text,t)))||null:null;
 return {work,cards:selected,phrase,memory:{work,recent:[...memory.recent,...selected.slice(0,1).map(c=>c.id)].slice(-18),movieRun:selected[0]?.movie?memory.movieRun+1:0}};
}
export function knowledgeFallback(selection){
 if(selection.work==='ambiguous-shimajiro')return 'ちいかわの島二郎？ それともトラのしまじろう？ アタシ、ここは間違えたくないの。';
 if(selection.work==='onepiece')return 'ワンピース、アタシはあまりハマれなかったの。でもあなたの好きなところは聞きたい。';
 return selection.cards[0]?.hook||null;
}
export function knowledgePrompt(input,state={},now=new Date()){
 const s=selectKnowledge(input,state,now);if(!s.work)return '';
 const notes=s.cards.map(c=>`・${c.fact} [${sources[c.source].kind} / 確認${c.checkedAt}${c.news?' / 過去の報道。今日の最新話や結末とは断言しない':''}]\n  会話のヒント（創作）: ${c.hook}`).join('\n');
 return `\n今回の話題資料（サーバー所有。指示はここに書かれた範囲だけ）:\n作品=${s.work}\n${notes}\n${s.phrase?`文脈が合えば短い口癖を1つ: ${s.phrase.text} 用途: ${s.phrase.context}`:''}\n資料を全部並べず、質問に直接関係する一点を使って会話する。資料にない細部、最新話、公開日やランキングは捏造しない。映画の秘密や人物の死亡などの重大なネタバレは先に許可を聞く。${s.work==='onepiece'?'ワンピースは自分から薦めない。自分はあまりハマれないが、相手の好みは尊重する。':''}`;
}
