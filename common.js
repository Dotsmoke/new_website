'use strict';
/* ================= CONFIG ================= */
const CONFIG={
  /* Paste your deployed Google Apps Script web-app URL here (see Code.gs). Leave '' to use the demo products below. */
  SHEET_API_URL:'https://script.google.com/macros/s/AKfycbyBgmzVonv_nLV0DNvo4m2SKXk_m2vvXRGjT-flDKkTAipVr_KJzdp567lnbb64iDOR/exec',
  BRAND:'Athulya Beauty Parlour',FREE_SHIP_ABOVE:999,SHIPPING:60,
  UPI_ID:'yourname@upi',EMAIL:'hello@example.com',PHONE:'+91 8590960947',WHATSAPP:'+91 7034016193',ADDRESS:'Near UP School Kaniyambetta ,Wayanad , Kerala, India, PIN : 673122'};
/* Demo products, used only when SHEET_API_URL is empty or fails. Sheet columns: id, name, price, mrp, image, category, description, Recommended */
const U=id=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
const DEMO=[
['Rootora.1 Hair Oil',449,549,'photo-1526947425960-945c6e72858f','Hair Care','Herb-infused hair oil for scalp massage and daily nourishment.','yes'],
['Rootora.1 Soap',149,0,'photo-1600857062241-98e5dba7f214','Soaps','Gentle handmade bar for everyday body care.','yes'],
['Bhringraj Hair Oil',379,0,'photo-1526947425960-945c6e72858f','Hair Care','Slow-infused bhringraj and coconut oil.','yes'],
['Neem & Turmeric Soap',159,0,'photo-1600857062241-98e5dba7f214','Soaps','Cold-process bar with neem and turmeric.',''],
['Kumkumadi Face Oil',1299,1599,'photo-1608571423902-eed4a5ad8108','Skin Care','Saffron and sandalwood in a light facial oil.','yes'],
['Amla Shikakai Hair Oil',329,399,'photo-1526947425960-945c6e72858f','Hair Care','Amla and shikakai infused in coconut oil for stronger-looking hair.',''],
['Hibiscus Coconut Soap',139,0,'photo-1600857062241-98e5dba7f214','Soaps','Hibiscus and coconut oil in a soft, creamy bar.',''],
['Sesame Body Massage Oil',699,849,'photo-1590779033100-9f60a05a013d','Skin Care','Herb-infused sesame oil for daily self-massage.','']
].map(r=>({id:r[0],name:r[0],price:r[1],mrp:r[2],image:U(r[3]),category:r[4],description:r[5],Recommended:r[6]}));
DEMO[0].availableSizes='100 ml, 200 ml';
const HERO=U('photo-1515377905703-c4788e51af15'),HERO2=U('photo-1556228720-195a672e8a03');

