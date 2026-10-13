// The visual viewport can pan as well as shrink when a phone keyboard opens.
// Track its position; keep portrait scale tied to width, never keyboard height.
export function viewportFrame(view,previous=null,editing=false){
 const width=Math.round(view.width),height=Math.round(view.height);
 if(!(width>0&&height>0)||Math.abs((view.scale||1)-1)>.02)return null;
 const rotated=!previous||Math.abs(width-previous.width)>30;
 const fullHeight=rotated?height:Math.max(previous.fullHeight,height);
 const keyboard=(editing||previous?.keyboard===true)&&fullHeight-height>=Math.min(120,fullHeight*.18);
 return {width,height,fullHeight,keyboard,top:Math.max(0,Math.round(view.offsetTop||0)),left:Math.max(0,Math.round(view.offsetLeft||0))};
}
export function bindMobileViewport(win=globalThis.window,doc=globalThis.document){
 const root=doc?.documentElement;
 if(!root?.style?.setProperty)return ()=>{};
 let frame=null;
 const update=()=>{
  const visual=win.visualViewport;
  const editing=Boolean(doc.activeElement?.matches?.('input,textarea,[contenteditable="true"]'));
  const next=viewportFrame(visual||{width:win.innerWidth,height:win.innerHeight},frame,editing);
  if(!next)return;
  frame=next;
  for(const [key,value] of Object.entries({height:next.height,width:next.width,top:next.top,left:next.left}))root.style.setProperty(`--visual-${key}`,`${value}px`);
  root.setAttribute('data-keyboard',String(next.keyboard));
 };
 const events=[[win,'resize'],[win,'orientationchange'],[doc,'focusin'],[doc,'focusout'],[win.visualViewport,'resize'],[win.visualViewport,'scroll']];
 for(const [target,event] of events)target?.addEventListener(event,update);
 update();
 return ()=>{for(const [target,event] of events)target?.removeEventListener(event,update);};
}
