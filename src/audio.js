// Lightweight original Web Audio soundtrack: no external samples or copyrighted source audio.
export function createAudioDirector(){
  let ctx=null, master=null, enabled=true, timer=null, step=0,version=0, visible=true;
  const voices=new Set();
  const ensure=()=>{
    if(ctx)return ctx;
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    return ctx;
  };
  const tone=(freq,dur=.08,when=0,type='sine',gain=.04)=>{
    if(!enabled||!visible||!ctx||ctx.state==='suspended'||ctx.state==='closed')return;
    const c=ensure(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+when;
    o.type=type;o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    const voice={o,g};voices.add(voice);
    o.onended=()=>{voices.delete(voice);o.disconnect?.();g.disconnect?.();};
    o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03);
  };
  const chord=(notes,when=0)=>notes.forEach((n,i)=>tone(n,.75,when+i*.018,'sine',.023));
  const tick=()=>{
    if(!enabled||!visible||!ctx)return;
    // Slow, lounge-like I–vi–IV–V loop with a tiny 80s computer shimmer.
    const progression=[
      [261.63,329.63,392.00],
      [220.00,261.63,329.63],
      [174.61,220.00,261.63],
      [196.00,246.94,293.66]
    ];
    chord(progression[step%progression.length]);
    if(step%2===1)tone([659.25,587.33,523.25,587.33][step%4],.11,.32,'triangle',.018);
    step++;
  };
  const start=async()=>{
    enabled=true;if(!visible)return;
    const request=++version,c=ensure();await c.resume();
    if(!enabled||!visible||request!==version||ctx!==c||c.state==='suspended'||c.state==='closed')return;
    master.gain.setValueAtTime(.18,c.currentTime);clearInterval(timer);tick();timer=setInterval(tick,1800);
  };
  const activate=async()=>{if(enabled&&visible&&timer===null)await start();};
  const release=()=>{
    version++;clearInterval(timer);timer=null;
    const c=ctx,m=master;ctx=null;master=null;
    if(m&&c){m.gain.cancelScheduledValues?.(c.currentTime);m.gain.setValueAtTime(0,c.currentTime);}
    for(const {o,g} of voices){try{o.stop();}catch{}o.disconnect?.();g.disconnect?.();}voices.clear();
    m?.disconnect?.();
    if(c&&c.state!=='closed')try{void c.close?.()?.catch(()=>{});}catch{}
  };
  const setVisible=value=>{visible=Boolean(value);if(!visible)release();};
  const stop=()=>{enabled=false;release();};
  const toggle=async()=>{if(enabled)stop();else await start();return enabled;};
  const se={
    send(){tone(880,.045,0,'square',.025);tone(1320,.035,.045,'square',.016);},
    reply(){tone(523.25,.055,0,'triangle',.024);tone(659.25,.07,.05,'triangle',.018);},
    excited(){tone(659.25,.07,0,'square',.02);tone(783.99,.07,.07,'square',.02);tone(1046.5,.12,.14,'square',.025);},
    worried(){tone(392,.08,0,'triangle',.018);tone(349.23,.13,.09,'triangle',.014);},
    ending(){tone(523.25,.12,0,'sine',.025);tone(659.25,.12,.12,'sine',.022);tone(783.99,.22,.24,'sine',.02);}
  };
  return {toggle,start,activate,stop,release,setVisible,get enabled(){return enabled;},se};
}

// A hidden panel can remain a live document. Closing UI is not an audio lifecycle.
// Keep the ON preference, but require another player gesture before restarting.
export function bindAudioLifecycle(audio,doc=document,win=window){
  const visibility=()=>audio.setVisible(!doc.hidden);
  const leave=()=>audio.setVisible(false);
  doc.addEventListener('visibilitychange',visibility);
  win.addEventListener('pagehide',leave);
  win.addEventListener('pageshow',visibility);
  visibility();
  return ()=>{doc.removeEventListener('visibilitychange',visibility);win.removeEventListener('pagehide',leave);win.removeEventListener('pageshow',visibility);audio.release();};
}
