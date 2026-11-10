/* AZRA — sayfa mantıkları */
window.PAGES = {};
const after = () => { window.watchReveal && watchReveal(); window.sizeHS && sizeHS(); };
const dateTR = d => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
const catName = id => (CATS.find(c => c.id === id) || {}).name || id;

/* ================= ANA SAYFA ================= */
PAGES.home = () => {
  const pop = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 8);
  $('#pop-track').innerHTML = pop.map((p, i) => card(p, { i })).join('');
  const top = [...PRODUCTS].sort((a, b) => b.sold * b.rating - a.sold * a.rating).slice(0, 8), max = top[0].sold;
  $('#rank').innerHTML = top.map((p, i) => `<div class="rk rv" style="--d:${i % 4 * .08}s"><span class="num">${i + 1}</span>
   <a class="im" href="product.html?id=${p.id}">${pArt(p, 0)}</a><h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
   <div class="row" style="margin-top:6px"><span class="price">${fmt(p.price)}</span>${stars(p.rating)}</div>
   <div class="bar"><i style="--w:${Math.round(p.sold / max * 100)}%"></i></div><span class="sold">${p.sold.toLocaleString('tr-TR')} kez satın alındı</span>
   <button class="btn sm block" style="margin-top:12px" data-quick="${p.id}">Sepete Ekle</button></div>`).join('');
  const sets = {
    new: () => [...PRODUCTS].sort((a, b) => b.id - a.id).slice(0, 8),
    sale: () => PRODUCTS.filter(p => p.old).slice(0, 8),
    top: () => PRODUCTS.filter(p => p.rating >= 4.8).slice(0, 8)
  };
  const draw = k => { $('#vit').innerHTML = sets[k]().map((p, i) => card(p, { i })).join(''); after(); };
  $('#vit-tabs').addEventListener('click', e => { const t = e.target.closest('.tab'); if (!t) return; $$('#vit-tabs .tab').forEach(x => x.classList.toggle('on', x === t)); draw(t.dataset.k); });
  draw('new');
  $('#cats').innerHTML = CATS.map((c, i) => {
    const p = PRODUCTS.find(x => x.cat === c.id), ci = i % p.colors.length;
    return `<a class="cat rv" style="--d:${i * .07}s" href="products.html?cat=${c.id}">${pArt(p, ci, i + 1)}<span>${c.name} →</span></a>`;
  }).join('');
  $('#insta').innerHTML = [0, 5, 9, 14, 2, 17].map((i, k) => `<a href="product.html?id=${PRODUCTS[i].id}" class="rv" style="--d:${k * .06}s">${pArt(PRODUCTS[i], k % PRODUCTS[i].colors.length, k + 2)}</a>`).join('');
  $('#hv-main').innerHTML = art('dress', '#141417', 0, { bg: '#ff2e93' });
  $('#hv1').innerHTML = pArt(PRODUCTS[1], 1, 1); $('#hv2').innerHTML = pArt(PRODUCTS[7], 2, 0);
  $('#promo-art').innerHTML = art('jacket', '#141417', 1, { bg: 'none' });
  const nf = $('#news-form');
  nf.onsubmit = e => { e.preventDefault(); toast('Bültene kayıt oldun 💖 <b>AZRA10</b> kodun e-postanda!'); nf.reset(); };
};

/* ================= MAĞAZA ================= */
PAGES.products = () => {
  const f = qs.get('f');
  const st = { cats: new Set(qs.get('cat') ? [qs.get('cat')] : []), max: 3500, sizes: new Set(), colors: new Set(), sale: f === 'sale', sort: f === 'new' ? 'new' : 'pop', q: (qs.get('q') || '').toLowerCase(), shown: 12 };
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', '36', '37', '38', '39', '40', '41'];
  $('#filters').innerHTML = `
   <div class="fg"><h4>Kategori</h4>${CATS.map(c => `<label class="chk"><input type="checkbox" data-cat="${c.id}" ${st.cats.has(c.id) ? 'checked' : ''}>${c.name}<em>${PRODUCTS.filter(p => p.cat === c.id).length}</em></label>`).join('')}</div>
   <div class="fg"><h4>Maksimum Fiyat: <span id="pv" class="pink">${fmt(st.max)}</span></h4><input type="range" id="pr" min="300" max="3500" step="50" value="${st.max}"></div>
   <div class="fg"><h4>Beden</h4><div class="chips">${allSizes.map(s => `<button class="chip" data-size="${s}">${s}</button>`).join('')}</div></div>
   <div class="fg"><h4>Renk</h4><div class="chips">${Object.entries(C).map(([k, c]) => `<button class="sw" data-color="${k}" style="background:${c.h}" title="${c.n}"></button>`).join('')}</div></div>
   <label class="chk"><input type="checkbox" id="sale" ${st.sale ? 'checked' : ''}>Sadece indirimli ürünler</label>
   <button class="btn ghost sm" id="reset">Filtreleri Temizle</button>`;
  $('#sort').value = st.sort; if (st.q) $('#qin').value = qs.get('q');
  const title = $('#ptitle');
  const draw = () => {
    let l = PRODUCTS.filter(p => (!st.cats.size || st.cats.has(p.cat)) && p.price <= st.max && (!st.sale || p.old) &&
      (!st.sizes.size || p.sizes.some(s => st.sizes.has(s))) && (!st.colors.size || p.colors.some(c => st.colors.has(c.k))) &&
      (!st.q || (p.name + ' ' + catName(p.cat) + ' ' + p.desc).toLowerCase().includes(st.q)));
    const sorts = { pop: (a, b) => b.sold - a.sold, new: (a, b) => b.id - a.id, asc: (a, b) => a.price - b.price, desc: (a, b) => b.price - a.price, rate: (a, b) => b.rating - a.rating };
    l.sort(sorts[st.sort]);
    title.innerHTML = st.q ? `“${esc(qs.get('q'))}” <span class="serif pink">sonuçları</span>` : st.cats.size === 1 ? `${catName([...st.cats][0])}` : st.sale ? 'İndirimli <span class="serif pink">ürünler</span>' : 'Tüm <span class="serif pink">ürünler</span>';
    $('#count').textContent = `${l.length} ürün`;
    $('#plist').innerHTML = l.length ? l.slice(0, st.shown).map((p, i) => card(p, { i })).join('') : '<div class="empty" style="grid-column:1/-1"><div class="big">🔍</div><p>Aradığın kriterlerde ürün bulunamadı.</p></div>';
    $('#more').style.display = l.length > st.shown ? '' : 'none';
    after();
  };
  const sync = () => { st.shown = 12; draw(); };
  $('#filters').addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.cat) t.checked ? st.cats.add(t.dataset.cat) : st.cats.delete(t.dataset.cat);
    if (t.id === 'pr') { st.max = +t.value; $('#pv').textContent = fmt(st.max); }
    if (t.id === 'sale') st.sale = t.checked;
    sync();
  });
  $('#filters').addEventListener('click', e => {
    const s = e.target.closest('[data-size]'), c = e.target.closest('[data-color]');
    if (s) { const k = s.dataset.size; st.sizes.has(k) ? st.sizes.delete(k) : st.sizes.add(k); s.classList.toggle('on'); sync(); }
    if (c) { const k = c.dataset.color; st.colors.has(k) ? st.colors.delete(k) : st.colors.add(k); c.classList.toggle('on'); sync(); }
    if (e.target.id === 'reset') location.href = 'products.html';
  });
  $('#sort').onchange = e => { st.sort = e.target.value; sync(); };
  $('#qform').onsubmit = e => { e.preventDefault(); st.q = $('#qin').value.trim().toLowerCase(); qs.set('q', $('#qin').value.trim()); sync(); };
  $('#more').onclick = () => { st.shown += 12; draw(); };
  draw();
};

