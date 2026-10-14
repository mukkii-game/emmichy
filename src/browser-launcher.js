// User-triggered launch only; embedded apps may reject even a valid scheme.
// Always reveal menu/copy instructions before trying to leave the webview.
export function browserEnvironment(nav=globalThis.navigator,href=globalThis.location?.href){
 const ua=nav?.userAgent||'',ios=/iPhone|iPad|iPod/i.test(ua)||nav?.platform==='MacIntel'&&nav?.maxTouchPoints>1;
 const mobile=ios||/Android/i.test(ua);
 const embedded=mobile&&(/FBAN|FBAV|FB_IAB|FBIOS|Instagram|Line\/|Twitter|MicroMessenger|TikTok|Bytedance|\bwv\b/i.test(ua)||ios&&/AppleWebKit/.test(ua)&&!/Safari\//.test(ua));
 let url='';try{const parsed=new URL(href);if(['https:','http:'].includes(parsed.protocol)){parsed.hash='';url=parsed.href;}}catch{}
 return {ios,android:/Android/i.test(ua),mobile,embedded,url};
}
export function externalBrowserTarget(environment){
 const {url,ios}=environment;if(!url)return '';
 if(ios)return `x-safari-${url}`;
 if(!environment.android)return url;
 const parsed=new URL(url);
 return `intent://${parsed.host}${parsed.pathname}${parsed.search}#Intent;scheme=${parsed.protocol.slice(0,-1)};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url)};end`;
}
export function bindBrowserLauncher({win=globalThis.window,doc=globalThis.document,nav=globalThis.navigator,onOpen=()=>{},onClose=()=>{}}={}){
 const environment=browserEnvironment(nav,win?.location?.href||globalThis.location?.href);
 if(!environment.url||!environment.mobile&&!win?.matchMedia?.('(max-width:680px)').matches)return;
 const $=id=>doc?.getElementById(id),guide=$('browser-guide'),launch=$('browser-launch');
 if(!guide||!launch)return;
 let opened=false,previousFocus=null;
 launch.hidden=false;
 const show=()=>{
  if(opened)return;
  if(onOpen()===false)return;
  opened=true;previousFocus=doc.activeElement;doc.activeElement?.blur?.();
  guide.hidden=false;$('browser-open').focus({preventScroll:true});
 };
 const hide=()=>{if(!opened)return;opened=false;guide.hidden=true;onClose();previousFocus?.focus?.({preventScroll:true});};
 launch.onclick=show;$('browser-stay').onclick=hide;
 $('browser-open').onclick=()=>{
  $('browser-open-help').hidden=false;
  $('browser-menu-help').textContent=environment.ios?'開かない時は、SNSの「…」や共有メニューから「Safariで開く」を選んでね。URLをコピーしてSafariに貼っても遊べます。':'開かない時は、SNSの「︙」「…」メニューから「ブラウザで開く」を選んでね。URLをコピーしてChromeなどに貼っても遊べます。';
  $('browser-url').value=environment.url;
  try{win.location.href=externalBrowserTarget(environment);}catch{}
 };
 $('browser-url').onclick=()=>$('browser-url').select();
 $('browser-copy').onclick=async()=>{
  let copied=false;
  try{await nav.clipboard.writeText(environment.url);copied=true;}catch{
   try{$('browser-url').select();copied=doc.execCommand?.('copy')===true;}catch{}
  }
  $('browser-copy-status').textContent=copied?'コピーしました。いつものブラウザに貼って開いてね。':'URLを長押ししてコピーし、いつものブラウザで開いてね。';
 };
 guide.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();hide();}
  if(e.key!=='Tab')return;
  const buttons=[...guide.querySelectorAll('button,input')].filter(el=>!el.disabled&&!el.closest('[hidden]'));
  const first=buttons[0],last=buttons.at(-1);
  if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first?.focus();}
 });
 // One suggestion per tab; a blocked storage API must not prevent play.
 let seen=false;try{seen=win.sessionStorage.getItem('emmichy-browser-guide-v1')==='seen';}catch{}
 if(environment.embedded&&!seen){show();try{win.sessionStorage.setItem('emmichy-browser-guide-v1','seen');}catch{}}
}
