(() => {
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Lightweight scroll progress; one animation frame per scroll event.
 const progress=$('.progress');let queued=false;
 const paint=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';queued=false};
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(paint)}},{passive:true});paint();
 // Reveal content once, without permanent animation loops.
 const reveal=$$('.about-copy,.work-heading,.project,.thought-list article,.contact h2,.contact-copy,.contact-cta');
 reveal.forEach(el=>el.classList.add('js-reveal'));
 if('IntersectionObserver'in window&&!reduce){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});reveal.forEach(el=>io.observe(el))}else reveal.forEach(el=>el.classList.add('visible'));
 // Mobile menu.
 const toggle=$('.menu-toggle'),menu=$('.menu');
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open)});
 $$('a',menu).forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
 // Project rail: native horizontal scrolling plus accessible arrow controls.
 const rail=$('.project-rail'),step=()=>Math.min(rail.clientWidth*.78,rail.querySelector('.project').getBoundingClientRect().width+24);
 $('.rail-next').addEventListener('click',()=>rail.scrollBy({left:step(),behavior:reduce?'auto':'smooth'}));
 $('.rail-prev').addEventListener('click',()=>rail.scrollBy({left:-step(),behavior:reduce?'auto':'smooth'}));
 // Mouse drag on desktop. Touch remains native and never gets intercepted.
 let down=false,startX=0,startScroll=0;
 rail.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;down=true;startX=e.clientX;startScroll=rail.scrollLeft;rail.setPointerCapture(e.pointerId)});
 rail.addEventListener('pointermove',e=>{if(down)rail.scrollLeft=startScroll-(e.clientX-startX)});
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>rail.addEventListener(type,()=>down=false));
 // A small portrait response on desktop only; no full-screen pointer tracking.
 const portrait=$('.portrait-cutout');
 if(portrait&&matchMedia('(pointer:fine)').matches&&!reduce){const stage=$('.hero-stage');stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;portrait.style.transform='translate3d('+x*9+'px,'+y*6+'px,0)'} ,{passive:true});stage.addEventListener('pointerleave',()=>portrait.style.transform='')}
})();