/* ================= ÜRÜN DETAY ================= */
PAGES.product = () => {
  const p = byId(qs.get('id')); const root = $('#pd');
  if (!p) { root.innerHTML = '<div class="empty"><div class="big">😕</div><p>Ürün bulunamadı.</p><a class="btn mt" href="products.html">Mağazaya Dön</a></div>'; return; }
  document.title = p.name + ' — AZRA';
  let ci = 0, size = p.sizes.length === 1 ? p.sizes[0] : null, qty = 1, view = 0;
  const sale = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const allViews = [{}, { zoom: 1 }, { bg: '#0b0b0d' }, { bg: '#ff2e93' }];
  const revs = LS.get('azra_rev_' + p.id, []).concat([
    { n: 'Elif K.', r: 5, t: 'Kalıbı ve kumaşı harika, tam beklediğim gibi. Kesinlikle tavsiye ederim!', d: '2026-10-12' },
    { n: 'Zeynep A.', r: 4, t: 'Rengi fotoğraftakiyle birebir. Kargo çok hızlıydı.', d: '2026-09-28' },
    { n: 'Merve T.', r: 5, t: 'Üçüncü kez sipariş veriyorum, AZRA kalitesi başka.', d: '2026-09-03' }]);
  $('#crumb').innerHTML = `<a href="index.html">Ana Sayfa</a> / <a href="products.html?cat=${p.cat}">${catName(p.cat)}</a> / ${esc(p.name)}`;
  const draw = () => {
    const views = hasPhoto(p, ci) ? [{}, { zoom: 1 }] : allViews;
    if (view >= views.length) view = 0;
    root.innerHTML = `<div class="gal"><div class="thumbs">${views.map((v, i) => `<button class="${i === view ? 'on' : ''}" data-v="${i}">${pArt(p, ci, p.id, v)}</button>`).join('')}</div>
     <div class="mainimg" id="mimg">${pArt(p, ci, p.id, views[view])}</div></div>
     <div><span class="eyebrow">${catName(p.cat)}</span><h1 style="margin-top:10px">${esc(p.name)}</h1>
      <div class="row" style="justify-content:flex-start;gap:14px;margin-top:10px">${stars(p.rating)}<small class="muted">${p.rating} · ${p.reviews} değerlendirme · ${p.sold.toLocaleString('tr-TR')} satış</small></div>
      <p class="price">${fmt(p.price)}${p.old ? `<s>${fmt(p.old)}</s> <span class="pill">-%${sale}</span>` : ''}</p>
      <p class="muted">${esc(p.desc)}</p>
      <div class="opt"><h4>Renk: <span style="font-weight:500">${p.colors[ci].n}</span></h4><div class="chips">${p.colors.map((c, i) => `<button class="sw ${i === ci ? 'on' : ''}" data-c="${i}" style="background:${c.h}" title="${c.n}"></button>`).join('')}</div></div>
      <div class="opt"><h4>Beden ${p.sizes.length > 1 ? '<a id="sg">Beden tablosu</a>' : ''}</h4><div class="chips">${p.sizes.map(s => `<button class="chip ${s === size ? 'on' : ''}" data-s="${s}">${s}</button>`).join('')}</div></div>
      <div class="opt"><h4>Adet</h4><div class="qty"><button data-q="-1">−</button><span>${qty}</span><button data-q="1">+</button></div></div>
      <div class="buy"><button class="btn" id="add">Sepete Ekle — ${fmt(p.price * qty)}</button><button class="ico fav ${getFavs().includes(p.id) ? 'on' : ''}" data-fav="${p.id}" style="box-shadow:inset 0 0 0 1.5px var(--line);width:54px;height:54px">${heart}</button></div>
      <div class="perks"><span>🚚 1500₺ üzeri ücretsiz kargo</span><span>↩️ 30 gün içinde ücretsiz iade</span><span>🔒 256-bit SSL ile güvenli ödeme</span><span>📦 ${p.stock > 10 ? 'Stokta var' : `Son ${p.stock} ürün!`}</span></div></div>`;
  };
  draw();
  root.addEventListener('click', e => {
    const v = e.target.closest('[data-v]'), c = e.target.closest('[data-c]'), s = e.target.closest('[data-s]'), q = e.target.closest('[data-q]');
    if (v) { view = +v.dataset.v; draw(); }
    if (c) { ci = +c.dataset.c; draw(); }
    if (s) { size = s.dataset.s; draw(); }
    if (q) { qty = clamp(qty + +q.dataset.q, 1, 10); draw(); }
    if (e.target.id === 'sg') sizeGuide();
    if (e.target.id === 'add') { if (!size) return toast('Lütfen beden seçin'); addToCart(p.id, p.colors[ci].k, size, qty); openDrawer(); }
  });
  root.addEventListener('mousemove', e => { const m = e.target.closest('#mimg'); if (!m) return; const r = m.getBoundingClientRect(); const svg = m.firstElementChild; svg.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; svg.style.transform = 'scale(1.6)'; });
  root.addEventListener('mouseout', e => { const m = e.target.closest('#mimg'); if (m) m.firstElementChild.style.transform = ''; });

  /* sekmeler */
  const tabs = {
    Açıklama: () => `<p>${esc(p.desc)}</p><p class="mt">AZRA tasarım ekibi tarafından sezonun en güncel trendleri göz önünde bulundurularak hazırlanmıştır. Ürün modelin üzerinde S bedendir; modelin boyu 1,76 m, kilosu 56 kg'dır.</p>`,
    Detaylar: () => `<ul><li>Kategori: ${catName(p.cat)}</li><li>Ürün kodu: AZ-${String(p.id).padStart(4, '0')}</li><li>Kumaş: %80 Pamuk, %15 Polyester, %5 Elastan</li><li>Yıkama: 30°C hassas programda yıkayınız</li><li>Menşei: Türkiye</li></ul>`,
    'Kargo & İade': () => `<ul><li>Siparişler 24 saat içinde kargoya verilir.</li><li>1500₺ üzeri siparişlerde kargo ücretsizdir.</li><li>Teslimattan itibaren 30 gün içinde iade edebilirsiniz.</li><li>İade kargo ücreti AZRA'ya aittir.</li></ul>`,
    [`Yorumlar (${revs.length})`]: () => `${revs.map(r => `<div class="rev"><div class="row">${stars(r.r)}<small class="muted">${dateTR(r.d)}</small></div><b>${esc(r.n)}</b><p>${esc(r.t)}</p></div>`).join('')}
      <form id="rf" class="mt" style="display:grid;gap:10px;max-width:520px"><h4>Yorum yaz</h4><input class="inp" name="n" placeholder="Adın" required value="${esc(getUser()?.name || '')}"><select class="inp" name="r"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select><textarea class="inp" name="t" placeholder="Ürün hakkında ne düşünüyorsun?" required></textarea><button class="btn sm" style="justify-self:start">Gönder</button></form>`
  };
  const names = Object.keys(tabs); let cur = 0;
  const drawTabs = () => {
    $('#ptabs').innerHTML = `<div class="pt-nav">${names.map((n, i) => `<button class="${i === cur ? 'on' : ''}" data-t="${i}">${n}</button>`).join('')}</div><div class="pt-body">${tabs[names[cur]]()}</div>`;
    const rf = $('#rf'); if (rf) rf.onsubmit = e => { e.preventDefault(); const f = new FormData(rf); const all = LS.get('azra_rev_' + p.id, []); all.unshift({ n: f.get('n'), r: +f.get('r'), t: f.get('t'), d: new Date().toISOString() }); LS.set('azra_rev_' + p.id, all); toast('Yorumun için teşekkürler 💖'); setTimeout(() => location.reload(), 600); };
  };
  $('#ptabs').addEventListener('click', e => { const t = e.target.closest('[data-t]'); if (t) { cur = +t.dataset.t; drawTabs(); } });
  drawTabs();
  $('#related').innerHTML = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter(x => x.cat !== p.cat)).slice(0, 4).map((x, i) => card(x, { i })).join('');
  after();
};
function sizeGuide() {
  modal(`<h3 style="font-size:1.6rem;margin-bottom:16px">Beden Tablosu</h3><div class="tbl-wrap"><table class="t"><tr><th>Beden</th><th>Göğüs</th><th>Bel</th><th>Kalça</th></tr>
  ${[['XS', 80, 62, 88], ['S', 84, 66, 92], ['M', 88, 70, 96], ['L', 94, 76, 102], ['XL', 100, 82, 108]].map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]} cm</td><td>${r[2]} cm</td><td>${r[3]} cm</td></tr>`).join('')}</table></div>
  <p class="muted mt" style="font-size:.88rem">İki beden arasında kalırsan büyük bedeni öneriyoruz.</p>`);
}

/* ================= SEPET ================= */
PAGES.cart = () => {
  const c = calc(), root = $('#cart');
  if (!c.lines.length) { root.innerHTML = '<div class="empty"><div class="big">🛍️</div><h2>Sepetin boş</h2><p>Pembe dünyamızı keşfetmeye ne dersin?</p><a class="btn mt" href="products.html">Alışverişe Başla</a></div>'; return; }
  const left = Math.max(0, FREE_SHIP - (c.sub - c.disc));
  root.innerHTML = `<div class="two"><div>
   <div style="padding:18px 22px;border-radius:20px;background:var(--blush);margin-bottom:10px">${left ? `Ücretsiz kargo için <b class="pink">${fmt(left)}</b> daha ekle` : '🎉 Tebrikler, ücretsiz kargo kazandın!'}<div class="ship-bar"><i style="width:${clamp((c.sub - c.disc) / FREE_SHIP * 100, 0, 100)}%"></i></div></div>
   ${c.lines.map((l, i) => `<div class="ci"><a class="th" href="product.html?id=${l.p.id}">${pArt(l.p, l.ci)}</a><div><h3 style="font-size:1.1rem"><a href="product.html?id=${l.p.id}">${esc(l.p.name)}</a></h3><small class="muted">${l.p.colors[l.ci].n} · Beden ${l.size}</small>
     <div class="qty mt" style="display:flex;width:max-content"><button data-m="${i}" data-d="-1">−</button><span>${l.qty}</span><button data-m="${i}" data-d="1">+</button></div></div>
     <div style="text-align:right"><div class="price" style="font-size:1.2rem">${fmt(l.p.price * l.qty)}</div><button class="x" data-rm="${i}" style="font-size:.85rem;text-decoration:underline;margin-top:8px">Kaldır</button></div></div>`).join('')}
   <a href="products.html" class="btn ghost sm mt">← Alışverişe devam et</a></div>
   <aside class="box"><h3>Sipariş Özeti</h3>
    <div class="cpn"><input class="inp" id="cin" placeholder="İndirim kodu" value="${c.code || ''}"><button class="btn sm" id="capply">Uygula</button></div>
    <small class="muted">Dene: AZRA10 · HOSGELDIN · PEMBE200</small>
    <div class="row mt"><span>Ara toplam</span><b>${fmt(c.sub)}</b></div>
    ${c.disc ? `<div class="row pink"><span>İndirim (${c.code})</span><b>-${fmt(c.disc)}</b></div>` : ''}
    <div class="row"><span>Kargo</span><b>${c.ship ? fmt(c.ship) : 'Ücretsiz'}</b></div>
    <div class="row total"><span>Toplam</span><span>${fmt(c.total)}</span></div>
    <a class="btn pinkb block mt" href="checkout.html">Ödemeye Geç →</a></aside></div>`;
  root.onclick = e => {
    const m = e.target.closest('[data-m]');
    if (m) { const cart = getCart(); cart[+m.dataset.m].qty = clamp(cart[+m.dataset.m].qty + +m.dataset.d, 1, 10); setCart(cart); PAGES.cart(); }
    if (e.target.id === 'capply') {
      const code = $('#cin').value.trim().toUpperCase();
      if (!code) { LS.set('azra_coupon', null); return PAGES.cart(); }
      const cp = COUPONS[code]; if (!cp) return toast('Geçersiz indirim kodu');
      if (cp.min && c.sub < cp.min) return toast(`Bu kod için en az ${fmt(cp.min)} sepet gerekir`);
      LS.set('azra_coupon', code); toast(`<b>${code}</b> uygulandı: ${cp.d}`); PAGES.cart();
    }
  };
  updateBadges();
};

/* ================= ÖDEME ================= */
PAGES.checkout = () => {
  const root = $('#co'); const u = getUser() || {};
  if (!calc().lines.length) { root.innerHTML = '<div class="empty"><div class="big">🛍️</div><h2>Sepetin boş</h2><a class="btn mt" href="products.html">Alışverişe Başla</a></div>'; return; }
  let ship = 'standart', pay = 'kart';
  const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Kocaeli', 'Trabzon', 'Eskişehir', 'Samsun'];
  const summary = () => {
    const c = calc({ ship, pay });
    $('#sum').innerHTML = `<h3>Sipariş Özeti</h3>${c.lines.map(l => `<div class="mi" style="grid-template-columns:60px 1fr auto"><div class="th">${pArt(l.p, l.ci)}</div><div><h4>${esc(l.p.name)}</h4><small>${l.p.colors[l.ci].n} / ${l.size} × ${l.qty}</small></div><b>${fmt(l.p.price * l.qty)}</b></div>`).join('')}
     <div class="row mt"><span>Ara toplam</span><b>${fmt(c.sub)}</b></div>${c.disc ? `<div class="row pink"><span>İndirim (${c.code})</span><b>-${fmt(c.disc)}</b></div>` : ''}
     <div class="row"><span>Kargo</span><b>${c.ship ? fmt(c.ship) : 'Ücretsiz'}</b></div>${c.fee ? `<div class="row"><span>Kapıda ödeme bedeli</span><b>${fmt(c.fee)}</b></div>` : ''}
     <div class="row total"><span>Toplam</span><span>${fmt(c.total)}</span></div>`;
  };
  const [fn, ...ln] = (u.name || '').split(' ');
  root.innerHTML = `<div class="steps"><div class="step on"><i>1</i>Bilgiler</div><div class="step on"><i>2</i>Ödeme</div><div class="step"><i>3</i>Onay</div></div>
  <form id="cf" class="two" novalidate><div>
   <div class="sect"><h3><i>1</i>Teslimat Bilgileri</h3><div class="fgrid">
    <div><label class="l">Ad</label><input class="inp" name="ad" required value="${esc(fn || '')}"></div><div><label class="l">Soyad</label><input class="inp" name="soyad" required value="${esc(ln.join(' '))}"></div>
    <div><label class="l">E-posta</label><input class="inp" type="email" name="email" required value="${esc(u.email || '')}"></div><div><label class="l">Telefon</label><input class="inp" name="tel" placeholder="05XX XXX XX XX" required></div>
    <div><label class="l">İl</label><select class="inp" name="il" required><option value="">Seçiniz</option>${cities.map(c => `<option>${c}</option>`).join('')}</select></div><div><label class="l">İlçe</label><input class="inp" name="ilce" required></div>
    <div class="full"><label class="l">Açık Adres</label><textarea class="inp" name="adres" required style="min-height:90px"></textarea></div></div></div>
   <div class="sect"><h3><i>2</i>Kargo Yöntemi</h3>${Object.entries(SHIP).map(([k, s]) => `<label class="opt-card"><input type="radio" name="ship" value="${k}" ${k === ship ? 'checked' : ''}><span>${s.n}</span><b>${s.p ? fmt(s.p) : ''}</b></label>`).join('')}<small class="muted">1500₺ üzeri siparişlerde kargo ücretsizdir.</small></div>
   <div class="sect"><h3><i>3</i>Ödeme Yöntemi</h3>
    <label class="opt-card"><input type="radio" name="pay" value="kart" checked><span>💳 Kredi / Banka Kartı</span></label>
    <label class="opt-card"><input type="radio" name="pay" value="havale"><span>🏦 Havale / EFT</span></label>
    <label class="opt-card"><input type="radio" name="pay" value="kapida"><span>🚪 Kapıda Ödeme</span><b>+19,90 ₺</b></label>
    <div id="cardbox" class="mt"><div class="ccard"><div class="chip2"></div><div class="no" id="pn">•••• •••• •••• ••••</div><div class="r2"><span id="pname">AD SOYAD</span><span id="pexp">AA/YY</span></div></div>
     <div class="fgrid"><div class="full"><label class="l">Kart Numarası</label><input class="inp" name="cn" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000"></div>
     <div class="full"><label class="l">Kart Üzerindeki İsim</label><input class="inp" name="cname"></div>
     <div><label class="l">Son Kullanma</label><input class="inp" name="cexp" maxlength="5" placeholder="AA/YY"></div><div><label class="l">CVV</label><input class="inp" name="cvv" maxlength="3" inputmode="numeric" placeholder="123"></div></div>
     <small class="muted">Bu bir ödev projesidir; kart bilgileri hiçbir yere gönderilmez.</small></div></div>
   <label class="chk"><input type="checkbox" name="terms" required> <span><a class="pink" href="legal.html?doc=mesafeli" target="_blank">Mesafeli Satış Sözleşmesi</a>'ni ve <a class="pink" href="legal.html?doc=kvkk" target="_blank">KVKK Aydınlatma Metni</a>'ni okudum, kabul ediyorum.</span></label>
  </div><aside class="box" id="sum"></aside><div class="full" style="grid-column:1/-1"><button class="btn pinkb block" style="padding:20px;font-size:1.1rem" id="place">Siparişi Tamamla</button></div></form>`;
  summary();
  const f = $('#cf');
  f.addEventListener('input', e => {
    const t = e.target;
    if (t.name === 'cn') { t.value = t.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); $('#pn').textContent = t.value || '•••• •••• •••• ••••'; }
    if (t.name === 'cexp') { let v = t.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); t.value = v; $('#pexp').textContent = v || 'AA/YY'; }
    if (t.name === 'cname') $('#pname').textContent = t.value.toUpperCase() || 'AD SOYAD';
    if (t.name === 'cvv') t.value = t.value.replace(/\D/g, '');
    t.classList.remove('err');
  });
  f.addEventListener('change', e => {
    if (e.target.name === 'ship') ship = e.target.value;
    if (e.target.name === 'pay') { pay = e.target.value; $('#cardbox').style.display = pay === 'kart' ? '' : 'none'; }
    summary();
  });
  f.onsubmit = e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(f)); let bad = [];
    ['ad', 'soyad', 'email', 'tel', 'il', 'ilce', 'adres'].forEach(k => { if (!String(d[k] || '').trim()) bad.push(k); });
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) bad.push('email');
    if (d.tel && d.tel.replace(/\D/g, '').length < 10) bad.push('tel');
    if (pay === 'kart') {
      if ((d.cn || '').replace(/\s/g, '').length !== 16) bad.push('cn');
      if (!(d.cname || '').trim()) bad.push('cname');
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(d.cexp || '')) bad.push('cexp');
      if ((d.cvv || '').length !== 3) bad.push('cvv');
    }
    $$('.inp', f).forEach(i => i.classList.toggle('err', bad.includes(i.name)));
    if (bad.length) { toast('Lütfen işaretli alanları kontrol edin'); f[bad[0]]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (!d.terms) return toast('Sözleşmeleri onaylamanız gerekiyor');
    const c = calc({ ship, pay });
    const no = 'AZ-' + Date.now().toString().slice(-7) + Math.floor(Math.random() * 90 + 10);
    const order = {
      no, date: new Date().toISOString(), status: 0, ship, pay, user: u.email || d.email,
      customer: { name: d.ad + ' ' + d.soyad, email: d.email, tel: d.tel, il: d.il, ilce: d.ilce, adres: d.adres },
      items: c.lines.map(l => ({ id: l.p.id, name: l.p.name, color: l.p.colors[l.ci].n, size: l.size, qty: l.qty, price: l.p.price })),
      sub: c.sub, disc: c.disc, code: c.code, shipFee: c.ship, fee: c.fee, total: c.total
    };
    const o = getOrders(); o.unshift(order); LS.set('azra_orders', o);
    setCart([]); LS.set('azra_coupon', null);
    location.href = 'order.html?no=' + no + '&new=1';
  };
};

/* ================= SİPARİŞ / TAKİP / FATURA ================= */
function timeline(s) { return `<div class="tl">${STATUS.map((t, i) => `<div class="${i <= s ? 'on' : ''}"><i>${i <= s ? '✓' : i + 1}</i>${t}</div>`).join('')}</div>`; }
PAGES.order = () => {
  const root = $('#ord'), no = qs.get('no');
  const form = `<div class="panel" style="max-width:560px"><h3>Sipariş numaranı gir</h3><form id="tf" style="display:flex;gap:8px"><input class="inp" id="tno" placeholder="AZ-1234567" required><button class="btn">Sorgula</button></form></div>`;
  if (!no) { root.innerHTML = form; $('#tf').onsubmit = e => { e.preventDefault(); location.href = 'order.html?no=' + $('#tno').value.trim().toUpperCase(); }; return; }
  const o = getOrders().find(x => x.no === no);
  if (!o) { root.innerHTML = '<div class="empty"><div class="big">🔎</div><p>Bu numarayla sipariş bulunamadı.</p></div>' + form; $('#tf').onsubmit = e => { e.preventDefault(); location.href = 'order.html?no=' + $('#tno').value.trim().toUpperCase(); }; return; }
  const kdv = o.total / 1.10 * 0.10;
  root.innerHTML = `${qs.get('new') ? `<div class="ok"><div class="check">✓</div><h1 style="font-size:clamp(2rem,5vw,3.6rem)">Siparişin alındı! <span class="serif pink">Teşekkürler</span></h1><p class="muted mt">Onay e-postası <b>${esc(o.customer.email)}</b> adresine gönderildi (demo).</p></div>` : `<h1 style="font-size:2.4rem;margin-bottom:6px">Sipariş ${o.no}</h1>`}
  ${timeline(o.status)}
  <div class="row" style="justify-content:flex-start;gap:10px;flex-wrap:wrap"><button class="btn" onclick="window.print()">🖨 Faturayı Yazdır / PDF</button><a class="btn ghost" href="products.html">Alışverişe Devam</a></div>
  <div class="invoice"><header><div><div class="logo">azra<span>.</span></div><small>AZRA Moda Tic. A.Ş.<br>Pembe Sk. No:7 Şişli / İstanbul<br>V.D.: Şişli · V.N.: 1234567890</small></div>
   <div style="text-align:right"><h2 style="font-size:1.5rem">SATIŞ FATURASI / SİPARİŞ BELGESİ</h2><small>Belge No: ${o.no}<br>Tarih: ${dateTR(o.date)}<br>Ödeme: ${{ kart: 'Kredi Kartı', havale: 'Havale/EFT', kapida: 'Kapıda Ödeme' }[o.pay]}</small></div></header>
   <div class="fgrid" style="margin-bottom:20px"><div><b>Alıcı</b><br><small>${esc(o.customer.name)}<br>${esc(o.customer.adres)}<br>${esc(o.customer.ilce)} / ${esc(o.customer.il)}<br>${esc(o.customer.tel)} · ${esc(o.customer.email)}</small></div><div><b>Teslimat</b><br><small>${SHIP[o.ship].n}<br>Durum: <span class="pill">${STATUS[o.status]}</span></small></div></div>
   <div class="tbl-wrap"><table class="t"><tr><th>Ürün</th><th>Renk / Beden</th><th>Adet</th><th>Birim</th><th>Tutar</th></tr>${o.items.map(i => `<tr><td>${esc(i.name)}</td><td>${i.color} / ${i.size}</td><td>${i.qty}</td><td>${fmt(i.price)}</td><td>${fmt(i.price * i.qty)}</td></tr>`).join('')}</table></div>
   <div style="margin-left:auto;max-width:320px;margin-top:20px"><div class="row"><span>Ara toplam</span><span>${fmt(o.sub)}</span></div>${o.disc ? `<div class="row"><span>İndirim (${o.code})</span><span>-${fmt(o.disc)}</span></div>` : ''}<div class="row"><span>Kargo</span><span>${o.shipFee ? fmt(o.shipFee) : 'Ücretsiz'}</span></div>${o.fee ? `<div class="row"><span>Kapıda ödeme</span><span>${fmt(o.fee)}</span></div>` : ''}<div class="row"><small>KDV (%10) dahil</small><small>${fmt(kdv)}</small></div><div class="row total" style="border-top:2px solid var(--ink);margin-top:8px;padding-top:10px;font-size:1.3rem;font-weight:700"><span>GENEL TOPLAM</span><span>${fmt(o.total)}</span></div></div>
   <small class="muted" style="display:block;margin-top:24px">Bu belge ödev projesi kapsamında üretilmiştir, mali değeri yoktur.</small></div>`;
};

/* ================= GİRİŞ / KAYIT ================= */
PAGES.login = () => {
  if (getUser()) { location.href = 'account.html'; return; }
  let mode = 'in'; const root = $('#auth-form');
  const draw = () => {
    root.innerHTML = `<div class="tabs" style="margin-bottom:10px"><button class="tab ${mode === 'in' ? 'on' : ''}" data-m="in">Giriş Yap</button><button class="tab ${mode === 'up' ? 'on' : ''}" data-m="up">Üye Ol</button></div>
    <form id="af" style="display:grid;gap:14px">${mode === 'up' ? '<div><label class="l">Ad Soyad</label><input class="inp" name="name" required></div>' : ''}
    <div><label class="l">E-posta</label><input class="inp" type="email" name="email" required></div><div><label class="l">Şifre</label><input class="inp" type="password" name="pw" minlength="6" required></div>
    <button class="btn pinkb block">${mode === 'in' ? 'Giriş Yap' : 'Hesap Oluştur'}</button><small class="muted">Demo: veriler yalnızca bu tarayıcıda saklanır.</small></form>`;
    $('#af').onsubmit = e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); const users = LS.get('azra_users', []);
      if (mode === 'up') {
        if (users.find(u => u.email === d.email)) return toast('Bu e-posta zaten kayıtlı');
        users.push({ name: d.name, email: d.email, pw: d.pw }); LS.set('azra_users', users); LS.set('azra_user', { name: d.name, email: d.email });
      } else {
        const u = users.find(u => u.email === d.email && u.pw === d.pw); if (!u) return toast('E-posta veya şifre hatalı');
        LS.set('azra_user', { name: u.name, email: u.email });
      }
      location.href = qs.get('next') || 'account.html';
    };
  };
  root.addEventListener('click', e => { const m = e.target.closest('[data-m]'); if (m) { mode = m.dataset.m; draw(); } });
  draw();
};

/* ================= HESABIM ================= */
PAGES.account = () => {
  const u = getUser(); if (!u) { location.href = 'login.html?next=account.html'; return; }
  let tab = qs.get('tab') || 'orders'; const root = $('#acc');
  const mine = () => getOrders().filter(o => o.user === u.email || o.customer.email === u.email);
  const views = {
    orders: () => { const o = mine(); return `<h2 style="font-size:2rem;margin-bottom:20px">Siparişlerim</h2>` + (o.length ? `<div class="tbl-wrap"><table class="t"><tr><th>No</th><th>Tarih</th><th>Tutar</th><th>Durum</th><th></th></tr>${o.map(x => `<tr><td><b>${x.no}</b></td><td>${dateTR(x.date)}</td><td>${fmt(x.total)}</td><td><span class="pill ${x.status === 3 ? 'g' : ''}">${STATUS[x.status]}</span></td><td><a class="pink" href="order.html?no=${x.no}">Detay / Fatura</a></td></tr>`).join('')}</table></div>` : '<div class="empty"><div class="big">📦</div><p>Henüz siparişin yok.</p><a class="btn mt" href="products.html">Alışverişe Başla</a></div>'); },
    favs: () => { const f = getFavs().map(byId).filter(Boolean); return `<h2 style="font-size:2rem;margin-bottom:20px">Favorilerim</h2>` + (f.length ? `<div class="grid" style="grid-template-columns:repeat(3,1fr)">${f.map((p, i) => card(p, { i })).join('')}</div>` : '<div class="empty"><div class="big">♥</div><p>Favori ürünün yok.</p></div>'); },
    profile: () => `<h2 style="font-size:2rem;margin-bottom:20px">Profilim</h2><form id="pf" style="display:grid;gap:14px;max-width:460px"><div><label class="l">Ad Soyad</label><input class="inp" name="name" value="${esc(u.name)}"></div><div><label class="l">E-posta</label><input class="inp" value="${esc(u.email)}" disabled></div><button class="btn" style="justify-self:start">Kaydet</button></form>
      <div class="stats mt" style="margin-top:34px"><div class="stat"><b>${mine().length}</b><span>Sipariş</span></div><div class="stat"><b>${getFavs().length}</b><span>Favori</span></div><div class="stat dk"><b>${fmt(mine().reduce((s, o) => s + o.total, 0))}</b><span>Toplam harcama</span></div><div class="stat"><b>${mine().length > 2 ? 'Gold' : 'Classic'}</b><span>Üyelik</span></div></div>`
  };
  const draw = () => {
    root.innerHTML = `<div class="acc"><nav>${[['orders', '📦 Siparişlerim'], ['favs', '♥ Favorilerim'], ['profile', '👤 Profilim']].map(([k, t]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}">${t}</button>`).join('')}<button id="out">↩ Çıkış Yap</button></nav><div>${views[tab]()}</div></div>`;
    const pf = $('#pf'); if (pf) pf.onsubmit = e => { e.preventDefault(); const n = new FormData(pf).get('name'); LS.set('azra_user', { ...u, name: n }); toast('Profil güncellendi'); };
    after();
  };
  root.addEventListener('click', e => { const t = e.target.closest('[data-t]'); if (t) { tab = t.dataset.t; draw(); } if (e.target.id === 'out') { localStorage.removeItem('azra_user'); location.href = 'index.html'; } });
  $('#hello').textContent = u.name.split(' ')[0];
  draw();
};

