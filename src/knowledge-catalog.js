// Reviewed runtime facts only. Research candidates and player memories stay separate.
import {chiikawaRelations} from './chiikawa-relations.js?v=20261017-catalog1';
import {sceneFacts} from './chiikawa-scenes.js?v=20261014-view1';
import {topicFacts} from './chiikawa-news.js?v=20261014-view1';
const spoken={
 'reviewed:usagi:yaha':'「ヤハ！」はうさぎの掛け声だよ。',
 'reviewed:hachi:nantoka':'「なんとかなれーッ！」はハチワレのセリフだよ。',
 'reviewed:hachi:ending':'TVアニメのEDは「ひとりごつ」。ハチワレが歌うの。',
 'reviewed:hachi:opening':'映画のOPは「くつずれ」。ハチワレが歌うの。',
 'reviewed:chiikawa:pochette':'アニメ第28話で、ちいかわは買ったお気に入りのポシェットをさげて出かけるの。',
 'reviewed:trio:log':'映画の冒頭では、ちいかわ・ハチワレ・うさぎが丸太の周りで掛け合いをするの。',
 'reviewed:trio:prepare':'映画では、セイレーン討伐に向けて、みんなで協力して準備するの。',
 'reviewed:momonga:ear':'映画では、崖から落ちそうなちいかわを、モモンガが耳を引っ張って助けるの。'
};
export const knowledgeFacts=Object.freeze([...chiikawaRelations.filter(r=>r.evidence==='official'||r.id==='relation:chiikawa-23'),...sceneFacts,...topicFacts].map(r=>Object.freeze({...r,
 ...(r.id==='relation:chiikawa-23'?{fact:'島二郎は手を回して水流を起こす。',spoken:'島二郎は手を回して水流を起こすの。',limits:[...r.limits,'虎のしまじろうとは別人'],deliveredVariants:['島二郎が手を回して起こす水流','手を回して水流を起こす島二郎']}:{}),
 spoken:r.id==='relation:chiikawa-23'?'島二郎は手を回して水流を起こすの。':r.spoken||spoken[r.id]||r.fact})));

const index=new Map(knowledgeFacts.map(row=>[row.id,row]));
export const knowledgeById=Object.freeze({get:id=>index.get(id),has:id=>index.has(id)});

// Capabilities, not raw keyword counts. A question can be factual, a personal
// view, or an explicit knowledge boundary. All IDs refer to reviewed facts.
export const knowledgeQuestions=Object.freeze([
 {id:'exam-result',kind:'fact',factIds:['exam:result'],examples:['草むしり検定5級の最初の結果は？'],match:/草むしり|クサムシリ/,facet:/結果|合否|合格|不合格/},
 {id:'exam-gift',kind:'fact',factIds:['exam:cookie','exam:celebrate'],requiresScene:'examination',examples:['草むしり検定のお祝いに何を渡すの？','クサムシリ ケンテイ ノ オイワイ ニ ナニヲ ワタスノ?'],match:/祝い|イワイ|クッキー/,facet:/何.*渡|ナニ.*(?:渡|ワタ)|何.*贈|ナニ.*贈|何.*もら|ナニ.*モラ/},
 {id:'exam-episodes',kind:'fact',factIds:['exam:episodes'],examples:['草むしり検定ってアニメ何話？'],match:/草むしり|クサムシリ|検定|ケンテイ/,facet:/何話|ナンワ|話数/},
 {id:'exam-cookie-origin',kind:'boundary',factIds:['exam:cookie'],requiresScene:'examination',context:'草むしり検定のお祝いのクッキー',examples:['そのクッキーは手作り？'],match:/クッキー/,facet:/手作|テヅクリ|買った|カッタ/},
 {id:'hachi-feeling',kind:'opinion',factIds:['exam:result','relation:hachi-friend'],requiresScene:'examination',context:'草むしり検定の最初の結果は？',examples:['ハチワレの気持ちをどう思う？'],match:/ハチワレ/,facet:/気持|キモチ|どう思|ドウオモ/},
 {id:'hachi-friend',kind:'fact',factIds:['relation:hachi-friend'],examples:['ハチワレの大切な友達は？'],match:/ハチワレ/,facet:/友達|トモダチ|友情/},
 {id:'hachi-photo',kind:'fact',factIds:['relation:chiikawa-9'],examples:['ハチワレって写真が好き？'],match:/ハチワレ/,facet:/写真|シャシン|カメラ/},
 {id:'anime-ending',kind:'fact',factIds:['reviewed:hachi:ending'],examples:['ひとりごつって何の曲？'],match:/ひとりごつ|ヒトリゴツ/,facet:/曲|キョク|歌|ウタ|ED|エンディング/},
 {id:'film-opening',kind:'fact',factIds:['reviewed:hachi:opening'],examples:['映画ちいかわのオープニング曲は？'],match:/映画|エイガ|くつずれ|クツズレ/,facet:/オープニング|OP|くつずれ|クツズレ/,exclude:/テレビ|アニメ|TV|映画じゃなく|エイガジャナク/i},
 {id:'usagi-call',kind:'fact',factIds:['reviewed:usagi:yaha'],examples:['ヤハって誰の掛け声？'],match:/ヤハ/,facet:/誰|ダレ|口癖|クチグセ|掛け声|カケゴエ/},
 {id:'island-menu',kind:'fact',factIds:['relation:chiikawa-25'],examples:['島二郎の店のメニューは？'],match:/島二郎|シマジロウ/,facet:/メニュー|料理|リョウリ|貝汁|カツカレー/},
 {id:'shisa-work',kind:'fact',factIds:['relation:chiikawa-16'],examples:['シーサーはどこで働いている？'],match:/シーサー/,facet:/働|ハタラ|資格|シカク|郎/},
 {id:'kaniko-gift',kind:'fact',factIds:['relation:chiikawa-17'],examples:['古本屋のカニの飾りの話をして'],match:/古本屋|フルホンヤ/,facet:/カニ|飾|カザリ/},
 {id:'creator',kind:'fact',factIds:['relation:chiikawa-5'],examples:['ちいかわの作者は誰？'],match:/ちいかわ|チイカワ|ナガノ/,facet:/作者|サクシャ|原作|ゲンサク/}
].map(q=>Object.freeze({...q,factIds:Object.freeze(q.factIds),examples:Object.freeze(q.examples)})));