/* ================= HELPERS ================= */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const inr=n=>'₹'+(+n||0).toLocaleString('en-IN');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ================= ICONS (inline line icons, no icon font needed) ================= */
const ICONS={
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
heart:'<path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.8 3.6 4.5 7 4.5c2 0 3.7 1.1 5 3 1.3-1.9 3-3 5-3 3.4 0 5.3 3.3 4.2 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"/>',
bag:'<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
menu:'<path d="M4 8h16M4 16h16"/>',
x:'<path d="M6 6l12 12M18 6 6 18"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
'arrow-right':'<path d="M5 12h14M13 6l6 6-6 6"/>',
'arrow-left':'<path d="M19 12H5M11 6l-6 6 6 6"/>',
'chevron-down':'<path d="m6 9 6 6 6-6"/>',
truck:'<path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
leaf:'<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>',
box:'<path d="M3 8l9-4 9 4v9l-9 4-9-4V8z"/><path d="M3 8l9 4 9-4M12 12v9"/>',
mortar:'<path d="M3 11h18c0 5-3.5 8-9 8s-9-3-9-8z"/><path d="M14 11l5-6"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
pin:'<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
check:'<path d="m5 12 5 5 9-10"/>',
lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
'check-square':'<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="m8 12.5 3 3 5-6"/>',
card:'<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
minus:'<path d="M5 12h14"/>',
'chevron-left':'<path d="m15 6-6 6 6 6"/>','chevron-right':'<path d="m9 6 6 6-6 6"/>',
chat:'<path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.6L3 21z"/><path d="M9 9.5c.5 2.5 2.5 4.5 5 5l1.2-1.2-2-1-.8.8c-1-.4-1.8-1.2-2.2-2.2l.8-.8-1-2L9 9.5z"/>'
};
const ic=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||''}</svg>`;
function hydrateIcons(r=document){$$('[data-ic]',r).forEach(el=>{el.outerHTML=ic(el.dataset.ic)})}

const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const getCart=()=>read('cart',[]).map(i=>({...i,key:i.key||i.id,qty:i.qty||1})),getWish=()=>read('wishlist',[]);
const PAGE=document.body.dataset.page||'';
const REG={};  /* id -> product, so buttons only need the id */
function norm(r){const price=+String(r.price??0).replace(/[^\d.]/g,'')||0,mrp=+String(r.mrp??r.was??0).replace(/[^\d.]/g,'')||0;
  const list=v=>String(v??'').split(/[\n|,]/).map(x=>x.trim()).filter(Boolean);
  const rec=String(r.Recommended??r.recommended??'').toLowerCase().trim(),image=String(r.image||'').trim();
  const p={id:String(r.id||r.name),name:String(r.name||'Untitled'),price,mrp:mrp>price?mrp:0,image,images:[...new Set([image,...list(r.images)].filter(Boolean))],sizes:list(r.availableSizes),category:String(r.category||'Other').trim(),description:r.description||'',recommended:['yes','true','✅','y','1'].includes(rec),benefits:String(r.benefits??r.Benefits??'').trim(),ingredients:String(r.ingredients??r.Ingredients??'').trim(),usage:String(r.usage??r.Usage??r.howToUse??'').trim()};
  REG[p.id]=p;return p}

function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=m;requestAnimationFrame(()=>t.classList.add('show'));clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2400)}

/* ================= HEADER / MENU / FOOTER (injected on every page) ================= */
const LINKS=[['index.html','Home','','home'],['index.html#shop','Shop','','shop'],['about.html','About','','about'],['contact.html','Contact','','contact']];
const ANN=()=>[`Free delivery above ${inr(CONFIG.FREE_SHIP_ABOVE)}`,'Cash on delivery & UPI accepted','Questions? Ask us on WhatsApp'];
const catHref=c=>'index.html?cat='+encodeURIComponent(c)+'#shop';
function chrome(){
  const cur=p=>PAGE===p||(p==='shop'&&PAGE==='product')?' aria-current="page"':'';
  const cats=read('cats',[]);
  const dl=LINKS.map(l=>l[3]==='shop'&&cats.length
    ?`<div class="dd" id="dd"><button class="ddb" type="button" aria-haspopup="true" aria-expanded="false"${cur('shop')}>Shop${ic('chevron-down')}</button><div class="ddm"><a href="index.html#shop">All products</a>${cats.map(c=>`<a href="${catHref(c)}">${esc(c)}</a>`).join('')}</div></div>`
    :`<a href="${l[0]}"${cur(l[3])}>${l[1]}</a>`).join('');
  const ml=LINKS.concat([['wishlist.html','Wishlist','','wishlist'],['cart.html','Cart','','cart']]).map(l=>`<a class="ml" href="${l[0]}"${cur(l[3])}>${l[1]}${ic('arrow-right')}</a>`).join('');
  const B=esc(CONFIG.BRAND);
  document.body.insertAdjacentHTML('afterbegin',`<div class="ann" role="region" aria-label="Store announcements"><button type="button" data-ann="-1" aria-label="Previous announcement">${ic('chevron-left')}</button><p id="annT"></p><button type="button" data-ann="1" aria-label="Next announcement">${ic('chevron-right')}</button></div>
<header class="hdr" id="hdr"><div class="wrap hdr-in">
<div class="hl"><button class="ib menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav">${ic('menu')}</button><button class="ib" id="searchBtn" type="button" aria-label="Search products" aria-expanded="false" aria-controls="sbar">${ic('search')}</button></div>
<a class="logo" href="index.html" aria-label="${B} home">${B}</a>
<div class="acts"><a class="ib" href="wishlist.html" aria-label="Wishlist">${ic('heart')}<b data-wc></b></a>
<a class="ib" href="cart.html" aria-label="Cart">${ic('bag')}<b data-cc></b></a></div></div>
<nav class="dnav wrap" aria-label="Main">${dl}</nav>
<div class="sbar" id="sbar" hidden><div class="wrap"><form id="sform" role="search"><label class="sr" for="q">Search products</label><input id="q" type="search" placeholder="Search hair oils, soaps, skin care" autocomplete="off"><button class="btn" type="submit">Search</button></form></div></div></header>
<div class="scrim" id="scrim" hidden></div>
<aside class="mnav" id="mnav" aria-label="Menu"><div class="mnav-h"><a class="logo" href="index.html">${B}</a><button class="ib" id="menuClose" type="button" aria-label="Close menu">${ic('x')}</button></div>${ml}<div class="mnav-f"><p>${esc(CONFIG.EMAIL)}<br>${esc(CONFIG.PHONE)}</p></div></aside>`);
  document.body.insertAdjacentHTML('beforeend',`<footer class="foot"><div class="wrap fgrid">
