import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.resolve(process.argv[2]||path.join(root,'..','game-llm'));
if(!fs.existsSync(path.join(target,'games','emmichy.js')))throw Error('Specify the existing game-llm checkout.');
for(const name of ['fandom','fan-lines','gap','repertoire','context','conversation']){
 let content=fs.readFileSync(path.join(root,'src',`${name}.js`),'utf8');
 content=content.replace(/'\.\/(fandom|fan-lines)\.js\?v=[^']+'/g,(_,module)=>`'./emmichy-${module}.js'`);
 fs.writeFileSync(path.join(target,'games',`emmichy-${name}.js`),content);
}
console.log('Synced Emmichy dialogue data and selection logic. Server prompts stay in games/emmichy.js.');
