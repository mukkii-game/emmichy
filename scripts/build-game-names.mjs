// Explicit refresh only. No catalog fetches during a conversation.
import fs from 'node:fs/promises';
const titles=new Set(),pages=[];let stopped=null;
async function persist(){const names=[...titles].sort();await fs.writeFile('src/game-names.js',`// Official Steam store name snapshot,2026-10-08. Recognition only, no game facts.\nexport const gameNames=${JSON.stringify(names)};\n`);await fs.writeFile('docs/game-names-20261008.json',JSON.stringify({source:'https://store.steampowered.com/search/?category1=998&l=japanese',checkedAt:'2026-10-08',pages,count:names.length,stopped},null,2));}
for(let start=0;start<5000;start+=100){
 const url=`https://store.steampowered.com/search/results/?category1=998&l=japanese&cc=jp&start=${start}&count=100&json=1`;
 const r=await fetch(url,{signal:AbortSignal.timeout(20000)});
 if(!r.ok){stopped=`HTTP${r.status} at${start}`;break;}
 const data=await r.json();if(!Array.isArray(data.items))throw new Error('Unexpected catalog format');
 let added=0;for(const row of data.items){const name=String(row.name||'').trim();if(name.length>=4&&name.length<=100&&!titles.has(name)){titles.add(name);added++;}}
 pages.push({start,received:data.items.length,added});
 await persist();
 if(!data.items.length||(!added&&start>0))break;
 await new Promise(resolve=>setTimeout(resolve,1100));
}
const names=[...titles].sort();
await persist();
console.log(JSON.stringify({count:names.length,pages:pages.length,bytes:(await fs.stat('src/game-names.js')).size}));