<div><a class="logo" href="index.html">${B}</a><p>Hair oils, soaps and beauty care, made in small batches and packed in glass and paper.</p></div>
<div><h4>Quick Links</h4><a href="index.html#shop">All products</a><a href="about.html">About us</a><a href="contact.html">Contact us</a><a href="wishlist.html">Wishlist</a><a href="cart.html">Cart</a></div>
<div><h4>Contact Us</h4><a class="fc" href="https://maps.google.com/?q=${encodeURIComponent(CONFIG.ADDRESS)}" target="_blank" rel="noopener">${ic('pin')}<span>${esc(CONFIG.ADDRESS)}</span></a><a class="fc" href="tel:${esc(CONFIG.PHONE.replace(/\s/g,''))}">${ic('phone')}<span>${esc(CONFIG.PHONE)}</span></a><a class="fc" href="mailto:${esc(CONFIG.EMAIL)}">${ic('mail')}<span>${esc(CONFIG.EMAIL)}</span></a></div></div>
<p class="wrap copy">© ${new Date().getFullYear()} ${B}. Cosmetic products for external use only. Please do a patch test before first use. <a class="adm" href="admin.html" aria-label="Admin sign in">${ic('lock')}</a></p></footer>`);
  document.body.insertAdjacentHTML('beforeend',`<a class="wa-float" href="https://wa.me/${CONFIG.WHATSAPP.replace(/\D/g,'')}?text=${encodeURIComponent('Hello '+CONFIG.BRAND+', I have a question.')}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.19 1.6 6.01L4 29l8.14-1.56a12.02 12.02 0 0 0 3.9.65h.01C22.68 28.09 28 22.69 28 16.06 28 9.4 22.68 3 16.04 3zm0 22.04h-.01c-1.2 0-2.37-.32-3.4-.93l-.24-.15-4.83.93.98-4.7-.16-.25a9.97 9.97 0 0 1-1.54-5.3c0-5.5 4.5-9.98 10.03-9.98 5.52 0 10.01 4.48 10.01 9.99 0 5.5-4.5 10.39-10.84 10.39zm5.5-7.46c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.13 4.53.72.31 1.28.5 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.12-.28-.2-.58-.35z"/></svg></a>`);
  $$('[data-free]').forEach(e=>e.textContent=inr(CONFIG.FREE_SHIP_ABOVE));
  hydrateIcons();menuInit();searchInit();badges();railInit();annInit();ddInit();
}
/* Rotating announcement bar */
function annInit(){const m=ANN(),t=$('#annT');let i=0,tm;const show=()=>{t.textContent=m[i]},go=d=>{i=(i+d+m.length)%m.length;show();clearInterval(tm);tm=setInterval(()=>go(1),5000)};
  show();document.addEventListener('click',e=>{const b=e.target.closest('[data-ann]');if(b)go(+b.dataset.ann)});tm=setInterval(()=>go(1),5000)}
/* "Shop" dropdown (hover/focus on desktop, tap to toggle on touch) */
function ddInit(){const d=$('#dd');if(!d)return;const b=$('.ddb',d),set=o=>{d.classList.toggle('open',o);b.setAttribute('aria-expanded',o)};
  b.addEventListener('click',()=>set(!d.classList.contains('open')));
  document.addEventListener('click',e=>{if(!d.contains(e.target))set(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false)})}
function railInit(){document.addEventListener('click',e=>{const b=e.target.closest('[data-rail]');if(!b)return;const r=$('#recProducts');if(r)r.scrollBy({left:+b.dataset.rail*Math.min(r.clientWidth*.8,640),behavior:'smooth'})})}
/* Mobile menu: lives OUTSIDE <header>, because a fixed element inside a backdrop-filter parent is positioned against that parent, not the screen. */
function menuInit(){const m=$('#mnav'),b=$('#menuBtn'),s=$('#scrim');let last;
  const open=()=>{last=document.activeElement;m.classList.add('open');s.hidden=false;document.documentElement.classList.add('lock');b.setAttribute('aria-expanded','true');$('#menuClose').focus()};
  const close=()=>{m.classList.remove('open');s.hidden=true;document.documentElement.classList.remove('lock');b.setAttribute('aria-expanded','false');last&&last.focus&&last.focus()};
  b.addEventListener('click',open);$('#menuClose').addEventListener('click',close);s.addEventListener('click',close);
  m.addEventListener('click',e=>{if(e.target.closest('a'))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('open'))close()});
  matchMedia('(min-width:961px)').addEventListener('change',e=>{if(e.matches&&m.classList.contains('open'))close()})}
function searchInit(){const btn=$('#searchBtn'),bar=$('#sbar'),q=$('#q');
  const set=o=>{bar.hidden=!o;btn.setAttribute('aria-expanded',o);if(o)q.focus()};
  btn.addEventListener('click',()=>set(bar.hidden));
  $('#sform').addEventListener('submit',e=>{e.preventDefault();if(PAGE==='home'){applyQuery(q.value);$('#shop').scrollIntoView()}else location.href='index.html?q='+encodeURIComponent(q.value.trim())+'#shop'});
  q.addEventListener('input',()=>{if(PAGE==='home')applyQuery(q.value)});
  const init=new URLSearchParams(location.search).get('q');if(init&&PAGE==='home'){q.value=init;set(true)}}
function badges(){const n=getCart().reduce((s,i)=>s+(i.qty||1),0),w=getWish().length;
  $$('[data-cc]').forEach(b=>{b.textContent=n||'';b.dataset.n=n});$$('[data-wc]').forEach(b=>{b.textContent=w||'';b.dataset.n=w})}

/* ================= DATA (Google Sheet via Apps Script) ================= */
async function loadProducts(){
  let rows=null;
  if(CONFIG.SHEET_API_URL){try{const r=await fetch(CONFIG.SHEET_API_URL);const d=await r.json();if(Array.isArray(d)&&d.length)rows=d}catch(e){console.error('Sheet load failed, using demo data',e)}}
  const list=(rows||DEMO).map(norm);write('lastCount',list.length);write('cats',[...new Set(list.map(p=>p.category))]);return list}

/* ================= CARDS ================= */
const pHref=p=>'product.html?id='+encodeURIComponent(p.id);
function card(p){const off=p.mrp?Math.round(100-p.price/p.mrp*100):0,w=getWish().some(x=>x.id===p.id);const id=esc(p.id),href=esc(pHref(p));
  return `<article class="card"><div class="pimgw"><a class="pimg" href="${href}" tabindex="-1" aria-hidden="true"><img src="${esc(p.image)}" alt="" loading="lazy" onerror="this.classList.add('bad')"></a>${off?`<span class="tag">${off}% off</span>`:''}<button class="ib wish" type="button" data-wish="${id}" aria-pressed="${w}" aria-label="${w?'Remove':'Add'} ${esc(p.name)} ${w?'from':'to'} wishlist">${ic('heart')}</button></div>
