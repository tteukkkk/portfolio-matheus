'use strict';
(() => {
  const root=document.documentElement;
  const toggle=document.getElementById('case-theme');
  const mq=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  function syncTheme(){
    const isDark=root.dataset.theme==='dark';
    if(toggle){toggle.setAttribute('aria-label',isDark?'Ativar modo claro':'Ativar modo escuro');toggle.title=isDark?'Ativar modo claro':'Ativar modo escuro';toggle.querySelector('span').textContent=isDark?'☀':'☾'}
  }
  toggle?.addEventListener('click',()=>{
    root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
    try{localStorage.setItem('portfolio-theme',root.dataset.theme)}catch(error){}
    syncTheme();
  });
  syncTheme();
  // Animações de entrada com suporte a navegação sem JS e preferência de movimento reduzido.
  if(!mq.matches && 'IntersectionObserver' in window){
    root.classList.add('js-motion');
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}
    }),{threshold:.09,rootMargin:'0px 0px -35px 0px'});
    document.querySelectorAll('[data-reveal]').forEach((element,index)=>{
      element.style.setProperty('--delay',`${Math.min(index%4,3)*75}ms`);io.observe(element);
    });
  }
  // Galeria: abrir captura em tamanho ampliado, sem carregar imagens externas.
  const dialog=document.getElementById('case-image-modal');
  const dialogImg=document.getElementById('case-modal-img');
  const dialogLabel=document.getElementById('case-modal-label');
  const zoomButtons=[...document.querySelectorAll('[data-zoom]')];
  let activeIndex=0;
  function showImage(index){
    const button=zoomButtons[index]; if(!button||!dialog||!dialogImg)return;
    const img=button.querySelector('img'); if(!img)return;
    activeIndex=index;
    dialogImg.src=img.currentSrc||img.src;
    dialogImg.alt=img.alt;
    if(dialogLabel)dialogLabel.textContent=button.dataset.caption||img.alt;
    if(!dialog.open)dialog.showModal();
  }
  zoomButtons.forEach((button,index)=>button.addEventListener('click',()=>showImage(index)));
  document.getElementById('case-modal-close')?.addEventListener('click',()=>dialog?.close());
  dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
  dialog?.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'){event.preventDefault();showImage((activeIndex+1)%zoomButtons.length)}
    if(event.key==='ArrowLeft'){event.preventDefault();showImage((activeIndex-1+zoomButtons.length)%zoomButtons.length)}
  });
  // Indicador de rolagem sem layout thrashing; animado com rAF.
  const bar=document.querySelector('.case-scroll-progress');
  let scheduled=false;
  function updateScroll(){
    scheduled=false;
    const max=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.transform=`scaleX(${max>0?Math.max(0,Math.min(1,scrollY/max)):0})`;
  }
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll)}},{passive:true});
  addEventListener('resize',updateScroll,{passive:true}); updateScroll();
  // Suave parallax em áreas específicas, limitado a elementos de apresentação.
  if(finePointer.matches&&!mq.matches){
    document.querySelectorAll('[data-parallax-host]').forEach(host=>{
      const element=host.querySelector('.case-parallax'); if(!element)return;
      let raf=0;
      host.addEventListener('pointermove',event=>{
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(()=>{
          const b=host.getBoundingClientRect();
          const x=(event.clientX-b.left)/b.width-.5;
          const y=(event.clientY-b.top)/b.height-.5;
          element.style.setProperty('--parallax-x',`${(x*13).toFixed(1)}px`);
          element.style.setProperty('--parallax-y',`${(y*13).toFixed(1)}px`);
        });
      },{passive:true});
      host.addEventListener('pointerleave',()=>{
        element.style.setProperty('--parallax-x','0px');
        element.style.setProperty('--parallax-y','0px');
      });
    });
  }
})();