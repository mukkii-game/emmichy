import {exactNames} from './names.js?v=20261010-fanmemory1';
export const CHII_REMINDER_MS=120000;
export function mentionsChiikawa(text){return exactNames(text,{knowledge:{work:'chiikawa'}}).some(row=>row.work==='chiikawa');}
export function noteChiikawa(session,text,now=Date.now()){
 if(session&&mentionsChiikawa(text))session.lastChiikawaElapsed=Math.max(0,now-session.startedAt);
}
export function chiikawaReminder(state,session,now=Date.now()){
 if(!session||session.finished||state.ended||now-session.startedAt-(session.lastChiikawaElapsed||0)<CHII_REMINDER_MS)return null;
 const users=(state.history||[]).filter(h=>h.role==='user').slice(-8).map(h=>h.text).join(' ');
 if(/つらい|苦しい|病気|事故|亡く|死に|相談|ちいかわ.{0,12}(?:以外|嫌い|苦手|やめ)|チイカワ.{0,16}(?:イガイ|キライ|ヤメ)|漫画.{0,12}(?:やめ|以外|じゃなく)|マンガ.{0,16}(?:ヤメ|イガイ)|別の話/.test(users))return null;
 const lines=['あ、ちいかわのこと思い出しちゃった。ハチワレって、嬉しいとすぐ顔に出るよね。アタシも今、そんな顔してるかも。','ちょっとだけ、ちいかわの話していい？ アタシ、ハチワレの気遣いが好きなの。つい、そこを見ちゃう。','ねえ、ちいかわのうさぎ。言葉が少ないのに、元気が伝わってくるね。アタシも、あの勢いほしいな。'];
 return lines[(session.chiikawaReminders||0)%lines.length];
}
