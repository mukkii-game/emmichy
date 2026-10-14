import {specialistFacts} from './specialist.js?v=20261014-dialogue1';
import {attributionRepair} from './chiikawa-attribution.js?v=20261014-dialogue1';
import {rejectedJoke} from './humor.js?v=20261014-dialogue1';
import {dialogueSentences} from './dialogue-sentences.js?v=20261014-dialogue1';
export const SPECIALIST_MARKER='専門会話の根拠（サーバー所有資料だけ）: ';
const facts=new Map(specialistFacts.map(r=>[r.id,r]));
const fold=s=>String(s).normalize('NFKC').replace(/[\s。!?！？、]/g,'');
export const specialistReplyFormat=`
通信の返答形式（専門会話の時だけ）: JSONだけを返す。画面にはJSONでなく、下記の短文が順に表示される。
{"beats":[{"fact":"今回の根拠ID"},{"say":"アタシ自身の感想"},{"ask":"必要なら同じ話題の質問？"}]}
2〜4拍。factは今回の根拠IDを最大1個、不要なら0個。事実の文はゲームが根拠から出すので、自分で書き直さない。sayには感想・自分の気持ち・明示した想像だけを書く。原作の新しい出来事や台詞、本人の未設定の経歴をsayで追加しない。askは必要な時だけ最大1個、答えやすい質問にする。既出の説明を繰り返さず、理由や感想への質問にはsayで答える。合計180文字以内になる短さで。`;

export function readSpecialistEvidence(messages=[]){
 const line=messages.find(m=>m.role==='system')?.content?.split('\n').find(s=>s.startsWith(SPECIALIST_MARKER));
 if(!line)return null;
 try{const data=JSON.parse(line.slice(SPECIALIST_MARKER.length));return Array.isArray(data.evidence)?data:null;}catch{return null;}
}

// A model chooses the fact and writes personal reactions. It cannot manufacture
// a new canonical statement by placing arbitrary text in a fact beat.
export function renderSpecialistReply(value,{messages=[]}={}){
 const envelope=readSpecialistEvidence(messages);
 if(!envelope||typeof value!=='string'||!/^\s*(?:\{|```)/.test(value))return undefined;
 if(value.length>4000)return null;
 let plan;try{plan=JSON.parse(value.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));}catch{return null;}
 if(!Array.isArray(plan.beats)||plan.beats.length<1||plan.beats.length>4)return null;
 // Some providers combine the three allowed fields in a single beat. Accept
 // that equivalent shape, but never arbitrary fact text or extra fields.
 const beats=[];
 for(const beat of plan.beats){
  if(!beat||typeof beat!=='object'||Array.isArray(beat)||!Object.keys(beat).length||Object.keys(beat).some(k=>!['fact','say','ask'].includes(k)))return null;
  for(const key of ['fact','say','ask']){
   if(!Object.hasOwn(beat,key)||beat[key]===null||beat[key]==='')continue;
   beats.push({[key]:beat[key]});
  }
 }
 if(!beats.length||beats.length>5)return null;
 const allowed=new Map(envelope.evidence.filter(r=>facts.has(r.id)).map(r=>[r.id,r]));
 const input=messages.filter(m=>m.role==='user').at(-1)?.content||'';
 const askingFact=/何|ナニ|誰|ダレ|何話|何級|名前|ナマエ|曲名|キョクメイ|メニュー|結果|合否|もう一度|モウイチド|もう一回/.test(input)&&!/どうして|なぜ|ドウシテ|ナゼ|どこが好き/.test(input);
 const parts=[],used=new Set();let asks=0,says=0,generated=0;
 for(const beat of beats){
  if(!beat||typeof beat!=='object'||Array.isArray(beat)||Object.keys(beat).length!==1)return null;
  if(Object.hasOwn(beat,'fact')){
   const entry=allowed.get(beat.fact);if(!entry||used.size)return null;
   if(entry.said&&!askingFact)continue;
   parts.push(facts.get(beat.fact).spoken);used.add(beat.fact);continue;
  }
  const question=Object.hasOwn(beat,'ask'),key=question?'ask':'say',text=beat[key];
  if(typeof text!=='string'||!text.trim()||text.length>100||rejectedJoke(text))return null;
  if(question&&(!/[?？]$/.test(text)||++asks>1)||!question&&++says>3)return null;
  if(question&&/次の|次ノ|次.{0,4}挑戦|別の|ほかの|他の/.test(text))continue;
  // Concrete story assertions belong to a fact beat. Pure feelings and explicit
  // self-imagination remain free prose; unsupported fragments are omitted.
  const accepted=dialogueSentences(text).filter(sentence=>{
  const imagined=/もし|だったら|してくれたら|アタシの想像/.test(sentence);
  const text=sentence;
  const wrongResult=/ハチワレ(?:は|が|だけ)[^、。！？!?]{0,16}(?:不合格|落第|落ち)|ちいかわ(?:は|が|だけ)[^、。！？!?]{0,16}(?<!不)合格(?:した|できた)|ちいかわ(?:は|が|だけ)[^、。！？!?]{0,16}受かった/.test(text);
  const inference=!question&&allowed.has('exam:result')&&!wrongResult&&/思う|感じる|かもしれ|だろう|かな/.test(text)&&!/言っ|叫|作っ|渡|戦|遊|食べ|飲ん|歌っ|持っ|撮っ|顔|表情|「/.test(text);
  const action=/(?:ちいかわ|ハチワレ|うさぎ|モモンガ|島二郎|シーサー|ラッコ|くりまんじゅう|ヒトハ|フタバ|古本屋)(?:たち|だけ)?(?:が|は).{0,45}(?:言っ|叫|作っ|渡し|渡す|合格|不合格|落ち|落第|戦っ|遊ん|助け|食べ|飲ん|歌っ|持っ|撮っ)/.test(text);
  const personalReference=/アタシ|私/.test(text)&&/好き|思|感じ|気持ち|胸|嬉|うれし|不安|悲し|気にな/.test(text)&&!action;
  const depicted=/(?:ちいかわ|ハチワレ|うさぎ|モモンガ|島二郎|シーサー)の.{0,20}(?:がっかり|泣いて|怒った|笑った|困った).{0,8}(?:顔|表情|姿)/.test(text);
  const story=/原作で|公式で/.test(text)||action||depicted||!question&&/場面|シーン|エピソード/.test(text)&&!personalReference;
  const quoted=/「[^」]+」.{0,12}(?:言|叫|セリフ|台詞)/.test(text)&&!/(?:アタシ|私)(?:も|が|は)?[、\s]*「/.test(text);
  return !wrongResult&&!attributionRepair(text)&&(imagined||inference||!story&&!quoted);
  }).map(sentence=>/思う|感じる|かもしれ|だろう/.test(sentence)&&!/アタシ|私/.test(sentence)?'アタシの見方だけど、'+sentence:sentence).join(' ');
  if(!accepted||parts.some(p=>fold(p)===fold(accepted)))continue;
  parts.push(accepted.trim());generated++;
 }
 const text=parts.join(' ');
 if(!text||text.length<8||text.length>180)return null;
 return {text,source:used.size?(generated?'mixed':'authored'):'llm',reason:'specialist-plan'};
}
