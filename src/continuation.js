// One bounded reply, paced on screen. No new model requests while waiting.
const fold=s=>String(s).normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
const invitation=t=>/^(?:モット)?(?:ナニカ)?(?:ホカニ)?(?:キキタイコト|キキタイコトハ|シツモン)(?:アル|アルノ|アルカナ|アルカナァ|ハアル|ハアルノ)[?？。!！]*$/.test(fold(t));
const extensions=[
 {match:/島二郎|シマジロウ/,facet:/水流|スイリュウ/,lines:['普段はお店にいる人なのに、水の中でもあんなに頼れるの、ずるいよ。','アタシ、次にお店の場面を見ても、あの水流を思い出しちゃいそう。']},
 {match:/音楽|オンガク|ピアノ|ギター/,facet:/音楽|オンガク|ピアノ|ギター|曲|キョク|音|オト/,lines:['曲を聴いてると、気に入ったところだけまた聴きたくなるの。','アタシ、そこだけ小さく口ずさんじゃう。言葉がない曲でもね。']},
 {match:/プリン/,facet:/プリン/,lines:['プリンの話してたら、ひと口食べたくなっちゃった。','最後のひと口、ゆっくり食べたいのにすぐなくなるね。']},
 {match:/散歩|サンポ/,facet:/散歩|サンポ/,lines:['散歩って、小さいお店を見つけると少し寄り道したくなるの。','アタシなら、何のお店か看板を読むところで止まっちゃう。']}
];
export function planContinuation(text,input='',state={}){
 const sentences=String(text).trim().match(/[^。!?！？\n]+[。!?！？]*|[^\n]+/g)?.map(s=>s.trim()).filter(Boolean)||[];
 const hadInvitation=sentences.length>1&&invitation(sentences.at(-1));
 if(hadInvitation)sentences.pop();
 // Explicit model paragraphs win; otherwise keep complete sentences together.
 const paragraphs=String(text).split(/\n+/).map(s=>s.trim()).filter(Boolean);
 let parts=paragraphs.length>1&&!hadInvitation?paragraphs:sentences;
 if(paragraphs.length===1&&parts.length>1&&parts[0].length<14&&/^(?:.+、[なねよ]|ウン|うん|そっか|ソッカ|エッ|えっ)[!！。…]*$/.test(parts[0]))parts.splice(0,2,parts.slice(0,2).join(' '));
 if(parts.length>3)parts=[parts[0],parts[1],parts.slice(2).join(' ')];
 if(!parts.length)return {first:String(text),later:[]};
 const first=parts.shift(),later=[...parts];
 const history=(state.history||[]).filter(h=>h.role==='enny').map(h=>fold(h.text));
 if(!later.length&&!/つらい|苦しい|相談|病気|いじめ|嫌い|苦手|やめ|以外|違う|ちがう|知らない/.test(input)&&!/わから|分から|知らない|シラナイ|ワカラ|わかんない/.test(first)&&!/[?？]$/.test(first)){
  const topic=extensions.find(e=>e.match.test(fold(input))&&e.facet.test(fold(input))&&(e.match.test(fold(text))||e.facet.test(fold(text))));
  if(topic)later.push(...topic.lines.filter(line=>!history.includes(fold(line))&&fold(line)!==fold(first)));
 }
 if(hadInvitation&&later.length<3)later.push('あ、アタシばっかり話しちゃった。聞きたいこと、ある？');
 return {first,later:later.slice(0,3)};
}
export function createContinuation(){
 let queue=[],due=Infinity,typingAt=-Infinity,nextDelay=5000;
 return {
  start(lines,time,{firstDelay=4000,nextDelay:between=5000}={}){queue=[...lines];nextDelay=between;due=time+firstDelay;},
  clear(){queue=[];due=Infinity;typingAt=-Infinity;},
  typed(time){typingAt=time;due=Math.max(due,time+6000);},
  get pending(){return queue.length>0;},
  peek(time,{composing=false}={}){return !composing&&time>=due&&time-typingAt>=6000?queue[0]||null:null;},
  spoken(time){queue.shift();due=time+nextDelay;}
 };
}
