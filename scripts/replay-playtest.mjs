import fs from 'node:fs/promises';
import {polishReply} from '../src/repertoire.js';
const cases=JSON.parse(await fs.readFile('docs/playtest-20261006-baseline.json','utf8'));
const results=cases.map(({type,rows})=>{
 const history=[];
 const replay=rows.map(row=>{
  const output=polishReply(row.text,row.input,{history}).text;
  history.push({role:'user',text:row.input},{role:'enny',text:output});
  return {...row,original:row.text,text:output,changed:row.text!==output,question:/[?？]|教えて(?:くれる|ほしい|ね)|聞かせて/.test(output)};
 });
 return {type,rows:replay};
});
await fs.writeFile('docs/playtest-20261006-replay.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(c=>({type:c.type,turns:c.rows.length,changed:c.rows.filter(r=>r.changed).length,questions:c.rows.filter(r=>r.question).length})),null,2));
