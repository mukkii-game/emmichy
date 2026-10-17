import fs from 'node:fs';
import {knowledgeFacts,knowledgeQuestions,knowledgeConnections,validateKnowledgeCatalog} from '../src/knowledge-catalog.js';
import {specialistPacket} from '../src/specialist.js';
const results=knowledgeQuestions.flatMap(q=>q.examples.map(input=>{
 const state=q.context?{specialist:specialistPacket(q.context).memory}:{};
 const packet=specialistPacket(input,state);
 return {question:q.id,kind:q.kind,input,context:q.context||null,required:q.factIds,selected:packet.evidence.map(r=>r.id),answerSelected:q.kind==='fact'?packet.evidence[0]?.id===q.factIds[0]:packet.evidence.some(r=>q.factIds.includes(r.id))};
}));
const evidence={mode:'local catalog and question retrieval audit; no new facts, provider calls or human evaluation',factCount:knowledgeFacts.length,questionCount:knowledgeQuestions.length,connectionCount:knowledgeConnections.length,errors:validateKnowledgeCatalog(),results,connections:knowledgeConnections};
const target=process.argv[2]||'docs/knowledge-catalog-audit-20261017.json';fs.writeFileSync(target,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({facts:evidence.factCount,questions:evidence.questionCount,examples:results.length,selected:results.filter(r=>r.answerSelected).length,errors:evidence.errors}));
if(evidence.errors.length||results.some(r=>!r.answerSelected))process.exitCode=1;
