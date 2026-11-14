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
['Ashwagandha Root Capsules',549,699,'photo-1471193945509-9ad0617afabf','Wellness','Whole-root ashwagandha in easy capsules.','yes'],
['Tulsi Ginger Herbal Tea',299,0,'photo-1544787219-7f47ccb76574','Teas','Holy basil, ginger and cardamom, blended in small batches.','yes'],
['Kumkumadi Face Oil',1299,1599,'photo-1608571423902-eed4a5ad8108','Skin & Hair','Saffron and sandalwood in a light facial oil.','yes'],
['Triphala Churna',249,0,'photo-1515023115689-589c33041d3c','Wellness','Amalaki, bibhitaki and haritaki, stone-ground.',''],
['Classic Chyawanprash',449,520,'photo-1505576399279-565b52d4ac71','Wellness','Amla-based herbal jam made to the classical recipe.','yes'],
['Bhringraj Hair Oil',379,0,'photo-1526947425960-945c6e72858f','Skin & Hair','Slow-infused bhringraj and coconut oil.',''],
['Neem & Turmeric Soap',159,0,'photo-1600857062241-98e5dba7f214','Skin & Hair','Cold-process bar with neem and turmeric.',''],
['Sesame Abhyanga Oil',699,849,'photo-1590779033100-9f60a05a013d','Oils','Herb-infused sesame oil for daily self-massage.','']
].map(r=>({id:r[0],name:r[0],price:r[1],mrp:r[2],image:U(r[3]),category:r[4],description:r[5],Recommended:r[6]}));
DEMO[1].availableSizes='25 bags, 50 bags';
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
  const p={id:String(r.id||r.name),name:String(r.name||'Untitled'),price,mrp:mrp>price?mrp:0,image,images:[...new Set([image,...list(r.images)].filter(Boolean))],sizes:list(r.availableSizes),category:String(r.category||'Other').trim(),description:r.description||'',recommended:['yes','true','✅','y','1'].includes(rec)};
  REG[p.id]=p;return p}

function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=m;requestAnimationFrame(()=>t.classList.add('show'));clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2400)}

