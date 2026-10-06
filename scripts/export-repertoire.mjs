import fs from 'node:fs';
import {replies} from '../src/repertoire.js';
import {sources,cards,works,checkedAt} from '../src/fandom.js';
const exported=replies.map(r=>({...r,source:sources[cards.find(c=>c.id===r.cardId).source].url}));
fs.writeFileSync(new URL('../docs/dialogue-bank.json',import.meta.url),JSON.stringify({checkedAt,factCount:cards.length,authoredReactions:600,replyCount:replies.length,replies:exported},null,2)+'\n');
const lines=['# えみちぃの会話台帳','','出典付き知識120件、返答候補1,200件。新しい事実1,200件を調べたという意味ではありません。600件の書き下ろし反応と、その反応に確認済みの事実を添えた600件の組み合わせです。','','|作品|返答候補|','|---|---:|'];
for(const work of Object.keys(works)){const count=replies.filter(r=>r.work===work).length;if(count)lines.push(`|${works[work][0]}|${count}|`);}
lines.push('','## 会話の選び方','','- 定義や公開日など、資料で答えられる短い質問は事実を含む返答。考察、比較、攻略、相談、教わった話はAI。','- 好きな作品への反応は用意した会話とAIを交互に混ぜる。AIにも関連する書き下ろし例を最大3件だけ渡す。','- 最近240件の返答ID、120件の文章の指紋、会話履歴で重複を抑える。同じ感想に事実を足しただけの同系統の返答も避ける。','- 新しい会話にしても既出IDを保つ。記憶の初期化では全部消える。他のプレイヤーとは共有しない。','- 話題の候補が尽きたらAIへ。通信なしでは未確認の質問の答えをでっち上げず、教えてほしいと伝える。','- 物騒な漫画の言葉や音のパロディは、普通の会話を挟んで時々。実際の危害やつらい相談には使わない。','- AIの返答は読みやすい表記へ整形。ほぼ同じ答えの反復や島二郎の取り違えには、文脈に合う用意済みの返答がある場合だけ置き換える。','- 漫画を知らない相手にも日本の暮らし・言葉・食べ物等を聞き、説明の具体的な一点に嬉しく反応する。','', '[全返答のデータ](dialogue-bank.json) / [事実と出典](fandom-sources.md)','','## 書き下ろしの例','');
for(const id of ['chiikawa-23','chiikawa-28','jojo-4','jojo-9','hunter-1','hunter-17'])for(const r of replies.filter(r=>r.cardId===id&&r.mode==='react').slice(1,3))lines.push(`- ${r.text}`);
fs.writeFileSync(new URL('../docs/repertoire.md',import.meta.url),lines.join('\n')+'\n');
console.log(`Exported ${replies.length} reply candidates.`);
