(()=>{
'use strict';
const P=[{id:1,name:'Kırmızı P Detaylı Köpek Göğüs Tasması',category:'Tasma & Kayış',animal:'kopek',photo:'product-harness.png',price:649},{id:2,name:'Yeşil Halat Köpek Gezdirme Kayışı',category:'Tasma & Kayış',animal:'kopek',photo:'product-leash.png',price:189},{id:3,name:'Peluş Ördek Oyuncak',category:'Oyuncak',animal:'kopek',photo:'product-duck.png',price:329},{id:4,name:'Adaçayı Yeşili Peluş Yatak',category:'Yatak & Ev',animal:'kedi',photo:'product-bed.png',price:1199},{id:5,name:'Pawomi Mama ve Su Kabı',category:'Mama',animal:'kedi',photo:'product-bowl.png',price:249},{id:6,name:'Patili Bakım Seti',category:'Sağlık',animal:'kedi',photo:'icon-bakim.png',price:449}];
const params=new URLSearchParams(location.search),page=params.get('p')||'urunler',id=+params.get('id'),main=document.querySelector('main');
const url=(p,more='')=>'./page.html?p='+encodeURIComponent(p)+more;
const fmt=n=>n.toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
function load(k,d){try{const x=JSON.parse(localStorage.getItem(k));return x&&typeof x==='object'?x:d}catch{return d}}
let cart=load('pawomi-preview-cart',{}),favorites=load('pawomi-preview-favorites',[]);
if(!Array.isArray(favorites))favorites=[];favorites=favorites.map(Number);
const save=()=>{localStorage.setItem('pawomi-preview-cart',JSON.stringify(cart));localStorage.setItem('pawomi-preview-favorites',JSON.stringify(favorites));document.querySelectorAll('[data-cart-count]').forEach(x=>x.textContent=Object.values(cart).reduce((a,b)=>a+(Number(b)||0),0))};
const intro=(title,subtitle='')=>'<p class="pawomi-page-eyebrow">PAWOMI / MUTLU PATİLER</p><h1>'+title+'</h1><p class="pw-lead">'+subtitle+'</p>';
const card=p=>'<article class="pw-product"><a href="'+url('urun','&id='+p.id)+'"><img src="./'+p.photo+'" alt="'+p.name+'" loading="lazy"></a><div class="pw-product-body"><a href="'+url('urun','&id='+p.id)+'"><h3>'+p.name+'</h3></a><p class="pw-price">'+fmt(p.price)+'</p><div class="pw-product-actions"><button class="pw-fav" data-fav="'+p.id+'" aria-label="Favorilere ekle" aria-pressed="'+favorites.includes(p.id)+'">♡</button><button class="pw-btn" data-add="'+p.id+'">Sepete Ekle</button></div></div></article>';
const grid=list=>'<div class="pw-grid">'+(list.map(card).join('')||'<p>Henüz ürün bulunamadı.</p>')+'</div>';
const categories=['Tümü','Mama','Tasma & Kayış','Oyuncak','Bakım','Yatak & Ev','Sağlık'];
const chips=categories.map(x=>'<a class="pw-chip" href="'+url('urunler','&category='+encodeURIComponent(x==='Tümü'?'':x))+'"'+(params.get('category')===x?' aria-current="page"':'')+'>'+x+'</a>').join('');
function catalog(){
const name={urunler:'Tüm Ürünler',kopek:'Köpek Koleksiyonu',kedi:'Kedi Koleksiyonu',tasma:'Tasma & Kayış',mama:'Mama',oyuncak:'Oyuncak',bakim:'Bakım',yatak:'Yatak & Ev',saglik:'Sağlık'}[page]||'Tüm Ürünler';
let items=P.filter(p=>page==='kopek'?p.animal==='kopek':page==='kedi'?p.animal==='kedi':page==='tasma'?p.category==='Tasma & Kayış':page==='mama'?p.category==='Mama':page==='oyuncak'?p.category==='Oyuncak':page==='bakim'?p.category==='Bakım':page==='yatak'?p.category==='Yatak & Ev':page==='saglik'?p.category==='Sağlık':true);
const cat=params.get('category');if(cat)items=items.filter(p=>p.category===cat);
if(['kopek','kedi'].includes(page))main.innerHTML='<div class="pw-hero"><div>'+intro(name,'Patili dostların günlük maceraları için seçimler.')+'</div><img src="./pawomi-'+(page==='kopek'?'dog':'cat')+'.png" alt=""></div>';
else main.innerHTML=intro(name,'Pawomi koleksiyonlarını ve ürünlerini keşfet.');
const pageSize=page==='urunler'?3:3;let visibleCount=Math.min(pageSize,items.length);
function paintCatalog(){
 const visible=items.slice(0,visibleCount),remaining=items.length-visibleCount;
 document.getElementById('pw-products').innerHTML=grid(visible)+
 (remaining>0?'<div class="pw-load-more-wrap"><p class="pw-product-count">'+visible.length+' / '+items.length+' ürün gösteriliyor</p><button type="button" class="pw-btn pw-load-more" id="pw-load-more">Daha Fazla Ürün Yükle ↓</button></div>':
 '<p class="pw-product-count" aria-live="polite">'+visible.length+' ürün gösteriliyor</p>');
 const loadMore=document.getElementById('pw-load-more');
 if(loadMore)loadMore.addEventListener('click',()=>{
   const old=visibleCount;visibleCount=Math.min(visibleCount+pageSize,items.length);
   paintCatalog();
   const cards=document.querySelectorAll('#pw-products .pw-product');
   const next=cards[old];if(next){next.classList.add('pw-new-product');next.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
 });
}
main.innerHTML+='<div class="pw-toolbar"><div class="pw-categories">'+chips+'</div><label>Sırala <select id="pw-sort"><option value="">Önerilen</option><option value="asc">Artan fiyat</option><option value="desc">Azalan fiyat</option></select></label></div><div id="pw-products"></div>';
const sel=document.getElementById('pw-sort');
sel.onchange=()=>{items.sort((a,b)=>sel.value==='asc'?a.price-b.price:sel.value==='desc'?b.price-a.price:a.id-b.id);visibleCount=Math.min(pageSize,items.length);paintCatalog()};
paintCatalog();
}
function product(){
 const p=P.find(p=>p.id===id);if(!p){main.innerHTML=intro('Ürün bulunamadı');return}
 document.title=p.name+' — Pawomi';
 const angles=['pw-angle-front','pw-angle-left','pw-angle-right','pw-angle-close','pw-angle-top'];
 const labels=['Önden görünüm','Sol açı','Sağ açı','Yakın plan','Üstten görünüm'];
 const gallery='<div class="pw-gallery"><button type="button" class="pw-gallery-main" id="pw-gallery-open" aria-label="Görseli büyüt"><img id="pw-gallery-image" src="./'+p.photo+'" alt="'+p.name+' — '+labels[0]+'" class="'+angles[0]+'"><span class="pw-zoom-hint">⌕ Büyüt</span></button><div class="pw-gallery-thumbs" aria-label="Ürün fotoğrafları">'+angles.map((angle,i)=>'<button type="button" class="pw-gallery-thumb" data-gallery="'+i+'" aria-label="'+labels[i]+'" aria-pressed="'+(i===0)+'"><img src="./'+p.photo+'" alt="" class="'+angle+'"></button>').join('')+'</div><p class="pw-gallery-note">Diğer açılar şimdilik aynı ürün fotoğrafından oluşturulan önizleme kadrajlarıdır.</p></div>';
 main.innerHTML='<div class="pw-detail">'+gallery+'<div>'+intro(p.name,'Patili dostların günlük maceraları için.')+'<p class="pw-price">'+fmt(p.price)+'</p><p class="pw-note">Bu ürün ve fiyat, tasarım önizlemesi için örnek içeriktir.</p><label>Adet <input type="number" min="1" max="99" id="qty" value="1" style="width:75px"></label><p><button class="pw-btn" data-add="'+p.id+'">Sepete Ekle ♡</button> <button class="pw-fav" data-fav="'+p.id+'" aria-pressed="'+favorites.includes(p.id)+'">♡</button></p><div class="pw-faq"><details open><summary>Ürün detayları</summary><p>Ürün açıklamaları mağaza açılmadan önce tamamlanacak.</p></details><details><summary>Beden rehberi</summary><a href="'+url('beden-rehberi')+'">Beden rehberini incele →</a></details><details><summary>Kargo & iade</summary><a href="'+url('kargo-iade')+'">Kargo ve iadeyi incele →</a></details></div></div></div>'+
 '<section class="pw-reviews"><div class="pw-reviews-heading"><div><p class="pawomi-page-eyebrow">PAWOMI / DENEYİMLER</p><h2>Müşteri Yorumları ♡</h2></div><span class="pw-review-info">Henüz değerlendirme yok</span></div><div class="pw-review-empty"><span>♡</span><div><h3>İlk yorum burada yerini alacak!</h3><p>Gerçek müşteri değerlendirmeleri mağaza açıldığında bu alanda gösterilecek.</p></div></div></section>'+
 '<section class="pw-story-feature"><div class="pw-story-copy"><h2>Küçük Detaylar<br>Büyük Mutluluklar</h2><a class="pw-btn" href="'+url('hikayemiz')+'">Hikâyemizi Keşfet →</a></div><img class="pw-story-hills" src="./story-hills.png" alt="" aria-hidden="true"><img class="pw-story-embrace" src="./story-embrace.png" alt="Birlikte mutlu patiler"><span class="pw-story-heart pw-heart-one" aria-hidden="true">♡</span><span class="pw-story-heart pw-heart-two" aria-hidden="true">♡</span><p class="pw-story-description">Pawomi, patili dostlarımızın daha sağlıklı, daha mutlu ve daha keyifli bir yaşam sürmesi için var.</p></section>'+
 '<dialog class="pw-lightbox" id="pw-lightbox" aria-label="Ürün görseli büyütme"><button type="button" class="pw-lightbox-close" aria-label="Kapat">×</button><img id="pw-lightbox-image" src="./'+p.photo+'" alt="'+p.name+'"></dialog>';
 let selected=0;
 const updateGallery=(n)=>{selected=n;const img=document.getElementById('pw-gallery-image');img.className=angles[n];img.alt=p.name+' — '+labels[n];document.querySelectorAll('[data-gallery]').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===n)))};
 document.querySelectorAll('[data-gallery]').forEach(btn=>btn.addEventListener('click',()=>updateGallery(Number(btn.dataset.gallery))));
 const modal=document.getElementById('pw-lightbox');
 document.getElementById('pw-gallery-open').addEventListener('click',()=>{const img=document.getElementById('pw-lightbox-image');img.className=angles[selected];modal.showModal()});
 modal.querySelector('.pw-lightbox-close').addEventListener('click',()=>modal.close());
 modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
}
function basket(){main.innerHTML=intro('Sepetim ♡','Patili mutluluklar burada birikiyor!');const list=P.filter(p=>cart[p.id]);let total=0;main.innerHTML+=list.length?'<div class="pw-panel">'+list.map(p=>{const q=Number(cart[p.id])||0;total+=q*p.price;return '<div class="pw-item"><a href="'+url('urun','&id='+p.id)+'"><img src="./'+p.photo+'" alt=""></a><div><b>'+p.name+'</b><p>'+fmt(p.price)+'</p></div><div><button class="pw-btn secondary" data-minus="'+p.id+'">−</button> '+q+' <button class="pw-btn secondary" data-add="'+p.id+'">+</button></div><button class="pw-btn secondary" data-remove="'+p.id+'">Sil</button></div>'}).join('')+'<h2>Toplam: '+fmt(total)+'</h2><a class="pw-btn" href="'+url('odeme')+'">Ödemeye Devam Et →</a></div>':'<div class="pw-panel"><h2>Sepetin henüz boş</h2><a class="pw-btn" href="'+url('urunler')+'">Alışverişe Başla →</a></div>'}
function faq(){const qs=[['Siparişimi nasıl takip ederim?','Hesabım / Siparişler sayfasını ziyaret edebilirsin.'],['Kargo seçenekleri neler?','Kargo ve teslimat bilgileri mağaza açılışında netleşecek.'],['Bedenimi nasıl seçerim?','Ürün beden rehberi sayfamızı inceleyebilirsin.'],['Nasıl iade yapabilirim?','Kargo, teslimat ve iade sayfasındaki bilgileri incele.']];main.innerHTML=intro('Sık Sorulan Sorular','Merak ettiklerinin cevapları burada.')+'<div class="pw-faq">'+qs.map(q=>'<details><summary>'+q[0]+'</summary><p>'+q[1]+'</p></details>').join('')+'</div>'}
const articles=[['Daha Mutlu Patiler İçin 10 İpucu','sky-friends.png'],['Kışın Patili Dostların Bakımı','story-embrace.png'],['Yeni Oyuncaklar ve Mutlu Anlar','blog-dog.png']];
function blog(){main.innerHTML=intro('Patili İlhamlar','Eğlenceli ipuçları ve dostlarımızın dünyasından hikâyeler.')+'<div class="pw-grid">'+articles.map((a,i)=>'<article class="pw-product"><a href="'+url('yazi','&id='+i)+'"><img src="./'+a[1]+'" alt=""><div class="pw-product-body"><h3>'+a[0]+'</h3><p>Yazıyı oku →</p></div></a></article>').join('')+'</div>'}
function article(){const a=articles[id]||articles[0];main.innerHTML='<article class="pw-article">'+intro(a[0],'PATİLİ İLHAMLAR')+'<img src="./'+a[1]+'" alt=""><p>Patili dostlarımızın mutluluğu her gün küçük dokunuşlarla büyüyor.</p><p>Bu sayfanın makale içeriği tasarım önizlemesi olarak hazırlanmıştır.</p><a class="pw-btn" href="'+url('blog')+'">← Bloga Dön</a></article>'}
function simple(){
const m={
hikayemiz:['Bizim Hikâyemiz','Mutlu Patiler, Güzel Yarınlar.','story-embrace.png'],
iletisim:['Bizimle İletişime Geçin','Soruların ve önerilerin bizim için değerli.',''],
'beden-rehberi':['Beden ve Ölçü Rehberi','Dostun için doğru ve konforlu bedeni seç.','pawomi-dog.png'],
'kargo-iade':['Kargo, Teslimat ve İade','Sipariş ve iade süreçleri hakkında bilgiler.',''],
gizlilik:['Gizlilik Politikası','Kişisel verilerin korunması ve gizlilik.',''],
'mesafeli-satis':['Mesafeli Satış Sözleşmesi','Mağaza açılışından önce yasal bilgiler tamamlanacaktır.',''],
'one-bilgilendirme':['Ön Bilgilendirme','Satış öncesi bilgilendirme.',''],
hesabim:['Hesabım / Siparişlerim','Gerçek hesap erişimi Shopify açılışında etkinleşecektir.',''],
'cok-yakinda':['Çok Yakında!','Patili sürprizler yolda.','pawomi-dog.png'],
'404':['Sayfa Bulunamadı','Aradığın sayfa başka bir maceraya koşmuş olabilir.','pawomi-dog.png'],
'odeme':['Ödeme','Bu GitHub önizlemesinde gerçek ödeme ve sipariş alınmaz.',''],
'siparis-onayi':['Sipariş Onayı','Gerçek sipariş onayı yalnızca Shopify ödeme sistemi üzerinden oluşturulur.','']
};const a=m[page]||m['404'];main.innerHTML=intro(a[0],a[1])+(a[2]?'<div class="pw-panel"><img style="max-height:320px;max-width:100%;object-fit:contain" src="./'+a[2]+'" alt=""></div>':'');
if(page==='iletisim')main.innerHTML+='<form class="pw-form" id="pw-contact"><input placeholder="Ad Soyad" required><input type="email" placeholder="E-posta" required><textarea placeholder="Mesaj" required></textarea><button class="pw-btn">Gönder</button><small>Bu form yalnızca tasarım önizlemesidir; mesaj gönderilmez.</small></form>';
if(page==='beden-rehberi')main.innerHTML+='<div class="pw-panel"><h2>Doğru ölçü nasıl alınır?</h2><p>Boyun çevresi ve göğsün en geniş noktasını ölç; ürünün kendi beden tablosunu kullan.</p></div>';
if(page==='odeme'||page==='siparis-onayi')main.innerHTML+='<a class="pw-btn" href="'+url('urunler')+'">Ürünlere Dön →</a>';
if(page==='cok-yakinda')main.innerHTML+='<a class="pw-btn" href="./index.html">Anasayfaya Dön →</a>';
}
function search(){const q=params.get('q')||'';main.innerHTML=intro('Arama Sonuçları','Aradığın patili güzellikleri bul.')+'<form class="pw-toolbar" action="./page.html"><input type="hidden" name="p" value="arama"><input name="q" placeholder="Ürün ara" value="'+q.replace(/[<>"&]/g,'')+'"><button class="pw-btn">Ara</button></form>'+grid(P.filter(p=>p.name.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr'))))}
function fav(){main.innerHTML=intro('Favorilerim ♡','Kaydettiğin ürünler burada.')+grid(P.filter(p=>favorites.includes(p.id)))}
function campaign(){main.innerHTML='<div class="pw-hero"><div>'+intro('İlk Alışverişinde %10 İndirim','Güncel kampanyalar yakında duyurulacak.')+'<a class="pw-btn" href="'+url('urunler')+'">Ürünleri Keşfet →</a></div><img src="./discount-dog.png" alt=""></div>'+grid(P.slice(0,3))}
function render(){if(['urunler','kopek','kedi','tasma','mama','oyuncak','bakim','yatak','saglik'].includes(page))catalog();else if(page==='urun')product();else if(page==='sepet')basket();else if(page==='favoriler')fav();else if(page==='arama')search();else if(page==='blog')blog();else if(page==='yazi')article();else if(page==='sss')faq();else if(page==='kampanyalar')campaign();else simple();save()}
document.addEventListener('click',e=>{const add=e.target.closest('[data-add]'),minus=e.target.closest('[data-minus]'),remove=e.target.closest('[data-remove]'),fav=e.target.closest('[data-fav]');if(add){const n=+add.dataset.add;const qty=+document.getElementById('qty')?.value||1;cart[n]=Math.min(99,(+cart[n]||0)+qty);save();add.textContent='Sepete Eklendi ✓';setTimeout(()=>add.textContent='Sepete Ekle',1300);if(page==='sepet')render()}if(minus){const n=+minus.dataset.minus;cart[n]--;if(cart[n]<1)delete cart[n];render()}if(remove){delete cart[remove.dataset.remove];render()}if(fav){const n=+fav.dataset.fav;favorites=favorites.includes(n)?favorites.filter(x=>x!==n):[...favorites,n];save();if(page==='favoriler')render();else fav.setAttribute('aria-pressed',String(favorites.includes(n)))}});
document.addEventListener('submit',e=>{if(e.target.id==='pw-contact'){e.preventDefault();alert('Bu önizlemede mesaj gönderilmez.')}});
const menu=document.querySelector('.menu-toggle');menu?.addEventListener('click',()=>{const nav=document.querySelector('.nav-links');const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
render();
})();