// Ephemeral listening gestures, never saved as answers or sent to the AI.
export function chooseFiller(input, recent=[]){
 const serious=/つらい|苦しい|相談|病気|入院|死に|いじめ|怖い|こわい/.test(input);
 const pool=serious?['うん、聞いてるよ。','うん。ゆっくり話してね。','そっか…。']:['ん、ん…。','うんうん。','えっとね…。','あ、うん…。','ふむふむ…。','んー…。'];
 return pool.find(line=>!recent.includes(line))||pool.find(line=>line!==recent.at(-1))||pool[0];
}
export function startFiller(show,{schedule=setTimeout,cancel=clearTimeout}={}){
 let active=true;
 const timer=schedule(()=>{if(active)show();},1000);
 return ()=>{active=false;cancel(timer);};
}
