// Relations reference the owned factual cards. Cue -> relation is an authored
// association, never a claim that the cue itself appeared in the original.
import {cards,sources} from './fandom.js?v=20261014-view1';
import {reviewedChiikawa} from './chiikawa-reviewed.js?v=20261014-view1';
const fold=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
const cast='https://chiikawa.toho-movie.jp/atm/characters.html';
const rows=[
 ['chiikawa-2','うさぎ','持ってくる','島への招待状',['チラシ','広告','招待','旅行','無料'],'うさぎの勢いで誘われたら、アタシも荷物を用意しちゃいそう。'],
 ['chiikawa-3','ラッコ','疑う','島への招待',['怪しい','うますぎる話','慎重'],'ラッコが疑ってくれるの、頼もしい。アタシはご飯につられちゃう。'],
 ['chiikawa-4','ちいかわたち','巻き込まれる','セイレーン討伐',['島合宿','冒険','討伐'],'楽しい旅行と怖さの差で、アタシ落ち着かなくなるの。'],
 ['chiikawa-5','ナガノ','担当する','原作と映画脚本',['作者','脚本','ナガノ先生'],'作者の考えたことまで追いかけたくなるくらい、好きなんだ。'],
 ['chiikawa-6','サイピク','制作する','映画アニメーション',['アニメ制作','作画','サイピク'],'動きがつくと、アタシまで体が動いちゃう。'],
 ['chiikawa-7','及川啓','監督する','映画ちいかわ',['監督','及川'],'好きな映画の裏側にいる人も、覚えたくなるの。'],
 ['chiikawa-8','トクマルシューゴ','上水樽力と担当する','映画音楽',['音楽','曲','歌','トクマル','上水樽'],'音楽を聴くと、アタシの頭の中でもまた映画が始まるの。'],
 ['chiikawa-9','ハチワレ','好き','写真撮影',['写真','カメラ','思い出','記念','撮った'],'ハチワレの写真好きなところ、いいよね。小さい思い出も残したくなる。'],
 ['chiikawa-10','ハチワレ','好き','料理と食事',['料理','ご飯','食事','自炊','おかわり'],'ハチワレが料理してくれたら、おかわりする速さにだけは自信あるよ。'],
 ['chiikawa-11','うさぎ','未公開','住まい',['家','引っ越し','どこに住む'],'うさぎの家、知らないからこそ想像しちゃう。アタシの想像と本当は分けなきゃね。'],
 ['chiikawa-12','モモンガ','熱心','かわいく見せること',['かわいい','おねだり','お願い','可愛く'],'モモンガのかわいく見せる熱意、すごいよね。アタシまで姿勢を直しちゃう。'],
 ['chiikawa-13','くりまんじゅう','所持する','お酒の資格',['お酒','乾杯','おつまみ'],'アタシは十七歳だからお茶で乾杯。くりまんじゅうみたいな満足顔だけ、真似したい。'],
 ['chiikawa-14','ラッコ','好む','甘い物',['甘い','甘党','ケーキ','プリン','チョコ','スイーツ'],'強いラッコが甘党なの、好き。甘い物を一緒に選ぶところ、想像しちゃう。'],
 ['chiikawa-15','ラッコ','所持する','運転免許',['車','ドライブ','免許','運転'],'ラッコとドライブできたら、アタシは曲とおやつを選ぶ係になりたい。'],
 ['chiikawa-16','シーサー','資格を取り働く','郎',['勉強','試験','資格','努力','アルバイト','ラーメン'],'シーサーの頑張りを思うと、アタシも日本語のノート、もう一行書きたくなる。'],
 ['chiikawa-17','古本屋','モモンガから受け取る','カニの飾り',['プレゼント','贈り物','カチューシャ','飾り','手作り'],'もらった物を大事にする古本屋、好き。アタシも見るたび相手のことを思い出すの。'],
 ['chiikawa-18','島二郎','営む','森の奥の店',['森','お店','店主','島二郎'],'島二郎の頼れる感じ、好き。アタシならお店でも話しかけたくなる。'],
 ['chiikawa-19','ヒトハ','いつも一緒にいる','フタバ',['ヒトハ','フタバ','二人組','いつも一緒'],'いつも一緒の二人って、短い返事だけでも通じそう。アタシ、そういう近さ好き。'],
 ['chiikawa-20','セイレーン','得意','歌',['セイレーン','人魚','歌声'],'セイレーンの歌の話になると、かわいいだけでは落ち着けないの。'],
 ['chiikawa-23','島二郎','手を回して起こす','水流',['水流','泳ぐ','水の中'],'手を回して水流を起こす島二郎、頼もしい。アタシ、思い出すと力が入っちゃう。'],
 ['chiikawa-25','島二郎の店','出す','カツカレーと貝汁',['カツカレー','貝汁','フルーツパフェ','料理','メニュー','作る'],'アタシもお店でその二つを食べてみたい。パフェとは、お店の話を混ぜないようにするね。']
];
const newlyChecked=new Set(['chiikawa-2','chiikawa-3','chiikawa-4',...Array.from({length:12},(_,i)=>`chiikawa-${i+9}`)]);
export const chiikawaRelations=rows.map(([cardId,subject,predicate,object,cues,feeling])=>{
 const card=cards.find(c=>c.id===cardId);
 return {id:`relation:${cardId}`,cardId,subject,predicate,object,cues,feeling,
  fact:card.fact,source:sources[card.source].url,evidence:sources[card.source].kind,
  checkedAt:newlyChecked.has(cardId)?'2026-10-11':card.checkedAt,
  scope:card.movie?'film':'character',spoiler:card.spoiler?'plot':'intro',
  limits:cardId==='chiikawa-23'?['ちいかわたちが水流で遊ぶとは言わない','腹や口から噴く技ではない']:cardId==='chiikawa-25'?['フルーツパフェを島二郎が作ると結び付けない','店のメニューという確認範囲を守り、調理担当者や作り方を追加しない']:['資料から未確認の場面や台詞を足さない']};
});
chiikawaRelations.push(...reviewedChiikawa);
chiikawaRelations.push(
 {id:'relation:chiikawa-effort',subject:'ちいかわ',predicate:'性格',object:'不器用でも頑張る',cues:['ちいかわ本人','頑張る','こわい','緊張','不器用'],fact:'ちいかわは不器用ながら頑張る子で、驚いたり嫌なことがあると泣く。',feeling:'怖い時にも頑張るちいかわを見ると、アタシも応援したくなるの。',source:cast,evidence:'official',checkedAt:'2026-10-11',scope:'character',spoiler:'none',limits:['特定の未確認の成功や事件を作らない']},
 {id:'relation:hachi-friend',subject:'ハチワレ',predicate:'大好きな友達',object:'ちいかわ',cues:['友達','友情','仲良し'],fact:'ハチワレはちいかわの大切な友達。',feeling:'友達の話になると、ちいかわとハチワレを思い出しちゃう。あの近さ、いいよね。',source:cast,evidence:'official',checkedAt:'2026-10-11',scope:'character',spoiler:'none',limits:['友達のためにした未確認の行動を追加しない']},
 {id:'relation:hachi-treasure',subject:'ハチワレ',predicate:'大切に使う',object:'ひとつの物',cues:['大切','捨てられない','長く使う','修理','お気に入り'],fact:'ハチワレは同じ物を大切に使う。',feeling:'ハチワレが物を大事にするところ、好き。アタシもお気に入り、長く使いたい。',source:cast,evidence:'official',checkedAt:'2026-10-11',scope:'character',spoiler:'none',limits:['物の入手経緯や壊れた場面を作らない']},
 {id:'relation:siren-mermaids',subject:'セイレーン',predicate:'一緒に行動する',object:'人魚',cues:['人魚','セイレーン','一緒に行動'],fact:'セイレーンは人魚と行動を共にする。',feeling:'セイレーンと人魚の話、アタシすごく話したくなる。秘密のところは、見たか聞いてからね。',source:cast,evidence:'official',checkedAt:'2026-10-11',scope:'film',spoiler:'intro',limits:['島の秘密や結末をここから推測しない']}
);
const readings={'島二郎':'シマジロウ','古本屋':'フルホンヤ','及川啓':'オイカワケイ','ちいかわたち':'チイカワ','島二郎の店':'シマジロウ'};
export function relatedChiikawa(input,state={}, {limit=3,allowSpoilers=false}={}){
 const t=fold(input),focus=state.knowledge?.focus;
 const named=[...new Set(chiikawaRelations.map(r=>r.subject))].filter(s=>s!=='ちいかわ'&&s!=='ちいかわたち'&&(t.includes(fold(s))||s==='島二郎の店'&&t.includes('島二郎')||readings[s]&&t.includes(readings[s])));
 const onlyChiikawa=/チイカワ本人|チイカワノ(?:ドンナ|ドコ|好キナトコ|スキナトコ)/.test(t);
 const follows=state.knowledge?.work==='chiikawa'&&/^(ソウ|ソレ|ソノ|アノ|ウン|モット|続キ|ツヅキ|何デモナイ)/.test(t);
 return chiikawaRelations.filter(r=>allowSpoilers||r.spoiler!=='plot').map(r=>{
  const direct=named.includes(r.subject),cues=r.cues.filter(c=>t.includes(fold(c))&&(c!=='作る'||direct)),facets=cues.filter(c=>fold(c)!==fold(r.subject)&&fold(c)!==readings[r.subject]);
  const compatible=!named.length||direct;
  const score=!compatible||onlyChiikawa&&r.subject!=='ちいかわ'?-1:(facets.length*8)+(direct?12:0)+(focus&&follows&&r.cardId===focus?15:0)+(focus&&r.cardId===focus?2:0);
  return {...r,cueHits:cues,match:direct?'entity':cues.length?'association':'context',score};
 }).filter(r=>r.score>2).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,limit);
}
export const serialCoverage={checkedAt:'2026-10-11',currentVerified:false,referenceDate:'2026-09-30',referenceSource:'https://realsound.jp/book/2026/09/post-2537897.html',reason:'公式の漫画投稿の最新本文を取得できていない。アニメの更新や9月の報道を現在の漫画連載と混同しない。'};
export function asksCurrentSerial(input,state={}){
 const t=fold(input);
 return /最新|(?:最近|今|イマ|現在).{0,12}(?:連載|更新|展開|シーサー)/.test(t)&&(/チイカワ|シーサー|連載/.test(t)||state.knowledge?.work==='chiikawa')&&!/映画|エイガ|上映|アニメ/.test(t);
}
export function relationPrompt(input,state={}){
 if(asksCurrentSerial(input,state))return `\n最新連載の確認範囲: ${serialCoverage.checkedAt}時点で${serialCoverage.reason} 最近の結末は断言せず、ユーザーが説明した新情報はユーザーの話として受け止める。確認済みの好きな点や本人の心配な気持ちへつなぐ。`;
 const selected=relatedChiikawa(input,state,{limit:2});if(!selected.length)return '';
 return '\n今の発言に関係するちいかわ資料（確認済み事実と創作の連想を区別）:\n'+selected.map(r=>`・${r.subject} → ${r.predicate} → ${r.object}\n事実: ${r.fact} [${r.evidence}, ${r.checkedAt}, ${r.scope}, ${r.source}]\n本人の気持ちの例（創作）: ${r.feeling}\n境界: ${r.limits.join('。')}`).join('\n')+'\n語の近さや食べ物からの連想は「思い出しちゃう」でつなぎ、入力の物が原作に登場したとは言わない。全部並べず一つを深める。';
}
