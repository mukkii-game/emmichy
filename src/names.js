import {nameData} from './name-data.js?v=20261014-view1';
import {placeNames} from './places.js?v=20261014-view1';
import {gameNames} from './game-names.js?v=20261014-view1';
import {requestsChiikawa} from './topic-intent.js?v=20261017-link1';
export const foldName=s=>String(s||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).toLowerCase().replace(/[\s・×＝=\-:：'’"「」]/g,'');
export const NAME_REACTION_MS=750;
const trie=new Map(),exact=[];
function insert(alias,row){const key=foldName(alias);if(key.length<2)return;let node=trie;for(const ch of key){if(!node.has(ch))node.set(ch,new Map());node=node.get(ch);}if(!node.has(''))node.set('',[]);node.get('').push({row,alias,key});}
for(const row of nameData)for(const alias of row.aliases){insert(alias,row);exact.push({row,alias,key:foldName(alias)});}
for(const row of placeNames)for(const alias of row.aliases)insert(alias,row);
for(const name of gameNames)insert(name,{id:`steam:${name}`,name,reading:name,work:'games',aliases:[name],contextOnly:false});
const distinct=matches=>[...new Map(matches.map(m=>[m.row.id,m])).values()];
const ownedNames=new Map([...nameData,...placeNames,...gameNames.map(name=>({id:`steam:${name}`,name,reading:name,work:'games'}))].map(row=>[row.id,row]));
export const nameFromId=id=>ownedNames.get(id)||null;
function scan(value){const input=foldName(value),found=[];for(let i=0;i<input.length;i++){let node=trie;for(let j=i;j<input.length;j++){node=node.get(input[j]);if(!node)break;for(const m of node.get('')||[]){
 if(m.key==='キュウ'&&/[0-9一二三四五六七八九十]/.test(input[i-1]||''))continue; // A grade/count is not Hunter's character.
 if(/^[a-z0-9]+$/.test(m.key)&&m.key.length<=5&&!new RegExp(`\\b${m.key}\\b`,'i').test(String(value)))continue;
 if(m.row.work==='japan'&&m.key.length<4&&!String(value).includes(m.row.name)&&input!==m.key&&!/旅行|観光|温泉|空港|地名|県|市/.test(value))continue;
 if(m.row.category==='context-item'&&m.key.length<=3&&input!==m.key&&!String(value).normalize('NFKC').includes(m.alias))continue;
 if(/^[ァ-ヶー]{2,3}$/.test(m.alias)&&/\.html$/.test(m.row.source)&&!String(value).normalize('NFKC').includes(m.alias)&&foldName(value)!==m.key)continue;
 found.push({...m,length:j-i+1,start:i,end:j+1});
 }}}return found.filter(m=>!found.some(longer=>longer.row.work===m.row.work&&longer.length>m.length&&longer.start<=m.start&&longer.end>=m.end));}
function workIn(state){if(state.knowledge?.work)return state.knowledge.work;for(const h of (Array.isArray(state.history)?state.history:[]).slice(-8).toReversed()){const matches=scan(h?.text).filter(m=>m.row.work!=='games');if(matches.length)return matches.sort((a,b)=>b.length-a.length)[0].row.work;}return '';}
export function oneEdit(a,b){if(a===b)return false;if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,edits=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++edits>1)return false;if(a.length>b.length)i++;else if(b.length>a.length)j++;else if(a[i]===b[j+1]&&a[i+1]===b[j]){i+=2;j+=2;}else{i++;j++;}}return edits+(i<a.length||j<b.length?1:0)===1;}
function inContext(row,input,work){
 if(!row.contextOnly||row.work===work)return true;
 // A fan's praise or a standalone call names Chiikawa's Usagi even after another work.
 return row.work==='chiikawa'&&row.name==='うさぎ'&&(!/飼|ペット|動物|野生|エサ|餌|牧場/.test(input))&&(foldName(input)==='ウサギ'||/かっこ|カッコ|好き|スキ|かわいい|カワイイ|キャラ|ちいかわ|チイカワ/.test(input));
}
export function exactNames(input,state={}){const work=workIn(state);return distinct(scan(input)).filter(m=>inContext(m.row,input,work)).map(m=>m.row);}
// A work title provides context; a named character in the question owns the answer.
export function focusName(input,state={}){
 const names=exactNames(input,state),chii=names.filter(n=>n.work==='chiikawa');
 const specific=chii.filter(n=>n.name!=='ちいかわ'),pool=specific.length?specific:chii;
 const t=foldName(input);
 return pool.sort((a,b)=>Math.max(...b.aliases.map(s=>t.lastIndexOf(foldName(s))))-Math.max(...a.aliases.map(s=>t.lastIndexOf(foldName(s)))))[0]||null;
}
export function recognizeName(input,{reading='',state={}}={}){
 const work=workIn(state),values=[input,reading].filter(Boolean);
 const decline=!requestsChiikawa(input)&&/(?:漫画|マンガ).*(?:ヤメ|以外|イガイ(?!イ)|苦手)|別ノ話|ベツノハナシ|ソノ話.*ヤメ|チイカワ.*(?:ヤメ|以外|イガイ(?!イ)|嫌イ|キライ|苦手)/.test(foldName(input));
 const matches=distinct(values.flatMap(scan)).filter(m=>inContext(m.row,input,work));
 const common=values.flatMap(scan).filter(m=>m.row.work==='chiikawa'&&m.row.contextOnly&&work!=='chiikawa');
 matches.sort((a,b)=>b.length-a.length||(b.row.work===work?1:0)-(a.row.work===work?1:0));
 const chii=focusName(input,state)||matches.find(m=>m.row.work==='chiikawa')?.row;
 if(chii)return {...chii,soft:false,decline};
 const direct=matches[0];
 if(decline||/つらい|苦しい|病気|事故|亡く|死に|相談/.test(input))return direct?{...direct.row,soft:false,decline}:null;
 // User-requested playful mishearing. It never rewrites the player's input.
 if(/(?:ももが|桃が|モモガ)/.test(input))return {...nameData.find(n=>n.name==='モモンガ'),soft:true};
 const candidates=exact.filter(m=>/^[ァ-ヶー]{3,14}$/.test(m.alias)&&(m.row.work===work||m.row.work==='chiikawa')&&(!m.row.contextOnly||m.row.work===work)&&!(m.alias.length<=3&&/\.html$/.test(m.row.source))&&(m.row.work!=='chiikawa'||work==='chiikawa'||!['term','item','food','brand'].includes(m.row.category)));
 const near=[];
 const fragments=String(input).normalize('NFKC').match(/[ァ-ヶー]{3,16}/g)||[];
 if(/^[ぁ-ゖー]{3,16}[!！?？。]*$/.test(String(input).trim()))fragments.push(input);
 if(reading)fragments.push(...reading.split(/\s+/).filter(word=>/^[ァ-ヶー]{3,16}$/.test(word)));
 for(const value of fragments){const t=foldName(value);for(const m of candidates){if(m.key.length<4&&m.row.work!==work)continue;if(!common.some(c=>c.key.includes(t)||t.includes(c.key))&&oneEdit(t,m.key))near.push({...m,length:m.key.length});}}
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
