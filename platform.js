(()=>{
 const root=window.SITE_ROOT||'./';
 const tabs=[...document.querySelectorAll('.hub-tabs [role=tab]')];
 function activate(tab,focus=false){tabs.forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!on;});if(focus)tab.focus();}
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>activate(tab));
  tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();activate(tabs[next],true);}});
 });
 document.querySelector('[data-valuation-start]')?.addEventListener('submit',e=>{e.preventDefault();const address=new FormData(e.currentTarget).get('address');location.href=root+'sell/home-valuation/index.html#address='+encodeURIComponent(address);});
 const address=new URLSearchParams(location.hash.slice(1)).get('address');
 if(address&&window.PAGE_PATH==='/sell/home-valuation'){const input=document.querySelector('[name=property_address]');if(input)input.value=address.slice(0,1000);}
 document.querySelector('[data-explore-start]')?.addEventListener('submit',e=>{e.preventDefault();const select=e.currentTarget.elements.community;const value=select.value;if([...select.options].some(o=>o.value===value))location.href=root+'communities/'+encodeURIComponent(value)+'/index.html';});
 document.querySelectorAll('[data-place-filter]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-place-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));let count=0;
  document.querySelectorAll('[data-place-tags]').forEach(card=>{const tags=card.dataset.placeTags.split(' ');const key=b.dataset.placeFilter;const show=key==='all'||tags.includes(key)||(key==='parks'&&tags.some(t=>['hiking','outdoors','trails'].includes(t)));card.hidden=!show;if(show)count++;});
  document.querySelector('#place-count').textContent=count+' community guide'+(count===1?'':'s');
 }));
 document.querySelector('[data-quick-mortgage]')?.addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(e.currentTarget),price=Number(data.get('price')),down=Number(data.get('down')),rate=Number(data.get('rate'))/1200;
  const value=document.querySelector('[data-quick-value]'),detail=document.querySelector('[data-quick-detail]');
  if(down>price){value.textContent='Check your down payment.';detail.textContent='Your down payment cannot exceed the home price.';return;}
  const principal=price-down,monthly=rate===0?principal/360:principal*rate/(1-Math.pow(1+rate,-360));
  value.textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(monthly)+' / month';
  detail.textContent='Estimated principal and interest only. Taxes, insurance, HOA dues, and other costs are not included.';
 });
})();
