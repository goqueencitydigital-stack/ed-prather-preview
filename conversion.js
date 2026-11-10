(()=>{
  const modes={
    sell:{headline:'Sell Your Colorado Home With Confidence.',copy:'Get expert guidance, strategic marketing, and a personalized plan to maximize the value of your home.',primary:'Get My Home Selling Plan',path:'sell/consultation',secondary:"What's My Home Worth?",secondaryPath:'home-valuation'},
    sellbuy:{headline:'Sell Your Current Home. Find Your Next One.',copy:'Make your next move easier with a coordinated strategy designed around your timeline, goals, and financial priorities.',primary:'Plan My Next Move',path:'sell-and-buy'},
    buy:{headline:'Find the Perfect Colorado Home.',copy:'Discover the right neighborhood, understand your options, and work with a team dedicated to helping you find your next home.',primary:'Connect With a Buyer Specialist',path:'buy/consultation',secondary:'Search Colorado Homes',external:true}
  };
  const tabs=[...document.querySelectorAll('[data-conversion-tab]')],root=window.SITE_ROOT||'./';
  function activate(tab,focus=false){
    const data=modes[tab.dataset.conversionTab];if(!data)return;
    tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});
    document.querySelector('.conversion-headline').textContent=data.headline;document.querySelector('.conversion-support').textContent=data.copy;
    const panel=document.querySelector('#conversion-hero-panel');panel.setAttribute('aria-labelledby',tab.id);
    const primary=document.querySelector('[data-hero-primary]');primary.href=root+data.path+'/index.html';primary.firstElementChild.textContent=data.primary;
    const secondary=document.querySelector('[data-hero-secondary]');secondary.hidden=!data.secondary;
    if(data.secondary){secondary.textContent=data.secondary+' '+(data.external?'↗':'→');secondary.href=data.external?'https://www.cohousehunters.com/property-search/results/':root+data.secondaryPath+'/index.html';if(data.external){secondary.target='_blank';secondary.rel='noopener noreferrer';}else{secondary.removeAttribute('target');secondary.removeAttribute('rel');}}
    if(focus)tab.focus();
  }
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();activate(tabs[n],true);}});});
})();
