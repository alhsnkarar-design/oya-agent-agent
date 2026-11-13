/* Zifidit Store — client app.
   The catalog lives in /products.json and is intentionally empty. To add a product, append e.g.:
   { "id": "zf-001", "name": "Product name", "price": 21.64, "compareAt": 39.99, "category": "Smart Home",
     "images": ["/img/zf-001-1.webp", "/img/zf-001-2.webp"], "description": "Short description.",
     "details": ["Bullet one", "Bullet two"], "rating": 4.8, "reviews": 21, "stock": 50, "badge": "-45%" }  */
(function () {
  'use strict';

  var STORE = {
    name: 'Zifidit',
    currency: 'USD',
    freeShippingFrom: 0,          // 0 = free standard shipping on every order
    shippingFee: 4.99,
    returnDays: 30,
    dispatchDays: 2,
    payments: ['VISA', 'Mastercard', 'AMEX', 'Discover', 'PayPal', 'Apple Pay', 'Google Pay'],
    collections: [
      { name: 'New In', text: 'Fresh drops, first.', href: '/new', glyph: 'spark' },
      { name: 'Smart Home', text: 'Connected devices for every room.', href: '/shop?c=Smart%20Home', glyph: 'home' },
      { name: 'Phone & Charging', text: 'Power, cases and accessories.', href: '/shop?c=Phone%20%26%20Charging', glyph: 'bolt' },
      { name: 'Wearables & Audio', text: 'Smartwatches, earbuds and more.', href: '/shop?c=Wearables%20%26%20Audio', glyph: 'watch' }
    ]
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: STORE.currency });
  var money = function (n) { return fmt.format(n); };
  var moneyHtml = function (n) { var p = money(n).split('.'); return p[0] + (p[1] ? '<sup>.' + p[1] + '</sup>' : ''); };

  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  var products = [];
  var cart = ls.get('zf-cart', []);
  var wish = ls.get('zf-wish', []);
  var history_ = ls.get('zf-history', []);
  var main = $('#main');

  /* ---------- Data ---------- */
  function load() {
    return fetch('/products.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (list) {
        products = Array.isArray(list) ? list.filter(function (p) { return p && p.id && p.name && typeof p.price === 'number'; }) : [];
        cart = cart.filter(function (l) { return byId(l.id); });
        wish = wish.filter(byId);
        history_ = history_.filter(byId);
        save();
      });
  }
  function byId(id) { for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i]; return null; }
  function save() { ls.set('zf-cart', cart); ls.set('zf-wish', wish); ls.set('zf-history', history_); counts(); }
  function totals() {
    var sub = 0, qty = 0;
    cart.forEach(function (l) { var p = byId(l.id); if (p) { sub += p.price * l.qty; qty += l.qty; } });
    var ship = sub === 0 || sub >= STORE.freeShippingFrom ? 0 : STORE.shippingFee;
    return { sub: sub, qty: qty, ship: ship, total: sub + ship };
  }
  function counts() {
    var t = totals();
    $('#cartCount').textContent = t.qty; $('#cartCount').hidden = !t.qty;
    $('#wishCount').textContent = wish.length; $('#wishCount').hidden = !wish.length;
  }

  /* ---------- Actions ---------- */
  function addToCart(id, qty, buyNow) {
    var p = byId(id); if (!p || p.stock === 0) return;
    var max = typeof p.stock === 'number' ? p.stock : 99;
    var l = cart.filter(function (x) { return x.id === id; })[0];
    if (l) l.qty = Math.min(max, l.qty + (qty || 1)); else cart.push({ id: id, qty: Math.min(max, qty || 1) });
    save(); renderDrawer();
    if (buyNow) go('/checkout'); else { toast('Added to your bag'); openPanel('cart'); }
  }
  function setQty(id, q) {
    cart = cart.map(function (l) { return l.id === id ? { id: id, qty: q } : l; }).filter(function (l) { return l.qty > 0; });
    save(); renderDrawer(); if (route().name === 'cart') render();
  }
  function toggleWish(id) {
    var i = wish.indexOf(id);
    if (i > -1) { wish.splice(i, 1); toast('Removed from wishlist'); } else { wish.push(id); toast('Saved to wishlist'); }
    save(); if (route().name === 'wishlist') render();
  }

  /* ---------- Icons & pieces ---------- */
  var I = {
    heart: function (on) { return '<svg viewBox="0 0 24 24" style="' + (on ? 'fill:#FF4D8D;stroke:#FF4D8D' : '') + '"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>'; },
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    bagPlus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2M12 11v6M9 14h6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };
  var ART = {
    shelf: '<svg class="empty-art" viewBox="0 0 132 100" aria-hidden="true"><path d="M10 34h112M10 70h112M16 34v60M116 34v60"/><rect class="hl" x="26" y="12" width="22" height="22" rx="4"/><path class="hl" d="M58 18h16M58 25h10"/><path d="M28 50h16v20H28zM54 56h12v14H54zM82 48h20v22H82z" stroke-dasharray="3 4"/></svg>',
    bag: '<svg class="empty-art" viewBox="0 0 132 100" aria-hidden="true"><path d="M38 32h56l-4 58H42z"/><path class="hl" d="M52 40V28a14 14 0 0 1 28 0v12"/><path d="M54 64h24" stroke-dasharray="3 4"/></svg>',
    heart: '<svg class="empty-art" viewBox="0 0 132 100" aria-hidden="true"><path class="hl" d="M66 84S32 64 32 40a16 16 0 0 1 34-7 16 16 0 0 1 34 7c0 24-34 44-34 44Z"/></svg>',
    search: '<svg class="empty-art" viewBox="0 0 132 100" aria-hidden="true"><circle class="hl" cx="58" cy="44" r="24"/><path d="m76 62 22 22"/><path d="M48 44h20" stroke-dasharray="3 4"/></svg>',
    box: '<svg class="empty-art" viewBox="0 0 132 100" aria-hidden="true"><path d="M22 32 66 16l44 16v42L66 92 22 74z"/><path d="M22 32l44 18 44-18M66 50v42"/><path class="hl" d="M44 24l44 17"/></svg>',
    ticket: '<svg class="empty-art" viewBox="0 0 132 100" aria-hidden="true"><path d="M20 28h92v14a8 8 0 0 0 0 16v14H20V58a8 8 0 0 0 0-16z"/><path class="hl" d="M80 28v44" stroke-dasharray="4 4"/><path d="M36 46h28M36 56h18"/></svg>',
    clock: '<svg class="empty-art" viewBox="0 0 132 100" aria-hidden="true"><circle cx="66" cy="50" r="34"/><path class="hl" d="M66 30v20l14 9"/></svg>'
  };
  var GLYPH = {
    spark: '<svg class="glyph" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8c4 22 20 38 42 42-22 4-38 20-42 42-4-22-20-38-42-42 22-4 38-20 42-42Z"/><circle cx="82" cy="18" r="6"/></svg>',
    home: '<svg class="glyph" viewBox="0 0 100 100" aria-hidden="true"><path d="M14 46 50 16l36 30v40H14z"/><path d="M40 86V60h20v26"/><circle cx="50" cy="40" r="5"/></svg>',
    bolt: '<svg class="glyph" viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="10" width="56" height="82" rx="12"/><path d="M54 26 38 54h14l-6 22 18-30H50z"/></svg>',
    watch: '<svg class="glyph" viewBox="0 0 100 100" aria-hidden="true"><path d="M36 22l4-14h20l4 14M36 78l4 14h20l4-14"/><rect x="24" y="22" width="52" height="56" rx="14"/><path d="M50 36v14l9 6"/></svg>'
  };
  function empty(art, title, text, actions) {
    return '<div class="empty">' + ART[art] + '<h3>' + title + '</h3><p>' + text + '</p>' + (actions ? '<div class="actions">' + actions + '</div>' : '') + '</div>';
  }
  function crumbs(items) {
    return '<nav class="crumbs" aria-label="Breadcrumb"><a href="/" data-link>Home</a>' +
      items.map(function (i) { return '<span aria-hidden="true">/</span>' + (i[1] ? '<a href="' + i[1] + '" data-link>' + i[0] + '</a>' : '<span>' + i[0] + '</span>'); }).join('') + '</nav>';
  }
  function head(title, trail, sub) {
    return '<div class="wrap page-head">' + crumbs(trail) + '<h1>' + title + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div>';
  }
  function secTitle(t) { return '<div class="sec-title"><h2>' + t + '</h2></div>'; }
  function priceHtml(p) {
    var sale = p.compareAt > p.price;
    return '<span class="price num' + (sale ? ' sale' : '') + '">' + moneyHtml(p.price) + (sale ? '<s>' + money(p.compareAt) + '</s>' : '') + '</span>';
  }
  function card(p) {
    var img = (p.images && p.images[0]) || '', on = wish.indexOf(p.id) > -1, url = '/product/' + encodeURIComponent(p.id);
    return '<article class="card">' +
      '<a href="' + url + '" data-link class="card-media">' + (img ? '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" loading="lazy">' : '') +
        (p.badge ? '<span class="card-badge">' + esc(p.badge) + '</span>' : '') + '</a>' +
      '<button class="icon-btn card-wish" data-wish="' + esc(p.id) + '" aria-pressed="' + on + '" aria-label="Save to wishlist">' + I.heart(on) + '</button>' +
      '<a href="' + url + '" data-link><h3>' + esc(p.name) + '</h3></a>' +
      '<div class="card-meta"><span class="free">' + (STORE.freeShippingFrom === 0 ? 'Free Shipping' : '') + '</span>' +
        (p.rating ? '<span class="rating">' + I.star + esc(p.rating) + '</span>' : '') + '</div>' +
      '<div class="card-foot">' + priceHtml(p) +
        '<button class="icon-btn add-mini" data-add="' + esc(p.id) + '" aria-label="Add to bag"' + (p.stock === 0 ? ' disabled' : '') + '>' + I.bagPlus + '</button></div>' +
    '</article>';
  }
  function grid(list) { return '<div class="grid">' + list.map(card).join('') + '</div>'; }
  function noProducts() {
    return empty('shelf', 'Our first collection is on its way',
      'We’re putting the finishing touches on our launch lineup. Join the list and we’ll let you know the moment it drops — with 10% off your first order.',
      '<a class="btn btn-dark" href="#nlTitle" data-scroll>Notify me at launch</a><a class="btn btn-line" href="/contact" data-link>Ask a question</a>');
  }

  /* ---------- Pages ---------- */
  var pages = {};

  pages.home = function () {
    var latest = products.slice(-8).reverse();
    return '' +
    '<section class="hero"><div class="wrap hero-in">' +
      '<div>' +
        '<p class="eyebrow">New season · ' + new Date().getFullYear() + '</p>' +
        '<h1>Smart gadgets that <span class="grad">make life easier.</span></h1>' +
        '<p class="hero-sub">Electronics and smart devices we test before we sell, so they simply work. Dispatched in under ' + STORE.dispatchDays + ' days, with ' + STORE.returnDays + '-day returns on every order.</p>' +
        '<div class="hero-cta"><a class="btn btn-dark" href="/shop" data-link>Shop now ' + I.arrow + '</a><a class="btn btn-line" href="/about" data-link>Our story</a></div>' +
        '<div class="hero-meta"><span>' + I.check + 'Free shipping</span><span>' + I.check + STORE.returnDays + '-day returns</span><span>' + I.check + 'Secure checkout</span></div>' +
      '</div>' +
      '<div class="hero-art" aria-hidden="true"><div class="orb"></div>' +
        '<div class="float-card fc-1"><span class="ic"><svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg></span><span>Fast dispatch<small>Ships in under ' + STORE.dispatchDays + ' days</small></span></div>' +
        '<div class="float-card fc-2"><span class="ic"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span><span>Secure payments<small>256-bit SSL checkout</small></span></div>' +
        '<div class="float-card fc-3"><span class="ic"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></svg></span><span>' + STORE.returnDays + '-day returns<small>No questions asked</small></span></div>' +
      '</div>' +
    '</div></section>' +

    '<section class="section"><div class="wrap">' + secTitle('Shop by Collection') +
      '<div class="cats">' + STORE.collections.map(function (c) {
        return '<a class="cat" href="' + c.href + '" data-link><div><h3>' + c.name + '</h3><p>' + c.text + '</p></div>' + GLYPH[c.glyph] +
          '<span class="go">Explore <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>';
      }).join('') + '</div>' +
    '</div></section>' +

    '<section class="section" style="padding-top:0"><div class="wrap">' + secTitle('New Arrivals') +
      (latest.length ? grid(latest) + '<div style="display:flex;justify-content:center;margin-top:40px"><a class="btn btn-line" href="/shop" data-link>View All ' + I.arrow + '</a></div>' : noProducts()) +
    '</div></section>' +

    '<section class="section" style="padding-top:0"><div class="wrap"><div class="story">' +
      '<span class="quote q1" aria-hidden="true">“</span><span class="quote q2" aria-hidden="true">“</span>' +
      '<h2>The Story of Us</h2>' +
      '<div class="story-list">' +
        '<div><b>01</b><p>We arrange dispatch in less than ' + STORE.dispatchDays + ' days, saving you both time and money.</p></div>' +
        '<div><b>02</b><p>Every product is tested by our team before it reaches the store. If we wouldn’t use it, we don’t sell it.</p></div>' +
        '<div><b>03</b><p>No minimum order, no hidden fees. The price you see is the price you pay.</p></div>' +
      '</div>' +
      '<a class="btn btn-line" href="/about" data-link>View More ' + I.arrow + '</a>' +
    '</div></div></section>' +

    '<section class="section" style="padding-top:0"><div class="wrap">' + secTitle('Our Service') +
      '<div class="services">' +
        service('<rect x="8" y="14" width="48" height="32" rx="3"/><path d="M4 50h56"/><path class="hl" d="M38 20l8 4-6 12-8-4zM41 28h.01"/>', 'Transaction protection', 'Your payment is protected from checkout to delivery.') +
        service('<path d="M10 44h10l14 4h12a4 4 0 0 0 0-8H34"/><path d="M20 40l10-4h10M46 44l10-6a3 3 0 0 1 4 4L46 54H22"/><path class="hl" d="M38 28s-10-6-10-12a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 6-10 12-10 12Z"/>', 'Reliable after-sale services', 'Real people who reply within one business day.') +
        service('<path d="M8 38l40-20 6 6-34 26-6-6z"/><path d="M20 30l-8-10 6-2 14 6M34 40l4 12 4-2 2-14"/><path class="hl" d="M50 46h8v8h-8z"/>', 'Fast shipping', 'Dispatched in under ' + STORE.dispatchDays + ' days with tracking.') +
        service('<path d="M32 6l20 8v14c0 14-9 24-20 30C21 52 12 42 12 28V14z"/><path class="hl" d="m24 31 6 6 11-12"/>', STORE.returnDays + '-day returns', 'Changed your mind? Send it back, hassle free.') +
      '</div>' +
    '</div></section>' +

    '<section class="section" style="padding-top:0"><div class="wrap"><div class="promo">' +
      '<h2>Find more collections</h2><p>Browse everything in the store, from new arrivals to our customer favourites.</p>' +
      '<a class="btn btn-light" href="/shop" data-link>View all ' + I.arrow + '</a>' +
    '</div></div></section>';
  };
  function service(path, h, p) { return '<div class="service"><svg viewBox="0 0 64 64" aria-hidden="true">' + path + '</svg><h3>' + h + '</h3><p>' + p + '</p></div>'; }

  var shopState = { sort: 'featured', cat: '' };
  function listing(title, trail, list, sub) {
    var cats = [];
    products.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    var shown = list.filter(function (p) { return !shopState.cat || p.category === shopState.cat; });
    if (shopState.sort === 'low') shown.sort(function (a, b) { return a.price - b.price; });
    else if (shopState.sort === 'high') shown.sort(function (a, b) { return b.price - a.price; });
    else if (shopState.sort === 'new') shown.reverse();
    var body = !products.length ? noProducts() : !shown.length ? empty('search', 'Nothing here yet', 'No products match this collection right now.', '<button class="btn btn-line" id="clearFilters">Show everything</button>') : grid(shown);
    return head(title, trail, sub) +
    '<div class="wrap" style="padding-bottom:80px">' +
      '<div class="toolbar"><div class="chips">' +
        '<button class="chip" data-cat="" aria-pressed="' + !shopState.cat + '">All</button>' +
        (cats.length ? cats : STORE.collections.slice(1).map(function (c) { return c.name; })).map(function (c) { return '<button class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (shopState.cat === c) + '">' + esc(c) + '</button>'; }).join('') +
      '</div><label style="display:flex;gap:10px;align-items:center"><span class="num">' + shown.length + ' products</span><select class="select" id="fSort" aria-label="Sort by">' +
        [['featured', 'Featured'], ['new', 'Newest'], ['low', 'Price: Low to High'], ['high', 'Price: High to Low']].map(function (o) { return '<option value="' + o[0] + '"' + (shopState.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
      '</select></label></div>' + body +
    '</div>';
  }
  pages.shop = function () { return listing('Shop All', [['Shop All']], products.slice()); };
  pages['new'] = function () { return listing('New Arrivals', [['New']], products.slice(-24), 'The latest additions to the Zifidit store.'); };

  pages.product = function (id) {
    var p = byId(id);
    if (!p) return head('Product unavailable', [['Shop', '/shop'], ['Product']]) +
      '<div class="wrap" style="padding-bottom:80px">' + empty('box', 'We couldn’t find this product', 'It may have sold out or been removed. Browse the store to see what’s available.', '<a class="btn btn-dark" href="/shop" data-link>Back to shop</a>') + '</div>';
    if (history_.indexOf(p.id) < 0) { history_.unshift(p.id); history_ = history_.slice(0, 24); save(); }
    var imgs = p.images && p.images.length ? p.images : [''], on = wish.indexOf(p.id) > -1;
    var stars = ''; for (var i = 0; i < 5; i++) stars += I.star;
    return '<div class="wrap page-head" style="padding-bottom:0">' + crumbs([['Shop', '/shop'], [esc(p.name)]]) + '</div>' +
    '<div class="wrap product">' +
      '<div style="min-width:0"><div class="gallery-main">' + (imgs[0] ? '<img id="pMain" src="' + esc(imgs[0]) + '" alt="' + esc(p.name) + '">' : '') + '</div>' +
        (imgs.length > 1 ? '<div class="thumbs">' + imgs.map(function (src, i) { return '<button data-thumb="' + esc(src) + '" aria-current="' + (i === 0) + '" aria-label="Image ' + (i + 1) + '"><img src="' + esc(src) + '" alt=""></button>'; }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="p-info">' +
        '<h1>' + esc(p.name) + '</h1>' +
        '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">' + priceHtml(p) + (STORE.freeShippingFrom === 0 ? '<span class="free">Free Shipping</span>' : '') + '</div>' +
        (p.description ? '<p style="color:var(--ink-2)">' + esc(p.description) + '</p>' : '') +
        (p.stock === 0 ? '<p style="color:var(--sale);font-weight:600">Sold out</p>' : typeof p.stock === 'number' && p.stock <= 5 ? '<p style="color:var(--sale);font-weight:600">Only ' + p.stock + ' left</p>' : '') +
        '<div style="display:flex;gap:10px;align-items:center"><div class="qty"><button type="button" data-q="-1" aria-label="Decrease">−</button><span class="num" id="pQty">1</span><button type="button" data-q="1" aria-label="Increase">+</button></div>' +
          '<button class="icon-btn" style="border:1.5px solid var(--line);width:52px;height:52px;border-radius:10px" data-wish="' + esc(p.id) + '" aria-pressed="' + on + '" aria-label="Save to wishlist">' + I.heart(on) + '</button></div>' +
        '<button class="btn btn-dark btn-block" id="pBuy"' + (p.stock === 0 ? ' disabled' : '') + '>Buy Now</button>' +
        '<button class="btn btn-line btn-block" id="pAdd"' + (p.stock === 0 ? ' disabled' : '') + '>+ Add to Cart</button>' +
        '<div class="pay-row"><span>Payments</span>' + STORE.payments.map(function (x) { return '<span class="pay">' + x + '</span>'; }).join('') + '</div>' +
        '<div class="bulk"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12 12 20 4 12V4h8z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg><div><b>Buy more, pay less!</b><small>Multi-buy discounts apply automatically at checkout.</small></div></div>' +
        '<div class="perks"><div><svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>Fast Shipping</div><div><svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v8M10 10h3a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3h3"/></svg>' + STORE.returnDays + '-Day Returns</div><div><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M3 9h18"/><rect x="14" y="13" width="7" height="6" rx="1"/></svg>Secured Payments</div></div>' +
        (p.rating ? '<div class="score"><b class="num">' + esc(p.rating) + '</b><div style="display:grid;justify-items:end;gap:8px"><div class="stars">' + stars + '</div><span style="text-decoration:underline">' + (p.reviews || 0) + ' Reviews</span></div></div>' : '') +
        (p.details && p.details.length ? '<div>' + secTitle('Details') + '<ol style="padding-left:20px;color:var(--ink-2);display:grid;gap:8px;margin:0">' + p.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ol></div>' : '') +
      '</div>' +
    '</div>' +
    '<div class="buy-bar" id="buyBar"><div class="wrap"><img src="' + esc(imgs[0]) + '" alt=""><div class="t"><h4>' + esc(p.name) + '</h4>' + priceHtml(p) + '</div><button class="btn btn-dark" data-buy="' + esc(p.id) + '"' + (p.stock === 0 ? ' disabled' : '') + '>Buy Now</button></div></div>';
  };

  pages.cart = function () {
    var t = totals();
    if (!cart.length) return head('Your Bag', [['Bag']]) + '<div class="wrap" style="padding-bottom:80px">' +
      empty('bag', 'Your bag is empty', products.length ? 'Looks like you haven’t added anything yet.' : 'The store is getting ready for launch. Join the list to hear when it opens.', '<a class="btn btn-dark" href="/shop" data-link>Continue shopping</a>') + '</div>';
    return head('Your Bag', [['Bag']], t.qty + (t.qty === 1 ? ' item' : ' items')) +
      '<div class="wrap two-col"><div style="min-width:0">' + cart.map(lineItem).join('') + '</div>' + summary(t, true) + '</div>';
  };
  function lineItem(l) {
    var p = byId(l.id); if (!p) return '';
    return '<div class="line-item"><img src="' + esc((p.images || [])[0] || '') + '" alt="">' +
      '<div style="min-width:0;display:grid;gap:8px"><h3>' + esc(p.name) + '</h3>' +
        '<div style="display:flex;gap:14px;align-items:center"><div class="qty"><button data-dec="' + esc(p.id) + '" aria-label="Decrease">−</button><span class="num">' + l.qty + '</span><button data-inc="' + esc(p.id) + '" aria-label="Increase">+</button></div>' +
        '<button class="rm" data-rm="' + esc(p.id) + '">Remove</button></div></div>' +
      '<span class="price num" style="font-size:17px">' + money(p.price * l.qty) + '</span></div>';
  }
  function summary(t, cta) {
    return '<aside class="summary"><h2>Order Summary</h2>' +
      '<div class="sum-row"><span>Subtotal</span><span class="num">' + money(t.sub) + '</span></div>' +
      '<div class="sum-row"><span>Shipping</span><span class="num">' + (t.ship ? money(t.ship) : 'Free') + '</span></div>' +
      '<div class="sum-row total"><span>Total</span><span class="num">' + money(t.total) + '</span></div>' +
      (cta ? '<a class="btn btn-dark btn-block" href="/checkout" data-link>Checkout</a>' : '') +
      '<p class="secure">' + I.lock + 'Secure checkout · ' + STORE.returnDays + '-day returns</p></aside>';
  }

  pages.checkout = function () {
    var t = totals();
    if (!cart.length) return head('Checkout', [['Bag', '/cart'], ['Checkout']]) + '<div class="wrap" style="padding-bottom:80px">' +
      empty('bag', 'Nothing to check out yet', 'Add at least one product to your bag first.', '<a class="btn btn-dark" href="/shop" data-link>Browse the store</a>') + '</div>';
    return head('Checkout', [['Bag', '/cart'], ['Checkout']]) +
    '<form class="wrap two-col" id="checkoutForm" novalidate><div style="display:grid;gap:20px;min-width:0">' +
      '<div class="panel"><h2>Contact</h2><div class="form-grid">' +
        field('cEmail', 'Email', 'email', 'email', true, 'full') + field('cName', 'Full name', 'text', 'name', true) + field('cPhone', 'Phone', 'tel', 'tel', true) +
      '</div></div>' +
      '<div class="panel"><h2>Shipping address</h2><div class="form-grid">' +
        field('cCountry', 'Country', 'text', 'country-name', true) + field('cCity', 'City', 'text', 'address-level2', true) +
        field('cAddr', 'Address', 'text', 'street-address', true, 'full') + field('cState', 'State / Region', 'text', 'address-level1', false) + field('cZip', 'Postal code', 'text', 'postal-code', false) +
      '</div></div>' +
      '<div class="panel"><h2>Payment</h2><p style="color:var(--ink-2)">After you place your order we email you a secure payment link (card, PayPal, Apple Pay or Google Pay). Your order ships once payment is confirmed.</p><div class="pay-row">' + STORE.payments.map(function (x) { return '<span class="pay">' + x + '</span>'; }).join('') + '</div></div>' +
    '</div><div>' + summary(t, false).replace('</aside>', '<button class="btn btn-dark btn-block" type="submit" id="placeOrder">Place order</button><p class="form-msg" id="coMsg" role="status"></p></aside>') + '</div></form>';
  };
  function field(id, label, type, ac, req, cls) {
    return '<div class="' + (cls || '') + '"><label class="lbl" for="' + id + '">' + label + (req ? '' : ' <span style="color:var(--ink-3);font-weight:400">(optional)</span>') + '</label><input class="input" id="' + id + '" type="' + type + '" autocomplete="' + ac + '"' + (req ? ' required' : '') + '></div>';
  }
  pages.done = function (ref) {
    return head('Thank you!', [['Order placed']]) + '<div class="wrap" style="padding-bottom:80px">' +
      empty('box', 'Order <span class="num">' + esc(ref) + '</span> received', 'We’ve sent a secure payment link to your email. Keep your order number to track it anytime.', '<a class="btn btn-dark" href="/orders" data-link>Track my order</a><a class="btn btn-line" href="/shop" data-link>Keep shopping</a>') + '</div>';
  };

  pages.wishlist = function () {
    var list = wish.map(byId).filter(Boolean);
    return head('Wishlist', [['Wishlist']]) + '<div class="wrap" style="padding-bottom:80px">' +
      (list.length ? grid(list) : empty('heart', 'Your wishlist is empty', 'Tap the heart on any product to save it here for later.', '<a class="btn btn-dark" href="/shop" data-link>Explore the store</a>')) + '</div>';
  };
  pages.history = function () {
    var list = history_.map(byId).filter(Boolean);
    return head('Browsing History', [['Browsing History']]) + '<div class="wrap" style="padding-bottom:80px">' +
      (list.length ? grid(list) : empty('clock', 'No browsing history yet', 'Products you view will appear here so you can find them again.', '<a class="btn btn-dark" href="/shop" data-link>Start browsing</a>')) + '</div>';
  };
  pages.coupons = function () {
    return head('My Coupons', [['My Coupons']]) + '<div class="wrap" style="padding-bottom:80px">' +
      empty('ticket', 'No coupons yet', 'Join our mailing list to get 10% off your first order, sent straight to your inbox.', '<a class="btn btn-dark" href="#nlTitle" data-scroll>Get my 10% off</a>') + '</div>';
  };
  pages.orders = function () {
    return head('My Orders', [['My Orders']], 'Enter your order number and the email you used at checkout.') +
    '<div class="wrap" style="padding-bottom:80px"><form class="panel" id="trackForm" novalidate style="max-width:640px"><div class="form-grid">' +
      field('tRef', 'Order number', 'text', 'off', true) + field('tEmail', 'Email', 'email', 'email', true) +
    '</div><button class="btn btn-dark" type="submit" style="justify-self:start">Track order</button><p class="form-msg" id="trMsg" role="status"></p></form></div>';
  };
  pages.contact = function () {
    return head('Contact Us', [['Contact Us']], 'Questions about a product or an order? We reply within one business day.') +
    '<div class="wrap contact-grid">' +
      '<div class="contact-cards">' +
        '<div><h3>Order support</h3><p>Include your order number and we’ll get to it faster. You can also <a href="/orders" data-link style="text-decoration:underline">track your order</a>.</p></div>' +
        '<div><h3>Returns</h3><p>Start a return within ' + STORE.returnDays + ' days of delivery. See our <a href="/returns" data-link style="text-decoration:underline">return policy</a>.</p></div>' +
        '<div><h3>Response time</h3><p>Monday to Saturday. Most messages are answered within 24 hours.</p></div>' +
      '</div>' +
      '<form class="panel" id="contactForm" novalidate><div class="form-grid">' +
        field('kName', 'Name', 'text', 'name', true) + field('kEmail', 'Email', 'email', 'email', true) +
        '<div class="full"><label class="lbl" for="kTopic">Topic</label><select class="input" id="kTopic"><option>Product question</option><option>Existing order</option><option>Returns &amp; refunds</option><option>Business inquiry</option><option>Other</option></select></div>' +
        '<div class="full"><label class="lbl" for="kMsg">Message</label><textarea class="input" id="kMsg" required></textarea></div>' +
      '</div><button class="btn btn-dark" type="submit" style="justify-self:start">Send message</button><p class="form-msg" id="kStatus" role="status"></p></form>' +
    '</div>';
  };

  var PROSE = {
    about: ['About Us', '<p>Zifidit started with a simple idea: technology should make life easier, not more complicated. We search for smart, well-made gadgets and electronics, test them ourselves, and only list the ones we’d happily use at home.</p><h2>What we promise</h2><ul><li>Dispatch in under ' + STORE.dispatchDays + ' days, with tracking on every order.</li><li>Honest descriptions and real photos.</li><li>No minimum order and no hidden fees.</li><li>' + STORE.returnDays + '-day returns if something isn’t right.</li></ul>'],
    shipping: ['Shipping Policy', '<ul><li>Orders are processed and dispatched within ' + STORE.dispatchDays + ' business days.</li><li>Standard shipping is free on every order.</li><li>Typical delivery time is 7–15 business days depending on destination.</li><li>You’ll receive a tracking number by email as soon as your order ships.</li><li>Import duties or taxes, where applicable, are the responsibility of the customer.</li></ul>'],
    returns: ['Return Policy', '<ul><li>You can return any item within ' + STORE.returnDays + ' days of delivery.</li><li>Items must be unused and in their original packaging.</li><li>If an item arrives damaged or not as described, we cover return shipping and send a replacement or full refund.</li><li>Refunds are issued to your original payment method within 5–10 business days of receiving the return.</li><li>To start a return, <a href="/contact" data-link>contact us</a> with your order number.</li></ul>'],
    privacy: ['Privacy Policy', '<p>We only collect what we need to process and deliver your order: your name, email, phone and shipping address.</p><ul><li>We never sell your personal data.</li><li>We share it only with payment and shipping partners to complete your order.</li><li>Your bag, wishlist and browsing history are stored in your own browser.</li><li>You can ask us to delete your data at any time through the contact page.</li></ul>'],
    terms: ['Terms & Conditions', '<ul><li>All prices are listed in US dollars (USD).</li><li>An order is confirmed once payment has been received.</li><li>If an item becomes unavailable after you order, we’ll notify you and issue a full refund.</li><li>Product images are for illustration; minor variations in colour may occur.</li><li>By using this website you agree to these terms.</li></ul>'],
    payment: ['Payment Methods', '<p>We support the following payment methods through our secure payment partners:</p><ul>' + STORE.payments.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul><p>All payments are encrypted with 256-bit SSL. We never see or store your full card details.</p>'],
    faq: ['FAQ', '<div class="faq">' + [
      ['When will products be available?', 'Our first collection is launching soon. Join the mailing list at the bottom of the page and we’ll email you on launch day.'],
      ['How long does shipping take?', 'Orders are dispatched within ' + STORE.dispatchDays + ' business days. Delivery usually takes 7–15 business days.'],
      ['Is shipping free?', 'Yes. Standard shipping is free on every order.'],
      ['Can I return an item?', 'Yes, within ' + STORE.returnDays + ' days of delivery, as long as it’s unused and in its original packaging.'],
      ['Which payment methods do you accept?', STORE.payments.join(', ') + '.'],
      ['Do I need an account to order?', 'No. You can check out with just your email and shipping address.']
    ].map(function (q) { return '<details><summary>' + q[0] + '</summary><p>' + q[1] + '</p></details>'; }).join('') + '</div>']
  };
  Object.keys(PROSE).forEach(function (k) {
    pages[k] = function () { return head(PROSE[k][0], [[PROSE[k][0]]]) + '<div class="wrap"><div class="prose">' + PROSE[k][1] + '</div></div>'; };
  });
  pages.notfound = function () {
    return head('Page not found', [['404']]) + '<div class="wrap" style="padding-bottom:80px">' +
      empty('search', 'This page doesn’t exist', 'The link may be broken or the page may have moved.', '<a class="btn btn-dark" href="/" data-link>Go home</a>') + '</div>';
  };

  /* ---------- Router ---------- */
  var TITLES = { shop: 'Shop All', 'new': 'New Arrivals', cart: 'Your Bag', checkout: 'Checkout', wishlist: 'Wishlist', history: 'Browsing History', coupons: 'My Coupons', orders: 'My Orders', contact: 'Contact Us', about: 'About Us', shipping: 'Shipping Policy', returns: 'Return Policy', privacy: 'Privacy Policy', terms: 'Terms & Conditions', payment: 'Payment Methods', faq: 'FAQ', done: 'Order placed', notfound: 'Page not found' };
  function route() {
    var parts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    if (!parts.length) return { name: 'home' };
    if (parts[0] === 'product' && parts[1]) return { name: 'product', arg: decodeURIComponent(parts[1]) };
    if (parts[0] === 'order' && parts[1]) return { name: 'done', arg: decodeURIComponent(parts[1]) };
    return TITLES[parts[0]] && parts[0] !== 'done' && parts[0] !== 'notfound' ? { name: parts[0] } : { name: 'notfound' };
  }
  function render() {
    var r = route();
    var c = new URLSearchParams(location.search).get('c');
    if (r.name === 'shop' && c !== null) shopState.cat = c;
    main.innerHTML = pages[r.name](r.arg);
    var p = r.name === 'product' && byId(r.arg);
    document.title = r.name === 'home' ? 'Zifidit — Smart Gadgets & Electronics' : (p ? p.name : TITLES[r.name]) + ' — Zifidit';
    $$('.main-nav a').forEach(function (a) { if (a.dataset.nav === r.name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.body.classList.remove('has-bar');
    bind(r);
  }
  function go(href) {
    history.pushState(null, '', href);
    render(); window.scrollTo(0, 0); closeAll();
    main.focus({ preventScroll: true });
  }

  /* ---------- Bindings ---------- */
  function post(url, data) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.'); return j; }); }, function () { throw new Error('Can’t reach the server. Check your connection and try again.'); });
  }
  function msg(el, text, ok) { el.textContent = text; el.className = 'form-msg ' + (ok ? 'ok' : 'err'); }
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

  function bind(r) {
    if (r.name === 'shop' || r.name === 'new') {
      $('#fSort').addEventListener('change', function () { shopState.sort = this.value; render(); });
      $$('[data-cat]').forEach(function (b) { b.addEventListener('click', function () { shopState.cat = b.dataset.cat; render(); }); });
      var cf = $('#clearFilters'); if (cf) cf.addEventListener('click', function () { shopState.cat = ''; render(); });
    }
    if (r.name === 'product' && byId(r.arg)) {
      var p = byId(r.arg), q = 1, max = typeof p.stock === 'number' ? p.stock : 99;
      $$('[data-q]').forEach(function (b) { b.addEventListener('click', function () { q = Math.max(1, Math.min(max, q + +b.dataset.q)); $('#pQty').textContent = q; }); });
      $('#pAdd').addEventListener('click', function () { addToCart(p.id, q); });
      $('#pBuy').addEventListener('click', function () { addToCart(p.id, q, true); });
      $$('[data-thumb]').forEach(function (b) { b.addEventListener('click', function () { $('#pMain').src = b.dataset.thumb; $$('[data-thumb]').forEach(function (x) { x.setAttribute('aria-current', x === b); }); }); });
      var bar = $('#buyBar'), target = $('#pBuy');
      if ('IntersectionObserver' in window) new IntersectionObserver(function (e) {
        var show = !e[0].isIntersecting && e[0].boundingClientRect.top < 0;
        bar.classList.toggle('show', show); document.body.classList.toggle('has-bar', show);
      }).observe(target);
    }
    if (r.name === 'checkout' && cart.length) {
      $('#checkoutForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var m = $('#coMsg'), btn = $('#placeOrder'), v = function (id) { return $('#' + id).value.trim(); };
        var d = { email: v('cEmail'), name: v('cName'), phone: v('cPhone'), country: v('cCountry'), city: v('cCity'), address: v('cAddr'), state: v('cState'), zip: v('cZip'), items: cart };
        if (!emailOk(d.email)) return msg(m, 'Enter a valid email address.');
        if (!d.name || !d.phone || !d.country || !d.city || !d.address) return msg(m, 'Fill in your name, phone, country, city and address.');
        btn.disabled = true; msg(m, 'Placing your order…', true);
        post('/api/order', d).then(function (j) { cart = []; save(); renderDrawer(); go('/order/' + j.ref); })
          .catch(function (err) { btn.disabled = false; msg(m, err.message); });
      });
    }
    if (r.name === 'orders') {
      $('#trackForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var m = $('#trMsg'), ref = $('#tRef').value.trim().toUpperCase(), em = $('#tEmail').value.trim();
        if (!ref || !emailOk(em)) return msg(m, 'Enter your order number and the email used at checkout.');
        msg(m, 'Looking up your order…', true);
        post('/api/track', { ref: ref, email: em }).then(function (j) { msg(m, 'Order ' + ref + ': ' + j.status, true); }).catch(function (err) { msg(m, err.message); });
      });
    }
    if (r.name === 'contact') {
      $('#contactForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var m = $('#kStatus'), d = { name: $('#kName').value.trim(), email: $('#kEmail').value.trim(), topic: $('#kTopic').value, message: $('#kMsg').value.trim() };
        if (!d.name || !emailOk(d.email) || d.message.length < 5) return msg(m, 'Add your name, a valid email and a message.');
        msg(m, 'Sending…', true);
        post('/api/contact', d).then(function () { e.target.reset(); msg(m, 'Thanks! We’ll reply within one business day.', true); }).catch(function (err) { msg(m, err.message); });
      });
    }
  }

  /* ---------- Panels ---------- */
  function renderDrawer() {
    var t = totals();
    $('#drawerBody').innerHTML = cart.length ? cart.map(lineItem).join('') :
      empty('bag', 'Your bag is empty', products.length ? 'Add something you love.' : 'Our first collection is launching soon.', '<a class="btn btn-line" href="/shop" data-link>Shop now</a>');
    $('#drawerFoot').innerHTML = cart.length ? '<div class="sum-row total"><span>Subtotal</span><span class="num">' + money(t.sub) + '</span></div><a class="btn btn-dark btn-block" href="/checkout" data-link>Checkout</a><a class="btn btn-line btn-block" href="/cart" data-link>View bag</a>' : '';
  }
  var lastFocus = null;
  function openPanel(which) {
    closeAll(true); lastFocus = document.activeElement;
    var el = which === 'cart' ? $('#cartDrawer') : $('#sideMenu');
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); $('#scrim').hidden = false;
    $('#menuBtn').setAttribute('aria-expanded', which === 'menu');
    (which === 'cart' ? $('#cartClose') : $('#sideClose')).focus();
  }
  function closeAll(keepFocus) {
    ['#cartDrawer', '#sideMenu'].forEach(function (s) { $(s).classList.remove('open'); $(s).setAttribute('aria-hidden', 'true'); });
    $('#scrim').hidden = true; $('#searchLayer').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false');
    if (!keepFocus && lastFocus && document.contains(lastFocus)) { lastFocus.focus(); lastFocus = null; }
  }
  function openSearch(q) { closeAll(true); $('#searchLayer').hidden = false; $('#searchInput').value = q || ''; doSearch(); $('#searchInput').focus(); }
  function doSearch() {
    var q = $('#searchInput').value.trim().toLowerCase(), out = $('#searchResults');
    if (!products.length) { out.innerHTML = empty('search', 'Nothing to search yet', 'Search will light up as soon as our first products go live.'); return; }
    if (!q) { out.innerHTML = '<p style="color:var(--ink-3)">Type a product name or category.</p>'; return; }
    var hits = products.filter(function (p) { return (p.name + ' ' + (p.category || '') + ' ' + (p.description || '')).toLowerCase().indexOf(q) > -1; });
    out.innerHTML = hits.length ? grid(hits.slice(0, 12)) : empty('search', 'No results for “' + esc(q) + '”', 'Try a shorter word or browse the full store.');
  }
  var tt;
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('show'); }, 2200); }

  /* ---------- Global events ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-link]');
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); go(a.getAttribute('href')); return; }
    if (e.target.closest('[data-scroll]')) { e.preventDefault(); closeAll(true); $('.newsletter').scrollIntoView({ behavior: 'smooth' }); setTimeout(function () { $('#nlEmail').focus({ preventScroll: true }); }, 450); return; }
    var b;
    if ((b = e.target.closest('[data-add]'))) addToCart(b.dataset.add, 1);
    else if ((b = e.target.closest('[data-buy]'))) addToCart(b.dataset.buy, 1, true);
    else if ((b = e.target.closest('[data-wish]'))) { toggleWish(b.dataset.wish); var on = wish.indexOf(b.dataset.wish) > -1; b.setAttribute('aria-pressed', on); b.innerHTML = I.heart(on); }
    else if ((b = e.target.closest('[data-inc]'))) { var l = cart.filter(function (x) { return x.id === b.dataset.inc; })[0], p = byId(l.id); setQty(l.id, Math.min(typeof p.stock === 'number' ? p.stock : 99, l.qty + 1)); }
    else if ((b = e.target.closest('[data-dec]'))) { var l2 = cart.filter(function (x) { return x.id === b.dataset.dec; })[0]; setQty(l2.id, l2.qty - 1); }
    else if ((b = e.target.closest('[data-rm]'))) setQty(b.dataset.rm, 0);
  });
  window.addEventListener('popstate', render);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });
  $('#menuBtn').addEventListener('click', function () { openPanel('menu'); });
  $('#sideClose').addEventListener('click', function () { closeAll(); });
  $('#cartBtn').addEventListener('click', function () { renderDrawer(); openPanel('cart'); });
  $('#cartClose').addEventListener('click', function () { closeAll(); });
  $('#scrim').addEventListener('click', function () { closeAll(); });
  $('#searchBtn').addEventListener('click', function () { openSearch(); });
  $('#searchClose').addEventListener('click', function () { closeAll(); });
  $('#searchInput').addEventListener('input', doSearch);
  $('#sideSearch').addEventListener('submit', function (e) { e.preventDefault(); openSearch($('#sideQ').value); });
  $('#nlForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var m = $('#nlMsg'), v = $('#nlEmail').value.trim();
    if (!emailOk(v)) return msg(m, 'Enter a valid email address.');
    msg(m, 'Subscribing…', true);
    post('/api/subscribe', { email: v }).then(function () { e.target.reset(); msg(m, 'You’re on the list! Watch your inbox for your 10% code at launch.', true); }).catch(function (err) { msg(m, err.message); });
  });

  var notes = ['Free shipping on every order', STORE.returnDays + '-day hassle-free returns', 'Dispatched in under ' + STORE.dispatchDays + ' days', 'Join the list for 10% off your first order'];
  var once = notes.map(function (n) { return '<span>' + n + '</span>'; }).join('');
  $('#announce').innerHTML = once + once + once + once;
  $('#footPay').innerHTML = STORE.payments.map(function (x) { return '<span class="pay">' + x + '</span>'; }).join('');
  $('#year').textContent = new Date().getFullYear();

  render(); counts(); renderDrawer();
  load().then(function () { render(); renderDrawer(); });
})();
