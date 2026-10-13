import {cards,selectKnowledge} from './fandom.js?v=20261013-talk1';
import {fanLines} from './fan-lines.js?v=20261013-talk1';
import {reviewedChiikawa} from './chiikawa-reviewed.js?v=20261013-talk1';
const compact=s=>String(s).normalize('NFKC').replace(/[\s。、!?！？]/g,'');

// A lightweight guard, not a semantic fact checker. Specific scene/quotation
// claims need an owned statement; feelings and explicitly imagined situations
// are free to remain model-written. Never teach an invented scene back to it.
export function groundModelReply(text,input,state={}){
 const selected=selectKnowledge(input,state);
 if(selected.work!=='chiikawa'&&state.knowledge?.work!=='chiikawa')return {text,changed:false};
 const pieces=String(text).match(/[^。!?！？]+[。!?！？]*|[。!?！？]+/g)||[];
 const facts=cards.filter(c=>c.work==='chiikawa').concat(reviewedChiikawa);
 const kept=[],removed=[];
 for(const piece of pieces){
  const scene=/シーン|場面|瞬間|エピソード|原作で|公式で/.test(piece)&&!/[?？]$/.test(piece);
  const quote=/「[^」]+」.{0,16}(?:言|叫|台詞|セリフ)/.test(piece);
  const imagined=/もし|想像|してくれたら|撮ってもらうなら|だったら/.test(piece);
  const owned=facts.some(c=>compact(c.fact).includes(compact(piece)));
  if((scene||quote)&&!imagined&&!owned)removed.push(piece.trim());else kept.push(piece.trim());
 }
 if(!removed.length)return {text,changed:false};
 const card=selected.cards[0]||facts.find(c=>c.id===state.knowledge?.focus);
 const recent=(state.history||[]).filter(h=>h.role==='enny').map(h=>compact(h.text)).join('');
 const opinion=card&&fanLines[card.id]?.find(line=>!/[?？]/.test(line)&&!recent.includes(compact(line)));
 const support=card?`${recent.includes(compact(card.fact))?'':card.fact+' '}${opinion||card.hook}`:'ちいかわのこと考えると、アタシすぐ顔がゆるむの。好きな気持ち、話し出すと止まらない！';
 // Retain the model's reaction, then the grounded detail. Drop a long tail
 // rather than cutting a sentence or adding another unchecked scene.
 const retained=kept.filter(line=>!/(?:もっと|他に|ほかに)?聞きたいこと.*ある/.test(line));
 let out='';for(const line of retained){if(out.length+line.length+support.length+2<=180)out+=(out?' ':'')+line;}
 return {text:(out?out+' ':'')+support,changed:true,replaced:!out,removed};
}
