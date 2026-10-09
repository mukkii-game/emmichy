import {topicDeflection} from './deflection.js?v=20261009-readmenu1';
import {everydayReply} from './everyday.js?v=20261008-hybrid1';
import {contextualReply} from './context.js?v=20261009-readmenu1';
import {curatedReply} from './curated.js?v=20261006-mix1';
import {balanceRoute} from './balance.js?v=20261009-readmenu1';
import {profileReply} from './profile.js?v=20261009-readmenu1';
import {recognizeName,exactNames} from './names.js?v=20261009-readmenu1';
import {chiikawaNotes} from './chiikawa-db.js?v=20261009-profile1';
import {unwantedFanRedirect} from './chat.js?v=20261009-pacing2';

function chiikawaReply(raw,state){
 if(/つらい|苦しい|病気|事故|亡く|死に|相談|やめ|以外|苦手|嫌い/.test(raw)||unwantedFanRedirect('ちいかわ',raw,state))return null;
 const name=recognizeName(raw,{state}),note=name?.work==='chiikawa'&&!name.soft&&!name.decline?chiikawaNotes[name.name]:null;
 if(!note)return null;
 const question=/[?？]|何|誰|担当|教えて|どう|なぜ|いつ|どこ|どんな|説明/.test(raw);
 if(question&&exactNames(raw,state).some(n=>n.work!=='chiikawa'))return null;
 // Only the closed fact covered by this note can bypass AI for a question.
 const covered={ナガノ:/作者|作詞|誰|何して/,トクマルシューゴ:/音楽|担当|作曲|編曲|誰|何して/,ひとりごつ:/誰|歌|作曲|作詞|曲/,チャルメラ:/チャリメラ|言い間違|何/,オリオンビール:/コラボ/,チータラ:/食べ|くりまんじゅう/,むちゃうまヨーグルト:/家|おうち/};
 if(question&&(!covered[name.name]?.test(raw)||/最新|結末|なぜ|どうして|比較|違い|いつ|どこ|何年/.test(raw)))return null;
 const text=question?`${note.fact} ${note.questionReaction||note.reaction}`:note.reaction;
 if(!question&&(state.history||[]).slice(-8).some(h=>h.role==='enny'&&h.text===text))return null;
 return {topic:'chiikawa-name',id:`chiikawa-note:${name.name}`,text};
}

// Shared by the screen and offline through-play checks.
export function preparedReply(raw,state,session,{gap=null,culture=null,repertoire={},modelEnabled=false,kind=null}={}){
 if(['bye','asleep'].includes(kind))return null;
 const deflect=topicDeflection(raw,state);if(deflect)return deflect;
 if(['name','arithmetic'].includes(kind))return null;
 const own=profileReply(raw);if(own)return own;
 if(kind==='memory')return null;
 const named=recognizeName(raw,{state});
 if(named?.decline&&named.work==='chiikawa'&&!/つらい|苦しい|相談|病気|いじめ|亡く|死に|事故/.test(raw)&&!exactNames(raw,state).some(n=>n.work!=='chiikawa'))return {topic:'fandom-decline',text:'うん、別の話にしよう。'};
 const chii=chiikawaReply(raw,state);if(chii)return chii;
 const legacy=contextualReply(raw,state)||curatedReply(raw,state);
 const daily=everydayReply(raw,state);
 const prepared=daily|| (legacy?.topic==='conversation-move'?legacy:
  gap&&!(named?.work==='chiikawa'&&state.knowledge?.work!=='chiikawa')?{text:gap.text,topic:'gap'}:
  culture?.kind==='curiosity'?{text:culture.text,topic:'culture'}:
  repertoire.scripted?{text:repertoire.candidate.text,topic:'repertoire'}:
  legacy&&(!repertoire.candidate||legacy.topic==='greeting')?legacy:null);
 return balanceRoute(prepared,repertoire,session,modelEnabled);
}
