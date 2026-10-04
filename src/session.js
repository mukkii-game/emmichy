export const SESSION_MS=5*60*1000;
export const SESSION_TURNS=18;
export function shouldEnd(session,now=Date.now()){
 return Boolean(session && Number.isFinite(session.startedAt) && Number.isFinite(session.turns) && !session.finished && (session.turns>=SESSION_TURNS || now-session.startedAt>=SESSION_MS));
}
export function finishSession(state,session){
 const mode=state.fan.excitement>state.fan.worry?'movie':'anime';
 const text=mode==='movie'?'アッ チイカワ\n10カイメ ミニイク ジカン ダ！\nマタネ イヤッハアアアッ！！':'アッ モウ コンナ ジカン\nチイカワ 10カイメ ミニイクノ\nマタネ！';
 return {state:{...state,ended:true,history:[...state.history,{role:'enny',text}].slice(-40)},session:{...session,finished:true},text,mode};
}
