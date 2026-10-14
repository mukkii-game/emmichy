// The visual viewport can pan as well as shrink when a phone keyboard opens.
// Track its position; keep portrait scale tied to width, never keyboard height.
export function viewportFrame(view,previous=null,editing=false){
 const measuredWidth=Math.round(view.width),height=Math.round(view.height);
 if(!(measuredWidth>0&&height>0)||Math.abs((view.scale||1)-1)>.02)return null;
 const rotated=!previous||Math.abs(measuredWidth-previous.width)>30;
 // Small visual-width changes during IME/browser-chrome animation must not
 // rescale the face. Genuine orientation changes still establish a new width.
 const width=editing&&!rotated?previous.width:measuredWidth;
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
// Keep the latest words visible when the keyboard reduces the log's height.
// Preserve a reader's scroll position if they were looking at older messages.
export function bindChatViewport(log,win=globalThis.window){
 if(!log||!win?.ResizeObserver)return ()=>{};
 let following=true;
 const onScroll=()=>{following=log.scrollHeight-log.clientHeight-log.scrollTop<=20;};
 log.addEventListener('scroll',onScroll,{passive:true});
 const observer=new win.ResizeObserver(()=>{if(following)log.scrollTop=log.scrollHeight;});
 observer.observe(log);
 return ()=>{observer.disconnect();log.removeEventListener('scroll',onScroll);};
}
