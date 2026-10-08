// One grounded move per authored reply. No new persistent memory.
import {rejectedJoke} from './humor.js?v=20261008-humor1';
export const MOVES=Object.freeze(['SELF_CORRECT','NOTICE_WORDING','LIGHT_TEASE','SHARED_FRAME','SMALL_SELF_DISCLOSURE']);
export function conversationMove(input,state={}){
 const raw=String(input||'').normalize('NFKC').trim();
 if(rejectedJoke(raw))return {move:'SELF_CORRECT',text:'ウン。その呼び方は使わないね。',topic:'conversation-move'};
 const history=Array.isArray(state.history)?state.history:[];
 const lastReply=history.filter(h=>h.role==='enny').at(-1)?.text||'';
 const prior=history.filter(h=>h.role==='enny').map(h=>h.text);
 const serious=/疲れ|つかれ|ミス|失敗|つら|苦し|病気|相談|怖|いじめ|悲し/.test(raw);
 const answer=(move,text)=>prior.includes(text)?null:{move,text,topic:'conversation-move'};
 if(/[?？]|教えて|聞かせて/.test(lastReply)&&/知らない|詳しくない|わからない|質問ばかり|質問ばっかり|聞かないで/.test(raw))
  return answer('SELF_CORRECT','ア、今の聞き方、答えることを増やしちゃったね。引っ込める。');
 if(/質問ばかり|質問ばっかり|聞かないで/.test(raw))
  return answer('SELF_CORRECT','ウン。質問を続けないね。アタシからも話す。');
 if(serious){
  if(/[?？]|なぜ|どうして|教えて/.test(raw))return null;
  const word=raw.match(/「([^「」\n]{1,16})」/)?.[1]||raw.match(/仕事|ミス|失敗|疲れ|病気|相談/)?.[0];
  return word?answer('NOTICE_WORDING',`「${word}」のところ、軽く流したくないな。`):null;
 }
 if(/^(?:その呼び方|そのあだ名)(?:は)?(?:やめて|やめよう)[。！!]*$/.test(raw))
  return answer('SELF_CORRECT','ウン。その呼び方、やめるね。');
 if(/プリン.*半額|半額.*プリン/.test(raw)&&!/[?？]|じゃない|ではない/.test(raw))
  return answer('NOTICE_WORDING','半額のプリン。アタシなら一個の予定が二個になりそう。');
 // Questions, denials and corrections need their own answer, not a joke.
 if(/[?？]|なぜ|どうして|教えて|違う|じゃない|やめて|忘れてない|忘れなかった/.test(raw))return null;
 if(/^(うん|そう|まあ|まあね|へえ)[。！!…]*$/.test(raw)){
  // A short acknowledgement continues the nearest concrete topic, not a new interview.
  const topicUser=history.filter(h=>h.role==='user'&&!/^(うん|そう|まあ|まあね|へえ)[。！!…]*$/.test(String(h.text).trim())).at(-1)?.text||'';
  const context=[topicUser,lastReply].join(' ');
  const subdued=/^(まあ|まあね)/.test(raw);
  const choose=(move,lines)=>{
   const text=lines.find(t=>!prior.includes(t));
   return {move,text:text||'ウン。',topic:'conversation-move'};
  };
  if(/疲れ|つかれ|つら|困|ミス|失敗|病気|悲し/.test(topicUser))
   return choose('SMALL_SELF_DISCLOSURE',['ウン。アタシも、少しゆっくり話すね。','今は、短い返事のままでいいよ。']);
  const food=topicUser.match(/([\p{Script=Katakana}ー]{2,12})(?:を|は|が|、)?(?:食べ|飲ん)/u)?.[1];
  if(food)return choose('NOTICE_WORDING',subdued?
   [`${food}、話してたらアタシも食べたくなった。`,`${food}の話で、アタシだけお腹すいてる。`]:
   food==='プリン'?[ '「うん」で終わるプリン、かなり満足度が高いやつだ。','プリンの話、アタシまでスプーン持ちたくなった。']:
   [`${food}の話、アタシまでお腹すいてきた。`,`${food}、話だけ聞いて食べたくなるの、ちょっと悔しい。`]);
  if(/上履き|うわばき/.test(context))return choose('SMALL_SELF_DISCLOSURE',[
   '上履き。アタシ、靴箱で一回止まりそう。履き替える方、こっちね。',
   '上履きと外の靴。初日は靴箱にメモ貼りたい。']);
  const work=topicUser.match(/ジョジョ|刃牙|ちいかわ|アニメ|漫画/)?.[0];
  if(work)return choose('SMALL_SELF_DISCLOSURE',[
   `${work}の話、アタシは好きな場面になると手まで動いちゃう。`,
   `${work}の話だと、アタシ、声がちょっと大きくなる。`]);
  if(/パソコン.*買/.test(topicUser))return choose('NOTICE_WORDING',[
   '新しいパソコン、アタシなら最初に壁紙を選んじゃう。',
   'パソコンの箱を開けるところ、アタシも見たかった。']);
  return choose('NOTICE_WORDING',['ウン。','そっか。アタシは、もう少しここにいる。']);
 }
 const forgotten=raw.match(/(スプーン|傘|かさ|鍵|財布|チケット|弁当)(?:を|ヲ)?.*(?:忘れ|わすれ)/)?.[1];
 if(forgotten){
  if(/お留守番|即位初日|流派/.test(lastReply))return null;
  if(forgotten==='スプーン'&&state.conversation?.entries?.some(e=>e.id==='half-price-pudding'))return answer('SHARED_FRAME','プリンはあるのに、スプーンがないのね。');
  const safeTease=/(?:笑|ｗ|w|平気|予備がある|借りた|借りられ|代わりがある)/i.test(raw);
  if(!safeTease)return null;
  return answer('LIGHT_TEASE',`${forgotten}だけ、お留守番になっちゃった。`);
 }
 const named=raw.match(/「([^「」\n]{1,16})」(?:と|って)(?:呼ぶ|呼んでる|名付けた)/)?.[1];
 if(named&&/本|積読|タワー|積ん/.test(raw))return answer('NOTICE_WORDING',`「${named}」。アタシなら一番上から取らずに、下から抜いて崩す。`);
 if(/上履き|うわばき/.test(raw)&&/(?:学校|教室|履き替|靴)/.test(raw))
  return answer('SMALL_SELF_DISCLOSURE','上履き、教室専用なんだ。アタシなら初日にそのまま外へ出そう。');
 const learned=raw.match(/「([^「」\n]{1,16})」(?:は|って)(?:.*)(?:意味|言葉)/)?.[1];
 if(learned)return answer('SMALL_SELF_DISCLOSURE',`「${learned}」、アタシの日本語に一つ増えた。使う時、ちょっと張り切りそう。`);
 return null;
}