<div class="cbody"><span class="cat-l">${esc(p.category)}</span><h3><a href="${href}">${esc(p.name)}</a></h3>
<div class="price">${p.mrp?`<s>${inr(p.mrp)}</s>`:''}<span>${inr(p.price)}</span></div>
${p.sizes.length?`<a class="addb" href="${href}">Choose options</a>`:`<button class="addb" type="button" data-add="${id}" aria-label="Add ${esc(p.name)} to cart">Add to cart</button>`}</div></article>`}
const skeletons=n=>Array.from({length:n},()=>'<div class="skel" aria-hidden="true"></div>').join('');

/* ================= CART / WISHLIST ACTIONS ================= */
function addToCart(p,n=1,size=''){const c=getCart(),key=p.id+(size?'|'+size:''),i=c.find(x=>x.key===key);if(i)i.qty=Math.min(10,i.qty+n);else c.push({key,id:p.id,name:p.name,price:p.price,image:p.image,size,qty:n});write('cart',c);badges();toast(`${p.name}${size?' ('+size+')':''} added to cart`)}
function toggleWish(p){let w=getWish();const has=w.some(x=>x.id===p.id);w=has?w.filter(x=>x.id!==p.id):[...w,{...p}];write('wishlist',w);badges();toast(has?'Removed from wishlist':'Saved to wishlist')}
function setQty(key,d){let c=getCart();const i=c.find(x=>x.key===key);if(!i)return;i.qty=Math.min(10,i.qty+d);if(i.qty<1)c=c.filter(x=>x!==i);write('cart',c);badges();renderCart()}

/* ---- Description parser: turns messy sheet text (chat stamps, emoji lines, 1./* lists) into {intro:[...],feats:[{t,d}]} ---- */
const PIC='[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B50}\\u{2B55}\\u{231A}-\\u{23FF}]',
  STAMP=/\[\d{1,2}:\d{2}(?::\d{2})?\s*(?:[AP]M)?,?\s*\d{1,4}[\/.-]\d{1,2}[\/.-]\d{1,4}\]\s*(?:\+?\d[\d\s().-]{6,}\d)?\s*:?/gi;
function parseDesc(raw){
  const split=new RegExp('(?='+PIC+')','u'),lead=new RegExp('^(?:'+PIC+'|\\s)+','u'),isPic=new RegExp('^'+PIC,'u'),NUM=/^\d{1,2}[.)]\s+/,BUL=/^[*•\-–—·▪●]\s+/;
  const t=String(raw||'').replace(STAMP,'\n').replace(/[️‍]/g,'');
  const intro=[],feats=[];let open=null;
  const mk=s=>{const i=s.indexOf(':');if(i>0&&i<=45)return{t:s.slice(0,i).trim(),d:s.slice(i+1).trim()};return s.length>45?{t:'',d:s}:{t:s,d:''}};
  t.split(/\r?\n/).forEach(line=>line.split(split).forEach(seg=>{
    seg=seg.trim();if(!seg)return;
    const pic=isPic.test(seg),num=NUM.test(seg.replace(lead,'')),bul=BUL.test(seg);
    const c=seg.replace(lead,'').replace(NUM,'').replace(BUL,'').trim();if(!c)return;
    if(pic||num){const f=mk(c);feats.push(f);open=f.t&&!f.d?f:null}
    else if(bul){if(open)open.d=(open.d?open.d+' · ':'')+c;else{feats.push(mk(c))}}
    else if(intro.length&&c.length<=48&&!/[.!?:]$/.test(c)){feats.push({t:c,d:''});open=null}
    else intro.push(c)}));
  return{intro,feats}}
/* ================= PRODUCT PAGE ================= */
const listHtml=t=>{const l=String(t||'').split(/\r?\n|\|/).map(x=>x.replace(/^[*•\-–—·▪●\d.)\s]+/,'').trim()).filter(Boolean);
  return l.length>1?`<ul>${l.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:l.length?`<p>${esc(l[0])}</p>`:''};
