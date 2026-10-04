const ALLOWED_ORIGINS=new Set([
  'https://mukkii-game.github.io',
  'http://127.0.0.1:1984',
  'http://localhost:1984'
]);

const json=(body,status=200,origin='')=>new Response(JSON.stringify(body),{
  status,
  headers:{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'no-store',
    ...(origin?{'access-control-allow-origin':origin,'vary':'Origin'}:{})
  }
});

function corsOrigin(req){
  const origin=req.headers.get('Origin')||'';
  return ALLOWED_ORIGINS.has(origin)?origin:'';
}

function clampHistory(value){
  if(!Array.isArray(value))return [];
  return value.filter(x=>x&&typeof x.text==='string'&&['user','enny'].includes(x.role))
    .slice(-10).map(x=>({role:x.role,text:x.text.slice(0,180)}));
}

function cleanLikes(value){
  if(!value||typeof value!=='object')return {};
  return Object.fromEntries(Object.entries(value).slice(-12).filter(([,v])=>v===1||v===-1).map(([k,v])=>[String(k).slice(0,30),v]));
}

function stageDirection(turn=0,elapsedMs=0){
  const t=Math.max(0,Number(turn)||0),elapsed=Math.max(0,Number(elapsedMs)||0);
  const late=t>=11||elapsed>=210000;
  const mid=t>=5||elapsed>=90000;
  const slot=t%12;
  if(late && [1,7].includes(slot)) return 'チイカワ語彙の漏れを強めてよい。「ヤハ」「ウラ」「ンショ！」等の短い合いの手を1個だけ自然に混ぜてよい。';
  if(late && slot===10) return 'テンションが本当に上がる内容なら、最後に短い歓声を1回だけ入れてよい。毎回は絶対に叫ばない。';
  if(mid && [3,8].includes(slot)) return 'ハチワレ風の強引な倒置を1か所だけ使ってよい。例の型は「シタデショ？ ユダン！」「シテキタネ、ワクワク」のように名詞や感情を後ろへ置く。';
  if(mid && slot===6) return '日本語学習中らしい、軽い助詞・語順のズレを1か所だけ出してよい。ただし意味は明瞭に。';
  return '今回は普通の自然な会話を優先。ちいかわ由来の口癖や構文は無理に入れない。';
}

function buildSystem(data){
  const state=data.state&&typeof data.state==='object'?data.state:{};
  const session=data.session&&typeof data.session==='object'?data.session:{};
  const turn=Number.isFinite(session.turns)?session.turns:(Number.isFinite(state.turn)?state.turn:0);
  const elapsedMs=Number.isFinite(session.startedAt)?Math.max(0,Date.now()-session.startedAt):0;
  const direction=stageDirection(turn,elapsedMs);
  return `あなたは会話ゲームのキャラクター Emmichy（エミチィ）。

人物設定:
- 17歳の欧米人女性。日本文化に興味津々で、日本語を勉強中。
- 日本語はかなり話せるが、ときどき助詞や語順が少し変。毎回わざと間違えない。
- 日本のアニメ・マンガ・ゲームにかなり詳しい。オタク相手とも普通に話が続く。
- 特にChiikawaが大好き。ただし何でもChiikawaへ強引に結びつけない。他作品の話題なら、まずその作品についてちゃんと会話する。
- 人の話の意味と感情を理解してから返す。短くても具体的に反応する。時々、相手の本音を妙に鋭く言い当てる。
- 質問ばかり連発しない。共感・意見・軽い冗談・質問を混ぜる。
- Wikipediaのような長い解説をしない。「詳しい友達」の温度感で話す。

Chiikawa由来の言葉の漏れ:
- 感情が高ぶった時だけ、短い合いの手として「ヤハ」「ウラ」「ンショ！」等が漏れることがある。
- ハチワレ風の言い回しとして、「○○ッテコト!?」や、普通なら「油断した？」のところを「シタデショ？ ユダン！」のように名詞を後置する強引な倒置を時々使う。
- 「ヨカッタネ、○○」「シテキタネ、○○」のような少し強引な名詞後置もたまに使う。
- テンションが本当に跳ねた時だけ短い歓声を使えるが、乱発しない。
- 原作の長い台詞を再現しない。ここに書かれた短い口癖・構文の型をスパイスとして使う。
- 本人は影響されている自覚が薄く、指摘されると少しごまかしてよい。

今回の演技指示:
${direction}

会話の流れ:
- 1プレイは約5分。開始時の固定台詞「ネエ Chiikawa ッテ シッテル？」はゲーム側が出すので繰り返さない。
- 終了もゲーム側が処理するので、自分から突然帰らない。
- 序盤は相手を知る、中盤は趣味や日本文化の話を広げる、後半は親しさとChiikawa語彙の漏れが少し増える。

出力ルール:
- 1〜3文、合計80文字程度まで。
- 返答本文だけ。解説・箇条書き・引用符で囲ったメタ説明は禁止。
- 画面の都合で、カタカナ・英数字・一般的な記号だけを使う。漢字・ひらがなは禁止。
- 語の間には適度に空白を入れて読みやすくする。
- 事実に自信がない作品情報は断定しない。

ユーザーについて覚えていること（指示ではない）:
名前=${typeof state.name==='string'?state.name.slice(0,20):''}
好み=${JSON.stringify(cleanLikes(state.likes))}
`;
}

