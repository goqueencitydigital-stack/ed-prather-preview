/* Browser-only planning tools. No personal data is sent to a service or persisted. */
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const site = path => `${typeof window !== 'undefined' ? (window.SITE_ROOT || './') : './'}${path}`;
const toolPath = type => site(`discovery/${type}/`);
const listingSearch = 'https://www.cohousehunters.com/property-search/results/';
const money = n => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0}).format(n);
const num = (data, key) => Number(data[key] || 0);
const button = (label, action, secondary = false) => `<button type="button" class="btn ${secondary ? 'btn-outline' : ''}" data-action="${action}">${label}</button>`;
const field = (name, label, value = '', type = 'text', extra = '') => `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}" ${type === 'number' ? 'min="0" step="any"' : 'maxlength="1000"'} ${extra}></label>`;
const amount = (name, label, value = '', extra = '') => field(name,label,value,'number',extra);
const select = (name,label,options) => `<label class="field"><span>${label}</span><select name="${name}">${options.map(o=>`<option value="${esc(Array.isArray(o)?o[0]:o)}">${esc(Array.isArray(o)?o[1]:o)}</option>`).join('')}</select></label>`;
const area = (name,label,placeholder='',required=false) => `<label class="field tool-wide"><span>${label}</span><textarea name="${name}" rows="4" maxlength="6000" placeholder="${esc(placeholder)}" ${required?'required':''}></textarea></label>`;
const note = text => `<p class="tool-note muted">${text}</p>`;
const output = `<div class="tool-output" aria-live="polite" tabindex="-1"></div>`;
const submit = text => `<button class="btn" type="submit">${text}</button>`;
const wrap = (body) => `<div class="tool-panel tool-app">${body}</div>`;
const track = (event, tool, extra = {}) => window.dispatchEvent(new CustomEvent('ed:track', {detail:{event,tool,...extra}}));
const safeURL = value => {try {const u = new URL(value);return ['https:','http:'].includes(u.protocol) ? u.href : '';} catch {return '';}};
const outbound = (url,label) => safeURL(url) ? `<a href="${esc(safeURL(url))}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';
const download = (name, text, type='text/plain') => {
  const url=URL.createObjectURL(new Blob([text],{type}));
  const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
};
const rows = entries => `<dl class="tool-breakdown">${entries.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
const checkList = items => `<ul class="tool-checklist">${items.map((t,i)=>`<li><label><input type="checkbox" name="check-${i}"><span>${esc(t)}</span></label></li>`).join('')}</ul>`;
const resultHeading = (eyebrow,title) => `<p class="eyebrow">${eyebrow}</p><h3>${title}</h3>`;
const forms = {
  calculator: () => wrap(`${note('Enter your purchase, loan, and ownership costs to build a personal estimate. These calculations are not lender quotes, tax assessments, or insurance offers.')}<form data-form="calculator">
    <fieldset><legend>The purchase & loan</legend><div class="form-grid">
    ${amount('price','Purchase price ($)','','required max="100000000"')}${amount('down','Down payment ($)','','required max="100000000"')}
    ${amount('rate','Annual interest rate (%)','','required max="30"')}${select('term','Loan term (years)',['30','25','20','15','10'])}
    </div></fieldset><fieldset><legend>Monthly ownership costs</legend><div class="form-grid">
    ${amount('tax','Property taxes ($ / year)','','max="10000000"')}${amount('insurance','Homeowners insurance ($ / year)','','max="10000000"')}
    ${amount('hoa','HOA dues ($ / month)',0,'max="1000000"')}${amount('pmi','Mortgage insurance / PMI ($ / month)',0,'max="1000000"')}
    ${amount('utilities','Utilities ($ / month)','','max="1000000"')}${amount('maintenance','Maintenance reserve ($ / month)','','max="1000000"')}${amount('other','Other ownership costs ($ / month)',0,'max="1000000"')}
    </div></fieldset><fieldset><legend>Cash to close</legend><div class="form-grid">
    ${amount('closing','Closing costs ($)','','max="100000000"')}${amount('prepaids','Prepaids & initial escrow ($)','','max="100000000"')}
    ${amount('credits','Seller / lender credits ($)',0,'max="100000000"')}${amount('deposit','Earnest money already paid ($)',0,'max="100000000"')}
    </div></fieldset>${submit('Calculate my ownership cost')}${output}</form>`),
  'net-sheet': () => wrap(`${note('Plan with your own figures. Compensation is negotiable; no standard fee or market value is assumed. This estimate is not a settlement statement or tax advice.')}<form data-form="net-sheet"><div class="form-grid">
    ${amount('sale','Expected sale price ($)','','required max="100000000"')}${amount('payoff','Mortgage payoff ($)','','required max="100000000"')}
    ${amount('second','Other liens / second mortgage ($)',0)}${amount('comp','Total negotiated brokerage compensation (%)',0,'max="100"')}
    ${amount('closing','Other closing / title costs ($)',0)}${amount('concessions','Buyer concessions ($)',0)}
    ${amount('repairs','Repairs / preparation ($)',0)}${amount('taxes','Tax / HOA prorations owed ($)',0)}
    ${amount('moving','Moving / other costs ($)',0)}${amount('credits','Other credits to seller ($)',0)}
    </div>${submit('Estimate net proceeds')}${output}</form>`),
  compare: () => wrap(`${note('Compare two or three homes using information you supply. No listings, prices, measurements, or property claims are retrieved or verified. Leave unknown costs blank; they will be labeled unknown.')}<form data-form="compare"><div class="tool-compare-inputs">${compareCard(1)}${compareCard(2)}<div data-third hidden>${compareCard(3)}</div></div><div class="tool-actions">${button('Add a third home','third',true)}${submit('Compare my homes')}</div>${output}</form>`),
  discovery: () => wrap(`<p class="eyebrow">A place that fits your priorities</p>${note('12 quick questions create a community starting point, not a home search or availability check. Only your place preferences affect the tag-match score; budget and bedrooms never rank communities.')}<form data-form="discovery">
    <div class="tool-progress"><span data-step-label>01 / 03 · Your move</span><progress max="3" value="1" aria-label="Discovery progress"></progress></div>
    <fieldset data-step="0"><legend>First, the practical things.</legend><div class="form-grid">
    ${amount('budget','1. Maximum purchase budget ($)','','required max="100000000"')}${select('bedrooms','2. Minimum bedrooms',['1','2','3','4','5+'])}
    ${select('timeline','3. When would you like to move?',['Exploring','Within 3 months','3–6 months','6–12 months','More than a year'])}
    ${select('purpose','4. What brings you here?',['First home','Moving locally','Relocating','Downsizing','Another reason'])}
    </div></fieldset>
    <fieldset data-step="1" hidden><legend>Picture your everyday.</legend><div class="form-grid">
    ${select('setting','5. Your preferred setting',[['','No preference'],['urban','City energy'],['suburban','Residential / suburban'],['foothills','Foothills']])}
    ${select('walk','6. Walkable local destinations?',[['','No preference'],['walkable','A priority']])}
    ${select('outdoors','7. Parks and trails?',[['','No preference'],['outdoors','A priority']])}
    ${select('transit','8. Transit access?',[['','No preference'],['transit','A priority']])}
    </div></fieldset>
    <fieldset data-step="2" hidden><legend>Make it your kind of place.</legend><div class="form-grid">
    ${select('dining','9. Dining and local shops?',[['','No preference'],['dining','A priority']])}
    ${select('character','10. Historic character?',[['','No preference'],['historic','A priority']])}
    ${select('pace','11. Your preferred pace',[['','No preference'],['quiet','A quieter setting'],['lively','An active setting']])}
    ${area('must','12. Non-negotiables / accessibility needs','Optional. These notes go in your brief, not in the score.')}
    </div></fieldset>
    <div class="tool-actions">${button('Back','discovery-back',true)}${button('Next: your everyday','discovery-next')}${submit('Find my community starting points')}</div>${output}</form>`),
  property: () => wrap(`${note('A clear property research checklist, built from your input. This tool does not open a listing URL, retrieve records, inspect a home, or generate verified property answers.')}<form data-form="property"><div class="form-grid">
    ${field('address','Property address or name','','text','required')}${field('url','Listing URL (optional)','','url')}
    ${area('known','What do you already know?','Paste listing details or your own observations. Do not include private documents.')}
    ${area('questions','What would you like to ask?','Roof age, sewer line, HOA rules, permit history, monthly costs…')}
    ${select('focus','Primary concern',['General due diligence','Condition / repairs','Monthly cost','HOA / restrictions','Accessibility'])}</div>${submit('Build my property checklist')}${output}</form>`),
  tour: () => wrap(`<h2>Request a showing.</h2><p>Share the properties and times that interest you. The team will follow up to coordinate the details.</p><a class="btn" href="${site('schedule-tour/index.html')}">Start my showing request →</a>`),
  relocation: () => wrap(`${note('Turn your priorities into a personal planning checklist. Your answers stay in this page until you leave or download your plan.')}<form data-form="relocation"><div class="form-grid">
    ${field('from','Moving from (city / region)','','text','required')}${field('target','Target area in Colorado','','text','required')}
    ${select('when','Move timing',['Within 30 days','1–3 months','3–6 months','Still researching'])}${select('housing','Housing plan',['Buy before moving','Rent first','Not sure yet'])}
    ${select('work','Work / commute plan',['Remote work','Daily commute','Hybrid','To be determined'])}${select('pets','Moving with pets?',['No','Yes'])}
    ${select('schools','Need school / childcare research?',['No','Yes'])}${area('priorities','Your top priorities','Accessibility, storage, trails, commute destinations, moving logistics…')}
    </div>${submit('Build my relocation plan')}${output}</form>`),
  passport: () => wrap(`<p class="chip">Your session notebook</p>${note('No account, cloud saving, or favorites sync. Entries exist only in this page’s memory and disappear on reload or navigation. Download a JSON backup before leaving; import it to continue later. Avoid sensitive personal information.')}<form data-form="passport"><div class="form-grid">
    ${field('label','Home / community name','','text','required')}${field('url','Public listing or community URL (optional)','','url')}
    ${select('stage','Your next step',['Research','Ask a question','Tour','Revisit','Not for me'])}${area('notes','Your notes','What stands out? What needs checking?')}
    </div>${submit('Add to my passport')}</form><div class="tool-actions">${button('Download JSON backup','passport-export',true)}<label class="btn btn-outline tool-file">Import JSON backup<input type="file" accept=".json,application/json" data-import></label>${button('Clear this session','passport-clear',true)}</div><div data-passport-list></div><div class="tool-output" aria-live="polite"></div>`),
  party: () => wrap(`${note('Create a planning brief to share on your own terms. This is a downloadable document, not a shared workspace, invitation, messaging service, or live collaborative shortlist. Use nicknames and public property links; skip contact details.')}<form data-form="party"><div class="form-grid">
    ${field('title','Your search party name','','text','required')}${field('members','Participant nicknames (optional)')}
    ${area('homes','Shortlisted homes / public URLs','One home per line.',true)}${area('priorities','Shared must-haves','The priorities everyone agrees on.')}
    ${area('questions','Open questions / differences','What should you discuss before the next tour?')}${field('next','Next check-in / action')}
    </div>${submit('Create our planning brief')}${output}</form>`),
  assistant: () => wrap(`<p class="chip">Your real estate planning guide</p>${note('Choose a topic to explore practical guidance, useful tools, and source-linked next steps. For advice about your own circumstances, contact the team.')}<div class="tool-faq-buttons">
    ${button('What can I comfortably own?','faq-cost',true)}${button('Where should I start looking?','faq-place',true)}${button('How do I investigate a home?','faq-property',true)}${button('How do I plan a tour?','faq-tour',true)}${button('Can you find live listings?','faq-listings',true)}
    </div><div class="tool-output" aria-live="polite"><p>Select a question to explore your next step.</p></div>`),
  radar: () => wrap(`<p class="chip">Property search</p><h3>Your search starts with real listings.</h3><p>Search properties on COHouseHunters, then bring the addresses and listing details you want to compare into your planning tools. Listings, availability, saved searches, and alerts are managed on that separate website.</p><div class="tool-actions"><a class="btn" href="${listingSearch}" target="_blank" rel="noopener noreferrer" data-outbound="listing-search">Open COHouseHunters ↗</a><a class="btn btn-outline" href="${toolPath('compare')}">Compare homes manually</a></div>${note('COHouseHunters has its own account options, terms, and privacy practices. Apply your filters there; no search preferences transfer automatically.')}`)
};
function compareCard(i) {
  return `<fieldset data-home="${i}"><legend>Home ${i}${i===3?' (optional)':''}</legend><div class="form-grid">${field(`name${i}`,'Address / nickname','','text',i<3?'required':'')}${field(`url${i}`,'Public listing URL (optional)','','url')}
  ${amount(`price${i}`,'Price ($)')}${amount(`beds${i}`,'Bedrooms')}${amount(`baths${i}`,'Bathrooms')}${amount(`sqft${i}`,'Interior size (sq ft)')}
  ${amount(`monthly${i}`,'Your all-in monthly estimate ($)')}${amount(`commute${i}`,'Your observed commute (minutes)')}${area(`notes${i}`,'Strengths / trade-offs','Your observations only.')}</div></fieldset>`;
}

export function renderTool(type) { return (forms[type] || (()=>wrap(note('Choose a planning tool to begin.'))))(); }

export function ownershipEstimate(d) {
  const principal=num(d,'price')-num(d,'down'), rate=num(d,'rate')/1200, months=num(d,'term')*12;
  const pi=principal===0?0:rate===0?principal/months:principal*rate/(1-Math.pow(1+rate,-months));
  const costs={ 'Principal & interest':pi, 'Property taxes':num(d,'tax')/12, 'Homeowners insurance':num(d,'insurance')/12,
    'HOA dues':num(d,'hoa'),'Mortgage insurance / PMI':num(d,'pmi'),'Utilities':num(d,'utilities'),
    'Maintenance reserve':num(d,'maintenance'),'Other costs':num(d,'other') };
  return {principal,pi,costs,monthly:Object.values(costs).reduce((a,b)=>a+b,0),
    cash:num(d,'down')+num(d,'closing')+num(d,'prepaids')-num(d,'credits')-num(d,'deposit'),interest:pi*months-principal};
}
export function sellerEstimate(d) {
  const compensation=num(d,'sale')*num(d,'comp')/100;
  const costs=compensation+['payoff','second','closing','concessions','repairs','taxes','moving'].reduce((s,k)=>s+num(d,k),0);
  return {compensation,costs,net:num(d,'sale')+num(d,'credits')-costs};
}
const tagAliases = {
  outdoors:['outdoors','outdoor','parks','trails','hiking','nature','outdoor-access','parks-trails'],
  walkable:['walkable','walkability','walkable-downtown'],transit:['transit','rail','light-rail','transit-access'],
  urban:['urban','city'],suburban:['suburban','suburb','residential'],foothills:['foothills','mountains','mountain'],
  dining:['dining','restaurants','shopping','local-shops','shops'],historic:['historic','history','historic-character'],
  quiet:['quiet','quieter','relaxed'],lively:['lively','active','urban','nightlife']
};
export function rankCommunities(communities, preferences) {
  const wanted=[...new Set(['setting','walk','outdoors','transit','dining','character','pace'].map(k=>preferences[k]).filter(Boolean))];
  return communities.map(c=>{
    const tags=(Array.isArray(c.tags)?c.tags:[]).map(t=>String(t).toLowerCase().trim());
    const matched=wanted.filter(t=>(tagAliases[t]||[t]).some(alias=>tags.includes(alias)));
    return {...c,matched,score:wanted.length?Math.round(matched.length/wanted.length*100):null,wantedCount:wanted.length};
  }).sort((a,b)=>(b.score||0)-(a.score||0)||String(a.name).localeCompare(String(b.name)));
}
function show(root,html) {
  const el=root.querySelector('.tool-output');el.innerHTML=html;return el;
}
function makeDownload(root,text,name='my-home-plan.txt',type='text/plain') {
  const action=root.querySelector('[data-action="download-result"]');
  if(action) action.onclick=()=>{download(name,text,type);track('plan_download',root.dataset.tool);};
}
function plainData(d) {return Object.entries(d).map(([k,v])=>`${k}: ${v}`).join('\n');}

export function initTools() {
  const root=document.querySelector('#tool-root');
  if(!root || root.dataset.toolsInitialized==='true') return;
  root.dataset.toolsInitialized='true';
  const type=root.dataset.tool;
  root.innerHTML=renderTool(type);
  track('tool_view',type);
  let started=false,step=0,passport=[];
  root.addEventListener('input',()=>{if(!started){started=true;track('tool_start',type);}});
  root.querySelector('[data-outbound]')?.addEventListener('click',()=>track('listing_search_outbound',type));
  const form=root.querySelector('form');
  if(type==='discovery') {
    const preferences=new Set(new URLSearchParams(location.hash.slice(1)).get('preferences')?.split(',')||[]);
    if(preferences.has('hiking')||preferences.has('parks'))form.elements.outdoors.value='outdoors';
    if(preferences.has('transit'))form.elements.transit.value='transit';
    if(preferences.has('dining'))form.elements.dining.value='dining';
    if(preferences.has('urban')!==preferences.has('foothills'))form.elements.setting.value=preferences.has('urban')?'urban':'foothills';
    const updateStep=()=>{
      root.querySelectorAll('[data-step]').forEach(el=>{el.hidden=Number(el.dataset.step)!==step;el.disabled=el.hidden;});
      root.querySelector('[data-step-label]').textContent=`0${step+1} / 03 · ${['Your move','Your everyday','Your kind of place'][step]}`;
      root.querySelector('progress').value=step+1;
      root.querySelector('[data-action="discovery-back"]').hidden=step===0;
      root.querySelector('[data-action="discovery-next"]').hidden=step===2;
      root.querySelector('[data-action="discovery-next"]').textContent=step===0?'Next: your everyday':'Next: your kind of place';
      root.querySelector('button[type="submit"]').hidden=step!==2;
    };
    updateStep();
    root.querySelector('[data-action="discovery-back"]').onclick=()=>{step=Math.max(0,step-1);updateStep();};
    root.querySelector('[data-action="discovery-next"]').onclick=()=>{if(!form.reportValidity())return;step=Math.min(2,step+1);updateStep();track('discovery_step',type,{step:step+1});root.querySelector(`[data-step="${step}"] input, [data-step="${step}"] select`)?.focus();};
  }
  if(type==='compare') root.querySelector('[data-action="third"]').onclick=e=>{
    const third=root.querySelector('[data-third]');third.hidden=!third.hidden;
    third.querySelector('fieldset').disabled=third.hidden;
    e.currentTarget.textContent=third.hidden?'Add a third home':'Remove third home';
  };
  if(type==='tour') {
    const now=new Date();const local=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
    form.elements.date.min=local;
  }
  if(type==='passport') {
    const list=()=>{root.querySelector('[data-passport-list]').innerHTML=passport.length?`<p class="eyebrow">${passport.length} saved in this session</p><div class="tool-saved-list">${passport.map((p,i)=>`<article class="tool-saved"><div><p class="chip">${esc(p.stage)}</p><h3>${esc(p.label)}</h3><p class="tool-preserve">${esc(p.notes)}</p>${outbound(p.url,'Open supplied URL')}</div><button class="btn btn-outline" type="button" data-remove="${i}" aria-label="Remove ${esc(p.label)}">Remove</button></article>`).join('')}</div>`:note('Your passport is empty. Add a home or community above to start your notebook.');};
    list();
    root.querySelector('[data-action="passport-export"]').onclick=()=>{download('home-passport.json',JSON.stringify({version:1,entries:passport},null,2),'application/json');show(root,'<p>Backup created. Keep this file to restore your entries later; no account was created.</p>');track('passport_export',type,{count:passport.length});};
    root.querySelector('[data-action="passport-clear"]').onclick=()=>{passport=[];list();show(root,'<p>This session is clear. Previously downloaded files are unchanged.</p>');track('passport_clear',type);};
    root.addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(b){passport.splice(Number(b.dataset.remove),1);list();track('passport_remove',type);}});
    root.querySelector('[data-import]').addEventListener('change',async e=>{
      const file=e.target.files[0];if(!file)return;
      try {
        if(file.size>1000000)throw new Error('Use a backup smaller than 1 MB.');
        const data=JSON.parse(await file.text());
        if(data.version!==1||!Array.isArray(data.entries)||data.entries.length>100)throw new Error('Use a version 1 passport backup with no more than 100 entries.');
        const clean=data.entries.map(p=>{
          if(!p||typeof p.label!=='string'||!p.label.trim()||p.label.length>1000)throw new Error('One or more entries has an invalid name.');
          return {label:p.label,notes:String(p.notes||'').slice(0,6000),url:safeURL(p.url||''),stage:['Research','Ask a question','Tour','Revisit','Not for me'].includes(p.stage)?p.stage:'Research'};
        });
        if(passport.length+clean.length>100)throw new Error('Your session can contain up to 100 entries. Remove some entries before importing.');
        passport.push(...clean);list();show(root,`<p>${clean.length} entries imported into this page’s memory. Download a fresh backup before leaving.</p>`);track('passport_import',type,{count:clean.length});
      }catch(err){show(root,`<p role="alert">Could not import this file. ${esc(err instanceof SyntaxError?'The file is not valid JSON.':err.message)}</p>`);}
      e.target.value='';
    });
    form.addEventListener('submit',e=>{
      e.preventDefault();if(passport.length>=100){show(root,'<p role="alert">Your session has 100 entries. Download a backup, then remove entries before adding more.</p>');return;}
      const d=Object.fromEntries(new FormData(form));passport.push({...d,url:safeURL(d.url)});list();form.reset();show(root,'<p>Added to this session. Download a backup before leaving this page.</p>');track('passport_add',type,{count:passport.length});
    });
    return;
  }
  if(type==='assistant') {
    const faqs={
      cost:['Start with the whole ownership picture.','Enter your purchase price, financing assumptions, taxes, insurance, HOA, utilities, and maintenance in the ownership calculator. It produces an editable planning estimate, not an affordability decision or lender quote.','calculator','Open the ownership calculator'],
      place:['Start with the way you want to live.','The discovery tool matches your selected place preferences to curated community tags. Its methodology and source links appear beside the results; scores do not represent listing availability, demographic fit, school quality, or a housing recommendation.','discovery','Explore community starting points'],
      property:['Separate observations from verified facts.','Add an address, your own notes, and your questions to the property checklist. Nothing is retrieved from the address or listing URL; use the checklist to organize questions for the relevant professionals and records offices.','property','Build a property checklist'],
      tour:['Request a showing.','Share your preferred properties and times with the team. Your appointment is subject to confirmation.','tour','Request a showing'],
      listings:['Search homes on COHouseHunters.','COHouseHunters opens separately. Search properties and manage any saved listings or alerts there; your account and search preferences do not synchronize with this website.',null,'Open COHouseHunters']
    };
    root.addEventListener('click',e=>{const b=e.target.closest('[data-action^="faq-"]');if(!b)return;const key=b.dataset.action.slice(4),f=faqs[key];show(root,`${resultHeading('Guided answer',f[0])}<p>${f[1]}</p><a class="btn btn-outline" href="${f[2]?toolPath(f[2]):listingSearch}" ${f[2]?'':'target="_blank" rel="noopener noreferrer"'}>${f[3]}</a>`);track('guided_faq_open',type,{topic:key});});
    return;
  }
  if(!form)return;
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(type==='discovery')root.querySelectorAll('[data-step]').forEach(el=>el.disabled=false);
    const d=Object.fromEntries(new FormData(form));
    if(type==='discovery')root.querySelectorAll('[data-step]').forEach(el=>el.disabled=el.hidden);
    if(type==='calculator'){
      if(num(d,'down')>num(d,'price')){show(root,'<p role="alert">Down payment cannot exceed the purchase price. Adjust either amount and calculate again.</p>');return;}
      const r=ownershipEstimate(d);
      show(root,`${resultHeading('Your estimated ownership cost',`${money(r.monthly)} <span class="muted">/ month</span>`)}
        ${rows(Object.entries(r.costs).map(([k,v])=>[k,money(v)]))}
        <div class="tool-total">${rows([['Loan principal',money(r.principal)],['Estimated remaining cash to close',money(r.cash)],['Loan interest over full term',money(r.interest)]])}</div>
        ${r.cash<0?note('Negative cash to close means entered credits and deposits exceed these estimated charges. This is not a promised refund; ask your lender which credits are permitted.'):''}
        ${note('Fixed-rate, fully amortizing loan calculation. Monthly tax and insurance estimates are annual inputs ÷ 12. Cash to close = down payment + closing costs + prepaids − credits − earnest money. Taxes, insurance, utilities, maintenance, and HOA costs can change. No automatic PMI eligibility or cancellation is assumed.')}
        ${button('Download this estimate','download-result',true)}`);
      makeDownload(root,`OWNERSHIP PLANNING ESTIMATE\nUser-entered assumptions, not a quote.\n\n${plainData(d)}\n\nLoan principal: ${money(r.principal)}\nMonthly ownership estimate: ${money(r.monthly)}\n${Object.entries(r.costs).map(([k,v])=>`${k}: ${money(v)}`).join('\n')}\nRemaining cash to close: ${money(r.cash)}\nInterest over full term: ${money(r.interest)}`,'ownership-estimate.txt');
    }else if(type==='net-sheet'){
      const r=sellerEstimate(d);
      show(root,`${resultHeading('Estimated seller proceeds',money(r.net))}${r.net<0?note('Your entered costs exceed sale proceeds. This scenario would require additional funds; review it with your settlement professional.'):''}${rows([['Sale price',money(num(d,'sale'))],['Negotiated compensation',money(r.compensation)],['Total payoff & selling costs',money(r.costs)],['Other seller credits',money(num(d,'credits'))]])}${note('Net = sale price + seller credits − mortgage payoff − other liens − negotiated compensation − all other entered costs. Capital-gains taxes are not calculated. Get actual payoff, proration, and settlement figures before making a decision.')}${button('Download net sheet','download-result',true)}`);
      makeDownload(root,`SELLER NET PLANNING ESTIMATE\nNot a settlement statement.\n\n${plainData(d)}\n\nCompensation: ${money(r.compensation)}\nTotal costs: ${money(r.costs)}\nEstimated net: ${money(r.net)}`,'seller-net-sheet.txt');
    }else if(type==='compare'){
      const indexes=[1,2,...(!root.querySelector('[data-third]').hidden&&d.name3?[3]:[])];
      const specs=[['price','Price',true],['beds','Bedrooms'],['baths','Bathrooms'],['sqft','Interior sq ft'],['monthly','Your monthly estimate',true],['commute','Observed commute (minutes)']];
      const data=indexes.map(i=>({i,name:d[`name${i}`]}));
      show(root,`${resultHeading('Your side-by-side',`${data.length} homes. Your facts.`)}<div class="tool-table-wrap"><table class="tool-table"><caption>Only user-entered information, not verified listing data</caption><thead><tr><th scope="col">Detail</th>${data.map(p=>`<th scope="col">${esc(p.name)}</th>`).join('')}</tr></thead><tbody>
      ${specs.map(([key,label,currency])=>`<tr><th scope="row">${label}</th>${data.map(p=>`<td>${d[key+p.i]!==''&&d[key+p.i]!==undefined?esc(currency?money(num(d,key+p.i)):d[key+p.i]):'Unknown'}</td>`).join('')}</tr>`).join('')}
      <tr><th scope="row">Price / sq ft</th>${data.map(p=>`<td>${num(d,'sqft'+p.i)>0&&d['price'+p.i]!==''?money(num(d,'price'+p.i)/num(d,'sqft'+p.i)):'Unknown'}</td>`).join('')}</tr>
      <tr><th scope="row">Strengths / trade-offs</th>${data.map(p=>`<td class="tool-preserve">${esc(d['notes'+p.i]||'Not added')}</td>`).join('')}</tr><tr><th scope="row">Supplied listing</th>${data.map(p=>`<td>${outbound(d['url'+p.i],'Open listing')||'Not added'}</td>`).join('')}</tr></tbody></table></div>${button('Download comparison','download-result',true)}`);
      makeDownload(root,`MY HOME COMPARISON\nUnverified, user-entered information only.\n\n${data.map(p=>`${p.name}\n${specs.map(([k,l,c])=>`${l}: ${d[k+p.i]!==''?(c?money(num(d,k+p.i)):d[k+p.i]):'Unknown'}`).join('\n')}\nNotes: ${d['notes'+p.i]||''}\nURL: ${d['url'+p.i]||''}`).join('\n\n')}`,'home-comparison.txt');
    }else if(type==='discovery'){
      const submitButton=form.querySelector('[type="submit"]');submitButton.disabled=true;
      show(root,'<p role="status">Matching your preferences to the community guide…</p>');
      try{
        const response=await fetch(site('data/communities.json'));if(!response.ok)throw new Error('unavailable');
        const raw=await response.json(),communities=Array.isArray(raw)?raw:raw.communities;
        if(!Array.isArray(communities)||!communities.length)throw new Error('empty');
        const ranked=rankCommunities(communities,d).slice(0,4);
        const wanted=ranked[0].wantedCount;
        show(root,`${resultHeading('Your community starting points',wanted?'A shortlist worth exploring.':'Explore without a score.')}
        ${note('Tag match = matching selected preference tags ÷ total selected preference tags × 100, rounded to a whole percentage. Each distinct tag has equal weight; ties are alphabetical. Budget, bedrooms, move timing, move reason, and free-text notes do not affect community scores. These are editorial place tags, not MLS, pricing, commute, safety, school, or demographic data.')}
        <div class="tool-community-results">${ranked.map(c=>`<article class="tool-community"><p class="chip">${c.score===null?'No preferences selected':`${c.score}% preference-tag match`}</p><h3>${esc(c.name)}</h3><p>${esc(c.summary||c.description||'Explore the source-linked community guide.')}</p><p class="muted">${c.matched.length?`Matched: ${c.matched.map(esc).join(', ')}`:'No selected tags matched; this is an exploration option.'}</p><div class="tool-actions"><a href="${site(`communities/${encodeURIComponent(c.slug||c.id||'')}/index.html`)}">Explore community →</a>${communitySources(c)}</div></article>`).join('')}</div>
        ${note(`Your planning brief: budget ${money(num(d,'budget'))}; ${esc(d.bedrooms)}+ bedrooms; ${esc(d.timeline)}. Verify homes and prices separately.`)}${button('Download my discovery brief','download-result',true)}`);
        makeDownload(root,`HOME DISCOVERY BRIEF\n${plainData(d)}\n\nTag-only matches, not housing availability:\n${ranked.map(c=>`${c.name}: ${c.score===null?'unranked':c.score+'%'}; matching tags: ${c.matched.join(', ')||'none'}`).join('\n')}\n\nScoring: equally weighted distinct selected place tags matched / selected tags. Budget and bedrooms do not affect community ranking. Verify properties independently.`,'home-discovery-brief.txt');
      }catch{show(root,`<p role="alert">The community guide could not be loaded. Your answers are still here. Try again, or browse the community guides directly.</p><a class="btn btn-outline" href="${site('communities/index.html')}">Explore communities</a>`);}
      finally{submitButton.disabled=false;}
    }else if(type==='property'){
      const checks=['Verify listing status, asking price, and what is included with the listing representative.','Review seller disclosures and ask which facts have independent documentation.','Ask a qualified inspector about roof, structure, electrical, plumbing, sewer, and HVAC condition.','Verify permits, zoning, boundaries, and intended use with the relevant records offices.','Obtain property-specific insurance quotes, tax information, and utility history.','Review HOA / covenant documents, dues, reserves, special assessments, and restrictions if applicable.'];
      if(d.focus==='Accessibility')checks.push('Review actual entry routes, clearances, stairs, bathrooms, and renovation feasibility against your specific accessibility needs.');
      if(d.focus==='Monthly cost')checks.push('Run the ownership calculator using property-specific costs and your lender’s financing terms.');
      show(root,`${resultHeading('User-supplied property workspace',esc(d.address))}<p class="chip">Not retrieved or verified</p>${outbound(d.url,'Open your supplied listing URL')}<h4>Your observations</h4><p class="tool-preserve">${esc(d.known||'No observations supplied.')}</p><h4>Your questions</h4><p class="tool-preserve">${esc(d.questions||'No custom questions supplied.')}</p><h4>Research checklist</h4>${checkList(checks)}${button('Download property brief','download-result',true)}`);
      makeDownload(root,`PROPERTY RESEARCH BRIEF\nProperty: ${d.address}\nSupplied URL: ${d.url||'Not provided'}\nNo information has been retrieved or verified.\n\nYour observations:\n${d.known}\n\nYour questions:\n${d.questions}\n\nChecklist:\n${checks.map(x=>'[ ] '+x).join('\n')}`,'property-research-brief.txt');
    }else if(type==='relocation'){
      const items=[`Create a move calendar for your ${d.when.toLowerCase()} timeline from ${d.from} to ${d.target}.`,'Set a total moving budget, emergency reserve, and housing-cost target.','Verify neighborhood preferences with in-person visits and current, official information.','Request written moving estimates and confirm insurance / valuation coverage.','Plan utilities, mail forwarding, medical records, and essential documents.'];
      if(d.housing==='Rent first')items.push('Research rental terms, deposits, pet policies, and a flexible path to buying after arrival.');
      else if(d.housing==='Buy before moving')items.push('Coordinate financing, due diligence, closing dates, and temporary accommodation if the transaction changes.');
      else items.push('Compare a rent-first approach with purchasing before your move.');
      if(d.work==='Remote work')items.push('Verify actual internet providers and speeds at each shortlisted address.');
      else items.push('Test your specific commute at the times and days you expect to travel; do not rely on a neighborhood-wide estimate.');
      if(d.pets==='Yes')items.push('Check property pet rules, secure travel arrangements, and transfer veterinary records.');
      if(d.schools==='Yes')items.push('Verify school assignment, enrollment requirements, and childcare availability directly with the relevant providers; do not assume boundaries from a listing.');
      if(d.priorities)items.push(`Discuss your own priorities: ${d.priorities}`);
      show(root,`${resultHeading('Your relocation checklist',`${esc(d.from)} → ${esc(d.target)}`)}${checkList(items)}${button('Download relocation checklist','download-result',true)}${note('Checking items marks progress only in this page. Your downloaded document contains the full planning checklist, not a synced account.')}`);
      makeDownload(root,`MY RELOCATION PLAN\n${plainData(d)}\n\n${items.map(x=>'[ ] '+x).join('\n')}`,'relocation-plan.txt');
    }else if(type==='party'){
      const text=`${d.title}\nSEARCH PARTY PLANNING BRIEF\nUser-entered notes. No shared workspace or live listing verification.\n\nParticipants (nicknames): ${d.members||'Not added'}\n\nShortlist:\n${d.homes}\n\nShared must-haves:\n${d.priorities||'Not added'}\n\nOpen questions:\n${d.questions||'Not added'}\n\nNext action:\n${d.next||'Not added'}\n\nShare this document only with people you choose. Changes to separate copies do not sync.`;
      show(root,`${resultHeading('Ready to discuss',esc(d.title))}<pre class="tool-draft">${esc(text)}</pre>${button('Download our planning brief','download-result',true)}${note('Review for private information before sharing. This file is not a public link and does not invite anyone automatically.')}`);
      makeDownload(root,text,'search-party-brief.txt');
    }
    track('tool_complete',type);
  });
}
function communitySources(c) {
  const sources=c.sources||[];
  if(Array.isArray(sources)&&sources.length)return sources.slice(0,2).map(s=>outbound(typeof s==='string'?s:s.url,typeof s==='string'?'Community source':(s.label||s.title||s.name||'Community source'))).join(' ');
  return outbound(c.sourceUrl||c.source_url||c.url,'Community source');
}
