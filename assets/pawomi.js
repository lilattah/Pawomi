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