/* ================= HEADER / MENU / FOOTER (injected on every page) ================= */
const LINKS=[['index.html','Home','','home'],['index.html#shop','Shop','','shop'],['about.html','About','','about'],['contact.html','Contact','','contact']];
function chrome(){
  const cur=p=>PAGE===p?' aria-current="page"':'';
  const dl=LINKS.map(l=>`<a href="${l[0]}"${cur(l[3])}>${l[1]}</a>`).join('');
  const ml=LINKS.concat([['wishlist.html','Wishlist','','wishlist'],['cart.html','Cart','','cart']]).map((l,i)=>`<a class="ml" href="${l[0]}"${cur(l[3])}><small>0${i+1}</small>${l[1]}${ic('arrow-right')}</a>`).join('');
  const B=esc(CONFIG.BRAND);
  document.body.insertAdjacentHTML('afterbegin',`<div class="topbar">Free delivery above <span data-free></span> &nbsp;·&nbsp; Cash on delivery &amp; UPI</div>
<header class="hdr" id="hdr"><div class="wrap hdr-in">
<div class="hl"><button class="ib menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav">${ic('menu')}</button><nav class="dnav" aria-label="Main">${dl}</nav></div>
<a class="logo" href="index.html" aria-label="${B} home">${B}</a>
<div class="acts"><button class="ib" id="searchBtn" type="button" aria-label="Search products" aria-expanded="false" aria-controls="sbar">${ic('search')}</button>
<a class="ib" href="wishlist.html" aria-label="Wishlist">${ic('heart')}<b data-wc></b></a>
<a class="ib" href="cart.html" aria-label="Cart">${ic('bag')}<b data-cc></b></a></div></div>
<div class="sbar" id="sbar" hidden><div class="wrap"><form id="sform" role="search"><label class="sr" for="q">Search products</label><input id="q" type="search" placeholder="Search herbs, oils, teas" autocomplete="off"><button class="btn" type="submit">Search</button></form></div></div></header>
<div class="scrim" id="scrim" hidden></div>
<aside class="mnav" id="mnav" aria-label="Menu"><div class="mnav-h"><a class="logo" href="index.html">${B}</a><button class="ib" id="menuClose" type="button" aria-label="Close menu">${ic('x')}</button></div>${ml}<div class="mnav-f"><p>${esc(CONFIG.EMAIL)}<br>${esc(CONFIG.PHONE)}</p></div></aside>`);
  document.body.insertAdjacentHTML('beforeend',`<footer class="foot"><div class="wrap fgrid">
<div><a class="logo" href="index.html">${B}</a><p>Herbs, oils and teas, made in small batches and packed in glass and paper.</p></div>
<div><h4>Shop</h4><a href="index.html#shop">All products</a><a href="wishlist.html">Wishlist</a><a href="cart.html">Cart</a></div>
<div><h4>Company</h4><a href="about.html">About us</a><a href="contact.html">Contact us</a><a href="index.html">Home</a></div>
<div><h4>Reach us</h4><a href="mailto:${esc(CONFIG.EMAIL)}">${esc(CONFIG.EMAIL)}</a><a href="tel:${esc(CONFIG.PHONE.replace(/\s/g,''))}">${esc(CONFIG.PHONE)}</a><p style="margin-top:6px">${esc(CONFIG.ADDRESS)}</p></div></div>
<div class="fbig" aria-hidden="true"><span>${B}</span></div>
<p class="wrap copy">© ${new Date().getFullYear()} ${B}. Traditional wellness products; not intended to diagnose, treat or cure any disease. <a class="adm" href="admin.html" aria-label="Admin sign in">${ic('lock')}</a></p></footer>`);
  document.body.insertAdjacentHTML('beforeend',`<a class="wa-float" href="https://wa.me/${CONFIG.WHATSAPP.replace(/\D/g,'')}?text=${encodeURIComponent('Hello '+CONFIG.BRAND+', I have a question.')}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.19 1.6 6.01L4 29l8.14-1.56a12.02 12.02 0 0 0 3.9.65h.01C22.68 28.09 28 22.69 28 16.06 28 9.4 22.68 3 16.04 3zm0 22.04h-.01c-1.2 0-2.37-.32-3.4-.93l-.24-.15-4.83.93.98-4.7-.16-.25a9.97 9.97 0 0 1-1.54-5.3c0-5.5 4.5-9.98 10.03-9.98 5.52 0 10.01 4.48 10.01 9.99 0 5.5-4.5 10.39-10.84 10.39zm5.5-7.46c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.13 4.53.72.31 1.28.5 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.12-.28-.2-.58-.35z"/></svg></a>`);
  $$('[data-free]').forEach(e=>e.textContent=inr(CONFIG.FREE_SHIP_ABOVE));
  hydrateIcons();menuInit();searchInit();badges();railInit();fitBrand();
}
/* Scale the big footer brand name so it always fits the screen width, whatever the name length. */
function fitBrand(){const run=()=>{const e=$('.fbig'),s=e&&$('span',e);if(!s)return;
    /* Glyph widths don't scale perfectly linearly (the font has an optical-size axis), so measure and correct a few times until it converges. */
    const cs=getComputedStyle(e),avail=e.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);if(avail<=0)return;
    let fs=60;e.style.fontSize=fs+'px';
    for(let i=0;i<6;i++){const w=s.getBoundingClientRect().width;if(!w)return;const next=Math.min(336,fs*avail/w*.96);if(Math.abs(next-fs)<.5)break;fs=next;e.style.fontSize=fs+'px'}
    if(s.getBoundingClientRect().width>avail)e.style.fontSize=(fs*avail/s.getBoundingClientRect().width*.96)+'px'};
  /* Re-fit whenever the width or the webfont changes (the font often arrives after first paint, which changes the text width). */
  run();addEventListener('resize',run);addEventListener('orientationchange',run);addEventListener('load',run);
  if(window.ResizeObserver){let lw=0;new ResizeObserver(()=>{const w=$('.fbig').clientWidth;if(w!==lw){lw=w;run()}}).observe($('.fbig'))}
  if(document.fonts){document.fonts.ready.then(run);document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',run);document.fonts.load('300 100px Fraunces').then(run).catch(()=>{})}}
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
  const list=(rows||DEMO).map(norm);write('lastCount',list.length);return list}

