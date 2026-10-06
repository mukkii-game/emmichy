export const SESSION_MS=5*60*1000;
export const SESSION_TURNS=18;
export function checkpointSession(session,now=Date.now()) {
 return session?{...session,lastSavedAt:now}:null;
}
export function resumeSession(session,now=Date.now()) {
 if(!session||!Number.isFinite(session.startedAt)||!Number.isFinite(session.turns))return null;
 const saved=Number.isFinite(session.lastSavedAt)?session.lastSavedAt:now;
 return {...session,startedAt:session.startedAt+Math.max(0,now-saved),lastSavedAt:now};
}
export function startConversation(state,now=Date.now()) {
 return {state:{...state,turn:0,last:'',repeat:0,praise:0,clues:0,topic:'',fan:{worry:0,excitement:0,lastTopic:''},performance:{},speechStyle:'normal',ended:false,history:[]},session:{startedAt:now,lastSavedAt:now,turns:0,finished:false}};
}
export function shouldEnd(session,now=Date.now()){
 if(session?.lastMood==='excited'&&session.turns<SESSION_TURNS+2&&now-session.startedAt<SESSION_MS+60000)return false;
 return Boolean(session && Number.isFinite(session.startedAt) && Number.isFinite(session.turns) && !session.finished && (session.turns>=SESSION_TURNS || now-session.startedAt>=SESSION_MS));
}
export function finishSession(state,session){
 const mode='movie';
 const text='アッ チイカワ 10カイメ ミニイク ジカン ダ！ マタネ！';
 return {state:{...state,ended:true,history:[...state.history,{role:'enny',text}].slice(-40)},session:{...session,finished:true},text,mode};
}
