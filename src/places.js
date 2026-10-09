// Names selected from JNTO's destination index, checked 2026-10-09.
// Names are recognition data, not a claim that Emmichy has visited each place.
export const placeSource='https://www.japan.travel/en/destinations/';
const entries=`北海道|ホッカイドウ|Hokkaido
青森|アオモリ|Aomori
秋田|アキタ|Akita
岩手|イワテ|Iwate
山形|ヤマガタ|Yamagata
宮城|ミヤギ|Miyagi
福島|フクシマ|Fukushima
新潟|ニイガタ|Niigata
富山|トヤマ|Toyama
石川|イシカワ|Ishikawa
福井|フクイ|Fukui
長野|ナガノ|Nagano
東京|トウキョウ|Tokyo
神奈川|カナガワ|Kanagawa
千葉|チバ|Chiba
埼玉|サイタマ|Saitama
茨城|イバラキ|Ibaraki
栃木|トチギ|Tochigi
群馬|グンマ|Gunma
山梨|ヤマナシ|Yamanashi
静岡|シズオカ|Shizuoka
岐阜|ギフ|Gifu
愛知|アイチ|Aichi
三重|ミエ|Mie
京都|キョウト|Kyoto
大阪|オオサカ|Osaka
滋賀|シガ|Shiga
兵庫|ヒョウゴ|Hyogo
奈良|ナラ|Nara
和歌山|ワカヤマ|Wakayama
鳥取|トットリ|Tottori
島根|シマネ|Shimane
岡山|オカヤマ|Okayama
広島|ヒロシマ|Hiroshima
山口|ヤマグチ|Yamaguchi
徳島|トクシマ|Tokushima
香川|カガワ|Kagawa
愛媛|エヒメ|Ehime
高知|コウチ|Kochi
福岡|フクオカ|Fukuoka
佐賀|サガ|Saga
長崎|ナガサキ|Nagasaki
大分|オオイタ|Oita
熊本|クマモト|Kumamoto
宮崎|ミヤザキ|Miyazaki
鹿児島|カゴシマ|Kagoshima
沖縄|オキナワ|Okinawa
札幌|サッポロ|Sapporo
旭川|アサヒカワ|Asahikawa
函館|ハコダテ|Hakodate
釧路|クシロ|Kushiro
仙台|センダイ|Sendai
盛岡|モリオカ|Morioka
鶴岡|ツルオカ|Tsuruoka
金沢|カナザワ|Kanazawa
松本|マツモト|Matsumoto
横浜|ヨコハマ|Yokohama
宇都宮|ウツノミヤ|Utsunomiya
前橋|マエバシ|Maebashi
名古屋|ナゴヤ|Nagoya
富士吉田|フジヨシダ|Fujiyoshida
浜松|ハママツ|Hamamatsu
飛騨高山|ヒダタカヤマ|Hida Takayama
伊勢志摩|イセシマ|Iseshima
神戸|コウベ|Kobe
姫路|ヒメジ|Himeji
大津|オオツ|Otsu
倉敷|クラシキ|Kurashiki
松江|マツエ|Matsue
下関|シモノセキ|Shimonoseki
松山|マツヤマ|Matsuyama
高松|タカマツ|Takamatsu
別府|ベップ|Beppu
那覇|ナハ|Naha
石垣島|イシガキジマ|Ishigaki Island
宮古島|ミヤコジマ|Miyako Island
慶良間|ケラマ|Kerama
富士山|フジサン|Mt. Fuji
蔵王|ザオウ|Zao
屋久島|ヤクシマ|Yakushima
日本アルプス|ニホンアルプス|Japan Alps
十和田|トワダ|Towada
ニセコ|ニセコ|Niseko
みなかみ|ミナカミ|Minakami
熊野本宮|クマノホングウ|Hongu
木曽|キソ|Kiso
甲賀|コウカ|Koka
信楽|シガラキ|Shigaraki
銀座|ギンザ|Ginza
日本橋|ニホンバシ|Nihonbashi
瀬戸内|セトウチ|Setouchi
清里|キヨサト|Kiyosato
箱根|ハコネ|Hakone
六本木|ロッポンギ|Roppongi
由布院|ユフイン|Yufuin
諏訪|スワ|Suwa
銀山温泉|ギンザンオンセン|Ginzan Onsen
熊野古道|クマノコドウ|Kumano Kodo
庄内|ショウナイ|Shonai
四国カルスト|シコクカルスト|Shikoku Karst
隠岐|オキ|Oki
奄美大島|アマミオオシマ|Amami Oshima
佐渡|サド|Sado
草津|クサツ|Kusatsu
城崎|キノサキ|Kinosaki
八幡平|ハチマンタイ|Hachimantai
日光|ニッコウ|Nikko
近江八幡|オウミハチマン|Omihachiman
会津若松|アイヅワカマツ|Aizuwakamatsu
知床|シレトコ|Shiretoko
白神|シラカミ|Shirakami`;
export const placeNames=entries.split('\n').map((line,i)=>{
 const [name,reading,english]=line.split('|');
 return {id:`japan:${i}`,name,reading,work:'japan',aliases:[name,reading,english],source:placeSource,category:'place'};
});
placeNames.push({id:'japan:akihabara',name:'秋葉原',reading:'アキハバラ',work:'japan',aliases:['秋葉原','アキハバラ','アキバ','akihabara','akiba'],category:'place',source:'https://www.japan.travel/en/spot/2178/',fact:'秋葉原は東京の電気街で、アニメやゲームなどの店が集まる。'});
export function placeReply(match,raw,state={}){
 if(match?.work!=='japan'||/つらい|苦しい|病気|事故|亡く|死に|相談/.test(raw))return null;
 // Detailed questions remain for the LLM; the bank only offers a personal bridge.
 if(/[?？]|教えて|なぜ|どうして|どこ|何時|いくら|行き方|アクセス/.test(raw))return null;
 const hooks=['写真を見ると、次に日本へ行く時のこと考えちゃう。','そこも気になるの。行った人の話、聞きたいな。','地図で場所を探すの、けっこう好きなの。'];
 return {topic:'japan-place',id:match.id,text:match.name==='秋葉原'?'アニメとゲームのお店、見て回りたい！ 買う物を決めても、きっと迷っちゃう。':`そこ、気になる！ ${hooks[(Number(state.turn)||0)%hooks.length]}`};
}
export function placeDirection(match){
 return match?.work==='japan'?`日本の地名として知っている: ${match.name}。名前しか確認していない場所では詳しい観光案内を捏造しない。アニメ好きとして秋葉原は知っていて、電気街やアニメ・ゲームのお店に興味がある。本人は東京に家族旅行で5日間来ただけ。行った店や他都市への旅行経験は作らない。${match.fact||''} 出典: ${match.source}`:'';
}
