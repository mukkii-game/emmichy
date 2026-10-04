export const SESSION_MS=5*60*1000;
export const SESSION_TURNS=18;
export function shouldEnd(session,now=Date.now()){
 return Boolean(session && Number.isFinite(session.startedAt) && Number.isFinite(session.turns) && !session.finished && (session.turns>=SESSION_TURNS || now-session.startedAt>=SESSION_MS));
}
export function finishSession(state,session){
 const mode=state.fan.excitement>state.fan.worry?'movie':'anime';
 const text=mode==='movie'?'ア ゴメン エイガ チイカワ\nモウ イッカイ ミル ジカン ナノ\nツヅキハ マタネ バイバイ':'ア ソロソロ チイカワ ノ\nアニメ ミナキャ ダカラ カエルネ\nアナタノ ハナシハ マタ コンド バイバイ';
 return {state:{...state,ended:true,history:[...state.history,{role:'enny',text}].slice(-40)},session:{...session,finished:true},text,mode};
}