// These are routes for conversation, never a newly discovered canon relation.
export const knowledgeConnections=Object.freeze([
 {from:'relation:hachi-friend',to:'exam:result',contact:'友達と結果が違った時の気持ち'},
 {from:'exam:result',to:'exam:celebrate',contact:'悔しさと、お祝いしたい気持ち'},
 {from:'exam:celebrate',to:'exam:cookie',contact:'相手に合う贈り物を選ぶ'},
 {from:'exam:cookie',to:'relation:chiikawa-9',contact:'食べる前の記念写真という本人の想像'},
 {from:'relation:chiikawa-9',to:'relation:hachi-treasure',contact:'小さい思い出や、大切に残す物'},
 {from:'relation:chiikawa-10',to:'relation:hachi-friend',contact:'料理だけでなく、一緒に過ごす楽しさ'},
 {from:'relation:chiikawa-16',to:'exam:attempt',contact:'勉強して目標へ向かう気持ち'},
 {from:'relation:chiikawa-14',to:'relation:chiikawa-10',contact:'好きな食べ物の話'},
 {from:'relation:chiikawa-17',to:'exam:cookie',contact:'もらった物に込められた気持ち'}
].map(e=>Object.freeze({...e,kind:'association',canonClaim:false})));

export function matchingKnowledgeQuestions(input,{scene=''}={}){
 const text=String(input||'').normalize('NFKC').replace(/\s/g,'');
 return knowledgeQuestions.filter(q=>(!q.requiresScene||q.requiresScene===scene)&&!q.exclude?.test(text)&&q.match.test(text)&&q.facet.test(text));
}
export function validateKnowledgeCatalog(records=knowledgeFacts,questions=knowledgeQuestions,connections=knowledgeConnections){
 const errors=[],ids=new Set();
 for(const r of records){
  if(!r.id||ids.has(r.id))errors.push(`duplicate-or-empty-id:${r.id}`);ids.add(r.id);
  if(!r.subject||!r.fact||!r.spoken||!Array.isArray(r.cues)||!r.cues.length)errors.push(`incomplete:${r.id}`);
  if(!/^https:\/\//.test(r.source||'')||!/^\d{4}-\d{2}-\d{2}$/.test(r.checkedAt||'')||!r.scope||!['official','reported'].includes(r.evidence)||!Array.isArray(r.limits)||!r.limits.length)errors.push(`provenance:${r.id}`);
  if(r.expires&&r.expires<r.checkedAt)errors.push(`expiry:${r.id}`);
 }
 for(const q of questions){if(!['fact','opinion','boundary'].includes(q.kind)||!q.examples?.length||!q.factIds?.length||q.factIds.some(id=>!ids.has(id)))errors.push(`question:${q.id}`);}
 for(const e of connections){if(!ids.has(e.from)||!ids.has(e.to)||e.kind!=='association'||e.canonClaim!==false||!e.contact)errors.push(`connection:${e.from}:${e.to}`);}
 return errors;
}
