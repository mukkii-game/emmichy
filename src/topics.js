// Hand-checked editorial snapshot. Never describes expired items as today's news.
export const checkedAt='2026-10-04';
export const fanContext={
  snapshot:'2026-10-04',
  movie:{title:'映画ちいかわ 人魚の島のひみつ',source:'https://chiikawa.toho-movie.jp/index.html'},
  serial:{topic:'シーサーが心配でハラハラする',provenance:'2026-10-04のユーザー指定。連載の結末・詳細は断定しない。Emmichy個人の感情として扱う。'}
};
export const news=[
  {id:'revival',from:'2026-10-02',until:'2026-10-31',title:'10月2日からリバイバル放送・ちいかわチャンス',source:'https://www.anime-chiikawa.jp/',fact:'2026年10月2日からリバイバル放送、新企画ちいかわチャンス。',line:'10/2 カラ チイカワ リバイバル\nアタシノ アイヅチモ サイホウソウ'},
  {id:'phone',from:'2026-08-26',until:'2026-10-30',title:'ちいかわフォンすまーと・10月31日発売予定',source:'https://toy.bandai.co.jp/ja/series/chiikawa/',fact:'ちいかわフォンすまーとは2026年10月31日発売予定。',line:'10/31 チイカワフォン ヨテイ\nアタシモ スマート ニ ナリタイ'},
  {id:'waffle',from:'2026-09-15',until:'2026-10-15',title:'ちいかわ わっふれ～む3・9月15日発売',source:'https://www.bandai.co.jp/candy/products/2026/4570117931277000.html',fact:'ちいかわ わっふれ～む3は2026年9月15日発売。一部を除くファミリーマートのチルドスイーツ売場。',line:'9/15 チイカワ ワッフル ダッテ\nアタシノ アタマモ アマイノ'}
];
export function activeNews(day=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'})){return news.filter(n=>n.from<=day&&day<=n.until);}
export function chiikawaReply(input,result,day,raw=input) {
 const s=result.state,n=input.replaceAll(' ',''),pick=a=>a[(s.turn-1)%a.length];
 if(['bye','asleep','empty','name','memory','arithmetic','contradiction','repeat'].includes(result.kind))return result;
 let t;
 const fan=/チイカワ|CHIIKAWA|ハチワレ|シーサー|モモンガ|ラッコ|クリマンジュウ/.test(n);
 if(s.turn===1&&!fan){
  t=/シラナイ|知らない|ナニソレ/.test(n)?'チイサイ コ タチ ノ オハナシ。アタシ ダイスキ！ アナタハ ナニ ガ スキ？':
   /キライ|苦手|イヤ/.test(n)?'ソッカ。ムリニ ススメナイヨ。アナタ ノ スキナ ハナシ シヨ。':
   /シッテル|知ってる|スキ/.test(n)?'シッテルノ！ アタシ ハ マンガモ アニメモ スキ。アナタ ノ オシハ？':undefined;
 }
 if(/チイカワ.*(?:イガイ|ヤメ|バカリ)|マタチイカワ/.test(n))t='ウン、ホカノ ハナシ シヨ。サイキン ナニ デ アソンデル？';
 else if(/シーサー/.test(n)){
  s.fan.worry=Math.min(5,s.fan.worry+2);s.fan.lastTopic='shisa';result.kind='shisa';result.mood='worried';
  t='シーサー ノ ツヅキ ガ シンパイ…。ミタイノニ ミルノ コワイ。アナタモ？';
 }else if(fan&&/映画|エイガ|人魚|ニンギョ/.test(n)){
  s.fan.excitement=Math.min(5,s.fan.excitement+2);s.fan.lastTopic='movie';result.kind='movie';result.mood='excited';
  t='エイガ チイカワ、ニンギョノ シマノ ヒミツ！ アノ オオキイ ガメン、マタ ミタイ。';
 }else if(/ダイジョウブ|大丈夫|オチツイテ/.test(n)&&s.fan.worry){
  s.fan.worry=Math.max(0,s.fan.worry-2);result.mood='soft';t='アリガト。スコシ オチツイタ。アナタ ノ ハナシモ キカセテ。';
 }else if(fan&&!t)t=pick(['アタシ ハ マンガノ チョット コワイ トコモ スキ。アナタハ？','ハナシテ イイノ？ アタシ、コノ ハナシハ ナガイヨ。']);
 else if(/仕事|残業|シゴト|ツカレ|疲れ|サミシ/.test(n))t=pick(['タイヘン ダッタネ。ヒト ガ タリナイノ？ ソレトモ シゴト ガ オオイ？','ヤスムノモ ムズカシイ ヒ ガ アルヨネ。キョウハ ハナシ キクヨ。']);
 else if(/試験|資格|勉強|シケン|ベンキョウ/.test(n)){s.topic='study';t='ベンキョウ シテモ フアン ナノ、ワカル。アタシモ ニホンゴノ テストハ ドキドキ。';}
 else if(/旅行|リョコウ|海/.test(n)){s.topic='travel';t='イイネ！ アタシハ シラナイ マチノ オミセ ミタイ。ドコニ イキタイ？';}
 else if(/ゲーム|アニメ|マンガ/.test(n)){s.topic='culture';t='アタシモ スキ！ サイキン ナニニ ハマッテル？ スキナ トコ キキタイ。';}
 else if(/ドウシテ|もっと|モット/.test(n)&&s.topic==='study')t='マチガウノ ヨリ、ガンバッタノニ デキナイノガ コワイノ。アナタハ ドウ？';
 if(t){result.text=t;s.history.at(-1).text=t;}
 return result;
}