const acc=(t,body,open)=>body?`<details class="acc"${open?' open':''}><summary>${ic('check-square')}${t}${ic('chevron-down').replace('class="i"','class="i chev"')}</summary><div class="accb">${body}</div></details>`:'';
async function initProduct(){
  const box=$('#pBox'),id=new URLSearchParams(location.search).get('id');
  box.innerHTML='<div class="wrap pp"><div class="skel" style="height:520px"></div><div class="skel" style="height:420px"></div></div>';
  ALL=await loadProducts();const p=ALL.find(x=>x.id===id);
  if(!p){document.title='Product not found | '+CONFIG.BRAND;box.innerHTML='<div class="wrap sec"><div class="empty"><h3>We couldn’t find that product</h3><p>It may have been removed or the link is out of date.</p><a class="btn" href="index.html#shop">Browse all products</a></div></div>';return}
  renderProduct(p)}
function renderProduct(p){
  document.title=`${p.name} | ${CONFIG.BRAND}`;
  const off=p.mrp?Math.round(100-p.price/p.mrp*100):0,imgs=p.images.length?p.images:[p.image],href=location.href,B=esc(CONFIG.BRAND);
  const {intro,feats}=parseDesc(p.description),inWish=()=>getWish().some(x=>x.id===p.id);
  let size=p.sizes[0]||'',qty=1;
  const bullets=feats.map(f=>f.t&&f.d?`<li><b>${esc(f.t)}:</b> <span>${esc(f.d)}</span></li>`:`<li><span>${esc(f.t||f.d)}</span></li>`).join('');
  const descBody=intro.map(x=>`<p>${esc(x)}</p>`).join('')||(bullets?'':'<p>Handmade beauty care product.</p>');
  const others=ALL.filter(x=>x.id!==p.id),rel=[...others.filter(x=>x.category===p.category),...others.filter(x=>x.category!==p.category)].slice(0,4);
  rel.forEach(x=>REG[x.id]=x);
  const faq=[['Is there free delivery?',`Yes, on orders above ${inr(CONFIG.FREE_SHIP_ABOVE)}. Below that, delivery is ${inr(CONFIG.SHIPPING)}.`],['How can I pay?','You can pay by cash on delivery or by UPI at checkout.'],['Do I need to do a patch test?','Yes. Our cosmetic products are for external use only, so please do a patch test before first use.'],['Can I ask a question before I buy?',`Of course. Message us on WhatsApp (${esc(CONFIG.WHATSAPP)}) or call ${esc(CONFIG.PHONE)} and we’ll help you choose.`]];
  $('#pBox').innerHTML=`<nav class="wrap crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><a href="${esc(catHref(p.category))}">${esc(p.category)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
<section class="wrap pp"><div class="pgal"><div class="pdesk"><div class="pmain" id="pMain"><img src="${esc(imgs[0])}" alt="${esc(p.name)}" onerror="this.classList.add('bad')"></div>
${imgs.length>1?`<div class="pgrid">${imgs.map((u,i)=>`<button class="pth" type="button" data-u="${esc(u)}" aria-pressed="${i===0}" aria-label="Show image ${i+1} of ${imgs.length}"><img src="${esc(u)}" alt="" loading="lazy" onerror="this.classList.add('bad')"></button>`).join('')}</div>`:''}</div>
<div class="pcar" role="region" aria-roledescription="carousel" aria-label="Product images"><div class="ptrack" id="pTrack">${imgs.map((u,i)=>`<div class="pslide" role="group" aria-label="Image ${i+1} of ${imgs.length}"><img src="${esc(u)}" alt="${esc(p.name)}${imgs.length>1?' – image '+(i+1):''}"${i?' loading="lazy"':''} onerror="this.classList.add('bad')"></div>`).join('')}</div>
${imgs.length>1?`<div class="pctl"><button type="button" class="pnav" data-slide="-1" aria-label="Previous image">${ic('chevron-left')}</button><span class="pcount" id="pCount" aria-live="polite">1 / ${imgs.length}</span><button type="button" class="pnav" data-slide="1" aria-label="Next image">${ic('chevron-right')}</button></div>`:''}</div></div>
<div class="pinfo"><p class="pvendor">${B}</p><h1>${esc(p.name)}</h1>
<div class="pprice">${p.mrp?`<s>${inr(p.mrp)}</s>`:''}<b>${inr(p.price)}</b>${off?`<span class="pill">${off}% off</span>`:''}</div>
<p class="pnote">Delivery ${inr(CONFIG.SHIPPING)}, free above ${inr(CONFIG.FREE_SHIP_ABOVE)}.</p>
${p.sizes.length?`<fieldset class="pfs"><legend>Size</legend><div class="sizes">${p.sizes.map((z,i)=>`<button type="button" class="chip" data-size="${esc(z)}" aria-pressed="${i===0}">${esc(z)}</button>`).join('')}</div></fieldset>`:''}
<div class="pfs"><span class="plabel" id="qL">Quantity</span><div class="qty" role="group" aria-labelledby="qL"><button type="button" data-q="-1" aria-label="Decrease quantity">${ic('minus')}</button><span id="pQty" aria-live="polite">1</span><button type="button" data-q="1" aria-label="Increase quantity">${ic('plus')}</button></div></div>
<div class="pbtns"><button class="btn green block" type="button" id="pAdd">Add to cart</button><button class="btn green block" type="button" id="pBuy">Buy it now</button><button class="btn ghost block" type="button" id="pWish" aria-pressed="${inWish()}">${ic('heart')}<span></span></button></div>
<ul class="offers"><li>${ic('check-circle')}Free delivery on orders above ${inr(CONFIG.FREE_SHIP_ABOVE)}</li><li>${ic('check-circle')}Cash on delivery &amp; UPI accepted</li><li>${ic('check-circle')}Made in small batches</li></ul>
<div class="perks"><div>${ic('truck')}Free delivery above ${inr(CONFIG.FREE_SHIP_ABOVE)}</div><div>${ic('card')}Cash on delivery &amp; UPI</div><div>${ic('chat')}Ask us on WhatsApp</div></div>
${bullets?`<ul class="pbul">${bullets}</ul>`:''}
${acc('Description',descBody,!bullets)}${acc('Benefits',listHtml(p.benefits))}${acc('Ingredients',listHtml(p.ingredients))}${acc('How to use',listHtml(p.usage))}
${acc('Delivery &amp; payment',`<p>Free delivery on orders above <b>${inr(CONFIG.FREE_SHIP_ABOVE)}</b>; otherwise ${inr(CONFIG.SHIPPING)}.</p><p>Pay by cash on delivery or UPI.</p>`)}
${acc('Good to know','<p>Cosmetic products for external use only. Please do a patch test before first use.</p>')}
${acc('Seller info',`<p><b>${B}</b><br>${esc(CONFIG.ADDRESS)}</p><p><a href="tel:${esc(CONFIG.PHONE.replace(/\s/g,''))}">${esc(CONFIG.PHONE)}</a> · <a href="mailto:${esc(CONFIG.EMAIL)}">${esc(CONFIG.EMAIL)}</a></p><p><a target="_blank" rel="noopener" href="https://wa.me/${esc(CONFIG.WHATSAPP.replace(/\D/g,''))}?text=${encodeURIComponent('Hello, I have a question about '+p.name)}">Ask about this product on WhatsApp</a></p>`)}
</div></section>
${rel.length?`<section class="wrap blk"><div class="sechead"><h2>You may also like</h2></div><div class="products" style="margin-top:0">${rel.map(card).join('')}</div></section>`:''}
<section class="wrap blk"><div class="faq"><h2>FAQ</h2>${faq.map(f=>`<details class="acc"><summary>${ic('check-square')}${f[0]}${ic('chevron-down').replace('class="i"','class="i chev"')}</summary><div class="accb"><p>${f[1]}</p></div></details>`).join('')}</div></section>`;
  const root=$('#pBox'),sync=()=>{$('#pQty').textContent=qty;const w=inWish(),b=$('#pWish');b.setAttribute('aria-pressed',w);b.querySelector('span').textContent=w?'Saved to wishlist':'Save to wishlist';b.querySelector('.i').style.fill=w?'currentColor':'none'};sync();
  const trk=$('#pTrack'),cnt=$('#pCount');if(trk&&cnt){let raf;trk.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const n=Math.round(trk.scrollLeft/trk.clientWidth)+1;cnt.textContent=`${Math.min(n,imgs.length)} / ${imgs.length}`})},{passive:true})}
  root.addEventListener('click',e=>{
    const th=e.target.closest('.pth');if(th){const im=$('#pMain img');im.src=th.dataset.u;im.classList.remove('bad');$$('.pth',root).forEach(b=>b.setAttribute('aria-pressed',b===th));$('#pMain').scrollIntoView({block:'nearest',behavior:'smooth'})}
    const sl=e.target.closest('[data-slide]');if(sl){const t=$('#pTrack');t.scrollBy({left:+sl.dataset.slide*t.clientWidth,behavior:'smooth'})}
    const z=e.target.closest('[data-size]');if(z){size=z.dataset.size;$$('[data-size]',root).forEach(b=>b.setAttribute('aria-pressed',b===z))}
    const q=e.target.closest('[data-q]');if(q){qty=Math.max(1,Math.min(10,qty+ +q.dataset.q));sync()}
    if(e.target.closest('#pAdd'))addToCart(p,qty,size);
    if(e.target.closest('#pBuy')){addToCart(p,qty,size);location.href='checkout.html'}
    if(e.target.closest('#pWish')){toggleWish(p);sync()}});
}

