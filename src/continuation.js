// One bounded reply, paced on screen. No new model requests while waiting.
const fold=s=>String(s).normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
const invitation=t=>/^(?:モット)?(?:ナニカ)?(?:ホカニ)?(?:キキタイコト|キキタイコトハ|シツモン)(?:アル|アルノ|アルカナ|アルカナァ|ハアル|ハアルノ)[?？。!！]*$/.test(fold(t));
// Boundaries inside a quoted line or a proper name are not breath points.
function boundaries(text){
 const cuts=[],stack=[],pairs={'「':'」','『':'』','（':'）','(':')','“':'”','"':'"'};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(stack.at(-1)===c){stack.pop();continue;}
  if(pairs[c]){stack.push(pairs[c]);continue;}
  if(stack.length)continue;
  if(/[。!?！？\n]/.test(c)){if(!/[。!?！？\n]/.test(text[i+1]||''))cuts.push({end:i+1,kind:'sentence',rank:4});}
  else if(/[、,]/.test(c))cuts.push({end:i+1,kind:'clause',rank:3});
  else if(/\s/.test(c))cuts.push({end:i+1,kind:'word',rank:1});
  else if(/(?:んだけど|なんだけど|けれど|なので|だから|ンダケド|ナンダケド|ケレド|ナノデ|ダカラ)$/.test(text.slice(0,i+1)))cuts.push({end:i+1,kind:'clause',rank:2});
 }
 return cuts;
}
export function speechChunks(value,{display=s=>s,tokenizer=null}={}){
 const text=String(value).trim(),size=s=>fold(display(s)).length;
 if(size(text)<=60)return [text].filter(Boolean);
 const cuts=boundaries(text);
 if(tokenizer){
  let end=0;
  const safe=new Set(),stack=[],pairs={'「':'」','『':'』','（':'）','(':')','“':'”','"':'"'};
  for(let i=0;i<text.length;i++){const c=text[i];if(stack.at(-1)===c)stack.pop();else if(pairs[c])stack.push(pairs[c]);if(!stack.length)safe.add(i+1);}
  for(const token of tokenizer.tokenize(text)){
   end+=token.surface_form.length;
   if(safe.has(end)&&token.pos==='助詞'&&['接続助詞','格助詞'].includes(token.pos_detail_1))cuts.push({end,kind:'word',rank:1});
  }
 }
 const parts=[];let start=0;
 while(size(text.slice(start))>60){
  const candidates=cuts.filter(c=>c.end>start&&size(text.slice(start,c.end))>=14&&size(text.slice(c.end))>=12);
  const fitting=candidates.filter(c=>size(text.slice(start,c.end))<=60);
  // Prefer a comma or a connective; word boundaries are a last resort.
  fitting.sort((a,b)=>b.rank-a.rank||Math.abs(size(text.slice(start,a.end))-36)-Math.abs(size(text.slice(start,b.end))-36)||b.end-a.end);
  const cut=fitting[0]||candidates.sort((a,b)=>a.end-b.end)[0];
  if(!cut)break; // An indivisible name or quote is safer than an arbitrary cut.
  parts.push(text.slice(start,cut.end).trim());start=cut.end;
 }
 parts.push(text.slice(start).trim());return parts.filter(Boolean);
}
const extensions=[
 {match:/島二郎|シマジロウ/,facet:/水流|スイリュウ/,lines:['普段はお店にいる人なのに、水の中でもあんなに頼れるの、ずるいよ。','アタシ、次にお店の場面を見ても、あの水流を思い出しちゃいそう。']},
 {match:/音楽|オンガク|ピアノ|ギター/,facet:/音楽|オンガク|ピアノ|ギター|曲|キョク|音|オト/,lines:['曲を聴いてると、気に入ったところだけまた聴きたくなるの。','アタシ、そこだけ小さく口ずさんじゃう。言葉がない曲でもね。']},
 {match:/プリン/,facet:/プリン/,lines:['プリンの話してたら、ひと口食べたくなっちゃった。','最後のひと口、ゆっくり食べたいのにすぐなくなるね。']},
 {match:/散歩|サンポ/,facet:/散歩|サンポ/,lines:['散歩って、小さいお店を見つけると少し寄り道したくなるの。','アタシなら、何のお店か看板を読むところで止まっちゃう。']}
];
export function planContinuation(text,input='',state={},options={}){
 const source=String(text).trim(),sentences=[];let start=0;
 for(const cut of boundaries(source).filter(c=>c.kind==='sentence')){const sentence=source.slice(start,cut.end).trim();if(sentence)sentences.push(sentence);start=cut.end;}
 if(source.slice(start).trim())sentences.push(source.slice(start).trim());
 const hadInvitation=sentences.length>1&&invitation(sentences.at(-1));
 if(hadInvitation)sentences.pop();
 const parts=sentences.flatMap(sentence=>speechChunks(sentence,options).map((text,i)=>({text,continues:i>0})));
 if(!parts.length)return {first:String(text),later:[]};
 if(parts.length>1&&parts[0].text.length<14&&/^(?:.+、[なねよ]|ウン|うん|そっか|ソッカ|エッ|えっ)[!！。…]*$/.test(parts[0].text)&&fold((options.display||String)(parts[0].text+parts[1].text)).length<=60)parts.splice(0,2,{text:parts.slice(0,2).map(p=>p.text).join(' '),continues:false});
 const first=parts.shift().text,later=parts.map(p=>p.text),delays=parts.map((p,i)=>p.continues?1500:options.enthusiastic?2000:i===0?4000:5000);
 const history=(state.history||[]).filter(h=>h.role==='enny').map(h=>fold(h.text));
 if(!later.length&&!/つらい|苦しい|相談|病気|いじめ|嫌い|苦手|やめ|以外|違う|ちがう|知らない/.test(input)&&!/わから|分から|知らない|シラナイ|ワカラ|わかんない/.test(first)&&!/[?？]$/.test(first)){
  const topic=extensions.find(e=>e.match.test(fold(input))&&e.facet.test(fold(input))&&(e.match.test(fold(text))||e.facet.test(fold(text))));
  if(topic)later.push(...topic.lines.filter(line=>!history.includes(fold(line))&&fold(line)!==fold(first)));
 }
 if(hadInvitation&&later.length<3)later.push('あ、アタシばっかり話しちゃった。聞きたいこと、ある？');
 return {first,later,timing:{delays}};
}
export function createContinuation(){
 let queue=[],due=Infinity,typingAt=-Infinity,nextDelay=5000,delays=[];
 return {
  start(lines,time,{firstDelay=4000,nextDelay:between=5000,delays:pauses=[]}={}){queue=[...lines];delays=[...pauses];nextDelay=between;due=time+(delays[0]??firstDelay);},
  clear(){queue=[];due=Infinity;typingAt=-Infinity;},
  typed(time){typingAt=time;due=Math.max(due,time+6000);},
  get pending(){return queue.length>0;},
  peek(time,{composing=false}={}){return !composing&&time>=due&&time-typingAt>=6000?queue[0]||null:null;},
  spoken(time){queue.shift();delays.shift();due=time+(delays[0]??nextDelay);}
 };
}
