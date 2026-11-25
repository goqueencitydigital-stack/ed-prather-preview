(() => {
  const g=document.querySelector('#name-that-town');
  if(!g)return;
  const rounds=[...g.querySelectorAll('.town-round')], photos=[...g.querySelectorAll('.town-print')], end=g.querySelector('.town-finish');
  let i=0,score=0,answered=false;
  function show(n,focus=true){
    i=n;answered=false;
    rounds.forEach((r,j)=>{r.hidden=j!==n;r.querySelector('.town-choices').hidden=false;r.querySelector('.town-reveal').hidden=true;});
    photos.forEach((p,j)=>p.hidden=j!==Math.min(n,photos.length-1));
    end.hidden=n!==rounds.length;
    if(!end.hidden){const h=end.querySelector('h3');h.textContent=`${score} out of ${rounds.length}`;h.focus({preventScroll:true});}
    else if(focus)rounds[n].querySelector('.town-clue').focus({preventScroll:true});
  }
  g.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-reset')){score=0;show(0);return;}
    const r=rounds[i];if(!r||!r.contains(b))return;
    if(b.hasAttribute('data-next')&&answered){show(i+1);return;}
    if(!b.hasAttribute('data-pick')||answered)return;
    answered=true;
    const correct=b.dataset.pick===r.dataset.answer;
    if(correct)score++;
    const reveal=r.querySelector('.town-reveal'),feedback=reveal.querySelector('strong');
    feedback.textContent=correct?`You got it. It’s ${r.dataset.answer}!`:`This one is ${r.dataset.answer}.`;
    r.querySelector('.town-choices').hidden=true;reveal.hidden=false;feedback.focus({preventScroll:true});
  });
  show(0,false);g.hidden=false;
})();
