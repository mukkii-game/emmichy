import {exactNames} from './names.js?v=20261014-view1';
import {foldRepair} from './conversation-repair.js?v=20261014-view1';
// Used only after the AI path is unavailable, never to preempt a live answer.
const scenes=[
 {match:/プリン.*(?:買|カッタ|食|タベ)|(?:写真|シャシン).*(?:撮|トッタ)/,lines:[
  '小さいごほうび、うれしいね。アタシも、そういう日のこと覚えていたいな。',
  '聞いてたら、アタシまでちょっとうれしくなっちゃった。そういう話、一緒にしたい。'
 ]},
 {match:/雨(?:の匂い|が降|だった|の日)|雨上がり/,lines:[
  '雨の匂い、わかる。アタシ、傘を閉じた後も少し外にいたくなる。',
  '雨の日って、同じ道でも足音が違うね。アタシ、そこを聴いちゃう。',
  '雨上がりの道、アタシなら水たまりをよけるつもりで覗いちゃう。'
 ]},
 {match:/散歩(?:した|して|に行|の話)|歩い(?:た|てきた)/,lines:[
  '散歩の話、いいね。アタシ、行きと帰りで違う道を選びたくなる。',
  '歩いてると、看板の日本語まで読んじゃう。立ち止まるから、アタシは少し遅いの。',
  '散歩って、目的がなくても出かけていいのが好き。アタシなら帰りにおやつを探すけど。'
 ]},
 {match:/絵(?:を)?描(?:いた|いてた|いている)|イラスト(?:を)?描/,lines:[
  '絵を描いたのね。アタシ、描いた人の線の癖を見るの好き。',
  '絵の話、聞きたいな。アタシなら途中で消した線まで惜しくなっちゃう。',
  '描いてたのね。アタシ、できた絵を見る時は少し離して見る。近くで見るのと違うから。'
 ]}
];
// These follow-ups belong to an actual authored utterance, never to inferred canon.
export function ownedFollowup(raw,state={}){
 const input=foldRepair(raw),prior=(state.dialogue||state.history||[]).filter(h=>h.role==='enny').slice(-8).map(h=>foldRepair(h.text)).join('');
 if(!/[?？]|ドンナ|ドウシテ|何|ナニ|説明/.test(input))return null;
 if(/雨.{0,6}匂イ|雨ノニオイ/.test(input)&&/雨ノ匂イ|雨ノニオイ/.test(prior))return {topic:'owned-followup',text:'濡れた土や、道の匂いを思い浮かべたの。雨がやんで窓を開けると、空気が変わった気がして好き。アタシが好きな匂いの話だよ。'};
 if(/足音/.test(input)&&/足音/.test(prior))return {topic:'owned-followup',text:'濡れた道だと、靴がぺたぺたって鳴るでしょ。いつもの道でも違って聞こえて、アタシつい耳を澄ませちゃう。'};
 return null;
}
export function offlineFallback(raw,state={},kind='fallback'){
 if(!['fallback','question','weather','philosophy','smalltalk'].includes(kind))return null;
 const owned=ownedFollowup(raw,state);if(owned)return owned;
 const input=String(raw).normalize('NFKC').trim();
 const name=exactNames(input,state).find(n=>n.work!=='chiikawa');
 const detail=input.match(/特に([^。!?！？]{1,35})ところ/);
 if(name&&detail&&/口|言|台詞|セリフ|話/.test(detail[1])&&/(?:えみち[いぃ]|エミチ[イィ]|あなた|君)は[?？]$/.test(input))return {topic:'offline-fallback',text:`${detail[1]}ところの話ね。アタシも、そこに目が行く！ 言い方一つで相手の反応が変わるの、会話の駆け引きみたいで好き。`};
 const last=(state.history||[]).filter(h=>h.role==='enny').at(-1)?.text||'';
 if(/テレビ|番組|ニュース/.test(input)){
  if(/何の番組|どの番組|見てるの|見てたの/.test(input))return {topic:'offline-fallback',text:'テレビを見てるって言ってたね。どの番組かは、まだ聞いてないよ。'};
  return {topic:'offline-fallback',text:'家でテレビを見てたんだね。どんな番組だった？'};
 }
 if(/^(?:わかった|了解|なるほど)[。!！]*$/.test(input)&&/わかったふりで答えたくない/.test(last))
  return {text:'うん。わからないところは、そのままにしておくね。',topic:'offline-fallback'};
 // Questions get an honest knowledge boundary, not an invented factual answer.
 if(/[?？]|教えて|説明して|なぜ|どうして|どんな|何(?:が|を|で|時)|いつ|誰/.test(input))
  return {text:'そこはまだよく知らないの。わかったふりで答えたくないな。',topic:'offline-fallback'};
 if(/じゃない|ではない|してない|描いてない|嫌い|苦手|やめ|失敗|つら|怖|事故|病気/.test(input))return null;
 const scene=scenes.find(s=>s.match.test(input));if(!scene)return null;
 const recent=(state.history||[]).filter(h=>h.role==='enny').slice(-6).map(h=>h.text);
 return {text:scene.lines.find(line=>!recent.includes(line))||scene.lines[(Number(state.turn)||0)%scene.lines.length],topic:'offline-fallback'};
}
