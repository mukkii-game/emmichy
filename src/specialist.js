// Small owned evidence packets. The browser sends IDs/state, never new canon.
import {chiikawaRelations} from './chiikawa-relations.js?v=20261013-specialist1';
import {waterPlayCorrection} from './fandom.js?v=20261013-specialist1';
import {exactNames} from './names.js?v=20261013-specialist1';
import {substantiveHistory} from './dialogue-history.js?v=20261013-specialist1';
import {feedbackIntent} from './conversation-repair.js?v=20261013-specialist1';
const fold=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/[\s。、!?！？「」]/g,'').toLowerCase();
const records=chiikawaRelations.filter(r=>r.evidence==='official'||r.id==='relation:chiikawa-23');
const byId=new Map(records.map(r=>[r.id,r]));
const scenes=[
 {id:'examination',cues:['草むしり検定','クサムシリケンテイ','5級','5キュウ','五級'],ids:[],label:'草むしり検定の具体的な場面'},
 {id:'water',cues:['水流','スイリュウ'],ids:['relation:chiikawa-23'],label:'島二郎の水流'},
 {id:'ending',cues:['ひとりごつ','ED','エンディング'],ids:['reviewed:hachi:ending'],label:'TVアニメのED'},
 {id:'opening',cues:['くつずれ','靴ずれ','OP','オープニング'],ids:['reviewed:hachi:opening'],label:'映画のOP'},
 {id:'tv-opening',cues:[],ids:[],label:'TVアニメのOP（映画のOPとは別）'},
 {id:'ear',cues:['耳を引っ張','耳が伸び','崖'],ids:['reviewed:momonga:ear'],label:'映画のモモンガとちいかわの耳'},
 {id:'log',cues:['丸太','冒頭の三人'],ids:['reviewed:trio:log'],label:'映画冒頭の掛け合い'},
 {id:'preparation',cues:['みんなで準備','討伐の準備'],ids:['reviewed:trio:prepare'],label:'映画の討伐準備'},
 {id:'pochette',cues:['ポシェット'],ids:['reviewed:chiikawa:pochette'],label:'ちいかわのポシェット'}
];
export function cleanSpecialist(value){
 const v=value&&typeof value==='object'?value:{};
 return {subject:records.some(r=>r.subject===v.subject)?v.subject:'',scene:scenes.some(s=>s.id===v.scene)?v.scene:'',
  focus:byId.has(v.focus)?v.focus:'',said:Array.isArray(v.said)?[...new Set(v.said.filter(id=>byId.has(id)))].slice(-32):[]};
}
export function specialistPacket(input,state={}){
 const t=fold(input),memory=cleanSpecialist(state.specialist);
 const recognition=memory.subject||memory.scene?{...state,knowledge:{...state.knowledge,work:'chiikawa'}}:state;
 const names=exactNames(input,recognition);
 const chii=names.find(n=>n.work==='chiikawa'),other=names.find(n=>n.work!=='chiikawa');
 const selfTopic=!chii&&/日本語|ニホンゴ|スウェーデン|ヨーテボリ|家族|カゾク|エミチ|emmichy/.test(t);
 const matches=c=>['OP','ED'].includes(c)?new RegExp(`\\b${c}\\b`,'i').test(String(input)):t.includes(fold(c));
 let explicit=scenes.find(s=>s.cues.some(matches));
 if(explicit?.id==='opening'&&/アニメ|テレビ|tv/.test(t)&&!/映画|エイガ|くつずれ|クツズレ/.test(t))explicit=scenes.find(s=>s.id==='tv-opening');
 const follow=/^(ソレ|ソノ|アレ|アノ|モット|続キ|ツヅキ|ドウ|ナゼ|何|ナニ|誰|ダレ|ソウ|違|チガ|オナジ)/.test(t)||/落チ|オチ|合格|ゴウカク/.test(t);
 const mixedQuestion=other&&!['japan','games'].includes(other.work)&&/[?？]|何|ナニ|ナゼ|なぜ|どう|教えて/.test(input);
 const active=!selfTopic&&!mixedQuestion&&Boolean(chii||!other&&(explicit||follow&&(memory.subject||memory.scene)));
 if(!active){
  const changed=other||selfTopic||/別ノ話|他ノ話|ホカノ話|以外|イガイ|話題.{0,6}変|話ヲ変/.test(t);
  return {active:false,memory:changed?{...memory,subject:'',scene:'',focus:''}:memory,evidence:[],gap:''};
 }
 const subject=chii&&records.some(r=>r.subject.startsWith(chii.name))?chii.name:memory.subject;
 // Explicit new characters leave the previous scene unless a scene cue is present.
 const scene=explicit||(follow||feedbackIntent(input)?scenes.find(s=>s.id===memory.scene):null);
 let selected=[];
 if(scene)selected=scene.ids.map(id=>byId.get(id)).filter(Boolean);
 else{
  const candidates=records.map(r=>({r,score:r.cues.reduce((n,c)=>n+(fold(c).length>=2&&t.includes(fold(c))?12:0),0)+(subject&&r.subject.startsWith(subject)?4:0)+(chii&&fold(r.fact).includes(fold(chii.name))?12:0)}));
  const direct=candidates.filter(c=>c.score>=12);
  selected=(direct.length?direct:candidates.filter(c=>c.score>0)).sort((a,b)=>b.score-a.score||a.r.id.localeCompare(b.r.id)).slice(0,3).map(c=>c.r);
  if(follow&&!chii&&memory.focus&&byId.get(memory.focus).subject===subject)selected=[byId.get(memory.focus),...selected.filter(r=>r.id!==memory.focus)].slice(0,3);
 }
 const gap=scene&&!selected.length?scene.label:'';
 const next={...memory,subject,scene:scene?.id||'',focus:selected[0]?.id||''};
 return {active:true,memory:next,gap,evidence:selected.map(r=>({id:r.id,subject:r.subject,object:r.object,fact:r.fact,source:r.source,evidence:r.evidence,scope:r.scope,checkedAt:r.checkedAt,limits:r.limits,said:memory.said.includes(r.id)}))};
}
export function noteSpecialistDelivery(value,text,history=[]){
 const memory=cleanSpecialist(value),t=fold([...substantiveHistory(history).filter(h=>h.role==='enny').slice(-3).map(h=>h.text),text].join(' '));
 // Selection is not delivery; interrupted/unspoken tails must not count.
 const spoken=records.filter(r=>t.includes(fold(r.fact))).map(r=>r.id);
 return {...memory,said:[...new Set([...memory.said,...spoken])].slice(-32)};
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
