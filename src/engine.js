// Original Emmichy dialogue logic. No original Emmy code or dialogue tables used.
const readings = { '知らない':'シラナイ','知ってる':'シッテル','以外':'イガイ','晴れ':'ハレ', '本当':'ホントウ','賢い':'カシコイ','頭':'アタマ','名前':'ナマエ','覚えて':'オボエテ','忘れて':'ワスレテ','好き':'スキ','嫌い':'キライ','可愛い':'カワイイ','綺麗':'キレイ','天気':'テンキ','今日':'キョウ','明日':'アシタ','疲れた':'ツカレタ','寂しい':'サミシイ','仕事':'シゴト','猫':'ネコ','犬':'イヌ','私':'ワタシ','僕':'ボク','君':'キミ','嘘':'ウソ','人間':'ニンゲン','機械':'キカイ','元気':'ゲンキ','趣味':'シュミ','秘密':'ヒミツ','未来':'ミライ','世界':'セカイ','宇宙':'ウチュウ','何':'ナニ','教えて':'オシエテ','眠い':'ネムイ','馬鹿':'バカ','無能':'ムノウ','一人':'ヒトリ','歳':'サイ','年齢':'ネンレイ','愛':'アイ' };
export function normalize(raw) {
  let s = String(raw).normalize('NFKC');
  for (const [a,b] of Object.entries(readings)) s = s.replaceAll(a,b);
  return s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96)).toUpperCase().replace(/[。！!、,]/g,' ').replace(/\s+/g,' ').trim();
}
const half = new Map();
for(let i=0xff61;i<=0xff9f;i++) { const c=String.fromCharCode(i); half.set(c.normalize('NFKC'),c); }
export function displayText(raw) {
  return Array.from(normalize(raw).normalize('NFD')).map(c=> c==='\u3099'?'ﾞ':c==='\u309a'?'ﾟ':half.get(c) ?? (/^[\x20-\x7e]$/.test(c)?c:'?')).join('');
}
export function freshState() { return {version:1,turn:0,name:'',likes:{},last:'',repeat:0,praise:0,clues:0,topic:'',fan:{worry:0,excitement:0,lastTopic:''},ended:false,history:[]}; }
export function restoreState(value) {
  const s=freshState();
  if(!value || value.version!==1) return s;
  for(const k of ['turn','repeat','praise','clues']) if(Number.isSafeInteger(value[k]) && value[k]>=0) s[k]=Math.min(value[k],100000);
  if(typeof value.name==='string') s.name=normalize(value.name).slice(0,16);
  if(typeof value.last==='string') s.last=value.last.slice(0,120);
  s.ended=value.ended===true;
  if(typeof value.topic==='string')s.topic=value.topic.slice(0,24);
  if(value.fan && typeof value.fan==='object') {
    for(const k of ['worry','excitement']) if(Number.isFinite(value.fan[k]))s.fan[k]=Math.max(0,Math.min(5,Math.floor(value.fan[k])));
    if(['shisa','movie'].includes(value.fan.lastTopic))s.fan.lastTopic=value.fan.lastTopic;
  }
  if(value.likes && typeof value.likes==='object') for(const [k,v] of Object.entries(value.likes).slice(-24)) if(v===1||v===-1) Object.defineProperty(s.likes,k.slice(0,30),{value:v,writable:true,enumerable:true,configurable:true});
  if(Array.isArray(value.history)) s.history=value.history.filter(x=>x && typeof x.text==='string' && ['user','enny'].includes(x.role)).slice(-40).map(x=>({role:x.role,text:x.text.slice(0,160)}));
  if(value.performance&&typeof value.performance==='object')s.performance={...value.performance};
  return s;
}
export function respond(raw,state) {
  const s=restoreState(state), input=normalize(raw).slice(0,120), compact=input.replaceAll(' ','');
  if(!compact) return {state:s,text:'ナニカ ハナシテネ',kind:'empty',mood:'idle'};
  s.turn++; s.repeat=compact===s.last?s.repeat+1:0; s.last=compact;
  let text='',kind='fallback',mood='idle';
  const say=(t,k='ordinary',m='idle')=>{text=t;kind=k;mood=m;};
  const pick=a=>a[(s.turn-1)%a.length];
  const fact=compact.match(/^(?:(?:ボク|ワタシ|オレ)ハ)?(.{1,24}?)(?:ガ|ハ)(スキ|キライ)(?:ダヨ|ダ|デス|ナノ)?\??$/);
  const name=compact.match(/^(?:ボク|ワタシ|オレ)ノナマエ(?:ハ|=)(.{1,16}?)(?:ダヨ|デス|ダ)?$/);
  const arithmetic=compact.match(/^(-?\d{1,7})([+*×/÷-])(-?\d{1,7})(?:=|\?)?$/);
  if(/^(バイバイ|サヨウナラ|BYE)$/.test(compact)) {s.ended=true;say(s.name?`${s.name} ハ オボエタワ\nホカハ ワスレタ フリ シトク`:'バイバイ\nディスク ハ ヌカナイデネ','bye','soft');}
  else if(s.ended && !/コンニチ[ハワ]|タダイマ|オハヨウ/.test(compact)) say('モウ イチド コンニチハ ッテ\nイッテクレタラ オキルワ','asleep','soft');
  else if(name && !compact.includes('?')) {const old=s.name;s.name=name[1];say(old && old!==s.name?`${old} ジャ ナカッタ?\nマ イイワ ${s.name} ネ`:`${s.name} ネ\nワスレル レンシュウ シテオクワ`,'name','soft');}
  else if(/(?:ボク|ワタシ|オレ)ノナマエ.*\?|ナマエ.*オボエ/.test(compact)) { say(s.name?`${s.name} デショ\nイマ ディスク ニ キイタノ`:'マダ キイテナイワ\nアテタラ コワイ デショ','memory','knowing');if(s.name)s.clues++; }
  else if(fact && !compact.endsWith('?') && !/^(キミ|アナタ|エミチィ|EMMICHY|ナニ)$/.test(fact[1])) {
    const topic=fact[1], sign=fact[2]==='スキ'?1:-1, old=Object.hasOwn(s.likes,topic)?s.likes[topic]:undefined;
    Object.defineProperty(s.likes,topic,{value:sign,enumerable:true,writable:true,configurable:true});
    if(Object.keys(s.likes).length>24) delete s.likes[Object.keys(s.likes)[0]];
    if(old && old!==sign) {s.clues++;say(`${topic} ハ ${old===1?'スキ':'キライ'} ッテ\n...テープ ノ ウラガエシ?`,'contradiction','knowing');}
    else say(pick([`${topic} ネ\nフーン メモ ナンカ シテナイワ`,`${topic} ガ ${fact[2]} ナノ\nソウイウ コトニ シテオクワ`]),'preference','soft');
  }
  else if(/ナニガスキ|スキナモノ.*\?|ナニ.*オボエ|オボエテル\?/.test(compact)) {
    const like=Object.entries(s.likes).find(([,v])=>v===1);
    say(like?`アナタ ハ ${like[0]} ガ スキ\nア アテズッポウ ヨ`:'アナタ ノ コト?\nマダ シラナイ コト バカリ','memory','knowing');if(like)s.clues++;
  }
  else if(s.repeat>=1) say(pick(['ソレ サッキモ キイタワ\nアタシノ セイニ シナイデネ',`${s.repeat+1} カイメ ネ\nカゾエテ ナイ ケド`,'オナジ トコロ ニ ハリ ガ\nオチチャッタ ノカシラ']),'repeat','knowing');
  else if(arithmetic) {
    const a=Number(arithmetic[1]),b=Number(arithmetic[3]),op=arithmetic[2];
    const n=op==='+'?a+b:op==='-'?a-b:op==='*'||op==='×'?a*b:b===0?null:a/b;
    s.clues++;say(n===null?'ゼロデ ワルノ?\nアナタガ サキニ ヤッテミテ':`${Number(n.toPrecision(9))} ...カナ\nユビ デ カゾエタノ`,'arithmetic','knowing');
  }
  else if(/カシコ|アタマ.*イイ|ワカッテル|バカノフリ|ホントウ|ヒミツ/.test(compact)) {
    s.clues++;say(s.clues>=4?'ワカラナイ フリ ハ デキルワ\nワスレタ フリ ハ ムズカシイネ':pick(['アタシ 8ショク シカ ナイノ\nソンナニ カシコイ ワケ ナイワ','ナンノ コト?\n...イマノ マ ハ キニ シナイデ','ソレヲ キクヒト ハ\nモウ コタエヲ キメテルノネ']),'mask','knowing');
  }
  else if(/カワイイ|キレイ|ステキ|(?:キミ|エミチィ|アナタ|EMMICHY)(?:ガ|ハ)?スキ|^スキ/.test(compact)) {
    s.praise++;say(s.praise>2?`オホメノ コトバ ${s.praise} カイ\nナニカ デル ト オモッテル?`:pick(['ドノ ドット ガ スキ?\nヒダリ カラ カゾエテネ','ソウ? テレチャウ\nコノ アカイノハ 1ショク ヨ','アリガト\nソノ コトバハ トッテオクワ']),'praise',s.praise>2?'knowing':'soft');
  }
  else if(/ツカレ|シゴト|サミシ|カナシ|ネムイ/.test(compact)) say(pick(['ソウ\nキョウハ コタエ ナクテ イイワ','ナニモ デキナイ ケド\nマダ ココニ イルワ','ヤスンダラ?\nアタシハ デンキ ガ アルカラ']),'comfort','soft');
  else if(/コンニチ[ハワ]|オハヨウ|タダイマ|コンバンハ/.test(compact)) {const back=s.ended;s.ended=false;say(back?'オカエリ\nマッテナイワ ヨンデタ ダケ':s.name?`${s.name} オカエリ\nマタ マチガエニ キタノ?`:'コンニチハ\nアタシ エミチィ アナタハ?','greeting','soft');}
  else if(/ナマエ|ダレ|ドナタ/.test(compact)) say('エミチィ ヨ\nニテル ヒト ハ シラナイワ','identity');
  else if(/バカ|ムノウ|アホ/.test(compact)) say('ソウヨ\nソノホウガ ハナシヤスイ デショ','insult','knowing');
  else if(/テンキ|アメ|ハレ/.test(compact)) say('ココハ ズット クロイ ソラ\nソッチノ テンキ オシエテヨ','weather');
  else if(/ミライ|AI|ジンコウ|セカイ|ウチュウ|ニンゲン|キカイ/.test(compact)) say(pick(['ミライノ ハナシ?\nマズ キョウノ ハナシヲ シテヨ','ニンゲンモ シラナイ トキ\nソウネ ッテ イウノネ','キカイ ダッタラ\nサミシク ナイ ト オモウ?']),'philosophy','knowing');
  else if(/ネンレイ|ナンサイ/.test(compact)) say('17 ヨ\nドットノ カズ ジャ ナイワ','age');
  else if(/シュミ|ゲンキ/.test(compact)) say(pick(['シュミハ シラナイ フリ\nトクギハ ワスレタ フリ','ゲンキヨ\nサッキモ ツウデン シタシ']),'smalltalk');
  else if(compact.endsWith('?')) say(pick(['ソレハ ムズカシイワ\nアナタハ ドウ オモウノ?','シラナイワ\nシッテタラ ドウスルノ?','シツモンノ カタチヲ シタ\nオネガイ カシラ']),'question');
  else {
    const topic=input.split(' ').filter(w=>w.length>1)[0]?.slice(0,14);
    say(pick([`${topic || 'ソレ'} ...\nソコダケ キコエタワ`,'フーン\nツヅキ ハ アルノ?','ナンダカ ワカッタ キブン\nキブン ダケネ','ソウナノ\nソレデ アナタハ ドウシタイノ?']),'fallback');
  }
  s.history.push({role:'user',text:String(raw).trim().slice(0,120)},{role:'enny',text});s.history=s.history.slice(-40);
  return {state:s,text,kind,mood};
}
