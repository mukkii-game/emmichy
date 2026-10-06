// Private performance state: values become server-owned directions, never prompts.
export function advancePerformance(state, raw, turn) {
 const old=state.performance||{}, bound=n=>Math.max(0,Math.min(5,Number(n)||0));
 const fan=/ちいかわ|チイカワ|chiikawa|シーサー|ハチワレ|うさぎ/i.test(raw);
 const excited=/好き|スキ|最高|うれし|嬉し|映画|！|!/.test(raw);
 const teaching=/(?:という|っていう|という意味|元ネタ|実は|つまり|要するに|のことだよ|のことです|の仕組み|だから.+なんだ)/.test(raw);
 const p={trust:bound((old.trust||0)+.25),curiosity:bound((old.curiosity||0)+(teaching?.8:.2)),
  chiikawaPressure:bound((old.chiikawaPressure||0)+(fan?1:-.3)),
  hype:bound((old.hype||0)+(teaching?1.5:excited?1:-.5)),speechLeak:bound(turn/4),shisaWorry:bound(state.fan?.worry)};
 const late=turn>=11, mid=turn>=5;
 p.speechStyle=late&&p.hype>=4&&turn%12===10?'hype':late&&turn%6===1?'filler':
  mid&&turn%12===8?'quoted_noun':mid&&turn%12===3?'inversion':late&&turn%12===6?'tte_koto':'normal';
 return {...state,performance:p,speechStyle:p.speechStyle};
}
