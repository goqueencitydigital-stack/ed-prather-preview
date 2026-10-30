(()=>{
  const config=window.ED_CONFIG||{},settings=config.analytics||{},seen=new Set();
  const params=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const query=new URLSearchParams(location.search);
  const attribution={landingPage:query.get('ep_landing')||location.href,referrer:query.get('ep_ref')||document.referrer};
  if(params.some(k=>query.has(k)))for(const k of params)attribution[k]=(query.get(k)||'').slice(0,250);
  window.epAttribution=()=>({...attribution,pageUrl:location.href});
  let consent=false;
  const adsIds=[...new Set(Object.values(settings.googleAdsSendTo||{}).filter(v=>/^AW-\d+\/[A-Za-z0-9_-]+$/.test(v)).map(v=>v.split('/')[0]))];
  const configured=!!(settings.gtmId||settings.ga4Id||settings.metaPixelId||adsIds.length);
  const script=src=>{const el=document.createElement('script');el.async=true;el.src=src;document.head.append(el);};
  function enable(){
    if(!configured)return;
    window.dataLayer=window.dataLayer||[];
    if(settings.gtmId){window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});script('https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(settings.gtmId));}
    else if(settings.ga4Id||adsIds.length){window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());if(settings.ga4Id)window.gtag('config',settings.ga4Id);adsIds.forEach(id=>window.gtag('config',id));script('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(settings.ga4Id||adsIds[0]));}
    if(settings.metaPixelId&&!settings.gtmId){
      const f=window.fbq=function(){f.callMethod?f.callMethod.apply(f,arguments):f.queue.push(arguments);};f.queue=[];f.loaded=true;f.version='2.0';
      script('https://connect.facebook.net/en_US/fbevents.js');f('init',settings.metaPixelId);f('track','PageView');
    }
  }
  const eventName={seller:'seller_form_submission',buyer:'buyer_form_submission',valuation:'home_valuation_request',sellbuy:'sell_buy_inquiry',relocation:'relocation_inquiry',consultation:'consultation_request',alerts:'listing_alert_request',careers:'career_application',contact:'contact_submission',sellerGuide:'seller_guide_request',buyerGuide:'buyer_guide_request',openhouse:'open_house_registration',tour:'showing_request'};
  window.epTrack=(name,data={})=>{
    const key=name+':'+(data.request_id||crypto.randomUUID());if(seen.has(key))return;seen.add(key);
    const clean={funnel:data.funnel||'',lead_type:data.lead_type||'',event_id:data.request_id||'',...(name==='external_home_search_click'?{destination:'cohousehunters.com'}:{})};
    const event=name==='generate_lead'?(eventName[data.funnel]||'generate_lead'):name;
    window.dispatchEvent(new CustomEvent('ed:conversion',{detail:{event,...clean}}));
    if(!consent||!configured)return;
    if(settings.gtmId){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...clean});}
    if(window.gtag){window.gtag('event',event,clean);const sendTo=settings.googleAdsSendTo?.[data.funnel];if(name==='generate_lead'&&sendTo)window.gtag('event','conversion',{send_to:sendTo,transaction_id:data.request_id});}
    if(window.fbq&&name==='generate_lead')window.fbq('track','Lead',{content_name:data.funnel},{eventID:data.request_id});
  };
  if(consent)enable();
  if(configured&&!consent){
    const box=document.createElement('section');box.className='tracking-consent';box.setAttribute('aria-label','Analytics preferences');box.innerHTML='<p>May we use analytics and advertising cookies on this page to understand visits and measure inquiries? Your choice does not affect forms or home search.</p><div><button data-consent="allow">Allow analytics</button><button data-consent="deny">Decline</button></div>';document.body.append(box);box.addEventListener('click',e=>{const b=e.target.closest('[data-consent]');if(!b)return;consent=b.dataset.consent==='allow';if(consent)enable();box.remove();});
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a');if(!a)return;
    // Carry campaign context through this site's links without browser storage.
    if(params.some(k=>attribution[k])&&a.origin===location.origin&&a.pathname.endsWith('.html')&&!a.hasAttribute('download')){
      const target=new URL(a.href);
      for(const k of params)if(attribution[k])target.searchParams.set(k,attribution[k]);
      target.searchParams.set('ep_landing',attribution.landingPage);
      if(attribution.referrer)target.searchParams.set('ep_ref',attribution.referrer);
      a.href=target.href;
    }
    if(/^https:\/\/(www\.)?cohousehunters\.com\/$/.test(a.href))window.epTrack('external_home_search_click');
    if(a.href.startsWith('tel:'))window.epTrack('phone_click');
  });
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
    if(data.secondary){secondary.textContent=data.secondary+' '+(data.external?'↗':'→');secondary.href=data.external?'https://www.cohousehunters.com/':root+data.secondaryPath+'/index.html';if(data.external){secondary.target='_blank';secondary.rel='noopener noreferrer';}else{secondary.removeAttribute('target');secondary.removeAttribute('rel');}}
    if(focus)tab.focus();
  }
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();activate(tabs[n],true);}});});
})();
