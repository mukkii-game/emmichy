// Used only after the AI path is unavailable, never to preempt a live answer.
const scenes=[
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
export function offlineFallback(raw,state={},kind='fallback'){
 if(!['fallback','question','weather','philosophy','smalltalk'].includes(kind))return null;
 const input=String(raw).normalize('NFKC').trim();
 const last=(state.history||[]).filter(h=>h.role==='enny').at(-1)?.text||'';
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
