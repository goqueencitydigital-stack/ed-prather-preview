(()=>{
 const header=document.querySelector('.site-header');
 if(!header)return;
 const triggers=[...header.querySelectorAll('[data-nav-trigger]')];
 const panels=[...header.querySelectorAll('.nav-panel')];
 const shade=document.querySelector('.nav-shade');
 const drawer=document.querySelector('.nav-drawer');
 const toggle=document.querySelector('.nav-menu-toggle');
 const mobile=matchMedia('(max-width:1020px)');
 let active=null,previousOverflow='';
 function closeDesktop(focus=false){
  const former=active;active=null;
  triggers.forEach(b=>b.setAttribute('aria-expanded','false'));
  panels.forEach(p=>p.hidden=true);shade.hidden=true;
  if(focus)former?.focus();
 }
 function openDesktop(button){
  if(mobile.matches)return;
  const wasOpen=active===button;closeDesktop();
  if(wasOpen)return;
  active=button;button.setAttribute('aria-expanded','true');
  document.getElementById(button.getAttribute('aria-controls')).hidden=false;
  document.documentElement.style.setProperty('--nav-bottom',header.getBoundingClientRect().bottom+'px');
  shade.hidden=false;
 }
 triggers.forEach(button=>{
  button.addEventListener('click',()=>openDesktop(button));
  button.addEventListener('keydown',e=>{
   if(e.key==='ArrowDown'){
    e.preventDefault();if(active!==button)openDesktop(button);
    document.getElementById(button.getAttribute('aria-controls')).querySelector('a')?.focus();
   }
  });
 });
 shade.addEventListener('click',()=>closeDesktop(true));
 header.addEventListener('focusout',e=>{
  if(e.relatedTarget){if(!header.contains(e.relatedTarget))closeDesktop();}
  else requestAnimationFrame(()=>{if(!header.contains(document.activeElement))closeDesktop();});
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();closeDesktop(true);}});
 header.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeDesktop()));
 function closeDrawer(){if(drawer.open)drawer.close();}
 toggle.addEventListener('click',()=>{
  closeDesktop();previousOverflow=document.body.style.overflow;
  drawer.showModal();document.body.style.overflow='hidden';toggle.setAttribute('aria-expanded','true');
 });
 drawer.querySelector('.drawer-close').addEventListener('click',closeDrawer);
 drawer.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const focusable=[...drawer.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 });
 drawer.addEventListener('click',e=>{if(e.target===drawer){const r=drawer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDrawer();}});
 drawer.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;toggle.setAttribute('aria-expanded','false');if(mobile.matches)toggle.focus();});
 drawer.querySelectorAll('.drawer-trigger').forEach(button=>button.addEventListener('click',()=>{
  const open=button.getAttribute('aria-expanded')==='true';
  drawer.querySelectorAll('.drawer-trigger').forEach(b=>{b.setAttribute('aria-expanded','false');document.getElementById(b.getAttribute('aria-controls')).hidden=true;});
  if(!open){button.setAttribute('aria-expanded','true');document.getElementById(button.getAttribute('aria-controls')).hidden=false;button.scrollIntoView({block:'nearest'});}
 }));
 drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeDrawer));
 mobile.addEventListener('change',()=>{closeDesktop();closeDrawer();});
 window.addEventListener('resize',()=>{if(active)document.documentElement.style.setProperty('--nav-bottom',header.getBoundingClientRect().bottom+'px');});
 window.addEventListener('scroll',()=>{if(active)document.documentElement.style.setProperty('--nav-bottom',header.getBoundingClientRect().bottom+'px');},{passive:true});
 const normalized=p=>p.replace(/\/index\.html$/,'/').replace(/\/$/,'');
 [...header.querySelectorAll('a'),...drawer.querySelectorAll('a')].forEach(a=>{
  const u=new URL(a.href,location.href);
  if(u.origin===location.origin&&normalized(u.pathname)===normalized(location.pathname)){
   a.setAttribute('aria-current','page');
   const panel=a.closest('.nav-panel');if(panel)document.getElementById(panel.getAttribute('aria-labelledby')).classList.add('nav-current-section');
  }
 });
})();
