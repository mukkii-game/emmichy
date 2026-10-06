// Reading conversion stays on the device; the original input goes to the AI.
const katakana = value => String(value).normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96));
export function readableText(value, tokenizer) {
  return String(value).split('\n').map(line => line.trim().split(/\s+/).filter(Boolean).map(part => {
    // AI/rule replies already contain word boundaries. Retokenizing kana
    // would split words incorrectly (e.g. エイガ -> エイ ガ).
    if (!tokenizer || !/[一-龠々ぁ-ゖ]/.test(part)) return katakana(part);
    return tokenizer.tokenize(part).map(token=>katakana(token.reading || token.surface_form)).join(' ');
  }).join(' ')).join('\n');
}
export function loadReadings() {
  return new Promise(resolve => {
    if (!globalThis.kuromoji) return resolve(null);
    globalThis.kuromoji.builder({dicPath:new URL('../assets/dict/',import.meta.url).pathname}).build((error,tokenizer)=>resolve(error?null:tokenizer));
  });
}
