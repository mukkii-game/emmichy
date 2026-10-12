// Original everyday connections, grounded in the existing owned factual cards.
import {cards,sources} from './fandom.js?v=20261012-memory1';
import {relatedChiikawa} from './chiikawa-relations.js?v=20261012-memory1';
const fold=value=>String(value||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
const bridges=[
 {id:'sweet',card:'chiikawa-14',match:/甘イ|アマイ|ケーキ|プリン|チョコ|スイーツ|シナモンロール/,lines:['甘い物って聞くと、ラッコを思い出しちゃう！ あんなに強いのに甘党なの、好き。','ラッコにも甘い物、選んであげたいな。アタシ、こういう時すぐちいかわのこと考えちゃう。']},
 {id:'photo',card:'chiikawa-9',match:/写真|シャシン|カメラ|撮ッ|トッタ/,lines:['写真の話で、ハチワレ思い出しちゃった！ 小さい思い出を残すの、いいよね。','ハチワレも写真が好きなの。アタシ、何を撮りたくなったのか考えるだけで楽しい。']},
 {id:'study',card:'chiikawa-16',match:/勉強|ベンキョウ|資格|シカク|試験|シケン|宿題|シュクダイ/,lines:['勉強って聞くと、シーサー応援したくなる！ 郎で働くために資格を取るの、好きなんだ。','アタシはシーサーを思い出すと、もう少し頑張ろってなるの。好きな子の力、借りちゃう。']},
 {id:'gift',card:'chiikawa-17',match:/プレゼント|贈リ物|オクリモノ|手作リ|テヅクリ|飾リ|カザリ/,lines:['古本屋のカニの飾りも、もらった物なの。大事にしてるところ、アタシ大好き！','こういう話、古本屋のカニ飾り思い出しちゃう。もらった物って、見るたび相手のこと考えるよね。']},
 {id:'cooking',card:'chiikawa-10',match:/料理|リョウリ|ゴハン|ご飯|ラーメン|チャルメラ/,lines:['ご飯の話で、もうハチワレ思い出しちゃった。料理も食べるのも好きなところ、アタシと一緒！','ハチワレとご飯の話、したいな。何を作るか相談するだけでも、アタシ楽しそう。']}
];
// Personal opinions, not additional canon scenes. Basic character framing:
// https://apps.apple.com/jp/iphone/story/id1776526436
export function personalFanReply(input,state={}){
 const t=fold(input),chii=/チイカワ|ハチワレ/.test(t)||state.knowledge?.work==='chiikawa';
 if(!chii||/嫌イ|キライ|病気|相談|事故|死ニ|亡ク/.test(t))return null;
 if(/(?:誰|ダレ).*(?:好キ|スキ)|(?:イチバン|一番).*(?:誰|ダレ)|推シ.*(?:誰|ダレ)/.test(t))
  return {subject:'favourite',text:'アタシ、ハチワレの気遣いに弱いの。写真で小さい思い出を残すところも、大好き！ 一番って聞かれると、みんな浮かんで迷っちゃう。'};
 if(/(?:エミチ[ィイー]|アナタ|君).{0,16}プリン.{0,6}(?:好キ|スキ)/.test(t))
  return {subject:'pudding',text:'アタシもプリン好き！ 一緒に食べながらちいかわの話、したいな。小さいうれしいこと、二つになるね。'};
 if(/チイカワ.*(?:本人|ドンナトコ|ドコガ好キ|ドコガスキ|怖クテモ|コワクテモ|小サナ幸セ|ガンバル|頑張ル)/.test(t)){
  const previous=state.history?.filter(h=>h.role==='enny').at(-1)?.text||'';
  const correction=/ジャナ|変エナイ|カエナイ/.test(t)&&/島|うさぎ|ハチワレ/.test(previous);
  const lines=/幸セ/.test(t)?['ちいかわの小さな幸せの話、しよう！ うれしそうな顔を見ると、アタシまで顔がゆるむの。ああいう時間、長く続いてほしくなる。']:
   ['ちいかわ本人の、泣いても一生懸命なところが好き。怖い気持ちがあるから、頑張る姿にぎゅっとなるの。アタシ、見てると応援しちゃう。','ちいかわの優しさ、好き！ 強い言葉で言えなくても、気持ちが伝わってくるの。アタシも日本語が出ない時、あんなふうに伝わったらいいな。'];
  const history=(state.history||[]).filter(h=>h.role==='enny').map(h=>fold(h.text)).join('');
  return {subject:'chiikawa-character',text:(correction?'ごめん、別の子の話にしちゃったね。 ':'')+(lines.find(line=>!history.includes(fold(line)))||lines[0])};
 }
 return null;
}
export function selectChiikawaBridge(input,state={}){
 const t=fold(input);
 if(/ツライ|苦シ|病気|事故|亡ク|死ニ|相談|嫌イ|キライ|苦手|ヤメ|イガイ|以外|バカリ|違ウ|チガウ|訂正/.test(t))return null;
 const history=(state.dialogue||state.history||[]).filter(h=>h.role==='enny').slice(-8).map(h=>fold(h.text)).concat((state.playerMemory?.recentReplies||[]).slice(-12).map(fold)).join('');
 for(const bridge of bridges){
  if(!bridge.match.test(t))continue;
  const text=bridge.lines.find(line=>!history.includes(fold(line)));
  if(!text)continue;
  const card=cards.find(c=>c.id===bridge.card);
  return {id:bridge.id,text,fact:card.fact,source:sources[card.source].url};
 }
 const related=relatedChiikawa(input,state).find(r=>r.cueHits.length&&!bridges.some(b=>b.card===r.cardId)&&!history.includes(fold(r.feeling)));
 if(related)return {id:related.id,text:related.feeling,fact:related.fact,source:related.source};
 return null;
}
export function chiikawaBridgePrompt(input,state={}){
 const bridge=selectChiikawaBridge(input,state);if(!bridge)return '';
 return `\n今の話からちいかわへつなげる材料: ${bridge.fact}\n本人の連想例（創作、原作の台詞ではない）: ${bridge.text}\n相手への返答に続けて、本人の好きな気持ちでつなぐ。質問の答えや訂正は先に扱う。例文の丸写しや同じ連想の反復は避ける。`;
}
