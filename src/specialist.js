// Small owned evidence packets. The browser sends IDs/state, never new canon.
import {chiikawaRelations} from './chiikawa-relations.js?v=20261014-dialogue1';
import {waterPlayCorrection} from './fandom.js?v=20261014-dialogue1';
import {exactNames,focusName} from './names.js?v=20261014-dialogue1';
import {substantiveHistory} from './dialogue-history.js?v=20261014-dialogue1';
import {feedbackIntent} from './conversation-repair.js?v=20261014-dialogue1';
import {sceneFacts} from './chiikawa-scenes.js?v=20261014-dialogue1';
import {topicFacts} from './chiikawa-news.js?v=20261014-dialogue1';
const fold=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/[\s。、!?！？「」]/g,'').toLowerCase();
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
export const specialistFacts=Object.freeze([...chiikawaRelations.filter(r=>r.evidence==='official'||r.id==='relation:chiikawa-23'),...sceneFacts,...topicFacts].map(r=>Object.freeze({...r,
 ...(r.id==='relation:chiikawa-23'?{fact:'島二郎は手を回して水流を起こす。',spoken:'島二郎は手を回して水流を起こすの。',limits:[...r.limits,'虎のしまじろうとは別人'],deliveredVariants:['島二郎が手を回して起こす水流','手を回して水流を起こす島二郎']}:{}),
 spoken:r.id==='relation:chiikawa-23'?'島二郎は手を回して水流を起こすの。':r.spoken||spoken[r.id]||r.fact})));