/* One click handler for every page */
document.addEventListener('click',e=>{const t=e.target.closest('[data-add],[data-wish],[data-inc],[data-dec],[data-rm],[data-cat]');if(!t)return;const d=t.dataset;
  if(d.add){const p=REG[d.add];p.sizes.length?location.href=pHref(p):addToCart(p)}
  else if(d.wish){toggleWish(REG[d.wish]||getWish().find(x=>x.id===d.wish));refresh()}
  else if(d.inc)setQty(d.inc,1);else if(d.dec)setQty(d.dec,-1);
  else if(d.rm){write('cart',getCart().filter(x=>x.key!==d.rm));badges();renderCart()}
  else if(d.cat!==undefined){state.cat=d.cat;renderShop()}});
function refresh(){if(PAGE==='home')renderShop(true);else if(PAGE==='wishlist')renderWish();else if(PAGE==='product')$$('.card [data-wish]').forEach(b=>{const w=getWish().some(x=>x.id===b.dataset.wish);b.setAttribute('aria-pressed',w)})}

/* ================= HOME: recommended + all products + filters + search ================= */
const state={cat:'',q:''};let ALL=[];
function applyQuery(v){state.q=v;renderShop()}
function renderShop(keepScroll){
  const rec=$('#recProducts');if(!rec)return;
  const r=ALL.filter(p=>p.recommended);$('#recSection').hidden=!r.length;rec.innerHTML=r.map(card).join('');
  const cats=[...new Set(ALL.map(p=>p.category))];
  $('#filters').innerHTML=['',...cats].map(c=>`<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${c===state.cat}">${c?esc(c):'All'}<sup>${c?ALL.filter(p=>p.category===c).length:ALL.length}</sup></button>`).join('');
  const q=state.q.trim().toLowerCase(),l=ALL.filter(p=>(!state.cat||p.category===state.cat)&&(!q||[p.name,p.category,p.description].some(s=>s.toLowerCase().includes(q))));
  $('#allProducts').innerHTML=l.length?l.map(card).join(''):`<div class="empty"><h3>No products found</h3><p>Try a different search or choose another category.</p><button class="btn" type="button" data-cat="">Show all products</button></div>`;
  $('#status').textContent=`${l.length} product${l.length===1?'':'s'}`+(q?` for “${state.q.trim()}”`:'')}
