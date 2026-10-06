// Listening gestures are dialogue, retained alongside the eventual answer.
export function retainAside(history,line,{pendingReply=false}={}){
 const next=[...history];
 next.splice(pendingReply?Math.max(0,next.length-1):next.length,0,{role:'enny',text:line});
 return next.slice(-40);
}
export function chooseFiller(input, recent=[]){
 const serious=/つらい|苦しい|相談|病気|入院|死に|いじめ|怖い|こわい/.test(input);
 const pool=serious?['うん、聞いてるよ。','うん。ゆっくり話してね。','そっか…。']:['ウ、ウン…。','ヤハ…。','エト、エト…。','ンショ…。','フムッ…。','ウンッ…。'];
 return pool.find(line=>!recent.includes(line))||pool.find(line=>line!==recent.at(-1))||pool[0];
}
export function longFiller(input,recent=[]){
 const pool=/つらい|苦しい|相談|病気|入院|死に|いじめ|怖い/.test(input)?['急がなくて大丈夫。ちゃんと聞きたいの。','うん、ここにいるよ。']:['むずかしい話、ちょっと整理してるの…。','エト…ちゃんと答えたいの。もう少しだけ！','ンー…言いたいことをまとめてるの。'];
 return pool.find(x=>!recent.includes(x))||pool[0];
}
export function startFiller(show,{schedule=setTimeout,cancel=clearTimeout,later}={}){
 let active=true;
 const timer=schedule(()=>{if(active)show();},1000);
 const longTimer=later?schedule(()=>{if(active)later();},10000):null;
 return ()=>{active=false;cancel(timer);if(longTimer!==null)cancel(longTimer);};
}
