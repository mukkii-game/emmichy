import fs from 'node:fs/promises';
import kuromoji from 'kuromoji';
import {nameSeeds} from '../src/name-seeds.js';
import {cards,works} from '../src/fandom.js';
const tokenizer=await new Promise((resolve,reject)=>kuromoji.builder({dicPath:'assets/dict/'}).build((e,t)=>e?reject(e):resolve(t)));
const kana=s=>s.normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96));
const reading=s=>tokenizer.tokenize(s).map(t=>t.reading||kana(t.surface_form)).join('');
const rows=new Map(),sources=[];
function add(work,name,sound=reading(name),aliases=[],source='repo:src/fandom.js',contextOnly=false){
 name=name.trim();if(!name)return;const id=`${work}:${name}`;
 if(!rows.has(id))rows.set(id,{id,work,name,reading:sound,aliases:[...new Set([name,sound,...aliases])],source,contextOnly});
}
for(const [work,source,text] of nameSeeds)for(const line of text.trim().split('\n')){const [name,rest]=line.split('=');const [sound,...aliases]=rest.split('|');add(work,name,sound,aliases,source,['うさぎ','ラッコ','星','古本屋','郎','オデ','ナニカ','ジン','カイト','クリーム','アトリエ'].includes(name));}
const hunter=['index','kimera','genei','jyunishin',...Array.from({length:6},(_,i)=>`other_0${i+1}`)].map(page=>`https://www.ntv.co.jp/hunterhunter/character/${page}.html`);
const jojo=['pb-bt/character/pb/','pb-bt/character/bt/','sc/character/','du/character/','gw/character/','so/character/'].map(path=>`https://jojo-portal.com/anime/${path}`);
for(const url of [...hunter,...jojo]){
 const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok){sources.push({url,status:r.status});continue;}const html=await r.text();let names=[];
 if(url.includes('ntv.co.jp'))names=[...html.matchAll(/<li[^>]*>\s*(?:<a[^>]*>)?\s*<img[^>]*alt="([^"]+)"/g)].map(m=>m[1]);
 else names=[...html.matchAll(/<a[^>]*href="[^\"]*\/character\/(?:[a-z]+\/)?\d+\/"[^>]*>([\s\S]*?)<\/a>/g)].map(m=>m[1].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().split('CV.')[0].trim()).filter(s=>s&&!/CHARACTER|キャラクター|STORY/.test(s));
 const work=url.includes('ntv.co.jp')?'hunter':'jojo';
 for(let name of names){name=name.replace(/&amp;/g,'&').trim();if(name.length<2||name.length>28)continue;add(work,name,reading(name),[],url,name.length<=2);}
 sources.push({url,status:r.status,names:names.length});
}
const generic=new Set('映画|人魚|島|脚本|監督|制作|音楽|写真|カメラ|料理|ご飯|家|住む|資格|仕事|心配|不安|漫画|アニメ|無料|ランキング|最新|公開|公開日|人気|修行|能力|変身|戦い|仲間|主人公|本|旅|名前|水|泳ぐ|潜る|店主|カレー|貝|初期|没|声|星|免許証|勉強|あだ名|タクシー|ギャップ|日本|九月|船|漕ぐ|絵|声優|作者|覚える|酒|運転|討伐'.split('|'));
for(const card of cards)for(const name of card.tags)if(name.length>=3&&!generic.has(name))add(card.work,name,reading(name),[],`repo:src/fandom.js#${card.id}`,true);
for(const [work,aliases] of Object.entries(works))add(work,aliases[0],reading(aliases[0]),aliases,'repo:src/fandom.js',false);
const data=[...rows.values()];await fs.writeFile('src/name-data.js',`// Generated reading/recognition names. Run scripts/build-name-data.mjs to refresh.\nexport const nameData=${JSON.stringify(data)};\n`);
await fs.writeFile('docs/name-data-20261008.json',JSON.stringify({count:data.length,works:Object.fromEntries([...new Set(data.map(r=>r.work))].map(w=>[w,data.filter(r=>r.work===w).length])),sources,limitations:'Name-only recognition; aliases editorial, tokenizer readings except seed overrides. No claim of complete canon or correct story details.'},null,2));
console.log(JSON.stringify({names:data.length,sources:sources.length,bytes:(await fs.stat('src/name-data.js')).size}));
