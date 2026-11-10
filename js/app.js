/* AZRA — çekirdek: yardımcılar, SVG ürün çizimleri, sepet, layout */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const LS = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const fmt = n => Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ₺';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const byId = id => PRODUCTS.find(p => p.id == id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const qs = new URLSearchParams(location.search);

/* ---------- renk yardımcıları ---------- */
function rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function shade(h, a) { const [r, g, b] = rgb(h).map(x => clamp(x + a, 0, 255)); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
function lum(h) { const [r, g, b] = rgb(h); return .299 * r + .587 * g + .114 * b; }

/* ---------- ürün illüstrasyonları (SVG) ---------- */
let _aid = 0;
const SHAPES = {
  tshirt: (f, d) => `<path d="M62 52 L90 40 Q100 58 110 40 L138 52 L178 92 L156 116 L140 102 L140 214 L60 214 L60 102 L44 116 L22 92 Z" fill="${f}"/><path d="M90 40 Q100 58 110 40" fill="none" stroke="${d}" stroke-width="3"/><path d="M60 102 L60 214 M140 102 L140 214" stroke="${d}" stroke-opacity=".25" stroke-width="2"/>`,
  shirt: (f, d) => `<path d="M62 52 L88 40 L100 62 L112 40 L138 52 L178 100 L156 124 L140 108 L140 222 L60 222 L60 108 L44 124 L22 100 Z" fill="${f}"/><path d="M88 40 L100 62 L112 40 L100 54Z" fill="${d}"/><path d="M100 62 V222" stroke="${d}" stroke-width="2"/>${[84, 112, 140, 168, 196].map(y => `<circle cx="100" cy="${y}" r="2.6" fill="${d}"/>`).join('')}`,
  hoodie: (f, d) => `<path d="M62 58 L92 46 Q100 62 108 46 L138 58 L178 160 L152 170 L140 126 L140 218 L60 218 L60 126 L48 170 L22 160 Z" fill="${f}"/><path d="M72 54 Q100 6 128 54 Q100 84 72 54Z" fill="${d}"/><path d="M92 74 V104 M108 74 V104" stroke="${f}" stroke-width="3" stroke-linecap="round"/><path d="M76 168 H124 L132 206 H68Z" fill="${d}" fill-opacity=".35"/>`,
  dress: (f, d) => `<path d="M82 34 L91 34 Q100 54 109 34 L118 34 L125 104 L174 238 Q100 254 26 238 L75 104 Z" fill="${f}"/><path d="M75 104 Q100 116 125 104" stroke="${d}" stroke-width="3" fill="none"/><path d="M100 118 L100 244 M78 120 L52 242 M122 120 L148 242" stroke="${d}" stroke-opacity=".22" stroke-width="2"/>`,
  jacket: (f, d) => `<path d="M58 50 L88 38 L100 72 L112 38 L142 50 L182 178 L158 186 L142 118 L142 218 L58 218 L58 118 L42 186 L18 178 Z" fill="${f}"/><path d="M88 38 L100 140 L70 86Z M112 38 L100 140 L130 86Z" fill="${d}"/><circle cx="100" cy="160" r="3" fill="${d}"/><circle cx="100" cy="190" r="3" fill="${d}"/>`,
  coat: (f, d) => `<path d="M58 44 L88 32 L100 66 L112 32 L142 44 L184 190 L160 198 L142 112 L148 246 L52 246 L58 112 L40 198 L16 190 Z" fill="${f}"/><path d="M88 32 L100 140 L70 80Z M112 32 L100 140 L130 80Z" fill="${d}"/><path d="M56 130 Q100 146 144 130 V144 Q100 160 56 144Z" fill="${d}"/><circle cx="92" cy="176" r="3" fill="${d}"/><circle cx="108" cy="176" r="3" fill="${d}"/><circle cx="92" cy="208" r="3" fill="${d}"/><circle cx="108" cy="208" r="3" fill="${d}"/>`,
  pants: (f, d) => `<path d="M62 40 L138 40 L152 240 L108 240 L100 116 L92 240 L48 240 Z" fill="${f}"/><rect x="62" y="40" width="76" height="14" fill="${d}"/><path d="M100 54 V116" stroke="${d}" stroke-width="2"/><path d="M70 90 Q82 100 88 96" stroke="${d}" stroke-width="2" fill="none"/>`,
  skirt: (f, d) => `<path d="M66 70 L134 70 L176 224 Q100 242 24 224 Z" fill="${f}"/><rect x="66" y="58" width="68" height="16" rx="3" fill="${d}"/><path d="M84 76 L62 230 M100 76 V236 M116 76 L138 230" stroke="${d}" stroke-opacity=".28" stroke-width="2"/>`,
  shoe: (f, d) => `<path d="M24 142 Q30 100 70 108 L92 138 Q132 146 170 160 Q188 168 186 192 L186 204 L22 204 Z" fill="${f}"/><path d="M20 200 H190 V222 H20 Z" fill="#fff" stroke="${d}" stroke-opacity=".3"/><path d="M70 108 L92 138 M82 122 L96 114 M92 134 L108 126" stroke="${d}" stroke-width="3" stroke-linecap="round"/><path d="M24 142 H60 V204" fill="none" stroke="${d}" stroke-opacity=".35" stroke-width="2"/>`,
  bag: (f, d) => `<path d="M68 118 Q68 58 100 58 Q132 58 132 118" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/><rect x="42" y="112" width="116" height="96" rx="16" fill="${f}"/><path d="M42 140 Q100 168 158 140" fill="none" stroke="${d}" stroke-width="3"/><circle cx="100" cy="158" r="8" fill="${d}"/>`,
  scarf: (f, d) => `<path d="M58 40 Q100 76 142 40 L156 74 Q100 112 44 74Z" fill="${f}"/><path d="M80 90 L104 100 L96 230 L64 226Z" fill="${f}"/><path d="M110 98 L138 88 L146 224 L114 232Z" fill="${d}"/><path d="M64 214 H96 M114 218 H146" stroke="${f}" stroke-width="3" stroke-dasharray="3 3"/>`,
  hat: (f, d) => `<path d="M54 156 Q54 82 100 82 Q146 82 146 156Z" fill="${f}"/><ellipse cx="100" cy="158" rx="82" ry="20" fill="${d}"/><ellipse cx="100" cy="150" rx="46" ry="6" fill="${d}" fill-opacity=".4"/>`
};
function art(type, hex, seed = 0, o = {}) {
  const id = 'g' + (++_aid), l = lum(hex);
  const pools = l < 80 ? ['#ffd3e6', '#fff1f7', '#f2f2f5', '#ff9ccb'] : l > 200 ? ['#ffd3e6', '#ff7ab8', '#17171b', '#ff2e93'] : ['#fff1f7', '#f2f2f5', '#ffd3e6', '#17171b'];
  const bg = o.bg || pools[seed % pools.length], dark = lum(bg) < 90;
  const d = shade(hex, l > 140 ? -38 : 40), vb = o.zoom ? '40 50 120 150' : '0 0 200 260';
  const stroke = l > 225 ? ' stroke="rgba(0,0,0,.16)" stroke-width="1.5"' : '';
  const sh = SHAPES[type] || SHAPES.tshirt;
  return `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ürün görseli"><defs><radialGradient id="${id}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${dark ? '#2a2a31' : '#fff'}" stop-opacity=".55"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></radialGradient></defs>
  <rect x="-40" y="-40" width="280" height="340" fill="${bg}"/><rect x="-40" y="-40" width="280" height="340" fill="url(#${id})"/>
  <circle cx="${150 - seed * 18 % 90}" cy="${36 + seed * 13 % 40}" r="${26 + seed % 3 * 8}" fill="${dark ? '#ff2e93' : '#fff'}" fill-opacity="${dark ? .5 : .5}"/>
  <ellipse cx="100" cy="246" rx="64" ry="7" fill="#000" fill-opacity="${dark ? .5 : .13}"/>
  <g${stroke} transform="${o.zoom ? '' : 'translate(0 -4)'}">${sh(hex, d)}</g></svg>`;
}
/* Fotoğraf varsa SVG içinde <image> olarak verir (mevcut CSS/JS svg'ye göre çalıştığı için bozulmaz); yoksa çizim. */
function pArt(p, ci = 0, seed, o = {}) {
  const url = photoUrl(p.id, p.colors[ci].k);
  if (!url) return art(p.type, p.colors[ci].h, seed ?? p.id, o);
  const vb = o.zoom ? '180 160 726 968' : '0 0 1086 1448';
  return `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(p.name)} - ${esc(p.colors[ci].n)}"><image href="${url}" width="1086" height="1448" preserveAspectRatio="xMidYMid slice"/></svg>`;
}
const hasPhoto = (p, ci = 0) => !!photoUrl(p.id, p.colors[ci].k);

/* ---------- state ---------- */
const getCart = () => LS.get('azra_cart', []);
const setCart = c => { LS.set('azra_cart', c); updateBadges(); };
const getFavs = () => LS.get('azra_favs', []);
const getUser = () => LS.get('azra_user', null);
const getOrders = () => LS.get('azra_orders', []);

function addToCart(id, color, size, qty = 1) {
  const c = getCart(), it = c.find(x => x.id == id && x.color === color && x.size === size);
  if (it) it.qty += qty; else c.push({ id, color, size, qty });
  setCart(c);
}
function cartLines() {
  return getCart().map(l => { const p = byId(l.id); return p ? { ...l, p, ci: Math.max(0, p.colors.findIndex(c => c.k === l.color)) } : null; }).filter(Boolean);
}
function calc(opts = {}) {
  const lines = cartLines(), sub = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const code = LS.get('azra_coupon', null), cp = code && COUPONS[code];
  let disc = 0;
  if (cp && (!cp.min || sub >= cp.min)) disc = cp.t === 'pct' ? Math.round(sub * cp.v) / 100 : cp.v;
  const after = Math.max(0, sub - disc), shipKey = opts.ship || 'standart';
  const ship = !lines.length || after >= FREE_SHIP ? 0 : SHIP[shipKey].p + (after >= FREE_SHIP && shipKey === 'hizli' ? 0 : 0);
  const fee = opts.pay === 'kapida' ? 19.9 : 0;
  return { lines, sub, disc, code: cp ? code : null, ship, fee, total: after + ship + fee, count: lines.reduce((s, l) => s + l.qty, 0) };
}
function toggleFav(id) {
  let f = getFavs(); const had = f.includes(id);
  f = had ? f.filter(x => x !== id) : [...f, id]; LS.set('azra_favs', f); updateBadges();
  toast(had ? 'Favorilerden çıkarıldı' : '<b>♥</b> Favorilere eklendi');
  $$(`[data-fav="${id}"]`).forEach(b => b.classList.toggle('on', !had));
  return !had;
}

/* ---------- UI yardımcıları ---------- */
function toast(html) {
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html;
  $('.toasts').appendChild(t); setTimeout(() => { t.style.transition = '.4s'; t.style.opacity = 0; setTimeout(() => t.remove(), 400); }, 2400);
}
function modal(html) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="modal-c"><button class="close" aria-label="Kapat">×</button>${html}</div>`;
  const close = () => m.remove();
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('.close')) close(); });
  document.body.appendChild(m); return { el: m, close };
}
const stars = r => `<span class="stars">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;
const heart = '<svg viewBox="0 0 24 24"><path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21.8l8.8-8.8a5.2 5.2 0 0 0 0-7.4z"/></svg>';

function card(p, opt = {}) {
  const fav = getFavs().includes(p.id), sale = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const isNew = p.id >= 19 || p.id === 1;
  return `<article class="card ${opt.cls || ''} rv" style="--d:${(opt.i || 0) % 4 * .08}s">
  <a class="im" href="product.html?id=${p.id}">${pArt(p, 0)}
   ${sale ? `<span class="badge sale">-%${sale}</span>` : isNew ? '<span class="badge">YENİ</span>' : ''}</a>
  <button class="fav ${fav ? 'on' : ''}" data-fav="${p.id}" aria-label="Favori">${heart}</button>
  <button class="quick" data-quick="${p.id}">Hızlı Ekle +</button>
  <div class="info"><h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
   <div class="meta"><span class="price">${fmt(p.price)}${p.old ? `<s>${fmt(p.old)}</s>` : ''}</span>
   <span class="dots">${p.colors.map(c => `<i style="background:${c.h}" title="${c.n}"></i>`).join('')}</span></div>
   <div class="stars" style="margin-top:4px">${'★'.repeat(Math.round(p.rating))} <small>${p.rating} (${p.reviews})</small></div></div></article>`;
}

function quickAdd(id) {
  const p = byId(id); let ci = 0, sz = p.sizes.length === 1 ? p.sizes[0] : null;
  const m = modal(`<div style="display:grid;grid-template-columns:130px 1fr;gap:20px"><div style="border-radius:18px;overflow:hidden;aspect-ratio:3/4" id="qa-im">${pArt(p, 0)}</div>
   <div><h3 style="font-size:1.4rem">${esc(p.name)}</h3><p class="price" style="margin:6px 0 14px">${fmt(p.price)}</p>
   <h4 style="font-size:.85rem;margin-bottom:8px">Renk</h4><div class="chips" id="qa-c">${p.colors.map((c, i) => `<button class="sw ${i ? '' : 'on'}" data-i="${i}" style="background:${c.h}" title="${c.n}"></button>`).join('')}</div>
   <h4 style="font-size:.85rem;margin:14px 0 8px">Beden</h4><div class="chips" id="qa-s">${p.sizes.map(s => `<button class="chip ${p.sizes.length === 1 ? 'on' : ''}">${s}</button>`).join('')}</div></div></div>
   <button class="btn block mt" id="qa-go">Sepete Ekle</button>`);
  m.el.addEventListener('click', e => {
    const c = e.target.closest('#qa-c .sw'), s = e.target.closest('#qa-s .chip');
    if (c) { ci = +c.dataset.i; $$('#qa-c .sw').forEach(x => x.classList.toggle('on', x === c)); $('#qa-im').innerHTML = pArt(p, ci); }
    if (s) { sz = s.textContent; $$('#qa-s .chip').forEach(x => x.classList.toggle('on', x === s)); }
    if (e.target.id === 'qa-go') {
      if (!sz) return toast('Lütfen bir beden seçin');
      addToCart(p.id, p.colors[ci].k, sz); m.close(); openDrawer();
    }
  });
}

/* ---------- layout ---------- */
const NAV = [['products.html', 'Mağaza'], ['products.html?f=new', 'Yeni Gelenler'], ['products.html?f=sale', 'İndirim'], ['about.html', 'Hakkımızda'], ['contact.html', 'İletişim']];
const icoS = { search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', heart: '<path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21.8l8.8-8.8a5.2 5.2 0 0 0 0-7.4z"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>', bag: '<path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>' };
const ic = k => `<svg viewBox="0 0 24 24">${icoS[k]}</svg>`;

function layout() {
  const here = location.pathname.split('/').pop() || 'index.html', cur = here + location.search;
  const nav = NAV.map(([h, t]) => `<a href="${h}" class="${cur === h || (h === 'products.html' && here === 'products.html' && !location.search) ? 'on' : ''}">${t}</a>`).join('');
  const msg = '<span>🚚 <b>1500₺</b> üzeri alışverişlerde ücretsiz kargo</span><span>💖 İlk siparişe özel <b>HOSGELDIN</b> koduyla %15 indirim</span><span>↩️ 30 gün koşulsuz iade</span><span>✨ Yeni sezon koleksiyonu yayında</span>';
  document.body.insertAdjacentHTML('afterbegin', `<div class="progress" id="prog"></div><div class="cursor-glow" id="glow"></div>
  <div class="topbar"><div class="mq">${msg}${msg}${msg}${msg}</div></div>
  <header class="hdr" id="hdr"><div class="hdr-in">
   <button class="ico burger" id="burger" aria-label="Menü">${ic('menu')}</button>
   <a class="logo" href="index.html">azra<span>.</span></a>
   <nav id="nav">${nav}</nav>
   <div class="acts">
    <button class="ico" id="sbtn" aria-label="Ara">${ic('search')}</button>
    <a class="ico" href="favorites.html" aria-label="Favoriler">${ic('heart')}<span class="b" id="bf">0</span></a>
    <a class="ico" href="${getUser() ? 'account.html' : 'login.html'}" aria-label="Hesap">${ic('user')}</a>
    <button class="ico" id="cbtn" aria-label="Sepet">${ic('bag')}<span class="b" id="bc">0</span></button>
   </div></div></header>
  <div class="scrim" id="scrim"></div>
  <aside class="drawer" id="drawer"><div class="drawer-h"><span>Sepetim <small class="muted" id="dcount"></small></span><button class="x" id="dclose" style="font-size:2rem">×</button></div><div class="drawer-b" id="dbody"></div><div class="drawer-f" id="dfoot"></div></aside>
  <div class="search-ov" id="sov"><div class="in"><div class="row"><span class="eyebrow">Arama</span><button class="x" id="sclose" style="font-size:2.4rem">×</button></div><input id="sin" placeholder="Ne arıyorsun?" autocomplete="off"><div id="sres" style="margin-top:20px"></div></div></div>
  <div class="toasts"></div>`);

  const cats = CATS.map(c => `<li><a href="products.html?cat=${c.id}">${c.name}</a></li>`).join('');
  document.body.insertAdjacentHTML('beforeend', `<footer><div class="wrap"><div class="ft">
   <div><a class="logo" href="index.html">azra<span>.</span></a><p class="muted" style="max-width:300px">Yeni nesil moda. Cesur, özgün ve sana özel. Pembenin gücüyle.</p>
    <div class="pay"><span>VISA</span><span>MASTERCARD</span><span>TROY</span><span>HAVALE/EFT</span></div></div>
   <div><h5>Alışveriş</h5><ul>${cats}</ul></div>
   <div><h5>Yardım</h5><ul><li><a href="order.html">Sipariş Takibi</a></li><li><a href="faq.html">Sıkça Sorulan Sorular</a></li><li><a href="legal.html?doc=iade">İade ve Değişim</a></li><li><a href="legal.html?doc=kargo">Kargo ve Teslimat</a></li><li><a href="contact.html">İletişim</a></li></ul></div>
   <div><h5>Kurumsal</h5><ul><li><a href="about.html">Hakkımızda</a></li><li><a href="legal.html?doc=mesafeli">Mesafeli Satış Sözleşmesi</a></li><li><a href="legal.html?doc=gizlilik">Gizlilik Politikası</a></li><li><a href="legal.html?doc=kvkk">KVKK Aydınlatma Metni</a></li><li><a href="legal.html?doc=cerez">Çerez Politikası</a></li><li><a href="admin.html">Yönetim Paneli</a></li></ul></div>
  </div><div class="copy"><span>© 2026 AZRA Moda Tic. A.Ş. — Ödev projesi, gerçek satış yapılmamaktadır.</span><span>Pembe ile yapıldı ♥</span></div></div><div class="big-logo">azra.</div></footer>`);

  /* olaylar */
  $('#burger').onclick = () => { $('#nav').classList.toggle('open'); };
  $('#nav').addEventListener('click', e => { if (e.target.closest('a')) $('#nav').classList.remove('open'); });
  $('#cbtn').onclick = openDrawer; $('#dclose').onclick = $('#scrim').onclick = closeDrawer;
  $('#sbtn').onclick = () => { $('#sov').classList.add('on'); setTimeout(() => $('#sin').focus(), 50); };
  $('#sclose').onclick = () => $('#sov').classList.remove('on');
  $('#sin').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    $('#sres').innerHTML = !q ? '<p class="muted">Örn: elbise, blazer, sneaker…</p>' :
      (PRODUCTS.filter(p => (p.name + CATS.find(c => c.id === p.cat).name).toLowerCase().includes(q)).slice(0, 6).map(p => `<a class="sr" href="product.html?id=${p.id}"><div class="th">${pArt(p, 0)}</div><b>${esc(p.name)}</b><span class="price">${fmt(p.price)}</span></a>`).join('') || '<p class="muted">Sonuç bulunamadı.</p>') + `<p class="mt"><a class="btn sm" href="products.html?q=${encodeURIComponent(q)}">Tüm sonuçları gör →</a></p>`;
  });
  $('#sin').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.value.trim()) location.href = 'products.html?q=' + encodeURIComponent(e.target.value.trim()); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); $('#sov').classList.remove('on'); } });
  updateBadges();
}
function updateBadges() {
  const n = calc().count, f = getFavs().length;
  const bc = $('#bc'), bf = $('#bf');
  if (bc) { bc.textContent = n; bc.classList.toggle('on', n > 0); }
  if (bf) { bf.textContent = f; bf.classList.toggle('on', f > 0); }
  renderDrawer();
}
function openDrawer() { renderDrawer(); $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); }
function closeDrawer() { $('#drawer')?.classList.remove('on'); $('#scrim')?.classList.remove('on'); }
function renderDrawer() {
  const body = $('#dbody'); if (!body) return;
  const c = calc();
  $('#dcount').textContent = c.count ? `(${c.count})` : '';
  const left = Math.max(0, FREE_SHIP - (c.sub - c.disc));
  body.innerHTML = !c.lines.length ? '<div class="empty"><div class="big">🛍️</div><p>Sepetin şu an boş.</p><a class="btn mt" href="products.html">Alışverişe Başla</a></div>' :
    `<div style="padding:4px 0 12px;font-size:.88rem">${left ? `Ücretsiz kargo için <b class="pink">${fmt(left)}</b> daha ekle` : '🎉 Ücretsiz kargo kazandın!'}<div class="ship-bar"><i style="width:${clamp((c.sub - c.disc) / FREE_SHIP * 100, 0, 100)}%"></i></div></div>` +
    c.lines.map((l, i) => `<div class="mi"><a class="th" href="product.html?id=${l.p.id}">${pArt(l.p, l.ci)}</a><div><h4>${esc(l.p.name)}</h4><small>${l.p.colors[l.ci].n} / ${l.size} × ${l.qty}</small><div class="price" style="margin-top:4px">${fmt(l.p.price * l.qty)}</div></div><button class="x" data-rm="${i}" aria-label="Kaldır">×</button></div>`).join('');
  $('#dfoot').innerHTML = c.lines.length ? `<div class="row"><span>Ara toplam</span><b>${fmt(c.sub)}</b></div><a class="btn block" href="checkout.html">Ödemeye Geç</a><a class="btn ghost block" href="cart.html">Sepeti Görüntüle</a>` : '';
}

