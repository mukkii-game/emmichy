import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.resolve(process.argv[2]||path.join(root,'..','game-llm'));
if(!fs.existsSync(path.join(target,'games','emmichy.js')))throw Error('Specify the existing game-llm checkout.');
const modules=process.argv.includes('--director')?['conversation-repair','fandom','fan-lines','profile','names','dialogue-history','chiikawa-theme','chiikawa-relations','chiikawa-reviewed','topic-intent','player-memory','japanese-learner','chiikawa-attribution','chiikawa-db','humor']:process.argv.includes('--fan-memory')?['names','profile','places','fandom']:process.argv.includes('--places-profile')?['names','profile','places']:process.argv.includes('--chiikawa-profile')?['names','name-data','game-names','chiikawa-db','profile','fandom','places']:process.argv.includes('--names-only')?['names','name-data','game-names','places']:['fandom','fan-lines','gap','repertoire','context','conversation'];
for(const name of modules){
 let content=fs.readFileSync(path.join(root,'src',`${name}.js`),'utf8');
 content=content.replace(/'\.\/(conversation-repair|dialogue-sentences|fandom|fan-lines|names|name-data|game-names|chiikawa-db|chiikawa-relations|chiikawa-reviewed|profile|places|topic-intent|player-memory|japanese-learner|chiikawa-attribution|humor)\.js(?:\?v=[^']+)?'/g,(_,module)=>`'./emmichy-${module}.js'`);
 fs.writeFileSync(path.join(target,'games',`emmichy-${name}.js`),content);
}
let specialist=fs.readFileSync(path.join(root,'src','specialist.js'),'utf8');
specialist=specialist.replace(/'\.\/(chiikawa-relations|chiikawa-scenes|chiikawa-news|fandom|names|dialogue-history|conversation-repair)\.js(?:\?v=[^']+)?'/g,(_,module)=>`'./emmichy-${module}.js'`);
fs.writeFileSync(path.join(target,'games','emmichy-specialist.js'),specialist);
for(const name of ['chiikawa-scenes','chiikawa-news','specialist-reply','dialogue-sentences']){
 let content=fs.readFileSync(path.join(root,'src',`${name}.js`),'utf8');
 content=content.replace(/'\.\/(specialist|dialogue-sentences|chiikawa-attribution|humor)\.js(?:\?v=[^']+)?'/g,(_,module)=>`'./emmichy-${module}.js'`);
 fs.writeFileSync(path.join(target,'games',`emmichy-${name}.js`),content);
}
console.log('Synced Emmichy dialogue data and selection logic. Server prompts stay in games/emmichy.js.');