async function initHome(){
  $('#recProducts').innerHTML=skeletons(3);$('#allProducts').innerHTML=skeletons(Math.min(8,read('lastCount',4)));
  $('#heroImg').style.setProperty('--img',`url(${HERO})`);$('#heroImg2').style.setProperty('--img',`url(${HERO2})`);
  const c0=new URLSearchParams(location.search).get('cat');if(c0)state.cat=c0;
  ALL=await loadProducts();if(state.cat&&!ALL.some(p=>p.category===state.cat))state.cat='';renderShop();
  if(!ALL.length)$('#allProducts').innerHTML='<div class="empty"><h3>No products yet</h3><p>Check back soon.</p></div>'}

/* ================= CART PAGE ================= */
function renderCart(){const box=$('#cartLines');if(!box)return;const c=getCart();
  if(!c.length){box.innerHTML='<div class="empty"><h3>Your cart is empty</h3><p>Browse our hair oils, soaps and skin care and add what you need.</p><a class="btn" href="index.html#shop">Continue shopping</a></div>';$('#sum').hidden=true;return}
  $('#sum').hidden=false;let sub=0;
  box.innerHTML='<div class="lines">'+c.map(i=>{const t=i.price*i.qty;sub+=t;return `<div class="line"><div class="pimg"><img src="${esc(i.image)}" alt="${esc(i.name)}" onerror="this.classList.add('bad')"></div><div><h3>${esc(i.name)}${i.size?` <small style="font:400 .85rem var(--bf);color:var(--mute)">(${esc(i.size)})</small>`:''}</h3><span class="price" style="font-size:.98rem">${inr(i.price)}</span><div class="qrow"><div class="qty"><button type="button" data-dec="${esc(i.key)}" aria-label="Decrease quantity of ${esc(i.name)}">−</button><span>${i.qty}</span><button type="button" data-inc="${esc(i.key)}" aria-label="Increase quantity of ${esc(i.name)}">+</button></div><button class="rm" type="button" data-rm="${esc(i.key)}">Remove</button></div></div><div class="sub">${inr(t)}</div></div>`}).join('')+'</div>';
  const ship=sub>=CONFIG.FREE_SHIP_ABOVE?0:CONFIG.SHIPPING,left=CONFIG.FREE_SHIP_ABOVE-sub;
  $('#sSub').textContent=inr(sub);$('#sShip').textContent=ship?inr(ship):'Free';$('#sTot').textContent=inr(sub+ship);
  $('#sTip').textContent=left>0?`Add ${inr(left)} more for free delivery.`:'You’ve unlocked free delivery.'}
/* ================= WISHLIST PAGE ================= */
function renderWish(){const g=$('#wishGrid');if(!g)return;const w=getWish();w.forEach(p=>REG[p.id]=p);
  g.innerHTML=w.length?w.map(card).join(''):'<div class="empty"><h3>Your wishlist is empty</h3><p>Tap the heart on any product to save it here.</p><a class="btn" href="index.html#shop">Browse products</a></div>';
  $('#wishNote').textContent=w.length?`${w.length} saved item${w.length===1?'':'s'}`:''}
