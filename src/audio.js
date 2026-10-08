// Lightweight original Web Audio soundtrack: no external samples or copyrighted source audio.
export function createAudioDirector(){
  let ctx=null, master=null, enabled=false, timer=null, step=0;
  const ensure=()=>{
    if(ctx)return ctx;
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=.18;master.connect(ctx.destination);
    return ctx;
  };
  const tone=(freq,dur=.08,when=0,type='sine',gain=.04)=>{
    if(!enabled)return;
    const c=ensure(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+when;
    o.type=type;o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03);
  };
  const chord=(notes,when=0)=>notes.forEach((n,i)=>tone(n,.75,when+i*.018,'sine',.015));
  const tick=()=>{
    if(!enabled||!ctx)return;
    // Slow, lounge-like I–vi–IV–V loop with a tiny 80s computer shimmer.
    const progression=[
      [261.63,329.63,392.00],
      [220.00,261.63,329.63],
      [174.61,220.00,261.63],
      [196.00,246.94,293.66]
    ];
    chord(progression[step%progression.length]);
    if(step%2===1)tone([659.25,587.33,523.25,587.33][step%4],.11,.32,'triangle',.012);
    step++;
  };
  const start=async()=>{
    ensure();await ctx.resume();master.gain.setValueAtTime(.18,ctx.currentTime);clearInterval(timer);enabled=true;tick();timer=setInterval(tick,1800);
  };
  const stop=()=>{enabled=false;if(master&&ctx)master.gain.setValueAtTime(0,ctx.currentTime);clearInterval(timer);timer=null;};
  const toggle=async()=>{if(enabled)stop();else await start();return enabled;};
  const se={
    send(){tone(880,.045,0,'square',.025);tone(1320,.035,.045,'square',.016);},
    reply(){tone(523.25,.055,0,'triangle',.024);tone(659.25,.07,.05,'triangle',.018);},
    excited(){tone(659.25,.07,0,'square',.02);tone(783.99,.07,.07,'square',.02);tone(1046.5,.12,.14,'square',.025);},
    worried(){tone(392,.08,0,'triangle',.018);tone(349.23,.13,.09,'triangle',.014);},
    ending(){tone(523.25,.12,0,'sine',.025);tone(659.25,.12,.12,'sine',.022);tone(783.99,.22,.24,'sine',.02);}
  };
  return {toggle,start,stop,get enabled(){return enabled;},se};
}