/* ================= CARDS ================= */
function card(p){const off=p.mrp?Math.round(100-p.price/p.mrp*100):0,w=getWish().some(x=>x.id===p.id);const id=esc(p.id);
  return `<article class="card"><div class="pimgw"><div class="pimg" data-view="${id}"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.classList.add('bad')"></div>${p.recommended?'<span class="tag">Our pick</span>':''}<button class="ib wish" type="button" data-wish="${id}" aria-pressed="${w}" aria-label="${w?'Remove':'Add'} ${esc(p.name)} ${w?'from':'to'} wishlist">${ic('heart')}</button></div>
<div class="cbody"><span class="cat-l">${esc(p.category)}</span><h3 data-view="${id}">${esc(p.name)}</h3>
<div class="prow"><div class="price"><span>${inr(p.price)}</span>${p.mrp?`<s>${inr(p.mrp)}</s><small>${off}% off</small>`:''}</div><button class="addb" type="button" data-add="${id}" aria-label="${p.sizes.length?'Choose size for':'Add to cart:'} ${esc(p.name)}">${ic('plus')}</button></div></div></article>`}
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
function fmtDesc(raw){
  const {intro,feats}=parseDesc(raw);
  if(!intro.length&&!feats.length)return{html:'<p class="lede">Traditional herbal product.</p>',long:false};
  const fh=feats.map(f=>`<li><div>${f.t&&f.d?`<b>${esc(f.t)}</b><span>${esc(f.d)}</span>`:`<span style="color:var(--ink)">${esc(f.t||f.d)}</span>`}</div></li>`).join('');
  const html=intro.map((x,i)=>`<p${i?'':' class="lede"'}>${esc(x)}</p>`).join('')+(fh?`<ul class="mfeat">${fh}</ul>`:'');
  return{html,long:(intro.join(' ').length+feats.map(f=>f.t+f.d).join(' ').length)>380}}

function quick(p){let m=$('#modal');if(!m){m=document.createElement('div');m.id='modal';m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-labelledby','mT');document.body.appendChild(m)}
  const last=document.activeElement,off=p.mrp?Math.round(100-p.price/p.mrp*100):0,imgs=p.images.length?p.images:[''],d=fmtDesc(p.description),inWish=()=>getWish().some(x=>x.id===p.id);
  let size=p.sizes[0]||'',qty=1;
  m.innerHTML=`<div class="mbox"><div class="xw"><button class="ib x" type="button" aria-label="Close">${ic('x')}</button></div><div class="grab" aria-hidden="true"><span></span></div>
<div class="mgal"><div class="mmain" id="mMain"><img src="${esc(imgs[0])}" alt="${esc(p.name)}" onerror="this.classList.add('bad')">${off?`<span class="mbadge">${off}% off</span>`:''}<button class="ib mwish" id="mWish" type="button" aria-pressed="${inWish()}" aria-label="Save to wishlist">${ic('heart')}</button></div>${imgs.length>1?`<div class="thumbs">${imgs.map((u,i)=>`<button type="button" class="th" data-u="${esc(u)}" aria-pressed="${i===0}" aria-label="Show image ${i+1}"><img src="${esc(u)}" alt="" onerror="this.classList.add('bad')"></button>`).join('')}</div>`:''}</div>
<div class="minfo"><div class="mscroll"><span class="mcat">${esc(p.category)}</span><h2 id="mT">${esc(p.name)}</h2>
<div class="mprice"><b>${inr(p.price)}</b>${p.mrp?`<s>${inr(p.mrp)}</s><small>${off}% off</small>`:''}</div>
<div class="mdesc${d.long?' clip':''}" id="mDesc">${d.html}</div>${d.long?('<button class="more" type="button" id="mMore" aria-expanded="false">Read more'+ic('chevron-down')+'</button>'):''}
${p.sizes.length?`<p class="mlabel">Size</p><div class="sizes" role="group" aria-label="Size">${p.sizes.map((z,i)=>`<button type="button" class="chip" data-size="${esc(z)}" aria-pressed="${i===0}">${esc(z)}</button>`).join('')}</div>`:''}
<div class="mperks"><div>${ic('truck')}Free delivery above ${inr(CONFIG.FREE_SHIP_ABOVE)}</div><div>${ic('mortar')}Made by traditional methods</div><div>${ic('box')}Glass and paper, plastic-light packing</div></div>
<a class="mask" target="_blank" rel="noopener" href="https://wa.me/${esc(CONFIG.WHATSAPP)}?text=${encodeURIComponent('Hello, I have a question about '+p.name)}">${ic('chat')}Have a question? Ask us on WhatsApp</a></div>
<div class="mfoot"><div class="qty" role="group" aria-label="Quantity"><button type="button" data-q="-1" aria-label="Decrease quantity">−</button><span id="mQty" aria-live="polite">1</span><button type="button" data-q="1" aria-label="Increase quantity">+</button></div><button class="btn" type="button" id="mAdd">${ic('bag')}<span id="mAddT"></span></button></div></div></div>`;
  const sync=()=>{$('#mQty',m).textContent=qty;$('#mAddT',m).textContent='Add to cart · '+inr(p.price*qty)};sync();
  m.hidden=false;m.scrollTop=0;document.documentElement.classList.add('lock');
  const close=()=>{m.hidden=true;document.documentElement.classList.remove('lock');document.removeEventListener('keydown',esc_);last&&last.focus&&last.focus()},esc_=e=>{if(e.key==='Escape')close()};
  document.addEventListener('keydown',esc_);
  m.onclick=e=>{if(e.target===m||e.target.closest('.x'))return close();
    const th=e.target.closest('.th');if(th){const im=$('#mMain img',m);im.src=th.dataset.u;im.classList.remove('bad');$$('.th',m).forEach(b=>b.setAttribute('aria-pressed',b===th))}
    const z=e.target.closest('[data-size]');if(z){size=z.dataset.size;$$('[data-size]',m).forEach(b=>b.setAttribute('aria-pressed',b===z))}
    const q=e.target.closest('[data-q]');if(q){qty=Math.max(1,Math.min(10,qty+ +q.dataset.q));sync()}
    if(e.target.closest('#mMore')){const b=$('#mMore',m),c=$('#mDesc',m).classList.toggle('clip');b.setAttribute('aria-expanded',!c);b.firstChild.textContent=c?'Read more':'Show less';b.classList.toggle('open',!c)}};
  /* swipe the handle down to dismiss (mobile sheet) */
  const g=$('.grab',m),bx=$('.mbox',m);let y0=0,dy=0;
  g.addEventListener('touchstart',e=>{y0=e.touches[0].clientY;dy=0;bx.style.transition='none'},{passive:true});
  g.addEventListener('touchmove',e=>{dy=Math.max(0,e.touches[0].clientY-y0);bx.style.transform=`translateY(${dy}px)`},{passive:true});
  g.addEventListener('touchend',()=>{bx.style.transition='';bx.style.transform='';if(dy>90)close()});
  $('#mAdd',m).onclick=()=>{addToCart(p,qty,size);close()};
  $('#mWish',m).onclick=()=>{toggleWish(p);$('#mWish',m).setAttribute('aria-pressed',inWish());refresh()};$('.x',m).focus()}

/* One click handler for every page */
document.addEventListener('click',e=>{const t=e.target.closest('[data-add],[data-wish],[data-view],[data-inc],[data-dec],[data-rm],[data-cat]');if(!t)return;const d=t.dataset;
  if(d.add){const p=REG[d.add];p.sizes.length?quick(p):addToCart(p)}
  else if(d.wish){toggleWish(REG[d.wish]||getWish().find(x=>x.id===d.wish));refresh()}
  else if(d.view)quick(REG[d.view]);
  else if(d.inc)setQty(d.inc,1);else if(d.dec)setQty(d.dec,-1);
  else if(d.rm){write('cart',getCart().filter(x=>x.key!==d.rm));badges();renderCart()}
  else if(d.cat!==undefined){state.cat=d.cat;renderShop()}});
function refresh(){if(PAGE==='home')renderShop(true);else if(PAGE==='wishlist')renderWish()}

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
  ALL=await loadProducts();renderShop();
  if(!ALL.length)$('#allProducts').innerHTML='<div class="empty"><h3>No products yet</h3><p>Check back soon.</p></div>'}

