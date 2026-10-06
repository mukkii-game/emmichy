// User-requested short quote adaptations and original everyday punchlines.
// The mismatch is in choosing an expression, not in making Japanese unreadable.
export const gapPatterns=Object.freeze([
 {id:'shinjuku',match:/新宿|シンジュク/,text:'シンジュク、シンジュクゥッ！ 行きたい！ …今の、日本の駅の言い方として合ってる？',hint:'新宿へ行きたい気持ちがDIO風の音のパロディになる。駅名は新宿のまま。'},
 {id:'already',match:/宿題|掃除|片付け|タスク/,text:'コロスと決めたら、もうコロしてるべきよねェ。…宿題を終わらせる話よ！',hint:'プロシュート風の物騒な言葉を、先延ばししないという意味で無邪気に使う。実在の人へ向けない。'},
 {id:'lost',match:/負けた|負けちゃ|敗北|負けて|マケタ|マケチャ|ハイボク/,text:'アタシは勝っていた、勝っていたのに…！ お菓子を取りに行った間に負けたの！',hint:'リゾット風の悔しさを、小さなゲームの負けに大げさに使う。相手の深刻な失敗には使わない。'},
 {id:'admire',match:/かっこいい|カッコイイ|すごい技|スゴイワザ|神プレイ|上手すぎ/,text:'そこにシビれる、あこがれるぅ！ アタシもやる！ …まず操作を教えて？',hint:'男っぽい熱い歓声が元気よくそのまま出る。その後の無邪気さで見た目とのギャップを出す。'},
 {id:'notice',match:/見逃さ|細かいところ|細かい違い|隠しネタ/,text:'アタシじゃなきゃ見逃しちゃうね。…見つけたの、あなたなんだけどね！',hint:'ハンター由来の得意げな言い回しを借りて、発見者が自分ではないことに気づく。'},
 {id:'vow',match:/お菓子.*我慢|我慢.*お菓子|映画.*我慢/,text:'これがアタシの制約と誓約！ お菓子は一個だけ！ …大きさの条件は決めてないよ。',hint:'ハンターの能力の条件を小さな我慢に持ち込み、抜け道を見つける。'},
 {id:'courage',match:/明日から本気|明日からやる|アシタカラホンキ/,text:'アタシの覚悟を見て！ 明日から本気！ …今の、覚悟の使い方まちがえた？',hint:'少年漫画の熱い覚悟を先延ばしに使ってしまう。意味は一度でわかるようにする。'}
]);
const known=new Set(gapPatterns.map(p=>p.id));
export function cleanGap(value){const v=value&&typeof value==='object'?value:{};return {lastTurn:Number.isSafeInteger(v.lastTurn)?Math.max(-10,Math.min(100000,v.lastTurn)):-10,id:known.has(v.id)?v.id:'',seen:Array.isArray(v.seen)?[...new Set(v.seen.filter(id=>known.has(id)))].slice(-7):[]};}
export function selectGap(raw,state={}){
 const turn=Number.isSafeInteger(state.turn)?state.turn:0,old=cleanGap(state.gap),text=String(raw).normalize('NFKC').slice(0,180);
 // Contrast needs ordinary conversation between bursts. Never joke over a real grievance.
 if(turn<2||turn%4!==2||turn-old.lastTurn<4||/死に|殺し|殺す|ころす|自殺|つらい|苦しい|いじめ|暴力|怖い|こわい|嫌い|やめて|相談|失恋|事故|入院|病気|人が|上司|先生を|友達を|家族を/.test(text))return null;
 if(/[?？]|どうして|なぜ|教えて|説明|元ネタ|台詞|セリフ/.test(text))return null;
 const pattern=gapPatterns.find(p=>p.id!==old.id&&!old.seen.includes(p.id)&&p.match.test(text));
 if(!pattern)return null;
 const target=/掃除|片付け/.test(text)?'部屋を片付ける':/タスク/.test(text)?'やることを終わらせる':'宿題を終わらせる';
 const line=pattern.id==='already'?pattern.text.replace('宿題を終わらせる',target):pattern.text;
 return {...pattern,text:line,memory:{lastTurn:turn,id:pattern.id,seen:[...old.seen,pattern.id]}};
}
