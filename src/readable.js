// Reading conversion stays on the device; the original input goes to the AI.
import {nameData} from './name-data.js?v=20261009-profile1';
import {spokenAliases} from './chiikawa-db.js?v=20261009-profile1';
const katakana = value => String(value).normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96));
const names=new Map([['ちいかわ','チイカワ'],['chiikawa','Chiikawa'],['えみちぃ','エミチィ'],['エミチィ','エミチィ'],['ハチワレ','ハチワレ'],['ドラクエ','ドラクエ']]);
for(const [name,reading] of [['島二郎','シマジロウ'],['仗助','ジョウスケ'],['承太郎','ジョウタロウ'],['徐倫','ジョリーン'],['露伴','ロハン'],['億泰','オクヤス'],['康一','コウイチ'],['千空','センクウ'],['禰豆子','ネズコ'],['尸魂界','ソウルソサエティ']])names.set(name,reading);
for(const [name,reading] of [['左門豊作','サモンホウサク'],['左門','サモン'],['星飛雄馬','ホシヒュウマ'],['飛雄馬','ヒュウマ']])names.set(name,reading);
for(const spelling of ['箱根そば','箱根ソバ','はこねそば','ハコネソバ'])names.set(spelling,'ハコネソバ');
for(const row of nameData)for(const alias of row.aliases){if(alias.length<=3&&/\.html$/.test(row.source))continue;const key=alias.toLowerCase().replace(/\s/g,'');if(!names.has(key))names.set(key,row.reading.replace(/\s/g,''));if(/[ァ-ヶ]/.test(alias)){const hira=alias.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96)).toLowerCase().replace(/\s/g,'');if(!names.has(hira))names.set(hira,row.reading.replace(/\s/g,''));}}
for(const [alias,reading] of Object.entries(spokenAliases))names.set(alias,reading);
// Preferred everyday readings also protect ambiguous hiragana before tokenization.
for(const spelling of ['えみちい','エミチイ','エミチィ','えみちぃ','emmichy'])names.set(spelling,'エミチィ');
const preferredReadings=new Map([['台詞','セリフ'],['はなして','ハナシテ']]);
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const namePattern=new RegExp([...names.keys()].sort((a,b)=>b.length-a.length).map(n=>/^[a-z0-9]+$/i.test(n)?`(?<![a-z0-9])${escape(n)}(?![a-z0-9])`:[...n].map(escape).join('\\s*')).join('|'),'gi');
export function readableText(value, tokenizer) {
  return String(value).split('\n').map(line => line.replace(/台詞|はなして/g,word=>` ${preferredReadings.get(word)} `).replace(namePattern,name=>` ${names.get(name.toLowerCase().replace(/\s/g,''))||name} `).trim().split(/\s+/).filter(Boolean).map(part => {
    // AI/rule replies already contain word boundaries. Retokenizing kana
    // would split words incorrectly (e.g. エイガ -> エイ ガ).
    if (!tokenizer || !/[一-龠々ぁ-ゖ]/.test(part)) return katakana(part);
    const words=[];
    let previous=null;
    for(const token of tokenizer.tokenize(part)){
      const reading=katakana(token.reading||token.surface_form);
      const conditional=reading==='ト'&&previous?.surface_form==='だ'&&previous.pos==='助動詞';
      if(conditional&&words.length){const last=words.pop();words.push(last.slice(0,-1),`ダ${reading}`);previous=token;continue;}
      const contraction=token.pos==='動詞'&&/^(?:ちゃう|じゃう|ちゃっ|じゃっ)$/.test(token.surface_form)&&previous?.pos==='動詞';
      // Keep inflections and sentence endings together: シリタカッタ, ナルヨネ.
      const attach=token.pos==='助動詞'||token.pos_detail_1==='接尾'||token.pos_detail_1==='終助詞'||(token.pos_detail_1==='接続助詞'&&/^[テデ]$/.test(reading))||/^[テデ]ル$/.test(reading)||/^[。、!?]$/.test(reading);
      const prefix=previous?.pos==='接頭詞'&&token.pos!=='記号';
      const question=token.surface_form==='か'&&previous?.surface_form==='の'&&previous.pos_detail_1==='非自立';
      const contractedTe=token.pos==='動詞'&&token.pos_detail_1==='非自立'&&/^[テデ]$/.test(reading)&&previous?.pos==='動詞';
      const progressive=token.pos==='動詞'&&token.pos_detail_1==='非自立'&&token.basic_form==='いる'&&/^[てで]$/.test(previous?.surface_form||'');
      if((attach||prefix||question||contractedTe||progressive||contraction)&&words.length)words[words.length-1]+=reading;else words.push(reading);
      previous=token;
    }
    return words.join(' ');
  }).join(' ')).join('\n').replace(/ +(?=ッ)/g,'');
}
export function loadReadings() {
  return new Promise(resolve => {
    if (!globalThis.kuromoji) return resolve(null);
    try {globalThis.kuromoji.builder({dicPath:new URL('../assets/dict/',import.meta.url).pathname}).build((error,tokenizer)=>resolve(error?null:tokenizer));}catch{resolve(null);}
  });
}
