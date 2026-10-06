// Reading conversion stays on the device; the original input goes to the AI.
const katakana = value => String(value).normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96));
const names=new Map([['ちいかわ','チイカワ'],['chiikawa','Chiikawa'],['えみちぃ','エミチィ'],['エミチィ','エミチィ'],['ハチワレ','ハチワレ'],['ドラクエ','ドラクエ']]);
export function readableText(value, tokenizer) {
  return String(value).split('\n').map(line => line.replace(/ちいかわ|chiikawa|えみちぃ|エミチィ|ハチワレ|ドラクエ/gi,name=>` ${names.get(name.toLowerCase())||name} `).trim().split(/\s+/).filter(Boolean).map(part => {
    // AI/rule replies already contain word boundaries. Retokenizing kana
    // would split words incorrectly (e.g. エイガ -> エイ ガ).
    if (!tokenizer || !/[一-龠々ぁ-ゖ]/.test(part)) return katakana(part);
    const words=[];
    for(const token of tokenizer.tokenize(part)){
      const reading=katakana(token.reading||token.surface_form);
      // Keep inflections and sentence endings together: シリタカッタ, ナルヨネ.
      const attach=token.pos==='助動詞'||token.pos_detail_1==='接尾'||token.pos_detail_1==='終助詞'||/^[。、!?]$/.test(reading);
      if(attach&&words.length)words[words.length-1]+=reading;else words.push(reading);
    }
    return words.join(' ');
  }).join(' ')).join('\n');
}
export function loadReadings() {
  return new Promise(resolve => {
    if (!globalThis.kuromoji) return resolve(null);
    globalThis.kuromoji.builder({dicPath:new URL('../assets/dict/',import.meta.url).pathname}).build((error,tokenizer)=>resolve(error?null:tokenizer));
  });
}
