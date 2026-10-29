document.addEventListener('DOMContentLoaded',()=>{const btn=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav-links');if(btn&&nav){btn.addEventListener('click',()=>{const opened=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(opened));});}document.querySelectorAll('.product-mini-form').forEach(form=>form.addEventListener('submit',async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;const old=b.textContent;b.textContent='Ekleniyor…';try{const r=await fetch('/cart/add.js',{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}});if(!r.ok)throw Error('Sepete eklenemedi');const cart=await fetch('/cart.js').then(r=>r.json());document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=cart.item_count);b.textContent='Sepete Eklendi ✓';}catch(err){b.textContent='Tekrar Dene';}setTimeout(()=>{b.textContent=old;b.disabled=false},1800)}));});
/* Accessible section reveal, disabled in editor re-render and reduced-motion mode. */
(function(){
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const select='.section-pad,.promo,.collection-tile,.newsletter,.page-heading,.product-detail,.blog-grid';
 function observe(scope=document){
  if(reduce||!('IntersectionObserver' in window))return;
  const targets=[...scope.querySelectorAll(select)].filter(el=>!el.classList.contains('pawomi-reveal'));
  const observer=new IntersectionObserver((entries)=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -24px 0px'});
  targets.forEach(el=>{el.classList.add('pawomi-reveal');observer.observe(el)});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>observe());else observe();
 document.addEventListener('shopify:section:load',e=>observe(e.target));
})();

/* Featured carousel controls and local-only favorites. */
(function(){
 function initialize(root=document){
  root.querySelectorAll('.featured-products').forEach(section=>{
   if(section.dataset.carouselReady==='1')return;section.dataset.carouselReady='1';
   const slider=section.querySelector('.featured-carousel'),track=section.querySelector('.product-grid');
   if(!slider||!track)return;
   const arrows=section.querySelectorAll('[data-slide]');
   function updateArrows(){arrows.forEach(btn=>btn.disabled=btn.dataset.slide==='-1'?slider.scrollLeft<=3:slider.scrollLeft+slider.clientWidth>=slider.scrollWidth-3)}
   arrows.forEach(btn=>btn.addEventListener('click',()=>{const card=track.querySelector('.product-card');if(!card)return;const gap=parseFloat(getComputedStyle(track).gap)||14;slider.scrollBy({left:Number(btn.dataset.slide)*(card.getBoundingClientRect().width+gap),behavior:'smooth'})}));
   slider.addEventListener('scroll',updateArrows,{passive:true});window.addEventListener('resize',updateArrows);requestAnimationFrame(updateArrows);
   let saved=[];try{saved=JSON.parse(localStorage.getItem('pawomi-favorites')||'[]')}catch{}
   section.querySelectorAll('[data-favorite-product]').forEach(button=>{const id=button.dataset.favoriteProduct;button.setAttribute('aria-pressed',String(saved.includes(id)));button.addEventListener('click',()=>{saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];button.setAttribute('aria-pressed',String(saved.includes(id)));try{localStorage.setItem('pawomi-favorites',JSON.stringify(saved))}catch{}})});
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initialize());else initialize();
 document.addEventListener('shopify:section:load',e=>initialize(e.target));
})();
