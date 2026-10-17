import {exactNames} from './names.js?v=20261014-view1';
import {substantiveHistory} from './dialogue-history.js?v=20261014-view1';
const fold=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
// Conversational moves over an already established subject. These are authored
// personal views, never additional canon or a general semantic classifier.
const topics={
 exam:{focus:['exam:attempt','exam:result','exam:celebrate'],cues:/受カ|ウカ|合格|不合格|落チ|オチ|結果|喜|嬉|ウレシ|悔|クヤシ|友達|気持チ|キモチ|言イ|イイ|祝|オメデトウ/,
  angles:[
   {text:'アタシなら、まず「おめでとう」だけ言うかな。自分の結果の話は、そのあとでもいいし。',seen:/マズ「?オメデトウ|先ニ.{0,8}オ祝/},
   {text:'すぐ明るい顔になれなくても、一緒にいてほしいな。アタシなら、少し待ってくれるだけで助かる。',seen:/待ッテクレル|一緒ニイテホシイ/},
   {text:'嬉しい時も、悔しい時も、どっちかの役だけにならなくていいと思うの。アタシは、言葉にならない時間も大事にしたい。',seen:/言葉ニナラナイ時間/}
  ]},
 cookie:{focus:['exam:cookie'],cues:/クッキー|写真|シャシン|撮|トリ|トッ|食ベ|タベ|残|ノコ|眺メ|ナガメ|包装|ラッピング/,
  angles:[
   {text:'アタシなら、一枚撮ってから食べる！ 写真を見返す楽しみも、おやつの時間も、両方ほしいの。',seen:/(?:一枚|写真).{0,8}撮ッテカラ食ベ|両方ホシイ/},
   {text:'アタシなら、ココアも用意して、ゆっくりおやつにしたい。大事なお祝いなら、急いで食べるのはもったいないな。',seen:/ココアモ用意|急イデ食ベル/},
   {text:'アタシなら、包みも小さい箱に取っておきたい。お菓子がなくなっても、もらった時の嬉しさは残したいな。',seen:/包ミモ|小サイ箱ニ取ッテ/}
  ]},
 photo:{focus:['relation:chiikawa-9'],cues:/写真|シャシン|カメラ|撮|トリ|トッ|残|ノコ|思イ出|オモイデ/,
  angles:[
   {text:'アタシなら、上手に撮れた一枚だけじゃなくて、少しぶれた写真も残したい。一緒に笑った時間まで思い出せそう。',seen:/ブレタ写真/},
   {text:'撮るのに夢中で、目の前を見逃すのは惜しいな。アタシなら一枚撮ったら、カメラを置いて楽しみたい。',seen:/カメラヲ置イテ/}
  ]},
 food:{focus:['relation:chiikawa-10'],cues:/料理|リョウリ|作|ツク|食ベ|タベ|ご飯|ゴハン|一緒|イッショ/,
  angles:[
   {text:'アタシなら、食べる係だけじゃなくて、片付けも一緒にしたい。おいしかった、って伝えるところまで楽しみなの。',seen:/片付ケモ一緒/},
   {text:'一緒に作るなら、アタシはおやつを担当したいな。シナモンロールとココアなら、ずっと相談できちゃう。',seen:/オヤツヲ担当/}
  ]}
};
export function fanConversation(input,state={}){
 const memory=state.specialist||{},topic=Object.keys(topics).find(k=>topics[k].focus.includes(memory.focus));
 if(!topic||state.dialogueControl?.avoidFandom)return null;
 const t=fold(input);
 if(/別ノ話|他ノ話|ホカノ話|以外|イガイ|ヤメ|繰リ返|クリカエ|相談|病気|事故|亡ク|死ニ|ツライ|苦シ/.test(t))return null;
 const names=exactNames(input,{...state,knowledge:{...state.knowledge,work:'chiikawa'}});
 if(names.some(n=>n.work!=='chiikawa'||n.name!=='ちいかわ'&&!memory.subject?.includes(n.name)&&!(memory.scene==='examination'&&n.name==='ハチワレ')))return null;
 // An explicit fact question must retain its answer, not become a feeling.
 if(/何話|ナンワ|何級|ナンキュウ|点数|得点|誰ガ|ダレガ|ドコデ|イツ|ナゼ落|ドウシテ落|ナゼオチ|ドウシテオチ/.test(t)||topic==='cookie'&&/手作リ|テヅクリ|買ッタ|カッタ/.test(t)||/[?？]/.test(t)&&!/(?:ドウ思|ドウオモ|ナラ|ドウスル)/.test(t))return null;
 const own=/(?:エミチ[ィイ]|emmichy|アナタ|君)(?:ナラ|ハドウ)|(?:エミチ[ィイ]|emmichy).{0,5}ドウスル/i.test(t);
 const implicitView=!names.length&&/(?:シタイ|食ベタイ|タベタイ|残シタイ|ノコシタイ|撮リタイ|トリタイ|言イタイ|イイタイ)(?:ナ|ヨ|デス|ケド)?$/.test(t);
 const view=implicitView||/(?:私|僕|俺|ワタシ|ボク|オレ|自分).{0,60}(?:思ウ|オモウ|派|言|イウ|シタイ|シタク|好キ|スキ|食ベ|残|撮)|(?:イイヨネ|イイナ|言イタイ|イイタイ)|派(?:ダ|デス)?$/.test(t);
 if(!own&&!(view&&topics[topic].cues.test(t)))return null;
 const stance=topic==='cookie'?( /食ベ(?:ズ|ナイ)|タベ(?:ズ|ナイ)/.test(t)?'keep':/写真|シャシン|撮|トリ/.test(t)?/スグ食ベ|スグタベ/.test(t)?'eat':'photo':/食ベ|タベ/.test(t)?'eat':''):
  topic==='exam'?/言イヅラ|イイヅラ|言イニク|イイニク/.test(t)?'hesitate':/オメデトウ|祝/.test(t)?'celebrate':'':topic;
 return {topic,kind:own?'ask-personal':'player-view',stance};
}
export function fanConversationReply(input,state={}){
 const move=fanConversation(input,state);if(!move)return null;
 const heard=substantiveHistory(state).filter(h=>h.role==='enny').map(h=>fold(h.text)).join(' ');
 const angle=topics[move.topic].angles.find(a=>!heard.includes(fold(a.text))&&!a.seen.test(heard));
 const acknowledgment=move.kind==='ask-personal'?'':move.stance==='hesitate'?'言いづらくなるんだね。':move.stance==='celebrate'?'まず、おめでとうって伝えたいんだね。':move.stance==='keep'?'食べずに写真で残したいんだね。':move.stance==='photo'?'写真で残したい派なんだね。':move.stance==='eat'?'食べて楽しみたい派なんだね。':'うん、あなたの見方も聞けて嬉しい。';
 return {subject:`fan-conversation:${move.topic}`,text:(acknowledgment+' '+(angle?.text||'アタシ、いまのあなたの見方を考えてる。')).trim(),move};
}