/* ---------- global olaylar ---------- */
document.addEventListener('click', e => {
  const f = e.target.closest('[data-fav]'); if (f) { e.preventDefault(); toggleFav(+f.dataset.fav); if (document.body.dataset.page === 'favorites') PAGES.favorites(); return; }
  const q = e.target.closest('[data-quick]'); if (q) { e.preventDefault(); quickAdd(+q.dataset.quick); return; }
  const r = e.target.closest('[data-rm]'); if (r) { const c = getCart(); c.splice(+r.dataset.rm, 1); setCart(c); if (document.body.dataset.page === 'cart') PAGES.cart(); }
});

/* ---------- scroll efektleri ---------- */
function initScroll() {
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  const watch = () => $$('.rv:not(.seen),.mask:not(.seen)').forEach(el => { el.classList.add('seen'); io.observe(el); });
  watch(); window.watchReveal = watch;

  /* kelime kelime dolan metin */
  $$('.statement').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w ${/^(pembe|azra|sen|cesur)/i.test(w) ? 'p' : ''}">${w}</span>`).join(' ');
  });
  const hs = $('.hs'), track = hs && $('.hs-track', hs), bar = hs && $('.hs-bar i', hs);
  let dist = 0;
  const sizeHS = () => {
    if (!hs) return;
    if (innerWidth <= 900) { hs.style.height = ''; track.style.transform = ''; return; }
    dist = Math.max(0, track.scrollWidth - innerWidth + 60); hs.style.height = (dist + innerHeight) + 'px';
  };
  window.sizeHS = sizeHS; sizeHS(); addEventListener('resize', sizeHS); addEventListener('load', sizeHS);
  const par = $$('[data-speed]'), words = $$('.statement .w'), prog = $('#prog'), hdr = $('#hdr');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (y / h * 100) + '%'; hdr.classList.toggle('scrolled', y > 40);
    par.forEach(el => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return; el.style.transform = `translate3d(0,${(r.top + r.height / 2 - innerHeight / 2) * -parseFloat(el.dataset.speed)}px,0) rotate(${el.dataset.rot ? (y * el.dataset.rot / 20) % 360 : 0}deg)`; });
    if (hs && innerWidth > 900) {
      const r = hs.getBoundingClientRect(), p = clamp(-r.top / (hs.offsetHeight - innerHeight), 0, 1);
      track.style.transform = `translate3d(${-p * dist}px,0,0)`; if (bar) bar.style.width = (p * 100) + '%';
    }
    if (words.length) {
      const st = words[0].parentElement.getBoundingClientRect(), p = clamp((innerHeight * .85 - st.top) / (st.height + innerHeight * .35), 0, 1);
      words.forEach((w, i) => w.classList.toggle('on', i / words.length < p));
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame); frame();
  const glow = $('#glow'); if (matchMedia('(hover:hover)').matches) addEventListener('mousemove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, { passive: true });
  /* sayaçlar */
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, to = +el.dataset.count, t0 = performance.now();
    const step = t => { const k = clamp((t - t0) / 1600, 0, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))).toLocaleString('tr-TR') + (el.dataset.suf || ''); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  layout();
  const pg = document.body.dataset.page; if (pg && window.PAGES && PAGES[pg]) PAGES[pg]();
  initScroll();
});