/* ================= CART PAGE ================= */
function renderCart(){const box=$('#cartLines');if(!box)return;const c=getCart();
  if(!c.length){box.innerHTML='<div class="empty"><h3>Your cart is empty</h3><p>Browse the herbal shelf and add what you need.</p><a class="btn" href="index.html#shop">Continue shopping</a></div>';$('#sum').hidden=true;return}
  $('#sum').hidden=false;let sub=0;
  box.innerHTML='<div class="lines">'+c.map(i=>{const t=i.price*i.qty;sub+=t;return `<div class="line"><div class="pimg"><img src="${esc(i.image)}" alt="${esc(i.name)}" onerror="this.classList.add('bad')"></div><div><h3>${esc(i.name)}${i.size?` <small style="font:400 .85rem var(--bf);color:var(--mute)">(${esc(i.size)})</small>`:''}</h3><span class="price" style="font-size:.98rem">${inr(i.price)}</span><div class="qty"><button type="button" data-dec="${esc(i.key)}" aria-label="Decrease quantity of ${esc(i.name)}">−</button><span>${i.qty}</span><button type="button" data-inc="${esc(i.key)}" aria-label="Increase quantity of ${esc(i.name)}">+</button><button class="rm" type="button" data-rm="${esc(i.key)}">Remove</button></div></div><div class="sub">${inr(t)}</div></div>`}).join('')+'</div>';
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
if(PAGE==='home')initHome();if(PAGE==='cart')renderCart();if(PAGE==='wishlist')renderWish();if(PAGE==='contact')initContact();if(PAGE==='checkout')initCheckout();
