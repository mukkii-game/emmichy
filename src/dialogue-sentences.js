// Punctuation inside a quote belongs to that quote. A cut there can leave a
// dangling closing bracket or hide the subject of a factual claim.
export function reactionContinues(text,index){
 // 「ヤハ！って思う」 is one reaction even without quotation marks.
 return /[!?！？]/.test(text[index])&&/^[!?！？]*\s*(?:って|ッテ|と(?:思|感|言)|ト(?:オモ|カン|イ))/.test(text.slice(index+1));
}
export function dialogueSentences(value){
 const text=String(value||''),parts=[],stack=[],pairs={'「':'」','『':'』','（':'）','(':')','“':'”'};
 let start=0;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(stack.at(-1)===c)stack.pop();else if(pairs[c])stack.push(pairs[c]);
  if(!stack.length&&/[。!?！？\n]/.test(c)&&!/[。!?！？\n]/.test(text[i+1]||'')&&!reactionContinues(text,i)){
   const part=text.slice(start,i+1).trim();if(part)parts.push(part);start=i+1;
  }
 }
 const tail=text.slice(start).trim();if(tail)parts.push(tail);
 return parts;
}
