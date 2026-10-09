import {everydayEnding} from './everyday.js?v=20261008-hybrid1';
import {selectEnding} from './endings.js?v=20261009-farewell2';
import {cleanConversation,endingCallback} from './conversation.js?v=20261008-humor1';
export const SESSION_MS=5*60*1000;
export const MIN_SESSION_TURNS=10;
export const SESSION_TURNS=18;
export function remainingTime(session,now=Date.now()){
 const seconds=session?.finished?0:Math.ceil(Math.max(0,SESSION_MS-(session?Math.max(0,now-session.startedAt):0))/1000);
 return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
export function checkpointSession(session,now=Date.now()) {
 return session?{...session,lastSavedAt:now}:null;
}
export function resumeSession(session,now=Date.now()) {
 if(!session||!Number.isFinite(session.startedAt)||!Number.isFinite(session.turns))return null;
 // Older versions only stored a wall-clock start. Its away time is unknown;
 // give migrated conversations a fresh time window and retain turn count.
 if(!Number.isFinite(session.lastSavedAt))return {...session,startedAt:now,lastSavedAt:now};
 const saved=session.lastSavedAt;
 return {...session,startedAt:session.startedAt+Math.max(0,now-saved),lastSavedAt:now};
}
export function startConversation(state,now=Date.now()) {
 return {state:{...state,turn:0,last:'',repeat:0,praise:0,clues:0,topic:'',fan:{worry:0,excitement:0,lastTopic:''},performance:{},conversation:cleanConversation(null),gap:{...state.gap,lastTurn:-10},repertoire:{...state.repertoire,lastTurn:-10},speechStyle:'normal',ended:false,history:[]},session:{startedAt:now,lastSavedAt:now,turns:0,finished:false}};
}
export function shouldEnd(session,now=Date.now()){
 if(!session||session.turns<MIN_SESSION_TURNS||now-session.startedAt<SESSION_MS)return false;
 if(session?.lastMood==='excited'&&session.turns<SESSION_TURNS+2&&now-session.startedAt<SESSION_MS+60000)return false;
 return Boolean(session && Number.isFinite(session.startedAt) && Number.isFinite(session.turns) && !session.finished && (session.turns>=SESSION_TURNS || now-session.startedAt>=SESSION_MS));
}
export function finishSession(state,session){
 // Idle farewell uses the same reason and grounded callback as other endings.
 const mode='fandom',ending=selectEnding(state),callback=endingCallback(state.conversation),daily=callback?'':everydayEnding(state);
 const parts=[ending.reason,`${ending.transition} ${callback?.text||daily||ending.farewell}バイバイ！`.trim()],text=parts.join('\n\n');
 return {state:{...state,conversation:callback?.memory||cleanConversation(state.conversation),endingSeen:ending.seen,ended:true,history:[...state.history,{role:'enny',text}].slice(-40)},session:{...session,finished:true},text,parts,mode};
}
