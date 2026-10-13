// Punctuation inside a quote belongs to that quote. A cut there can leave a
// dangling closing bracket or hide the subject of a factual claim.
export function dialogueSentences(value){
 const text=String(value||''),parts=[],stack=[],pairs={'「':'」','『':'』','（':'）','(':')','“':'”'};
 let start=0;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(stack.at(-1)===c)stack.pop();else if(pairs[c])stack.push(pairs[c]);
  if(!stack.length&&/[。!?！？\n]/.test(c)){
   const part=text.slice(start,i+1).trim();if(part)parts.push(part);start=i+1;
  }
 }
 const tail=text.slice(start).trim();if(tail)parts.push(tail);
 return parts;
}
