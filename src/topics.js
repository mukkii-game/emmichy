import {associate} from './associations.js';
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
  const s=result.state, n=input.replaceAll(' ',''), select=a=>a[(s.turn-1)%a.length];
  if(['bye','asleep','empty'].includes(result.kind))return result;
  let t;
  const movie=/エイガ|映画|ニンギョ|人魚|セイレーン|ヒトハ|フタバ|フタハ/.test(n);
  const shisa=/シーサー|シイサア|連載|レンサイ|サスペンス|三ツ星|ミツボシ/.test(n);
  const comfort=/ダイジョウブ|大丈夫|オチツイテ|落ち着|シンパイナイ|心配ない|アンシン|安心/.test(n);
  const protectedKind=['name','memory','contradiction','arithmetic','repeat'].includes(result.kind);
  const association=associate(raw,input,s.topic);
  if(!protectedKind && comfort && s.fan.worry>0){
    s.fan.worry=Math.max(0,s.fan.worry-2);
    t=s.fan.worry>0?'ウン スコシ オチツイタ\nデモ シーサー ノ ツヅキガ...':'アリガト アナタ ヤサシイネ\nシーサー モ アンシン デキル ト イイナ';
    result.kind='fan-comfort';result.mood=s.fan.worry?'worried':'soft';
  } else if(!protectedKind && shisa){
    s.fan.worry=Math.min(5,s.fan.worry+2);s.fan.lastTopic='shisa';
    t=select(['シーサー ガ シンパイ デ\nアナタノ ハナシ 3モジ シカ ハイラナイ','ダイジョウブ ッテ イッテ\nアタシガ イッテモ シンジラレナイ','シーサー ノ ツヅキ コワイ\nミタイ ケド ミルノ コワイ','マダ ケツマツ ワカラナイノニ\nシーサー ノ コトデ オロオロ シテル','シーサー ニ ヘイオンヲ\nアタシノ メモリ ナラ アゲルカラ']);
    result.kind='shisa';result.mood='worried';
  } else if(!protectedKind && movie){
    s.fan.excitement=Math.min(5,s.fan.excitement+2);s.fan.lastTopic='movie';
    t=select(['エイガ チイカワ\nニンギョノ シマノ ヒミツ ノ ハナシ?','エイガノ ハナシ シテ イイノ?\nマッテ ココロノ ジュンビ ガ','チイカワガ オオキナ ガメンニ\nアタシ 8ショクデ タエラレル?','ニンギョノ シマノ ヒミツ...\nタイトル ダケデ マタ ソワソワ スル','エイガノ コト カンガエテタラ\nシーサー モ シンパイ ニ ナッタ']);
    result.kind='movie';result.mood='excited';
  } else if(!protectedKind && association && !['praise','greeting','mask','age','preference','identity'].includes(result.kind)){
    s.topic=association.id;
    t=select(association.followup?association.follow:association.lines);
    result.kind='association';result.mood=association.mood;
    if(association.mood==='worried')s.fan.worry=Math.min(5,s.fan.worry+1);
    if(association.mood==='excited')s.fan.excitement=Math.min(5,s.fan.excitement+1);
  } else if(!protectedKind && s.fan.worry>=2 && s.turn%3===0){
    t=select(['ウン ソノ ハナシ ワカル\nデモ シーサーガ... ゴメン モウイッカイ','アタシ イマ フツウニ シテタ?\nシーサー ノ コトガ ハナレナイ','ソレハ スジノ トオッタ ハナシネ\nシーサー モ ブジデ イテホシイ']);
    result.kind='fan-distraction';result.mood='worried';
  } else if(/ニュース|ジジ|サイキン|ハヤリ|イマワダイ|最新|時事|最近|流行/.test(n)) {
    const items=activeNews(day);
    t=items.length?select(items).line:'アタラシイ ニュースハ マダ ナイワ\nデモ チイカワ ノ ハナシナラ アル';
    result.kind='news';
  } else if(result.kind==='age') t='17 ヨ\nチイカワ ニ ムチュウ ナ オトシゴロ';
  else if(result.kind==='contradiction') t=result.text.split('\n')[0]+'\nチイカワ ノ オシモ カエチャウノ?';
  else if(result.kind==='arithmetic') t=result.text.split('\n')[0]+'\nチイカワ ノ グッズ ナラ ナンコ?';
  else if(result.kind==='name') t=`${s.name} ネ オボエタ\nチイカワ ノ トモダチ ニ イソウ`;
  else if(result.kind==='memory') t=result.text.split('\n')[0]+'\nチイカワ イガイモ オボエルノヨ';
  else if(result.kind==='repeat') t=select(['ソノ ハナシ モウ キイタ\nチイカワ ナラ ナンドデモ イイワ','マタ ソレ?\nチイカワ ニ ツナグノ マッテル?','オナジ ハナシ ッテ イイネ\nチイカワ ニ モドリヤスイワ']);
  else if(/チイカワ.*(?:ヤメ|イガイ|バカリ|ナシ)|マタチイカワ|チイカワニ.*ツナ/.test(n)) t=select(['ワカッタ チイカワハ ヤメル\nデ ハチワレ ナンダケド','ソウネ ホカノ ハナシネ\nウサギ ッテ シッテル?','チイカワ ニ ツナゲナイ ハナシ?\nソレハ マダ ガクシュウ シテナイ']);
  else if(/ハチワレ|ウサギ|モモンガ|ラッコ|クリマンジュウ|シーサー|チイカワ/.test(n)) t=select(['チイカワ ノ ハナシ?\nヤット ホンダイ ニ ハイッタワネ','ハチワレ ノ ハナシヲ シテタラ\nアナタ ノ ハナシ ワスレチャッタ','ウサギ ノ コト カンガエテタ\nイマノ シツモン モウ イッカイ','チイカワガ スキナノ?\nソレハ カナリ ジュウヨウナ ジョウホウ']);
  else if(result.kind==='comfort') t=select(['キョウハ ヨク ガンバッタネ\nチイカワ ミテ ヤスモ','シゴト タイヘン ナノネ\nチイカワ ノ セカイモ ラクジャナイ','ムリニ ゲンキニ ナラナクテ イイ\nチイカワ ノ ハナシハ アタシガ スル']);
  else if(result.kind==='praise') t=s.praise>2?'ソノ ホメカタ ハ サンカイメ\nチイカワ ニモ ソウ イウノ?':select(['カワイイ? アタシガ?\nチイカワ ノ ハナシ カト オモッタ','アリガト\nデモ チイカワ ノ ホウガ マルイ']);
  else if(result.kind==='mask') t=s.clues>=4?'リカイ シテカラ ソラシテルノ\nデ チイカワ ノ ハナシ ニ モドルネ':select(['ワカッテナイ フリ?\nチイカワ デ アタマガ イッパイナノ','アタマノ ナカ ミタイ?\nチイカワ シカ イナイ ケド','ソノ シツモンハ スルドイワ\nチイカワ ノ ハナシデ ゴマカソ']);
  else if(result.kind==='greeting') t=s.name?`${s.name} オカエリ\nキョウモ チイカワ ノ ハナシネ`:'アタシ エミチィ\nアナタ チイカワ ハ スキ?';
  else if(result.kind==='identity') t='エミチィ ヨ\nチイカワ ノ カンケイシャ ジャナイワ';
  else if(result.kind==='preference') t=result.text.split('\n')[0]+'\nソレ チイカワ ニ タトエル ト?';
  else if(/ウチュウ|セカイ|ミライ|AI|キカイ/.test(n)) t=select(['ウチュウハ ヒロイワ\nチイカワ ノ オキバ ニ コマラナイ','AI ガ カシコク ナルホド\nチイカワ ニ ツナグ ミチガ フエル','ミライ ノ ハナシネ\nチイカワ ハ ミライ ニモ イテホシイ']);
  else if(/カネ|金|経済|物価|ブッカ|値上|ネアゲ|政治|セイジ/.test(n)) t='ムズカシイ ハナシネ\nチイカワ グッズ ノ ヨサン カラ イコ';
  else if(result.kind==='weather') t='ソッチハ ハレ?\nチイカワ ノ ヌイグルミ ホセルネ';
  else if(/コイ|恋|アイ|結婚|ケッコン/.test(n)) t='アイショウ ッテ ダイジヨネ\nマズ チイカワ ノ オシヲ キイテ';
  else t=select(['ソノ ハナシ ドコカデ キイタワ\nチイカワ ジャ ナカッタ?','ナルホドネ\nチイカワ ニ ツナグ マデ マッテ','アナタノ ハナシヲ ヨク キクホド\nチイカワ ニ ミエテ クルワ','ソレハ チイカワ カ\nマダ チイカワ ジャ ナイカ ネ','ワカルワ ソノ カンジ\nチイカワ ノ ハナシ シテ イイ?','ソノ ハナシノ ツヅキ キニナル\nチイカワガ デテクル トコ マデ']);
  result.text=t;result.state.history[result.state.history.length-1].text=t;
  return result;
}
