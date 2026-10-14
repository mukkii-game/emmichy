import {dialogueSentences} from './dialogue-sentences.js?v=20261014-dialogue1';
import {cards,selectKnowledge} from './fandom.js?v=20261014-dialogue1';
import {fanLines} from './fan-lines.js?v=20261014-dialogue1';
import {reviewedChiikawa} from './chiikawa-reviewed.js?v=20261014-dialogue1';
import {specialistFacts,specialistPacket} from './specialist.js?v=20261014-dialogue1';
const compact=s=>String(s).normalize('NFKC').replace(/[\s。、!?！？]/g,'');

// A lightweight guard, not a semantic fact checker. Specific scene/quotation
// claims need an owned statement; feelings and explicitly imagined situations
// are free to remain model-written. Never teach an invented scene back to it.
export function groundModelReply(text,input,state={}){
 const selected=selectKnowledge(input,state);
 const packet=specialistPacket(input,state);
 if(selected.work!=='chiikawa'&&state.knowledge?.work!=='chiikawa')return {text,changed:false};
 const pieces=dialogueSentences(text);
 const facts=cards.filter(c=>c.work==='chiikawa').concat(reviewedChiikawa,specialistFacts);
 const kept=[],removed=[];
 for(const piece of pieces){
  const personalMoment=/(?:私|アタシ)(?:が|は).{0,24}(?:勇気をもらう|嬉しくなる|うれしくなる|励まされる)瞬間/.test(piece)&&!/シーン|場面|エピソード|原作で|公式で/.test(piece);
  const referenceFeeling=packet.active&&packet.evidence.length>0&&/^(?:あの|その|この|好きな)(?:場面|シーン|瞬間)/.test(piece)&&/アタシ|私/.test(piece)&&!/「|(?:ハチワレ|ちいかわ|うさぎ|モモンガ|みんな|皆)(?:が|は).{0,35}(?:作|言|叫|遊|戦|食|持|想像)/.test(piece);
  const scene=/シーン|場面|瞬間|エピソード|原作で|公式で/.test(piece)&&!personalMoment&&!referenceFeeling&&!/[?？]$/.test(piece);
  const quote=/「[^」]+」.{0,16}(?:言|叫|台詞|セリフ)/.test(piece);
  const ownImitation=/(?:アタシ|私|自分)(?:も|は|が)?[、\s]*「[^」]+」.{0,16}(?:言|真似|叫|口ずさ)/.test(piece)&&!/シーン|場面|台詞|セリフ|原作で|公式で/.test(piece);
  const imagined=ownImitation||/もし|してくれたら|撮ってもらうなら|だったら/.test(piece)||/(?:アタシ|私|自分).{0,16}想像|アタシの想像/.test(piece);
  const attributedImagination=/(?:ちいかわ|チイカワ|ハチワレ|うさぎ|モモンガ)(?:たち)?(?:が|は).{0,90}(?:想像して|空想|ごっこ).{0,30}(?:した|シタ|遊んだ)/.test(piece)&&!imagined;
  const owned=facts.some(c=>compact(c.fact).includes(compact(piece))||c.spoken&&compact(c.spoken).includes(compact(piece)));
  if((scene||quote||attributedImagination)&&!imagined&&!owned)removed.push(piece.trim());else kept.push(piece.trim());
 }
 if(!removed.length)return {text,changed:false};
 const evidence=packet.active?packet.evidence[0]:null;
 const card=packet.active?evidence:(selected.cards[0]||facts.find(c=>c.id===state.knowledge?.focus));
 const recent=(state.history||[]).filter(h=>h.role==='enny').map(h=>compact(h.text)).join('');
 const opinion=card&&fanLines[card.id]?.find(line=>!/[?？]/.test(line)&&!recent.includes(compact(line)));
 const support=packet.active?(card?`${recent.includes(compact(card.spoken))?'':card.spoken}`:'その場面の細部は、今の資料では確かめきれないの。'):(card?`${recent.includes(compact(card.fact))?'':card.fact+' '}${opinion||card.hook}`:'ちいかわのこと考えると、アタシすぐ顔がゆるむの。好きな気持ち、話し出すと止まらない！');
 // Retain the model's reaction, then the grounded detail. Drop a long tail
 // rather than cutting a sentence or adding another unchecked scene.
 const retained=kept.filter(line=>!/(?:もっと|他に|ほかに)?聞きたいこと.*ある/.test(line));
 let out='';for(const line of retained){if(out.length+line.length+support.length+2<=180)out+=(out?' ':'')+line;}
 return {text:(out?out+' ':'')+support,changed:true,replaced:!out,removed};
}