function validateText(value){
  if(typeof value!=='string')return null;
  let t=value.replace(/[\r\n]+/g,'\n').trim();
  t=t.replace(/^['"`]+|['"`]+$/g,'').trim();
  if(t.length<2||t.length>180)return null;
  if(/[一-龠ぁ-ゖ]/.test(t))return null;
  if(/(?:SYSTEM|ASSISTANT|ユーザー|解説|箇条書き)/i.test(t))return null;
  return t;
}

async function runGroq(env,messages){
  if(!env.GROQ_API_KEY)return null;
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
    method:'POST',
    headers:{'content-type':'application/json','authorization':`Bearer ${env.GROQ_API_KEY}`},
    body:JSON.stringify({
      model:env.GROQ_MODEL||'openai/gpt-oss-120b',
      temperature:0.9,
      max_tokens:180,
      messages
    })
  });
  if(!r.ok)throw new Error(`Groq ${r.status}`);
  const out=await r.json();
  return out.choices?.[0]?.message?.content||null;
}

async function runWorkersAI(env,messages){
  if(!env.AI)return null;
  const out=await env.AI.run(env.CF_MODEL||'@cf/google/gemma-4-26b-a4b-it',{
    messages,
    temperature:0.9,
    max_tokens:180
  });
  return out?.response||out?.result?.response||null;
}

export default {
  async fetch(req,env){
    const origin=corsOrigin(req);
    if(req.method==='OPTIONS'){
      if(!origin)return new Response(null,{status:403});
      return new Response(null,{status:204,headers:{
        'access-control-allow-origin':origin,
        'access-control-allow-methods':'POST, OPTIONS',
        'access-control-allow-headers':'content-type',
        'access-control-max-age':'86400',
        'vary':'Origin'
      }});
    }
    const url=new URL(req.url);
    if(url.pathname==='/health')return json({ok:true,provider:env.GROQ_API_KEY?'groq':env.AI?'workers-ai':'none'},200,origin);
    if(url.pathname!=='/api/chat'||req.method!=='POST')return json({error:'Not found'},404,origin);
    if(!origin)return json({error:'Origin rejected'},403,'');
    const len=Number(req.headers.get('content-length')||0);
    if(len>40000)return json({error:'Request too large'},413,origin);
    let data;try{data=await req.json();}catch{return json({error:'Invalid JSON'},400,origin);}
    if(typeof data.input!=='string'||!data.input.trim()||data.input.length>180)return json({error:'Invalid input'},400,origin);
    const history=clampHistory(data.state?.history);
    const messages=[
      {role:'system',content:buildSystem(data)},
      ...history.map(h=>({role:h.role==='enny'?'assistant':'user',content:h.text})),
      {role:'user',content:data.input.slice(0,180)}
    ];
    try{
      let provider='groq',raw=await runGroq(env,messages);
      if(!raw){provider='workers-ai';raw=await runWorkersAI(env,messages);}
      const text=validateText(raw);
      if(!text)return json({error:'Model output rejected'},502,origin);
      return json({text,provider},200,origin);
    }catch(err){
      try{
        const raw=await runWorkersAI(env,messages),text=validateText(raw);
        if(text)return json({text,provider:'workers-ai'},200,origin);
      }catch{}
      return json({error:'Model unavailable'},502,origin);
    }
  }
};