/* ================= CONTACT PAGE (no backend needed: opens WhatsApp or email with the message filled in) ================= */
function initContact(){const f=$('#cform');if(!f)return;let mode='wa';
  $$('button[data-send]',f).forEach(b=>b.addEventListener('click',()=>mode=b.dataset.send));
  f.addEventListener('submit',e=>{e.preventDefault();const m=$('#fmsg'),d=Object.fromEntries(new FormData(f));
    if(!d.name.trim()){m.className='fmsg err';m.textContent='Enter your name.';return}
    if(d.message.trim().length<5){m.className='fmsg err';m.textContent='Write a short message so we can help.';return}
    const txt=`Hello ${CONFIG.BRAND}, I'm ${d.name.trim()}${d.phone?' ('+d.phone.trim()+')':''}.\n\n${d.message.trim()}`;
    m.className='fmsg ok';m.textContent=mode==='wa'?'Opening WhatsApp…':'Opening your email app…';
    if(mode==='wa')window.open('https://wa.me/'+CONFIG.WHATSAPP+'?text='+encodeURIComponent(txt),'_blank','noopener');
    else location.href=`mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent('Message from '+d.name.trim())}&body=${encodeURIComponent(txt)}`})}

/* ================= CHECKOUT PAGE (writes one row to the Orders sheet) ================= */
function initCheckout(){const c=getCart(),box=$('#coBox');
  if(!c.length){box.innerHTML='<div class="empty"><h3>Your cart is empty</h3><p>Add something before checking out.</p><a class="btn" href="index.html#shop">Browse products</a></div>';return}
  let sub=0;const lines=c.map(i=>{sub+=i.price*i.qty;return `<div class="r"><span>${esc(i.name)}${i.size?' ('+esc(i.size)+')':''} × ${i.qty}</span><span>${inr(i.price*i.qty)}</span></div>`}).join('');
  const ship=sub>=CONFIG.FREE_SHIP_ABOVE?0:CONFIG.SHIPPING,total=sub+ship;
  $('#coSum').innerHTML=`<h2>Your order</h2>${lines}<div class="r"><span>Delivery</span><span>${ship?inr(ship):'Free'}</span></div><div class="r t"><span>Total</span><span>${inr(total)}</span></div>`;
  $('#upiId').textContent=CONFIG.UPI_ID;
  const f=$('#coForm'),pm=()=>f.pm.value;
  $$('input[name=pm]',f).forEach(r=>r.addEventListener('change',()=>{$('#txnWrap').hidden=pm()!=='UPI'}));
  f.addEventListener('submit',async e=>{e.preventDefault();const m=$('#coMsg'),v=Object.fromEntries(new FormData(f)),err=t=>{m.className='fmsg err';m.textContent=t};
    if(v.name.trim().length<2)return err('Enter your full name.');
    if(!/^(\+?91)?[6-9]\d{9}$/.test(v.phone.replace(/[\s-]/g,'')))return err('Enter a valid 10-digit mobile number.');
    if(v.address.trim().length<10)return err('Enter your full delivery address with pincode.');
    if(pm()==='UPI'&&v.txn.trim().length<6)return err('Enter the UPI transaction ID after you pay.');
    /* The server re-reads prices from the Products sheet and saves the order (action=createOrder). */
    const data={Name:v.name.trim(),Address:v.address.trim(),Phone:v.phone.trim(),'Payment Method':pm()==='UPI'?'UPI':'Cash on Delivery','Transaction ID':pm()==='UPI'?v.txn.trim():'',
      cart:c.map(i=>({id:i.id,name:i.name,size:i.size||'',qty:i.qty}))};
    const btn=f.querySelector('[type=submit]');btn.disabled=true;m.className='fmsg';m.textContent='Placing your order…';
    try{let id='DEMO-'+Date.now().toString(36).toUpperCase();
      if(CONFIG.SHEET_API_URL){const r=await fetch(CONFIG.SHEET_API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'createOrder',data})});const j=await r.json();
        if(!j||j.success===false||j.error){const e=new Error(j&&(j.error||j.message)||'Order failed');e.server=true;throw e}id=j.orderId||id}
      write('cart',[]);badges();$('#coBox').hidden=true;const d=$('#coDone');d.hidden=false;
      $('#coId').textContent=id;$('#coDemo').hidden=!!CONFIG.SHEET_API_URL;
      $('#coWa').href='https://wa.me/'+CONFIG.WHATSAPP+'?text='+encodeURIComponent(`Hello, I placed order ${id} for ${inr(total)}.`);window.scrollTo(0,0)}
    catch(x){console.error(x);err(x.server?x.message:'We couldn’t place the order. Check your connection and try again, or message us on WhatsApp.');btn.disabled=false}})}

/* ================= BOOT ================= */
chrome();
window.addEventListener('storage',badges);
if(PAGE==='home')initHome();if(PAGE==='product')initProduct();if(PAGE==='cart')renderCart();if(PAGE==='wishlist')renderWish();if(PAGE==='contact')initContact();if(PAGE==='checkout')initCheckout();