/* ================= FAVORİLER ================= */
PAGES.favorites = () => {
  const f = getFavs().map(byId).filter(Boolean);
  $('#favs').innerHTML = f.length ? f.map((p, i) => card(p, { i })).join('') : '<div class="empty" style="grid-column:1/-1"><div class="big">♥</div><p>Henüz favorin yok. Kalbe dokun, burada görünsün.</p><a class="btn mt" href="products.html">Ürünleri Keşfet</a></div>';
  after();
};

/* ================= İLETİŞİM ================= */
PAGES.contact = () => {
  $('#contact-form').onsubmit = e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); const m = LS.get('azra_msgs', []);
    m.unshift({ ...d, date: new Date().toISOString() }); LS.set('azra_msgs', m); e.target.reset(); toast('Mesajın bize ulaştı 💌 En geç 24 saatte dönüş yapacağız.');
  };
};

/* ================= YASAL BELGELER ================= */
PAGES.legal = () => {
  const L = {
    mesafeli: ['Mesafeli Satış Sözleşmesi', `<h2>1. Taraflar</h2><p><b>SATICI:</b> AZRA Moda Tic. A.Ş., Pembe Sk. No:7 Şişli/İstanbul. <b>ALICI:</b> Sipariş formunda bilgileri yer alan müşteri.</p><h2>2. Konu</h2><p>İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesinden elektronik ortamda siparişini verdiği ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.</p><h2>3. Ürün ve Ödeme</h2><p>Ürünlerin cinsi, adedi, KDV dahil satış fiyatı ve ödeme şekli sipariş özetinde belirtilmiştir.</p><h2>4. Teslimat</h2><p>Ürünler, ALICI'nın belirttiği adrese sipariş tarihinden itibaren en geç 30 gün içinde teslim edilir.</p><h2>5. Cayma Hakkı</h2><p>ALICI, teslim tarihinden itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir. AZRA ayrıca 30 günlük ek iade süresi tanır.</p><h2>6. Uyuşmazlık</h2><p>Uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.</p>`],
    gizlilik: ['Gizlilik Politikası', `<h2>Toplanan Bilgiler</h2><p>Ad, soyad, e-posta, telefon, teslimat adresi ve sipariş bilgileri siparişinizi gerçekleştirmek amacıyla toplanır.</p><h2>Kullanım Amacı</h2><ul><li>Siparişlerin hazırlanması ve teslimi</li><li>Müşteri destek hizmetleri</li><li>Yasal yükümlülüklerin yerine getirilmesi</li><li>Onayınız dahilinde kampanya iletişimi</li></ul><h2>Paylaşım</h2><p>Kişisel verileriniz yalnızca kargo ve ödeme altyapısı iş ortaklarımızla, hizmetin gerektirdiği ölçüde paylaşılır; üçüncü kişilere satılmaz.</p><h2>Güvenlik</h2><p>Verileriniz SSL şifreleme ve güncel güvenlik önlemleriyle korunur.</p>`],
    kvkk: ['KVKK Aydınlatma Metni', `<h2>Veri Sorumlusu</h2><p>6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca veri sorumlusu AZRA Moda Tic. A.Ş.'dir.</p><h2>İşlenen Kişisel Veriler</h2><p>Kimlik, iletişim, müşteri işlem ve işlem güvenliği bilgileri.</p><h2>İşleme Amaçları ve Hukuki Sebep</h2><p>Sözleşmenin kurulması ve ifası, yasal yükümlülüklerin yerine getirilmesi ve meşru menfaatlerimiz.</p><h2>Haklarınız</h2><ul><li>Verilerinizin işlenip işlenmediğini öğrenme</li><li>Düzeltilmesini veya silinmesini isteme</li><li>İşlemeye itiraz etme</li><li>Zarar halinde tazminat talep etme</li></ul><p>Başvurularınızı <b>kvkk@azra.com</b> adresine iletebilirsiniz.</p>`],
    iade: ['İade ve Değişim Koşulları', `<h2>30 Gün Koşulsuz İade</h2><p>Satın aldığınız ürünleri teslim tarihinden itibaren 30 gün içinde iade edebilir veya değiştirebilirsiniz.</p><h2>Koşullar</h2><ul><li>Ürün kullanılmamış, yıkanmamış ve etiketi üzerinde olmalıdır.</li><li>İç giyim, mayo ve aksesuarlarda hijyen nedeniyle iade kabul edilmez.</li><li>Fatura veya sipariş belgesi iade paketine eklenmelidir.</li></ul><h2>Nasıl İade Ederim?</h2><ol style="padding-left:22px"><li>Hesabım > Siparişlerim bölümünden iade talebi oluşturun.</li><li>Anlaşmalı kargo ile ürünü ücretsiz gönderin.</li><li>Ürün ulaştıktan sonra 3 iş günü içinde ödemeniz iade edilir.</li></ol>`],
    kargo: ['Kargo ve Teslimat', `<h2>Kargo Ücretleri</h2><ul><li>Standart Kargo (2-4 iş günü): 49,90 ₺</li><li>Hızlı Kargo (1-2 iş günü): 89,90 ₺</li><li>1500 ₺ ve üzeri siparişlerde standart kargo ücretsizdir.</li></ul><h2>Kargo Süreci</h2><p>Siparişleriniz hafta içi 16:00'ya kadar verildiyse aynı gün kargoya teslim edilir. Takip numaranız e-posta ile paylaşılır.</p>`],
    cerez: ['Çerez Politikası', `<h2>Çerez Nedir?</h2><p>Çerezler, siteyi ziyaret ettiğinizde cihazınızda saklanan küçük dosyalardır.</p><h2>Kullandığımız Çerezler</h2><ul><li><b>Zorunlu:</b> Sepet ve oturum yönetimi</li><li><b>Performans:</b> Site kullanımını analiz etme</li><li><b>Pazarlama:</b> Kişiselleştirilmiş öneriler</li></ul><p>Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz.</p>`]
  };
  const k = L[qs.get('doc')] ? qs.get('doc') : 'mesafeli';
  $('#docs').innerHTML = Object.entries(L).map(([id, d]) => `<a class="tab ${id === k ? 'on' : ''}" href="legal.html?doc=${id}">${d[0]}</a>`).join('');
  $('#dtitle').textContent = L[k][0]; $('#dbody2').innerHTML = L[k][1]; document.title = L[k][0] + ' — AZRA';
};

