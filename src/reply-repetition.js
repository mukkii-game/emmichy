import {dialogueSentences} from './dialogue-sentences.js?v=20261017-quota1';
import {substantiveHistory} from './dialogue-history.js?v=20261014-view1';
const fold=s=>String(s).normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/[\s。、!?！？「」]/g,'');
export const requestsFactRecap=input=>/曲名|キョクメイ|口癖|クチグセ|掛け声|カケゴエ|結果|合否|何話|何級|誰|ダレ|だっけ|ダッケ|もう一度|モウイチド|もう一回|モウイッカイ/.test(input)&&!/なぜ|どうして|ナゼ|ドウシテ/.test(input);
export function freshReplySentences(text,input,state={}){
 if(requestsFactRecap(input))return {text,changed:false};
 const recent=substantiveHistory(state).filter(h=>h.role==='enny').slice(-6).map(h=>fold(h.text));
 const sentences=dialogueSentences(text),kept=sentences.filter(s=>fold(s).length<6||!recent.some(r=>r.includes(fold(s))));
 return {text:kept.join(' '),changed:kept.length!==sentences.length};
}
