import fs from 'node:fs/promises';
import {nameData} from '../src/name-data.js';
import {chiikawaRelations,serialCoverage} from '../src/chiikawa-relations.js';
const terms=nameData.filter(row=>row.work==='chiikawa');
const report={schemaVersion:1,coverage:{recognitionTerms:terms.length,relations:chiikawaRelations.length,exhaustive:false,limitations:['用語の存在は具体的な場面を説明できる証拠ではない','有名場面の全件収集・最新漫画本文の確認は未完了']},serialCoverage,records:chiikawaRelations};
await fs.writeFile('docs/chiikawa-knowledge-20261012.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.coverage));
