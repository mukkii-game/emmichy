// One grounded move per authored reply. No new persistent memory.
export const MOVES=Object.freeze(['SELF_CORRECT','NOTICE_WORDING','LIGHT_TEASE','SHARED_FRAME','SMALL_SELF_DISCLOSURE']);
export function conversationMove(input,state={}){
 const raw=String(input||'').normalize('NFKC').trim();
 const history=Array.isArray(state.history)?state.history:[];
 const lastUser=history.filter(h=>h.role==='user').at(-1)?.text||'';
 const lastReply=history.filter(h=>h.role==='enny').at(-1)?.text||'';
 const prior=history.filter(h=>h.role==='enny').map(h=>h.text);
 const serious=/疲れ|つかれ|ミス|失敗|つら|苦し|病気|相談|怖|いじめ|悲し/.test(raw);
 const answer=(move,text)=>prior.includes(text)?null:{move,text,topic:'conversation-move'};
 if(/[?？]|教えて|聞かせて/.test(lastReply)&&/知らない|詳しくない|わからない|質問ばかり|質問ばっかり|聞かないで/.test(raw))
  return answer('SELF_CORRECT','ア、今の聞き方、答えることを増やしちゃったね。引っ込める。');
 if(serious){
  if(/[?？]|なぜ|どうして|教えて/.test(raw))return null;
  const word=raw.match(/「([^「」\n]{1,16})」/)?.[1]||raw.match(/仕事|ミス|失敗|疲れ|病気|相談/)?.[0];
  return word?answer('NOTICE_WORDING',`「${word}」のところ、軽く流したくないな。`):null;
 }
 // Questions, denials and corrections need their own answer, not a joke.
 if(/[?？]|なぜ|どうして|教えて|違う|じゃない|やめて|忘れてない|忘れなかった/.test(raw))return null;
 if(/^(うん|そう|へえ)[。！!…]*$/.test(raw)){
  const word=lastUser.match(/([\p{Script=Katakana}ー]{2,12})/u)?.[1];
  return word?answer('NOTICE_WORDING',word==='プリン'&&/食べた/.test(lastUser)?'「うん」で終わるプリン、かなり満足度が高いやつだ。':`「${raw.replace(/[。！!…]/g,'')}」で終わる${word}。短いのに、ちょっと伝わる。`):null;
 }
 const forgotten=raw.match(/(スプーン|傘|かさ|鍵|財布|チケット|弁当)(?:を|ヲ)?.*(?:忘れ|わすれ)/)?.[1];
 if(forgotten){
  if(/お留守番|即位初日|流派/.test(lastReply))return null;
  const king=state.conversation?.entries?.some(e=>e.id==='half-price-king');
  if(king&&forgotten==='スプーン')return answer('SHARED_FRAME','王、即位初日に装備品を忘れてる。');
  return answer('LIGHT_TEASE',`${forgotten}だけ、お留守番になっちゃった。`);
 }
 const named=raw.match(/「([^「」\n]{1,16})」(?:と|って)(?:呼ぶ|呼んでる|名付けた)/)?.[1];
 if(named)return answer('NOTICE_WORDING',`「${named}」。その呼び方で、急に輪郭が見えた。`);
 const learned=raw.match(/「([^「」\n]{1,16})」(?:は|って)(?:.*)(?:意味|言葉)/)?.[1];
 if(learned)return answer('SMALL_SELF_DISCLOSURE',`「${learned}」、アタシの日本語に一つ増えた。使う時、ちょっと張り切りそう。`);
 return null;
}
