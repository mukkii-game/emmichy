import {nameData} from './name-data.js?v=20261009-profile1';
import {gameNames} from './game-names.js?v=20261009-profile1';
export const foldName=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).toLowerCase().replace(/[\s・×＝=\-:：'’"「」]/g,'');
export const NAME_REACTION_MS=750;
const trie=new Map(),exact=[];
function insert(alias,row){const key=foldName(alias);if(key.length<2)return;let node=trie;for(const ch of key){if(!node.has(ch))node.set(ch,new Map());node=node.get(ch);}if(!node.has(''))node.set('',[]);node.get('').push({row,alias,key});}
for(const row of nameData)for(const alias of row.aliases){insert(alias,row);exact.push({row,alias,key:foldName(alias)});}
for(const name of gameNames)insert(name,{id:`steam:${name}`,name,reading:name,work:'games',aliases:[name],contextOnly:false});
const distinct=matches=>[...new Map(matches.map(m=>[m.row.id,m])).values()];
function scan(value){const input=foldName(value),found=[];for(let i=0;i<input.length;i++){let node=trie;for(let j=i;j<input.length;j++){node=node.get(input[j]);if(!node)break;for(const m of node.get('')||[]){
 if(/^[a-z0-9]+$/.test(m.key)&&m.key.length<=5&&!new RegExp(`\\b${m.key}\\b`,'i').test(String(value)))continue;
 if(/^[ァ-ヶー]{2,3}$/.test(m.alias)&&/\.html$/.test(m.row.source)&&!String(value).normalize('NFKC').includes(m.alias)&&foldName(value)!==m.key)continue;
 found.push({...m,length:j-i+1});
 }}}return found;}
function workIn(state){if(state.knowledge?.work)return state.knowledge.work;for(const h of (Array.isArray(state.history)?state.history:[]).slice(-8).toReversed()){const matches=scan(h?.text).filter(m=>m.row.work!=='games');if(matches.length)return matches.sort((a,b)=>b.length-a.length)[0].row.work;}return '';}
export function oneEdit(a,b){if(a===b)return false;if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,edits=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++edits>1)return false;if(a.length>b.length)i++;else if(b.length>a.length)j++;else if(a[i]===b[j+1]&&a[i+1]===b[j]){i+=2;j+=2;}else{i++;j++;}}return edits+(i<a.length||j<b.length?1:0)===1;}
export function exactNames(input,state={}){const work=workIn(state);return distinct(scan(input)).filter(m=>!m.row.contextOnly||m.row.work===work).map(m=>m.row);}
export function recognizeName(input,{reading='',state={}}={}){
 const work=workIn(state),values=[input,reading].filter(Boolean);
 const decline=/(?:漫画|マンガ).*(?:ヤメ|以外|イガイ|苦手)|別ノ話|ベツノハナシ|ソノ話.*ヤメ|チイカワ.*(?:ヤメ|以外|イガイ|嫌イ|キライ|苦手)/.test(foldName(input));
 const matches=distinct(values.flatMap(scan)).filter(m=>!m.row.contextOnly||m.row.work===work);
 const common=values.flatMap(scan).filter(m=>m.row.work==='chiikawa'&&m.row.contextOnly&&work!=='chiikawa');
 matches.sort((a,b)=>b.length-a.length||(b.row.work===work?1:0)-(a.row.work===work?1:0));
 const chii=matches.find(m=>m.row.work==='chiikawa');
 if(chii)return {...chii.row,soft:false,decline};
 const direct=matches[0];
 if(decline||/つらい|苦しい|病気|事故|亡く|死に|相談/.test(input))return direct?{...direct.row,soft:false,decline}:null;
 // User-requested playful mishearing. It never rewrites the player's input.
 if(/(?:ももが|桃が|モモガ)/.test(input))return {...nameData.find(n=>n.name==='モモンガ'),soft:true};
 const candidates=exact.filter(m=>/^[ァ-ヶー]{3,14}$/.test(m.alias)&&(m.row.work===work||m.row.work==='chiikawa')&&(!m.row.contextOnly||m.row.work===work)&&!(m.alias.length<=3&&/\.html$/.test(m.row.source))&&(m.row.work!=='chiikawa'||work==='chiikawa'||!['term','item','food','brand'].includes(m.row.category)));
 const near=[];
 for(const value of values){const t=foldName(value);for(const m of candidates){if(m.key.length<4&&m.row.work!==work)continue;for(let size=m.key.length-1;size<=m.key.length+1;size++)for(let at=0;at+size<=t.length;at++){const word=t.slice(at,at+size);if(!common.some(c=>c.key.includes(word)||word.includes(c.key))&&oneEdit(word,m.key))near.push({...m,length:m.key.length});}}}
 near.sort((a,b)=>(b.row.work==='chiikawa'?1:0)-(a.row.work==='chiikawa'?1:0)||b.length-a.length);
 const nearChii=near.find(m=>m.row.work==='chiikawa');
 if(nearChii)return {...nearChii.row,soft:true};
 if(direct)return {...direct.row,soft:false,decline};
 return near.length?{...near[0].row,soft:true}:null;
}
export function namedGesture(match){return match?`${match.reading}${match.decline?'、ね。':'！'}`:null;}
export function namedFollowup(match,input=''){
 if(match.decline)return 'うん、別の話にしよう。';
 if(match.soft)return `${match.reading}って聞こえちゃった。あ、ちょっと似た言葉だった？`;
 if(/みたい|っぽい|言い方|イイカタ/.test(input))return `${match.reading}みたいな言い方、かー。`;
 return `${match.reading}の話ね。`;
}