/* ================= YÖNETİM PANELİ ================= */
PAGES.admin = () => {
  const root = $('#adm');
  if (sessionStorage.getItem('azra_admin') !== '1') {
    root.innerHTML = `<div class="panel" style="max-width:420px;margin:40px auto"><h3>Yönetici Girişi</h3><form id="gf" style="display:grid;gap:12px"><input class="inp" type="password" id="gp" placeholder="Şifre (admin123)"><button class="btn">Giriş</button></form></div>`;
    $('#gf').onsubmit = e => { e.preventDefault(); if ($('#gp').value === 'admin123') { sessionStorage.setItem('azra_admin', '1'); PAGES.admin(); } else toast('Şifre hatalı'); };
    return;
  }
  const o = getOrders(), rev = o.reduce((s, x) => s + x.total, 0), msgs = LS.get('azra_msgs', []);
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const per = days.map(d => o.filter(x => new Date(x.date).toDateString() === d.toDateString()).reduce((s, x) => s + x.total, 0));
  const mx = Math.max(...per, 1);
  const top = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 5);
  root.innerHTML = `<div class="row" style="margin-bottom:20px;flex-wrap:wrap"><h1 style="font-size:2.6rem">Yönetim Paneli</h1><div><button class="btn sm" id="demo">Demo veri yükle</button> <button class="btn ghost sm" id="logout">Çıkış</button></div></div>
  <div class="stats"><div class="stat dk"><b>${fmt(rev)}</b><span>Toplam ciro</span></div><div class="stat"><b>${o.length}</b><span>Sipariş</span></div><div class="stat"><b>${o.length ? fmt(rev / o.length) : '0 ₺'}</b><span>Ortalama sepet</span></div><div class="stat"><b>${PRODUCTS.length}</b><span>Ürün · ${msgs.length} mesaj</span></div></div>
  <div class="panel"><h3>Son 7 gün satış</h3><div class="chart">${per.map((v, i) => `<div><small>${v ? Math.round(v) : ''}</small><i data-h="${v / mx * 100}"></i>${days[i].toLocaleDateString('tr-TR', { weekday: 'short' })}</div>`).join('')}</div></div>
  <div class="panel"><h3>Siparişler</h3><div class="tbl-wrap"><table class="t"><tr><th>No</th><th>Müşteri</th><th>Tarih</th><th>Tutar</th><th>Durum</th><th></th></tr>${o.length ? o.slice(0, 30).map(x => `<tr><td><a class="pink" href="order.html?no=${x.no}">${x.no}</a></td><td>${esc(x.customer.name)}</td><td>${dateTR(x.date)}</td><td>${fmt(x.total)}</td><td><select class="inp" style="padding:8px" data-st="${x.no}">${STATUS.map((s, i) => `<option value="${i}" ${i === x.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td><td><button class="x" data-delo="${x.no}">×</button></td></tr>`).join('') : '<tr><td colspan="6" class="muted">Henüz sipariş yok. “Demo veri yükle”ye bas.</td></tr>'}</table></div></div>
  <div class="panel"><h3>Ürünler & Stok</h3><div class="tbl-wrap"><table class="t"><tr><th>Ürün</th><th>Kategori</th><th>Fiyat</th><th>Satış</th><th>Stok</th></tr>${top.map(p => `<tr><td>${esc(p.name)}</td><td>${catName(p.cat)}</td><td>${fmt(p.price)}</td><td>${p.sold}</td><td>${p.stock}</td></tr>`).join('')}</table></div><small class="muted">En çok satan 5 ürün gösteriliyor.</small></div>
  <div class="panel"><h3>Yeni ürün ekle</h3><form id="np" class="fgrid"><input class="inp" name="name" placeholder="Ürün adı" required><select class="inp" name="cat">${CATS.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select><input class="inp" name="price" type="number" min="1" placeholder="Fiyat (₺)" required><select class="inp" name="color">${Object.entries(C).map(([k, c]) => `<option value="${k}">${c.n}</option>`).join('')}</select><textarea class="inp full" name="desc" placeholder="Açıklama"></textarea><button class="btn full">Ürünü Ekle</button></form></div>
  <div class="panel"><h3>Gelen mesajlar (${msgs.length})</h3>${msgs.map(m => `<div class="rev"><b>${esc(m.name)}</b> <small class="muted">${esc(m.email)} · ${dateTR(m.date)}</small><p>${esc(m.message)}</p></div>`).join('') || '<p class="muted">Mesaj yok.</p>'}</div>`;
  setTimeout(() => $$('.chart i', root).forEach(i => i.style.height = i.dataset.h + '%'), 80);
  $('#logout').onclick = () => { sessionStorage.removeItem('azra_admin'); PAGES.admin(); };
  $('#demo').onclick = () => {
    const names = ['Ayşe Yılmaz', 'Elif Demir', 'Zeynep Kaya', 'Merve Çelik', 'Selin Aydın', 'Deniz Şahin', 'Ece Arslan'], list = getOrders();
    for (let i = 0; i < 14; i++) {
      const items = [...Array(1 + i % 3)].map((_, k) => { const p = PRODUCTS[(i * 5 + k * 3) % 24]; return { id: p.id, name: p.name, color: p.colors[0].n, size: 'M', qty: 1 + (k % 2), price: p.price }; });
      const sub = items.reduce((s, x) => s + x.price * x.qty, 0), ship = sub >= FREE_SHIP ? 0 : 49.9, d = new Date(); d.setDate(d.getDate() - i % 7);
      list.push({ no: 'AZ-D' + (1000 + i), date: d.toISOString(), status: i % 4, ship: 'standart', pay: 'kart', user: 'demo', customer: { name: names[i % 7], email: 'demo@azra.com', tel: '05320000000', il: 'İstanbul', ilce: 'Kadıköy', adres: 'Demo Mah. Pembe Sk. No:' + i }, items, sub, disc: 0, code: null, shipFee: ship, fee: 0, total: sub + ship });
    }
    LS.set('azra_orders', list); toast('14 demo sipariş eklendi'); PAGES.admin();
  };
  root.onchange = e => { if (e.target.dataset.st) { const l = getOrders(); l.find(x => x.no === e.target.dataset.st).status = +e.target.value; LS.set('azra_orders', l); toast('Sipariş durumu güncellendi'); } };
  root.onclick = e => { const d = e.target.closest('[data-delo]'); if (d && confirm('Sipariş silinsin mi?')) { LS.set('azra_orders', getOrders().filter(x => x.no !== d.dataset.delo)); PAGES.admin(); } };
  $('#np').onsubmit = e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); const ex = LS.get('azra_custom', []);
    const typeMap = { elbise: 'dress', ust: 'tshirt', alt: 'pants', dis: 'jacket', ayakkabi: 'shoe', aksesuar: 'bag' };
    const np = mk(100 + PRODUCTS.length + ex.length, d.name, d.cat, typeMap[d.cat], +d.price, null, [d.color], d.cat === 'ayakkabi' ? SHOE : d.cat === 'aksesuar' ? ONE : S, 5, 0, 0, d.desc || 'Yeni sezon ürünü.', 25);
    ex.push(np); LS.set('azra_custom', ex); toast('Ürün eklendi — mağazada görünür'); setTimeout(() => location.reload(), 700);
  };
};
