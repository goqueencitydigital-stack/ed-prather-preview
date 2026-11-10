(()=>{
  'use strict';
  const config=window.ED_CONFIG||{},settings=config.analytics||{};
  const campaignKeys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const consentKey='ed-analytics-consent-v2',attributionKey='ed-session-attribution-v2';
  const eventNames={seller:'seller_form_submission',buyer:'buyer_form_submission',valuation:'home_valuation_request',sellbuy:'sell_buy_inquiry',relocation:'relocation_inquiry',consultation:'consultation_request',alerts:'listing_alert_request',careers:'career_application',contact:'contact_submission',sellerGuide:'seller_guide_request',buyerGuide:'buyer_guide_request',openhouse:'open_house_registration',tour:'showing_request'};
  const seen=new Set(),query=new URLSearchParams(location.search);
  const safeText=v=>typeof v==='string'&&!/@|%40|\b\d{3}[- .]?\d{3}[- .]?\d{4}\b/i.test(v)?v.replace(/[<>\r\n]/g,'').slice(0,100):'';
  const pageUrl=()=>{try{return location.origin+new URL(document.querySelector('link[rel="canonical"]')?.href||location.href).pathname;}catch{return location.origin+location.pathname;}};
  const safeLanding=v=>{try{const u=new URL(v,location.href);return u.origin===location.origin?u.origin+u.pathname:pageUrl();}catch{return pageUrl();}};
  const safeReferrer=v=>{try{const u=new URL(v);return /^https?:$/.test(u.protocol)?u.origin:'';}catch{return '';}};
  const storage={
    read(type,key){try{return JSON.parse(window[type].getItem(key)||'null');}catch{return null;}},
    write(type,key,value){try{window[type].setItem(key,JSON.stringify(value));}catch{}},
    remove(type,key){try{window[type].removeItem(key);}catch{}}
  };
  let attribution={landingPage:safeLanding(query.get('ep_landing')||location.href),referrer:safeReferrer(query.get('ep_ref')||document.referrer)};
  for(const k of campaignKeys)if(query.has(k))attribution[k]=safeText(query.get(k));
  const saved=storage.read('localStorage',consentKey);
  let consent=!!(saved?.choice==='allow'&&Number(saved.expires)>Date.now());
  const hasChoice=!!(saved&&['allow','deny'].includes(saved.choice)&&Number(saved.expires)>Date.now());
  if(consent&&!campaignKeys.some(k=>query.has(k))){
    const prior=storage.read('sessionStorage',attributionKey);
    if(prior?.landingPage){attribution={landingPage:safeLanding(prior.landingPage),referrer:safeReferrer(prior.referrer)};for(const k of campaignKeys)if(prior[k])attribution[k]=safeText(prior[k]);}
  }
  window.epAttribution=()=>({...attribution,pageUrl:pageUrl()});
  const ga4Id=/^G-[A-Z0-9]+$/.test(settings.ga4Id||'')?settings.ga4Id:'';
  const allowedHosts=Array.isArray(settings.allowedHosts)?settings.allowedHosts:['www.edprather.com'];
  const configured=!!ga4Id&&!config.reviewOnly&&allowedHosts.includes(location.hostname);
  let loaded=false,pageviewSent=false,box=null,preferences=null;
  function gtag(){(window.dataLayer=window.dataLayer||[]).push(arguments);}
  function enable(){
    if(!configured||!consent)return;
    storage.write('sessionStorage',attributionKey,attribution);
    window['ga-disable-'+ga4Id]=false;
    window.gtag=gtag;
    if(!loaded){
      loaded=true;
      gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      gtag('set','ads_data_redaction',true);
      gtag('set','url_passthrough',false);
      gtag('set','user_data',null);
      gtag('js',new Date());
      const options={send_page_view:false,page_location:pageUrl(),page_referrer:safeReferrer(document.referrer),allow_google_signals:false,allow_ad_personalization_signals:false,user_data:null};
      const campaignMap={utm_source:'campaign_source',utm_medium:'campaign_medium',utm_campaign:'campaign_name',utm_content:'campaign_content',utm_term:'campaign_term'};
      for(const [from,to]of Object.entries(campaignMap))if(attribution[from])options[to]=attribution[from];
      gtag('config',ga4Id,options);
      const script=document.createElement('script');script.async=true;script.dataset.edAnalytics='true';script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ga4Id);document.head.append(script);
    }else gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    if(!pageviewSent){pageviewSent=true;gtag('event','page_view',{send_to:ga4Id,user_data:null,page_location:pageUrl(),page_referrer:safeReferrer(document.referrer),page_title:document.title});}
  }
  function disable(){
    consent=false;
    storage.remove('sessionStorage',attributionKey);
    if(ga4Id)window['ga-disable-'+ga4Id]=true;
    if(loaded)gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    // Remove this site's GA cookies where the browser allows it. No form data is stored.
    for(const name of document.cookie.split(';').map(x=>x.trim().split('=')[0]).filter(x=>/^_ga(?:_|$)/.test(x))){
      for(const domain of ['',location.hostname,'.'+location.hostname,'.edprather.com'])document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'')+'; SameSite=Lax';
    }
  }
  function openPreferences(focus=false){
    if(!configured)return;
    if(box){if(focus)box.querySelector('button')?.focus();return;}
    box=document.createElement('section');box.className='tracking-consent';box.setAttribute('aria-label','Analytics preferences');
    box.innerHTML='<p>May we use optional analytics cookies to understand visits and measure inquiries? Your choice does not affect forms or home search. You can change it using “Analytics preferences” in the footer.</p><div><button type="button" data-consent="allow">Allow analytics</button><button type="button" data-consent="deny">Decline</button></div>';
    document.body.append(box);
    box.addEventListener('click',e=>{
      const button=e.target.closest('[data-consent]');if(!button)return;
      const choice=button.dataset.consent;
      storage.write('localStorage',consentKey,{choice,expires:Date.now()+180*24*60*60*1000});
      consent=choice==='allow';if(consent)enable();else disable();
      box.remove();box=null;if(focus)preferences?.focus();
    });
    if(focus)box.querySelector('button')?.focus();
  }
  window.epTrack=(name,data={})=>{
    const funnel=Object.hasOwn(eventNames,data.funnel||'')?data.funnel:'';
    if(!['generate_lead','phone_click','external_home_search_click','guide_download'].includes(name))return;
    if((name==='generate_lead'||name==='guide_download')&&!funnel)return;
    const requestId=typeof data.request_id==='string'&&/^[a-z0-9-]{8,64}$/i.test(data.request_id)?data.request_id:'';
    const key=name+':'+(requestId||crypto.randomUUID());if(seen.has(key))return;seen.add(key);
    const event=name==='generate_lead'?eventNames[funnel]:name;
    const clean={funnel,lead_type:funnel,event_id:requestId,...(name==='external_home_search_click'?{destination:'cohousehunters.com'}:{})};
    window.dispatchEvent(new CustomEvent('ed:conversion',{detail:{event,...clean}}));
    if(consent&&configured&&loaded)gtag('event',event,{...clean,send_to:ga4Id,user_data:null,page_location:pageUrl(),page_referrer:safeReferrer(document.referrer)});
  };
  if(configured){
    preferences=document.createElement('button');preferences.type='button';preferences.className='analytics-preferences';preferences.textContent='Analytics preferences';preferences.addEventListener('click',()=>openPreferences(true));
    const footer=document.querySelector('footer');if(footer)footer.append(preferences);
    if(consent)enable();else if(!hasChoice)openPreferences();
    window.addEventListener('storage',e=>{if(e.key!==consentKey)return;const next=storage.read('localStorage',consentKey);if(next?.choice==='deny')disable();});
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');if(!a)return;
    const target=new URL(a.href,location.href);
    // Keep campaign context on clean internal routes too, without storing inquiry answers.
    // Fragment-only navigation, downloads, external links and non-HTML assets remain unchanged.
    if(campaignKeys.some(k=>attribution[k])&&target.origin===location.origin&&!a.hasAttribute('download')&&!a.getAttribute('href').startsWith('#')&&(/\/$|\/index\.html$/.test(target.pathname))){
      for(const k of campaignKeys)if(attribution[k])target.searchParams.set(k,attribution[k]);
      target.searchParams.set('ep_landing',attribution.landingPage);
      if(attribution.referrer)target.searchParams.set('ep_ref',attribution.referrer);
      a.href=target.href;
    }
    if(a.href==='https://www.cohousehunters.com/property-search/results/')window.epTrack('external_home_search_click');
    if(a.href.startsWith('tel:'))window.epTrack('phone_click');
  });
})();
