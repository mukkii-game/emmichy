export const SESSION_MS=5*60*1000;
export const SESSION_TURNS=18;
export function shouldEnd(session,now=Date.now()){
 if(session?.lastMood==='excited'&&session.turns<SESSION_TURNS+2&&now-session.startedAt<SESSION_MS+60000)return false;
 return Boolean(session && Number.isFinite(session.startedAt) && Number.isFinite(session.turns) && !session.finished && (session.turns>=SESSION_TURNS || now-session.startedAt>=SESSION_MS));
}
export function finishSession(state,session){
 const mode='movie';
 const text='アッ チイカワ 10カイメ ミニイク ジカン ダ！ マタネ！';
 return {state:{...state,ended:true,history:[...state.history,{role:'enny',text}].slice(-40)},session:{...session,finished:true},text,mode};
}
