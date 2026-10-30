const root=window.SITE_ROOT||'./';
const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>[...el.querySelectorAll(s)];
const track=(event,extra={})=>window.epTrack?.(event,extra);
window.addEventListener('ed:track',e=>track(e.detail.event,e.detail));
$$('[data-track]').filter(a=>!/^tel:|cohousehunters\.com/.test(a.getAttribute('href'))&&!a.href.includes('cohousehunters.com')).forEach(a=>a.addEventListener('click',()=>track(a.dataset.track)));
const modal=$('#search-handoff');
$$('[data-search-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form));const pieces=Object.entries(data).filter(([k,v])=>v&&v!=='Any').map(([k,v])=>`${k.replaceAll('_',' ')}: ${v}`);$('#handoff-criteria').textContent=pieces.length?pieces.join(' · '):'All Colorado homes';modal.showModal();track('search_handoff_open',{filters_selected:pieces.length});}));
$$('[data-handoff]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();$('#handoff-criteria').textContent=a.dataset.handoff;modal.showModal();track('search_handoff_open',{category:a.dataset.handoff});}));
$$('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
modal?.addEventListener('click',e=>{if(e.target===modal)modal.close();});
$$('.discovery-preview .chip').forEach(b=>b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));const tags=$$('.discovery-preview .chip[aria-pressed=true]').map(x=>x.dataset.tag);$('#begin-match').href=root+'discovery/discovery/index.html#preferences='+encodeURIComponent(tags.join(','));}));
const cards=$$('[data-community]');
function filterCommunities(){const term=($('#community-filter')?.value||'').trim().toLowerCase();const tag=$('#community-tag')?.value||'';let n=0;cards.forEach(c=>{const match=c.dataset.community.toLowerCase().includes(term)&&(!tag||c.dataset.tags.includes(tag));c.hidden=!match;if(match)n++;});$('#community-count')&&( $('#community-count').textContent=`${n} communities`);$('#community-empty')&&( $('#community-empty').hidden=n>0);}
$('#community-filter')?.addEventListener('input',filterCommunities);$('#community-tag')?.addEventListener('change',filterCommunities);
$('#agent-filter')?.addEventListener('input',e=>{const term=e.target.value.trim().toLowerCase();let count=0;$$('[data-agent]').forEach(card=>{card.hidden=!card.dataset.agent.toLowerCase().includes(term);if(!card.hidden)count++;});$('#agent-empty').hidden=count>0;});
const blogCards=$$('[data-blog-category]');$('#blog-filter')?.addEventListener('change',e=>blogCards.forEach(c=>c.hidden=!!e.target.value&&c.dataset.blogCategory!==e.target.value));
const reviews=window.REVIEWS||[];let r=0;
function showReview(){if(!reviews.length||!$('#review-quote'))return;$('#review-quote').textContent=reviews[r].text;$('#review-name').textContent=reviews[r].name;$('#review-count').textContent=`${r+1} / ${reviews.length}`;}
$$('[data-review]').forEach(b=>b.addEventListener('click',()=>{r=(r+Number(b.dataset.review)+reviews.length)%reviews.length;showReview();}));showReview();
function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
$$('img').forEach(i=>i.addEventListener('error',()=>{i.style.visibility='hidden';i.parentElement?.classList.add('image-unavailable');}));
if($('#tool-root')){import(new URL(root+'tools.js',window.location.href).href).then(m=>m.initTools()).catch(error=>{console.error('Planning tool initialization failed:',error);$('#tool-root').innerHTML='<div class="notice">This interactive tool could not load. Please refresh, or <a href="'+root+'contact/index.html">contact the team</a> for help.</div>';});}
