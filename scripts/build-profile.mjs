import fs from 'node:fs/promises';
import {profile} from '../src/profile.js';
const labels={name:'名前',age:'年齢',home:'出身・住まい',family:'家族',school:'学校・仕事',languages:'言葉',japan:'日本との関わり',appearance:'見た目',hobbies:'日常の好きなこと',fandom:'漫画',games:'ゲーム',food:'食べ物',strengths:'得意なこと',weaknesses:'苦手なこと',wish:'望み',conversation:'話し方'};
const text=`# Emmichy 本人のポートフォリオ\n\n2026-10-09、ユーザーの「本人の設定を作る」依頼に基づく創作設定。実在人物の経歴ではない。正本は src/profile.js。このファイルは scripts/build-profile.mjs で生成する。台詞・ローカルLLM・公開LLMが同じ正本を読む。\n\n${Object.entries(profile).map(([k,v])=>`- **${labels[k]}**: ${v}`).join('\n')}\n\n## 設定を守る\n\nプレイヤーの名前・好み・経歴と、本人の設定を混ぜない。プロフィールを質問されても国籍・年齢・訪日の回数を変えない。未設定の家族名や職歴を追加しない。今日の予定は開幕と、そのプレイで実際に話した履歴を維持する。映画の反復鑑賞はファンとしての創作の予定で、上映館・居場所・新しい訪日回数を作る根拠にしない。\n\n知らない日本の慣習は「聞いた」「そうだと思ってた」と本人の耳知識として話し、訂正を受け入れる。原作の事実を誤って解説することとは分ける。ちいかわの話の手がかりがなければ、今の話題を続ける。プロフィールは質問された項目や話に合う一面だけを出す。\n`;
await fs.writeFile('CHARACTER.md',text);
console.log('Generated CHARACTER.md from the shared portfolio.');
