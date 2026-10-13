// Conversation acts are handled before lexical fandom cues. A player's complaint
// is not a food preference, a name, or an invitation to another monologue.
export const foldRepair=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).replace(/\s/g,'');
const ids=new Set(['jp:long-vowel','jp:accent','jp:small-tsu','profile:family','profile:home','profile:notebook']);
const intents=new Set(['length','repeat','coherence','redirect','forgive','commit','confirm','meaning','recall','reassure']);
const words=[
 {word:'運行',match:/運行|ウンコウ/,meaning:'電車やバスが、決まった道を走ること。',example:'「電車の運行状況」なら、今ちゃんと走ってるか、ってことだよ。',id:'jp:long-vowel'},
 {word:'許す',match:/許ス|ユルス/,meaning:'相手を責めるのをやめて、受け入れること。',example:'「許すよ」は、もう怒ってないよ、って気持ちなんだね。'},
 {word:'橋と箸',match:/橋|箸|ハシ/,meaning:'橋は、川を渡るためのもの。箸は、ご飯を食べる道具。',example:'音の高さで区別する、って話だったよ。',id:'jp:accent'},
 {word:'長音',match:/長音|チョウオン/,meaning:'「おばあさん」の「ああ」みたいに、長く伸ばす音だよ。',id:'jp:long-vowel'},
 {word:'促音',match:/促音|ソクオン/,meaning:'「切って」の、小さい「っ」で一度止まる音だよ。',id:'jp:small-tsu'}
];
export function cleanDialogueControl(value){
 const v=value&&typeof value==='object'?value:{};
 return {concise:v.concise===true,avoidFandom:v.avoidFandom===true,quiet:v.quiet===true,
  lastIntent:intents.has(v.lastIntent)?v.lastIntent:'',lastWord:words.some(w=>w.word===v.lastWord)?v.lastWord:'',
  suppressed:[...new Set((Array.isArray(v.suppressed)?v.suppressed:[]).filter(id=>ids.has(id)))].slice(-6)};
}
export function feedbackIntent(input){
 const t=foldRepair(input);
 if(/(?:話|ハナシ|会話|カイワ|返事|ヘンジ|文|ブン|一言|ヒトコト).{0,25}(?:長スギ|ナガスギ|長イノ.{0,6}苦手|ナガイノ.{0,6}苦手)|短ク|ミジカク|短メ|ミジカメ/.test(t))return 'length';
 if(/ワンパターン|同ジ話|オナジ話|同ジネタ|オナジネタ|何度モ|ナンドモ|何回モ|ナンカイモ|[0-9０-９一二三四五六七八九十]+回目|サッキモ聞|サッキモキ|モウ聞イタ|モウキイタ/.test(t))return 'repeat';
 if(/独リ言|ヒトリゴト|会話.{0,16}(?:成立|成リ立|ニナッテナイ|ニナッテイナイ|ダメ|ヒド)|噛ミ合|カミアワ|話.{0,16}(?:ズレ|逸レ|通ジ)|質問ニ答エ|聞イテナイ|キイテナイ|馬鹿スギ|バカスギ|意味不明/.test(t))return 'coherence';
 if(/(?:チイカワ|地位側|地位回).{0,20}(?:強引|ゴウイン|挟ミスギ|入レスギ|無理)|話題.{0,12}(?:強引|ゴウイン|変エスギ)/.test(t))return 'redirect';
 if(/^(?:ウン、?|モウ大丈夫。?|大丈夫。?)?(?:許ス|ユルス)(?:ヨ|ネ|カラ|!|。)*$/.test(t))return 'forgive';
 if(/^(?:ジャア|デハ|ソレナラ)?(?:工夫|クフウ|改善|カイゼン|直シ|ナオシ|気ヲツケ).*(?:ネ|テ|ヨ|お願い|オネガイ)/.test(t))return 'commit';
 return '';
}
function topicId(t){return /運行|ウンコウ|長音|長イ音/.test(t)?'jp:long-vowel':/橋|箸|ハシ/.test(t)?'jp:accent':/弟|オトウト/.test(t)?'profile:family':/ノート/.test(t)?'profile:notebook':/スウェーデン|ヨーテボリ/.test(t)?'profile:home':null;}
export function updateDialogueControl(value,input){
 const c=cleanDialogueControl(value),t=foldRepair(input),intent=feedbackIntent(input);
 const explicitResume=(/^(?:ハチワレ|シーサー|ウサギ|モモンガ)[!?？。]*$/.test(t)||/(?:チイカワ|ハチワレ|シーサー|ウサギ|モモンガ).{0,24}(?:話シタイ|話シテ|話ソウ|ハナシテ|ハナソウ|話シヨ|話シナイ|話ニ戻|ハナシタイ|続ケ|ツヅケ|ドコガ好キ|ドコガスキ)/.test(t))&&!intent;
 if(explicitResume)c.avoidFandom=false;
 if(/(?:チイカワ|漫画|マンガ|ソノ話).{0,16}(?:以外|イガイ|ヤメ|モウイイ)|別ノ話|ベツノ話/.test(t))c.avoidFandom=true;
 c.quiet=Boolean(intent);if(intent)c.lastIntent=intent;else if(!/^(?:本当|ホントウ|ホント)/.test(t))c.lastIntent='';
 if(intent==='length')c.concise=true;
 if(['repeat','coherence','redirect'].includes(intent))c.avoidFandom=true;
 if(intent==='repeat'){const id=topicId(t);if(id)c.suppressed=[...new Set([...c.suppressed,id])];}
 return c;
}
export function conversationRepair(input,state={}){
 const t=foldRepair(input),c=cleanDialogueControl(state.dialogueControl),intent=feedbackIntent(input);
 const history=[...(state.dialogue||state.history||[]),...(state.heardHistory||[])],prior=history.filter(h=>h.role==='enny').slice(-8).map(h=>h.text).join(' ');
 const clause=t.split(/[。!！]/).at(-1)||t;
 const entry=words.find(w=>w.match.test(clause));
 const asksMeaning=entry&&(/意味|イミ|知ラナイ|シラナイ|知ッテル|シッテル|ッテ何|ッテナニ|トハ何|トハナニ/.test(clause)||clause.replace(/[?？]/g,'')===foldRepair(entry.word)||!clause.replace(entry.match,'').replace(/[?？]/g,''));
 const contradiction=/アナタ|エミチ|自分|ジブン|サッキ|言ッタ|イッタ/.test(t)&&/知ラナイ|シラナイ|忘|ワスレ/.test(t);
 const reply=(id,text,word='')=>({topic:'conversation-repair',id:`repair:${id}`,text,word,intent:id});
 if(asksMeaning&&intent!=='repeat')return reply('meaning',`「${entry.word}」は、${entry.meaning}${contradiction?' アタシが出した言葉なのに、知らないって返したのは変だったね。':entry.example?' '+entry.example:''}`,entry.word);
 if(/キセイ|寄生|奇声/.test(t)&&/[?？]|何|ナニ|意味|イミ/.test(t)&&/キセイ|寄生|奇声/.test(prior))return reply('recall','「キセイ」だけじゃ、何のことかわからないね。急に単語だけ言って、話を飛ばしちゃった。');
 if(/ラッコ/.test(t)&&/[?？]|何|ナニ|どうして|ドウシテ/.test(t)&&/ラッコ/.test(prior)&&/テレビ|雨|番組/.test(prior))return reply('recall','テレビの話なのに、甘い物からラッコを連想して飛んじゃった。今はあなたのテレビの話を続けたい。');
 if(/(?:知ラナイ|シラナイ|ワカラナイ|無理シナク|ムリシナク).{0,40}(?:大丈夫|ダイジョウブ|イイヨ)|(?:大丈夫|ダイジョウブ).{0,30}(?:知ラナイ|シラナイ|ワカラナイ)/.test(t))return reply('reassure','ありがとう。知らない細部は、そう言うね。でも、アタシが話した気持ちはちゃんと説明する。');
 if(intent==='length')return reply(intent,'一度に長く話しすぎたね。短く分けて、あなたの返事を待つね。');
 if(intent==='repeat'){const id=topicId(t);return reply(intent,id==='jp:long-vowel'?'また「運行」の同じ例を出しちゃったね。この例はもうやめる。':id==='profile:family'?'弟の紹介、もう聞いたよね。同じ紹介はやめる。': '同じ話をまた始めちゃったね。一度話したことを、初めてみたいに繰り返さないようにする。');}
 if(intent==='coherence'||intent==='redirect')return reply(intent,'あなたの話に答えず、アタシの独り言を続けてたね。今は別の話を挟まず、ちゃんと聞く。');
 if(intent==='forgive')return reply(intent,'ありがとう、ほっとした。今度はあなたの話をちゃんと聞くね。');
 if(intent==='commit')return reply(intent,'うん。あなたのひと言を受けて、その続きを話すね。アタシだけで次の話を始めない。');
 if(c.lastIntent&&/^(?:本当|ホントウ|ホント|ほんと)(?:ニ|ナノ|カ)?[?？。]*$/.test(t))return reply('confirm','うん。今聞かれたことに答えてから、あなたの返事を待つね。');
 return null;
}
export function waitForPlayer(state){
 const c=cleanDialogueControl(state.dialogueControl),last=(state.history||[]).filter(h=>h.role==='enny').at(-1)?.text||'';
 return c.quiet||/[?？]\s*$/.test(last);
}
export function repairPrompt(input,state={}){
 const c=cleanDialogueControl(state.dialogueControl),r=conversationRepair(input,state);
 return `\n会話の現在の約束: ${c.concise?'一文を短く、30文字程度のまとまり。':''}${c.avoidFandom?'プレイヤーが再開を求めるまで漫画への連想を休む。':''} 既に話した内容への質問は、その内容を見て答える。自分の発言を「知らない」で切らない。${r?' 今の発言は'+r.intent+'。返答の意味の基準: '+r.text:''}${c.suppressed.length?' 繰り返さない話題ID: '+c.suppressed.join(','):''} 許し・苦情・訂正をプロフィールや好きな食べ物として保存しない。`;
}
