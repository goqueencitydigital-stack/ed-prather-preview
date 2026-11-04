(() => {
  const filter=document.getElementById('blog-filter'),count=document.querySelector('.journal-count');
  if(filter&&count)filter.addEventListener('change',()=>{const n=[...document.querySelectorAll('[data-blog-category]')].filter(c=>!filter.value||c.dataset.blogCategory===filter.value).length;count.textContent=n+' '+(n===1?'guide':'guides')+' to explore';});
  const steps=[...document.querySelectorAll('[data-process-step]')],number=document.querySelector('[data-process-number]');
  steps.forEach(step=>step.addEventListener('toggle',()=>{if(step.open&&number)number.textContent=String(step.dataset.processStep).padStart(2,'0');}));
  const video=document.querySelector('.service-film video');
  if(video){
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let near=false,started=false;
    const update=()=>{if(motion.matches){video.autoplay=false;video.pause();}else if(near&&!started){started=true;video.autoplay=true;video.play().catch(()=>{started=false;});}};
    update();motion.addEventListener('change',update);
    if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{near=entries.some(e=>e.isIntersecting);update();},{rootMargin:'150px'});observer.observe(video);}else{near=true;update();}
  }
  const links=[...document.querySelectorAll('.service-nav a')];
  if(links.length&&'IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)links.forEach(a=>{if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-120px 0px -50% 0px',threshold:0});
    links.forEach(a=>{const section=document.getElementById(a.hash.slice(1));if(section)observer.observe(section);});
  }
})();