const records=specialistFacts;
const byId=new Map(records.map(r=>[r.id,r]));
const scenes=[
 {id:'examination',cues:['草むしり検定','クサムシリケンテイ','5級','5キュウ','五級'],ids:sceneFacts.map(r=>r.id),participants:['ちいかわ','ハチワレ'],label:'草むしり検定の具体的な場面'},
 {id:'dated-topics',cues:['ちいかわのニュース','チイカワノニュース','最近のちいかわ','サイキンノチイカワ','最新ニュース'],ids:topicFacts.map(r=>r.id),label:'ちいかわの最新案内'},
 {id:'park-christmas',cues:['ちいかわパーク','チイカワパーク','パークのクリスマス','クリスマスのパーク'],ids:['topic:park:christmas-2026'],label:'パークの最新案内'},
 {id:'strong-hachiware-goods',cues:['強くなったハチワレ','強クナッタハチワレ','パラレルワールドのマスコット','グッズ'],ids:['topic:goods:strong-hachiware'],label:'マスコットの最新案内'},
 {id:'water',cues:['水流','スイリュウ'],ids:['relation:chiikawa-23'],participants:['島二郎'],label:'島二郎の水流'},
 {id:'island-menu',cues:['島二郎のお店','島二郎の店','シマジロウノオ店','シマジロウノ店','カツカレー','貝汁','フルーツパフェ'],ids:['relation:chiikawa-25'],participants:['島二郎'],label:'島二郎の店のメニュー'},
 {id:'ending',cues:['ひとりごつ','ED','エンディング'],ids:['reviewed:hachi:ending'],label:'TVアニメのED'},
 {id:'opening',cues:['くつずれ','靴ずれ','OP','オープニング'],ids:['reviewed:hachi:opening'],label:'映画のOP'},
 {id:'tv-opening',cues:[],ids:[],label:'TVアニメのOP（映画のOPとは別）'},
 {id:'ear',cues:['耳を引っ張','耳が伸び','崖'],ids:['reviewed:momonga:ear'],participants:['モモンガ','ちいかわ'],label:'映画のモモンガとちいかわの耳'},
 {id:'log',cues:['丸太','冒頭の三人'],ids:['reviewed:trio:log'],participants:['ちいかわ','ハチワレ','うさぎ'],label:'映画冒頭の掛け合い'},
 {id:'preparation',cues:['みんなで準備','討伐の準備'],ids:['reviewed:trio:prepare'],label:'映画の討伐準備'},
 {id:'pochette',cues:['ポシェット'],ids:['reviewed:chiikawa:pochette'],label:'ちいかわのポシェット'}
];
export function cleanSpecialist(value){
 const v=value&&typeof value==='object'?value:{};
 return {subject:records.some(r=>r.subject===v.subject)?v.subject:'',scene:scenes.some(s=>s.id===v.scene)?v.scene:'',
  focus:byId.has(v.focus)?v.focus:'',said:Array.isArray(v.said)?[...new Set(v.said.filter(id=>byId.has(id)))].slice(-32):[],...(v.spoilers===false?{spoilers:false}:{})};
}
export function specialistPacket(input,state={},now=new Date()){
 const t=fold(input),memory=cleanSpecialist(state.specialist);
 const recognition=memory.subject||memory.scene?{...state,knowledge:{...state.knowledge,work:'chiikawa'}}:state;
 const names=exactNames(input,recognition);
 const chii=focusName(input,recognition),other=names.find(n=>n.work!=='chiikawa');
 const previousScene=scenes.find(s=>s.id===memory.scene);
 const selfTopic=!chii&&(/日本語|ニホンゴ|スウェーデン|ヨーテボリ|家族|カゾク/.test(t)||/エミチ|emmichy/.test(t)&&!/ドウ思|ドウオモ/.test(t));
 const matches=c=>['OP','ED'].includes(c)?new RegExp(`\\b${c}\\b`,'i').test(String(input)):t.includes(fold(c));
 let explicit=scenes.find(s=>s.cues.some(matches));
 if(explicit?.id==='opening'&&/アニメ|テレビ|tv/.test(t)&&!/映画|エイガ|くつずれ|クツズレ/.test(t))explicit=scenes.find(s=>s.id==='tv-opening');
 const follow=/^(ソレ|ソノ|アレ|アノ|モット|続キ|ツヅキ|ドウ|ナゼ|何|ナニ|誰|ダレ|ソウ|違|チガ|オナジ)/.test(t)||/(?:ソノ|アノ|サッキノ)(?:話|ハナシ|場面|シーン|子)|ソコデ|ドコガ好キ|ドウ思|ドウオモ|落チ|オチ|合格|ゴウカク|曲名|キョクメイ|モウ一度|モウイチド|サッキ|面白イ|オモシロイ|話シテ|話ヲシテ|ハナシテ|続ケ|ツヅケ|印象ニ残ル場面/.test(t);
 const facet=previousScene&&(/^(ドンナ|ドノ|ドレ)|手作リ|作ッタ|買ッタ|点数|得点|ドウヤッテ/.test(t)||previousScene.ids.some(id=>byId.get(id)?.cues.some(c=>fold(c).length>=2&&t.includes(fold(c)))));
 const mixedQuestion=other&&!['japan','games'].includes(other.work)&&/[?？]|何|ナニ|ナゼ|なぜ|どう|教えて/.test(input);
 const spoilerRequest=/ネタバレ/.test(t);
 const active=!selfTopic&&!mixedQuestion&&Boolean(chii||!other&&(explicit||(follow||facet||spoilerRequest)&&(memory.subject||memory.scene)));
 if(!active){
  const changed=other||selfTopic||/別ノ話|他ノ話|ホカノ話|以外|イガイ|話題.{0,6}変|話ヲ変/.test(t);
  return {active:false,memory:changed?{...memory,subject:'',scene:'',focus:''}:memory,evidence:[],gap:''};
 }
 const genericChii=chii?.name==='ちいかわ'&&!/本人|(?:ちいかわ|チイカワ)(?:が|は|ガ|ハ)|好きなところ|好キナトコロ/.test(input);
 let subject=chii&&records.some(r=>r.subject.startsWith(chii.name))&&(!genericChii||!memory.subject)?chii.name:memory.subject;
 if(memory.subject==='ハチワレ'&&/チイカワト一緒/.test(t))subject=memory.subject;
 if(/誰ガ好キ|ダレガスキ/.test(t))subject='ハチワレ';
 // Explicit new characters leave the previous scene unless a scene cue is present.
 const participant=chii&&previousScene?.participants?.includes(chii.name);
 const changedCharacter=chii&&!genericChii&&chii.name!==memory.subject&&!participant;
 const characterProfile=/本人|普段|全体|キャラとして|性格|魅力/.test(input);
 const reference=/^(ソレ|ソノ|アレ|アノ|ソウ|違|チガ|オナジ)|ソコデ/.test(t)||spoilerRequest||Boolean(feedbackIntent(input));
 const scene=explicit||(!characterProfile&&((follow||facet)&&!changedCharacter||reference||participant)?previousScene:null);
 let selected=[];
 if(!scene&&memory.subject&&/具体的.*場面|印象ニ残ル場面/.test(t)){
  explicit=scenes.find(s=>s.id==='examination'&&s.participants.includes(memory.subject));
 }
 const examIntent=scene?.id==='examination'?( /クッキー|手作リ|作ッタ|買ッタ/.test(t)?'exam:cookie':/祝|オイワイ|翌朝|次ノ日/.test(t)?'exam:celebrate':/結果|合否|合格|不合格|落チ|オチ|気持チ|思ウ|ドウ思/.test(t)?'exam:result':/何話|ナンワ|話数/.test(t)?'exam:episodes':''):'';
 const score=r=>(r.id===examIntent?100:0)+r.cues.reduce((n,c)=>n+(fold(c).length>=2&&t.includes(fold(c))?12:0),0)+(chii&&r.subject.includes(chii.name)?4:0);
 if(!scene&&explicit?.id==='examination')selected=[byId.get('exam:celebrate'),byId.get('exam:cookie')];
 else if(scene)selected=scene.ids.map(id=>byId.get(id)).filter(Boolean).sort((a,b)=>score(b)-score(a)||Number(memory.said.includes(a.id))-Number(memory.said.includes(b.id))).slice(0,3);
 else{
  const candidates=records.filter(r=>!r.scene&&(!subject||r.subject.startsWith(subject)||!characterProfile&&(chii&&fold(r.fact).includes(fold(chii.name))||r.cues.some(c=>fold(c).length>=2&&t.includes(fold(c)))))).map(r=>({r,score:(r.id==='relation:hachi-friend'&&/性格|魅力|好キナトコロ|ドンナトコロ|チイカワト一緒/.test(t)?100:0)+r.cues.reduce((n,c)=>n+(fold(c).length>=2&&t.includes(fold(c))?12:0),0)+(subject&&r.subject.startsWith(subject)?4:0)+(chii&&fold(r.fact).includes(fold(chii.name))?12:0)}));
  const direct=candidates.filter(c=>c.score>=12);
  selected=(direct.length?direct:candidates.filter(c=>c.score>0)).sort((a,b)=>b.score-a.score||a.r.id.localeCompare(b.r.id)).slice(0,3).map(c=>c.r);
  if(follow&&!chii&&memory.focus&&byId.get(memory.focus).subject===subject)selected=[byId.get(memory.focus),...selected.filter(r=>r.id!==memory.focus)].slice(0,3);
 }
 if(scene&&follow&&!examIntent&&!explicit&&byId.has(memory.focus)&&scene.ids.includes(memory.focus))selected=[byId.get(memory.focus),...selected.filter(r=>r.id!==memory.focus)].slice(0,3);
 const allowSpoilers=/ネタバレ.{0,8}(?:イイ|大丈夫|アリ)/.test(t);
 const noSpoilers=!allowSpoilers&&(memory.spoilers===false||/ネタバレ.{0,4}(?:ナシ|なし|イヤ|嫌|禁止)|ネタバレシナイ/.test(t));
 const specificScene=Boolean(scene&&scene.id!=='examination');
 const day=now.toISOString().slice(0,10);
 selected=selected.filter(r=>(!r.expires||day>=r.checkedAt&&day<=r.expires)&&(r.spoiler!=='plot'||specificScene&&!noSpoilers));
 const gap=scene&&!selected.length?scene.label:'';
 if(explicit&&selected.length&&(!subject||!selected.some(r=>r.subject.includes(subject))))subject=selected[0].subject;
 const next={...memory,subject,scene:scene?.id||explicit?.id||'',focus:selected[0]?.id||''};
 if(noSpoilers)next.spoilers=false;else if(allowSpoilers)delete next.spoilers;
 return {active:true,memory:next,gap,evidence:selected.map(r=>({id:r.id,subject:r.subject,object:r.object,fact:r.fact,spoken:r.spoken,source:r.source,evidence:r.evidence,scope:r.scope,checkedAt:r.checkedAt,limits:r.limits,said:memory.said.includes(r.id)}))};
}
export function noteSpecialistDelivery(value,text,history=[]){
 const memory=cleanSpecialist(value),dialogue=substantiveHistory(history),at=dialogue.findLastIndex(h=>h.role==='user');
 const previous=fold(dialogue.slice(at+1).filter(h=>h.role==='enny').map(h=>h.text).join(' ')),current=fold(text),t=previous+current;
 // Selection is not delivery; interrupted/unspoken tails must not count.
 const matches=(line,r)=>line.includes(fold(r.fact))||line.includes(fold(r.spoken))||r.deliveredVariants?.some(v=>line.includes(fold(v)));
 const spoken=records.filter(r=>matches(t,r)),newFact=spoken.filter(r=>matches(current,r)||!matches(previous,r)).at(-1);
 return {...memory,...(newFact?{focus:newFact.id,scene:newFact.scene||memory.scene}:{}),said:[...new Set([...memory.said,...spoken.map(r=>r.id)])].slice(-32)};
}
export function specialistFallback(input,state={}){
 const packet=specialistPacket(input,state);if(!packet.active)return null;
 const correction=waterPlayCorrection(input,state);if(correction)return correction;
 const recent=substantiveHistory(state).filter(h=>h.role==='enny').map(h=>fold(h.text)).join('');
 const direct=packet.evidence[0],record=direct&&byId.get(direct.id);
 if(packet.memory.scene==='water'&&/遊|アソ/.test(input))return '遊んでいた、とは言わないよ。島二郎が手を回して水流を起こす話。アタシ、その頼もしさが好きなの。';
 if(/ネタバレ.{0,8}(?:しない|なし|ナシ)|ネタバレシナイ/.test(input))return 'うん、ここから先の展開は話さないね。見たところの感想だけ、一緒に話そう。';
 if(!record)return 'その場面の細部は、今の資料では確かめきれないの。どこが気になったか、あなたの言葉で聞きたいな。';
 if(/誰|ダレ|何|ナニ|だっけ|ダッケ/.test(input)&&!/どうして|なぜ|ドウシテ|ナゼ/.test(input))return record.spoken;
 if(packet.memory.scene==='island-menu'&&/パフェ/.test(input))return '島二郎の店のメニューは、カツカレーと貝汁。パフェは島の別の食べ物だよ。作り手までは、この資料では確かめられないの。';
 if(packet.memory.scene==='ear'&&/好き|スキ/.test(input))return 'アタシ、可愛さだけじゃなくて、助けようとする勢いに力が入っちゃう。もしそばで見てたら、自分の手まで伸びそう。';
 if(packet.memory.scene==='strong-hachiware-goods'&&/集メ|アツメ|ガチ/.test(fold(input)))return `ファン全体で何が一番多いかは、今の資料ではわからないの。一つ例を挙げるね。${record.spoken} ${record.feeling}`;
 if(packet.memory.scene==='examination'&&/(?:なぜ|どうして|ナゼ|ドウシテ|理由).{0,18}(?:落|不合格|オチ)|(?:落|不合格|オチ).{0,18}(?:なぜ|どうして|ナゼ|ドウシテ|理由)/.test(input))return '落ちた理由や点数までは、確認した紹介には書いてないの。結果が違っても友達を大事にしたい、その気持ちはアタシも考えちゃう。';
 if(packet.memory.scene==='examination'&&/手作り|作った|買った|テヅクリ|ツクッタ|カッタ/.test(input))return '手作りか買ったものかまでは、確かめられないの。';
 if(packet.memory.scene==='examination'&&/気持ち|どう思|キモチ|ドウオモ/.test(input)){
  const angles=packet.memory.subject==='ハチワレ'?['アタシなら、自分だけ受かった時、友達になんて声をかけるか迷っちゃう。嬉しさと気遣い、両方ありそう。','喜んでいいのかな、って考えちゃうかも。アタシは、友達の前でその嬉しさをどう伝えるかが気になる。']:['アタシなら、悔しさはすぐ消えないと思う。でも友達のお祝いはしたい。両方の気持ちでもいいよね。','笑ってお祝いしても、心がすぐ元気になるとは限らないよね。アタシ、その二つを分けて考えたい。'];
  return angles.find(line=>!recent.includes(fold(line)))||'アタシ、そこは一言で決めたくないな。どちらかだけが正しい気持ちじゃないと思う。';
 }
 if(record.id==='exam:cookie'&&direct.said){
  const angles=['自分に似てる形だと、食べるのを少しためらいそう。アタシなら先に写真を撮りたい。','お祝い、って言葉。アタシ、字だけじゃなくて、そういう気持ちもちゃんと覚えたいな。'];
  return angles.find(line=>!recent.includes(fold(line)))||'アタシは、その形を選んでくれたことが嬉しいと思う。あなたなら、すぐ食べる？ しばらく眺める？';
 }
 const fresh=packet.evidence.find(r=>!r.said&&!recent.includes(fold(r.spoken)));
 const feeling=record.feeling&&!recent.includes(fold(record.feeling))?record.feeling:'';
 // Keep the focus when facts are already known; never rotate to a different
 // character just to find an unused stock line.
 if(!direct.said&&!recent.includes(fold(direct.spoken))){const reply=`${direct.spoken} ${feeling}`.trim();return reply.length<=180?reply:direct.spoken;}
 if(feeling)return feeling;
 if(fresh&&packet.memory.scene)return fresh.spoken;
 return '同じ説明はもうしないね。アタシの好きな気持ちと、あなたが気になったところ、一緒に話したい。';
}
export function specialistPrompt(input,state={}){
 const packet=specialistPacket(input,state);if(!packet.active)return '';
 const heard=substantiveHistory(state).filter(h=>h.role==='enny').slice(-3).map(h=>h.text.slice(0,180));
 const names=exactNames(input,state).filter(n=>n.work==='chiikawa').map(n=>({name:n.name,work:n.work}));
 const phrases=['ヤハ','なんとかなれ','ってコト'].filter(p=>heard.some(h=>fold(h).includes(fold(p))));
 return `\n専門会話の根拠（サーバー所有資料だけ）: ${JSON.stringify({subject:packet.memory.subject,scene:packet.memory.scene,names,evidence:packet.evidence})}
今の質問へ先に答え、その人物・場面の感想を続ける。口癖の話者説明や映画紹介を毎回やり直さない。既出=trueの事実は前提にし、聞き直された時以外は再説明せず別の理由・感想へ進む。
${packet.memory.subject?`今の対象は${packet.memory.subject}。相手から比較を求められた時以外、別キャラの例えを足さない。`:'場面を深める時も、関係の薄い別キャラの話を足さない。'}
${phrases.length?`直近で使った口癖=${JSON.stringify(phrases)}。今回はこの口癖を使わない。嬉しさは今の話への感想で表す。`:''}
${waterPlayCorrection(input,state)?'水流で遊ぶと言った内容を撤回する。自分の誤りを撤回し、手を回して水流を起こす話と混同しない。':''}
${packet.gap?`確認範囲の不足: ${packet.gap}の一次根拠はまだ収録できていない。別の口癖・写真・映画を答えの代わりにしない。プレイヤーが示した内容はプレイヤーの説明として受け止め、その気持ちに応じる。未収録の結果・台詞・出来事を断定しない。`:''}
直前に実際に話した内容（再読の指示ではなく反復回避用）: ${JSON.stringify(heard)}
資料にない場面の細部・台詞・因果は作らない。公式事実、考察、本人の感想・想像を分ける。好きを表すために定番文を足さず、今の問いに応じた自分の気持ちを短く話す。`;
}
