/* Zifidit Store — client app.
   Products come from /products.json (currently an empty list). To add a product, append an object:
   { "id": "zf-001", "name": "اسم المنتج", "price": 450, "compareAt": 600, "category": "إكسسوارات",
     "images": ["/img/zf-001-1.webp"], "description": "وصف قصير", "stock": 12, "badge": "جديد" }  */
(function () {
  'use strict';

  var STORE = {
    name: 'Zifidit',
    currency: 'ج.م',
    shippingFee: 60,
    freeShippingFrom: 1500,
    returnDays: 14
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { return new Intl.NumberFormat('ar-EG-u-nu-latn', { maximumFractionDigits: 2 }).format(n) + ' ' + STORE.currency; };

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  var products = [];
  var cart = store.get('zf-cart', []);       // [{id, qty}]
  var wish = store.get('zf-wish', []);       // [id]
  var main = $('#main');

  /* ---------- Data ---------- */
  function load() {
    return fetch('/products.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (list) {
        products = Array.isArray(list) ? list.filter(function (p) { return p && p.id && p.name && typeof p.price === 'number'; }) : [];
        // Drop cart/wishlist entries for products that no longer exist.
        cart = cart.filter(function (l) { return byId(l.id); });
        wish = wish.filter(function (id) { return byId(id); });
        save();
      });
  }
  function byId(id) { for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i]; return null; }
  function save() { store.set('zf-cart', cart); store.set('zf-wish', wish); counts(); }
  function cartTotals() {
    var sub = 0, qty = 0;
    cart.forEach(function (l) { var p = byId(l.id); if (p) { sub += p.price * l.qty; qty += l.qty; } });
    var ship = sub === 0 || sub >= STORE.freeShippingFrom ? 0 : STORE.shippingFee;
    return { sub: sub, qty: qty, ship: ship, total: sub + ship };
  }
  function counts() {
    var t = cartTotals();
    var c = $('#cartCount'), w = $('#wishCount');
    c.textContent = t.qty; c.hidden = t.qty === 0;
    w.textContent = wish.length; w.hidden = wish.length === 0;
  }

  /* ---------- Cart actions ---------- */
  function addToCart(id, qty) {
    var p = byId(id); if (!p) return;
    var l = cart.filter(function (x) { return x.id === id; })[0];
    var max = typeof p.stock === 'number' ? p.stock : 99;
    if (l) l.qty = Math.min(max, l.qty + (qty || 1)); else cart.push({ id: id, qty: Math.min(max, qty || 1) });
    save(); renderDrawer(); toast('أُضيف إلى السلة'); openDrawer();
  }
  function setQty(id, q) {
    cart = cart.map(function (l) { return l.id === id ? { id: id, qty: q } : l; }).filter(function (l) { return l.qty > 0; });
    save(); renderDrawer(); if (route().name === 'cart') render();
  }
  function toggleWish(id) {
    var i = wish.indexOf(id);
    if (i > -1) { wish.splice(i, 1); toast('أُزيل من المفضّلة'); } else { wish.push(id); toast('أُضيف إلى المفضّلة'); }
    save(); if (route().name === 'wishlist') render();
  }

  /* ---------- Shared pieces ---------- */
  var ART = {
    shelf: '<svg class="empty-art" viewBox="0 0 120 90" aria-hidden="true"><path d="M8 30h104M8 62h104M14 30v52M106 30v52"/><rect class="hl" x="24" y="10" width="20" height="20" rx="3"/><path d="M58 16h12M58 22h8" class="hl"/><path d="M24 44h14v18H24zM48 50h10v12H48z" stroke-dasharray="3 4"/><path d="M76 42h18v20H76z" stroke-dasharray="3 4"/></svg>',
    bag: '<svg class="empty-art" viewBox="0 0 120 90" aria-hidden="true"><path d="M34 28h52l-4 52H38z"/><path class="hl" d="M48 36V24a12 12 0 0 1 24 0v12"/><path d="M50 56h20" stroke-dasharray="3 4"/></svg>',
    heart: '<svg class="empty-art" viewBox="0 0 120 90" aria-hidden="true"><path class="hl" d="M60 76S30 58 30 36a14 14 0 0 1 30-6 14 14 0 0 1 30 6c0 22-30 40-30 40Z"/></svg>',
    search: '<svg class="empty-art" viewBox="0 0 120 90" aria-hidden="true"><circle class="hl" cx="54" cy="40" r="22"/><path d="m70 56 20 20"/><path d="M46 40h16" stroke-dasharray="3 4"/></svg>',
    box: '<svg class="empty-art" viewBox="0 0 120 90" aria-hidden="true"><path d="M20 30 60 14l40 16v38L60 84 20 68z"/><path d="M20 30l40 16 40-16M60 46v38"/><path class="hl" d="M40 22l40 16"/></svg>'
  };
  function empty(art, title, text, actions) {
    return '<div class="empty">' + ART[art] + '<h3>' + title + '</h3><p>' + text + '</p>' +
      (actions ? '<div class="actions">' + actions + '</div>' : '') + '</div>';
  }
  function crumbs(items) {
    return '<nav class="crumbs" aria-label="مسار التنقل"><a href="/" data-link>الرئيسية</a>' +
      items.map(function (i) { return '<span aria-hidden="true">/</span>' + (i[1] ? '<a href="' + i[1] + '" data-link>' + i[0] + '</a>' : '<span>' + i[0] + '</span>'); }).join('') + '</nav>';
  }
  function pageHead(title, trail, sub) {
    return '<div class="wrap page-head">' + crumbs(trail) + '<h1>' + title + '</h1>' + (sub ? '<p class="muted" style="margin-top:8px">' + sub + '</p>' : '') + '</div>';
  }
  function card(p) {
    var img = (p.images && p.images[0]) || '';
    var inWish = wish.indexOf(p.id) > -1;
    return '<article class="card">' +
      '<a href="/product/' + encodeURIComponent(p.id) + '" data-link class="card-media">' +
        (img ? '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" loading="lazy">' : '') +
        (p.badge ? '<span class="card-badge">' + esc(p.badge) + '</span>' : '') + '</a>' +
      '<button class="icon-btn card-wish" data-wish="' + esc(p.id) + '" aria-pressed="' + inWish + '" aria-label="' + (inWish ? 'إزالة من المفضّلة' : 'إضافة إلى المفضّلة') + '"></button>' +
      '<a href="/product/' + encodeURIComponent(p.id) + '" data-link><h3>' + esc(p.name) + '</h3></a>' +
      '<div class="price num">' + money(p.price) + (p.compareAt > p.price ? '<s>' + money(p.compareAt) + '</s>' : '') + '</div>' +
      '<button class="btn btn-ghost" data-add="' + esc(p.id) + '"' + (p.stock === 0 ? ' disabled>نفدت الكمية' : '>أضف إلى السلة') + '</button>' +
    '</article>';
  }
  function grid(list) { return '<div class="grid">' + list.map(card).join('') + '</div>'; }
  var noProducts = function () {
    return empty('shelf', 'الرفوف جاهزة، والمنتجات في الطريق',
      'لا توجد منتجات معروضة حالياً. اشترك في النشرة البريدية لتصلك رسالة أول ما تنزل المنتجات.',
      '<a class="btn btn-primary" href="#nlTitle" data-scroll="nlEmail">نبّهني عند الإطلاق</a><a class="btn btn-ghost" href="/contact" data-link>اسألنا عن منتج</a>');
  };

  /* ---------- Pages ---------- */
  var pages = {};

  pages.home = function () {
    var slots = '';
    for (var i = 1; i <= 6; i++) {
      slots += '<div class="slot">' + (i === 1 || i === 5 ? '<span class="tag">قريباً</span>' : '') +
        '<span class="sku">ZF-' + ('00' + i).slice(-3) + '</span><div class="barcode"></div></div>';
    }
    var latest = products.slice(-8).reverse();
    return '' +
    '<section class="hero"><div class="wrap hero-grid">' +
      '<div>' +
        '<p class="eyebrow">متجر Zifidit الرسمي</p>' +
        '<h1>اختيارات مدروسة،<br><em>وسعر واضح</em> من أول نظرة.</h1>' +
        '<p class="lead">كل منتج هنا يمرّ باختبار قبل أن يصل إلى الرف: جودة نثق فيها، وصف صادق، وسعر نهائي بلا رسوم مخفية. ادفع عند الاستلام، واسترجع خلال ' + STORE.returnDays + ' يوماً.</p>' +
        '<div class="hero-cta"><a class="btn btn-primary" href="/shop" data-link>تصفّح المتجر</a><a class="btn btn-ghost" href="/about" data-link>تعرّف علينا</a></div>' +
        '<div class="hero-facts">' +
          '<div><b class="num">' + STORE.returnDays + ' يوماً</b><span>للاسترجاع والاستبدال</span></div>' +
          '<div><b class="num">27</b><span>محافظة نشحن إليها</span></div>' +
          '<div><b>عند الاستلام</b><span>ادفع بعد ما تشوف طلبك</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="rack" aria-hidden="true"><div class="rack-head"><span class="live">' + (products.length ? 'على الرف الآن' : 'نجهّز الرفوف') + '</span><span class="num" dir="ltr">' + products.length + ' / SKU</span></div><div class="rack-grid">' + slots + '</div></div>' +
    '</div></section>' +

    '<section class="trust" aria-label="مميزات الشراء"><div class="wrap trust-grid">' +
      trustItem('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>', 'شحن لكل المحافظات', 'مجاني للطلبات فوق ' + money(STORE.freeShippingFrom)) +
      trustItem('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>', 'الدفع عند الاستلام', 'افحص طلبك ثم ادفع للمندوب') +
      trustItem('<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/>', 'استرجاع خلال ' + STORE.returnDays + ' يوماً', 'بدون أسئلة معقّدة') +
      trustItem('<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/>', 'دعم حقيقي', 'فريق يردّ عليك خلال يوم عمل') +
    '</div></section>' +

    '<section class="section"><div class="wrap">' +
      '<div class="sec-head"><div><p class="eyebrow">وصل حديثاً</p><h2>أحدث المنتجات</h2></div>' +
      (products.length ? '<a class="link-arrow" href="/shop" data-link>عرض الكل ←</a>' : '') + '</div>' +
      (latest.length ? grid(latest) : noProducts()) +
    '</div></section>';
  };
  function trustItem(path, h, p) {
    return '<div class="trust-item"><svg viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg><div><h3>' + h + '</h3><p>' + p + '</p></div></div>';
  }

  var shopState = { sort: 'new', min: '', max: '', cat: '', stock: false };
  pages.shop = function () {
    var cats = [];
    products.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    var list = products.filter(function (p) {
      if (shopState.cat && p.category !== shopState.cat) return false;
      if (shopState.min !== '' && p.price < +shopState.min) return false;
      if (shopState.max !== '' && p.price > +shopState.max) return false;
      if (shopState.stock && p.stock === 0) return false;
      return true;
    });
    if (shopState.sort === 'low') list.sort(function (a, b) { return a.price - b.price; });
    else if (shopState.sort === 'high') list.sort(function (a, b) { return b.price - a.price; });
    else list.reverse();

    var body;
    if (!products.length) body = noProducts();
    else if (!list.length) body = empty('search', 'لا توجد منتجات بهذه الفلاتر', 'جرّب نطاق سعر أوسع أو فئة أخرى.', '<button class="btn btn-ghost" id="clearFilters">مسح الفلاتر</button>');
    else body = grid(list);

    return pageHead('المتجر', [['المتجر']]) +
    '<div class="wrap shop">' +
      '<aside class="filters" aria-label="الفلاتر">' +
        '<div><h3>الفئات</h3>' + (cats.length ?
          '<div class="chips"><button class="chip" data-cat="" aria-pressed="' + (!shopState.cat) + '">الكل</button>' +
          cats.map(function (c) { return '<button class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (shopState.cat === c) + '">' + esc(c) + '</button>'; }).join('') + '</div>'
          : '<p class="note">ستظهر الفئات هنا مع أول منتجات.</p>') + '</div>' +
        '<div><h3>السعر (' + STORE.currency + ')</h3><div class="range-row">' +
          '<div class="field"><label class="sr" for="fMin">من</label><input class="input num" id="fMin" type="number" min="0" inputmode="numeric" placeholder="من" value="' + esc(shopState.min) + '"></div>' +
          '<div class="field"><label class="sr" for="fMax">إلى</label><input class="input num" id="fMax" type="number" min="0" inputmode="numeric" placeholder="إلى" value="' + esc(shopState.max) + '"></div>' +
        '</div></div>' +
        '<div><h3>التوفر</h3><label style="display:flex;gap:8px;align-items:center;font-size:14.5px"><input type="checkbox" id="fStock"' + (shopState.stock ? ' checked' : '') + ' style="accent-color:var(--accent)"> المتوفر فقط</label></div>' +
      '</aside>' +
      '<div style="min-width:0">' +
        '<div class="toolbar"><span class="num">' + list.length + ' منتج</span>' +
          '<label style="display:flex;gap:8px;align-items:center"><span>ترتيب حسب</span><select class="input" id="fSort" style="width:auto;min-height:40px">' +
            '<option value="new"' + (shopState.sort === 'new' ? ' selected' : '') + '>الأحدث</option>' +
            '<option value="low"' + (shopState.sort === 'low' ? ' selected' : '') + '>السعر: من الأقل</option>' +
            '<option value="high"' + (shopState.sort === 'high' ? ' selected' : '') + '>السعر: من الأعلى</option>' +
          '</select></label></div>' + body +
      '</div>' +
    '</div>';
  };

  pages.product = function (id) {
    var p = byId(id);
    if (!p) return pageHead('المنتج غير متاح', [['المتجر', '/shop'], ['منتج']]) +
      '<div class="wrap" style="padding-block:24px 72px">' + empty('box', 'لم نجد هذا المنتج', 'ربما نفد أو أُزيل من المتجر. تصفّح المتجر لترى المتاح الآن.', '<a class="btn btn-primary" href="/shop" data-link>العودة إلى المتجر</a>') + '</div>';
    var imgs = p.images && p.images.length ? p.images : [''];
    var inWish = wish.indexOf(p.id) > -1;
    return '<div class="wrap page-head">' + crumbs([['المتجر', '/shop'], [esc(p.name)]]) + '</div>' +
    '<div class="wrap product">' +
      '<div style="min-width:0"><div class="gallery-main">' + (imgs[0] ? '<img id="pMain" src="' + esc(imgs[0]) + '" alt="' + esc(p.name) + '">' : '') + '</div>' +
        (imgs.length > 1 ? '<div class="thumbs">' + imgs.map(function (src, i) { return '<button data-thumb="' + esc(src) + '" aria-current="' + (i === 0) + '" aria-label="صورة ' + (i + 1) + '"><img src="' + esc(src) + '" alt=""></button>'; }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="p-info">' +
        (p.category ? '<p class="eyebrow" style="margin:0">' + esc(p.category) + '</p>' : '') +
        '<h1>' + esc(p.name) + '</h1>' +
        '<div class="price num">' + money(p.price) + (p.compareAt > p.price ? '<s>' + money(p.compareAt) + '</s>' : '') + '</div>' +
        (p.description ? '<p class="muted">' + esc(p.description) + '</p>' : '') +
        (p.stock === 0 ? '<p style="color:var(--err)">نفدت الكمية حالياً</p>' : (typeof p.stock === 'number' && p.stock <= 5 ? '<p style="color:var(--err)">باقي ' + p.stock + ' قطع فقط</p>' : '')) +
        '<div class="buy-row"><div class="qty"><button type="button" data-q="-1" aria-label="إنقاص">−</button><span class="num" id="pQty">1</span><button type="button" data-q="1" aria-label="زيادة">+</button></div>' +
          '<button class="btn btn-primary" id="pAdd"' + (p.stock === 0 ? ' disabled' : '') + '>أضف إلى السلة</button>' +
          '<button class="icon-btn" style="border:1.5px solid var(--line);width:48px;height:48px" data-wish="' + esc(p.id) + '" aria-pressed="' + inWish + '" aria-label="المفضّلة">' + heartSvg(inWish) + '</button></div>' +
        '<div class="p-points"><span>شحن خلال 2–5 أيام عمل لكل المحافظات</span><span>الدفع عند الاستلام متاح</span><span>استرجاع مجاني خلال ' + STORE.returnDays + ' يوماً</span></div>' +
      '</div>' +
    '</div>';
  };
  function heartSvg(on) {
    return '<svg viewBox="0 0 24 24" style="' + (on ? 'fill:var(--accent);stroke:var(--accent)' : '') + '"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>';
  }

  pages.cart = function () {
    var t = cartTotals();
    if (!cart.length) return pageHead('سلة التسوق', [['السلة']]) +
      '<div class="wrap" style="padding-block:24px 72px">' + empty('bag', 'سلتك فارغة', products.length ? 'لم تُضف أي منتج بعد. تصفّح المتجر وأضف ما يعجبك.' : 'لا توجد منتجات في المتجر حالياً. اشترك في النشرة لتعرف أول ما تنزل.', '<a class="btn btn-primary" href="/shop" data-link>تصفّح المتجر</a>') + '</div>';
    return pageHead('سلة التسوق', [['السلة']], t.qty + ' منتج في السلة') +
    '<div class="wrap two-col"><div style="min-width:0">' + cart.map(lineItem).join('') + '</div>' + summary(t, true) + '</div>';
  };
  function lineItem(l) {
    var p = byId(l.id); if (!p) return '';
    return '<div class="line-item"><img src="' + esc((p.images || [])[0] || '') + '" alt="">' +
      '<div style="min-width:0;display:grid;gap:6px"><h3>' + esc(p.name) + '</h3>' +
        '<div style="display:flex;gap:12px;align-items:center"><div class="qty" style="height:36px"><button data-dec="' + esc(p.id) + '" aria-label="إنقاص">−</button><span class="num">' + l.qty + '</span><button data-inc="' + esc(p.id) + '" aria-label="زيادة">+</button></div>' +
        '<button class="rm" data-rm="' + esc(p.id) + '">إزالة</button></div></div>' +
      '<div class="price num">' + money(p.price * l.qty) + '</div></div>';
  }
  function freeShipBar(t) {
    if (t.sub === 0) return '';
    var left = STORE.freeShippingFrom - t.sub;
    var pct = Math.min(100, t.sub / STORE.freeShippingFrom * 100);
    return '<div style="display:grid;gap:8px"><p style="font-size:14px">' + (left > 0 ? 'أضف <b class="num">' + money(left) + '</b> للحصول على شحن مجاني' : 'طلبك مؤهّل للشحن المجاني') + '</p><div class="progress"><i style="width:' + pct + '%"></i></div></div>';
  }
  function summary(t, withCta) {
    return '<aside class="summary"><h2>ملخص الطلب</h2>' + freeShipBar(t) +
      '<div class="sum-row"><span>المجموع الفرعي</span><span class="num">' + money(t.sub) + '</span></div>' +
      '<div class="sum-row"><span>الشحن</span><span class="num">' + (t.ship ? money(t.ship) : 'مجاني') + '</span></div>' +
      '<div class="sum-row total"><span>الإجمالي</span><span class="num">' + money(t.total) + '</span></div>' +
      (withCta ? '<a class="btn btn-primary btn-block" href="/checkout" data-link>إتمام الطلب</a>' : '') +
      '<p class="note">الأسعار تشمل الضريبة. الدفع نقداً عند الاستلام.</p></aside>';
  }

  var GOVS = ['القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'];
  pages.checkout = function () {
    var t = cartTotals();
    if (!cart.length) return pageHead('إتمام الطلب', [['السلة', '/cart'], ['إتمام الطلب']]) +
      '<div class="wrap" style="padding-block:24px 72px">' + empty('bag', 'لا يوجد ما نُتمّه بعد', 'أضف منتجاً واحداً على الأقل إلى السلة قبل إتمام الطلب.', '<a class="btn btn-primary" href="/shop" data-link>تصفّح المتجر</a>') + '</div>';
    return pageHead('إتمام الطلب', [['السلة', '/cart'], ['إتمام الطلب']]) +
    '<form class="wrap two-col" id="checkoutForm" novalidate><div style="display:grid;gap:20px;min-width:0">' +
      '<div class="fieldset"><h2>بيانات التواصل</h2><div class="form-grid">' +
        field('cName', 'الاسم بالكامل', 'text', 'name', true, 'full') +
        field('cPhone', 'رقم الموبايل', 'tel', 'tel', true, '', 'ltr', '01xxxxxxxxx') +
        field('cEmail', 'البريد الإلكتروني (اختياري)', 'email', 'email', false, '', 'ltr') +
      '</div></div>' +
      '<div class="fieldset"><h2>عنوان التوصيل</h2><div class="form-grid">' +
        '<div><label class="lbl" for="cGov">المحافظة</label><select class="input" id="cGov" name="gov" required><option value="">اختر المحافظة</option>' + GOVS.map(function (g) { return '<option>' + g + '</option>'; }).join('') + '</select></div>' +
        field('cCity', 'المدينة / المنطقة', 'text', 'address-level2', true) +
        field('cAddr', 'العنوان بالتفصيل', 'text', 'street-address', true, 'full') +
        '<div class="full"><label class="lbl" for="cNotes">ملاحظات للمندوب (اختياري)</label><textarea class="input" id="cNotes" name="notes" style="min-height:90px"></textarea></div>' +
      '</div></div>' +
      '<div class="fieldset"><h2>طريقة الدفع</h2><label class="radio-card"><input type="radio" name="pay" value="cod" checked><span><b>الدفع عند الاستلام</b><br><span class="muted" style="font-size:14px">ادفع نقداً للمندوب بعد استلام طلبك.</span></span></label></div>' +
    '</div><div style="display:grid;gap:14px">' + summary(t, false).replace('</aside>', '<button class="btn btn-primary btn-block" type="submit" id="placeOrder">تأكيد الطلب</button><p class="form-msg" id="coMsg" role="status"></p></aside>') + '</div></form>';
  };
  function field(id, label, type, ac, req, cls, dir, ph) {
    return '<div class="' + (cls || '') + '"><label class="lbl" for="' + id + '">' + label + '</label><input class="input" id="' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + ac + '"' + (req ? ' required' : '') + (dir ? ' dir="' + dir + '"' : '') + (ph ? ' placeholder="' + ph + '"' : '') + '></div>';
  }

  pages.done = function (ref) {
    return pageHead('تم استلام طلبك', [['تأكيد الطلب']]) +
      '<div class="wrap" style="padding-block:24px 72px">' + empty('box', 'شكراً لك! رقم طلبك: <span class="num" dir="ltr">' + esc(ref) + '</span>', 'سنتصل بك على رقم الموبايل لتأكيد الطلب قبل الشحن. احتفظ برقم الطلب لتتبّعه.', '<a class="btn btn-primary" href="/track" data-link>تتبّع الطلب</a><a class="btn btn-ghost" href="/shop" data-link>متابعة التسوق</a>') + '</div>';
  };

  pages.wishlist = function () {
    var list = wish.map(byId).filter(Boolean);
    return pageHead('المفضّلة', [['المفضّلة']]) + '<div class="wrap" style="padding-block:24px 72px">' +
      (list.length ? grid(list) : empty('heart', 'قائمة المفضّلة فارغة', 'اضغط على القلب بجانب أي منتج لتحفظه هنا وترجع له لاحقاً.', '<a class="btn btn-primary" href="/shop" data-link>تصفّح المتجر</a>')) + '</div>';
  };

  pages.track = function () {
    return pageHead('تتبّع طلبك', [['تتبّع الطلب']], 'أدخل رقم الطلب ورقم الموبايل المستخدم في الطلب.') +
    '<div class="wrap" style="padding-block:24px 72px;max-width:640px;margin-inline:0">' +
      '<form class="fieldset" id="trackForm" novalidate><div class="form-grid">' +
        field('tRef', 'رقم الطلب', 'text', 'off', true, '', 'ltr', 'ZF-XXXXXX') +
        field('tPhone', 'رقم الموبايل', 'tel', 'tel', true, '', 'ltr', '01xxxxxxxxx') +
      '</div><button class="btn btn-primary" type="submit">تتبّع</button><p class="form-msg" id="trMsg" role="status"></p></form>' +
    '</div>';
  };

  pages.contact = function () {
    return pageHead('تواصل معنا', [['تواصل معنا']]) +
    '<div class="wrap contact-grid">' +
      '<div class="prose" style="padding:0">' +
        '<p>سؤال عن منتج، طلب خاص، أو مشكلة في طلبك؟ اكتب لنا وسنرد عليك خلال يوم عمل واحد.</p>' +
        '<h2>مواعيد الرد</h2><p>من السبت إلى الخميس، من 10 صباحاً حتى 8 مساءً بتوقيت القاهرة.</p>' +
        '<h2>عن طلب حالي؟</h2><p>اكتب رقم الطلب في رسالتك لنصل إليه أسرع، أو استخدم <a href="/track" data-link style="color:var(--accent)">صفحة تتبّع الطلب</a>.</p>' +
      '</div>' +
      '<form class="fieldset" id="contactForm" novalidate><div class="form-grid">' +
        field('kName', 'الاسم', 'text', 'name', true) +
        field('kPhone', 'رقم الموبايل أو البريد', 'text', 'email', true, '', 'ltr') +
        '<div class="full"><label class="lbl" for="kTopic">الموضوع</label><select class="input" id="kTopic"><option>استفسار عن منتج</option><option>طلب حالي</option><option>استرجاع أو استبدال</option><option>تعاون تجاري</option><option>أخرى</option></select></div>' +
        '<div class="full"><label class="lbl" for="kMsg">رسالتك</label><textarea class="input" id="kMsg" required></textarea></div>' +
      '</div><button class="btn btn-primary" type="submit">أرسل الرسالة</button><p class="form-msg" id="kStatus" role="status"></p></form>' +
    '</div>';
  };

  var PROSE = {
    about: ['من نحن', '<p>Zifidit علامة مصرية تبني منتجات وأدوات تُسهّل يومك. أطلقنا هذا المتجر لنبيع ما نثق فيه فقط، ونقدّم تجربة شراء نتمنّى أن نجدها نحن كعملاء.</p>' +
      '<div class="values"><div><h3>نختار قبل أن نعرض</h3><p class="muted">لا يصل منتج إلى الرف قبل أن نجرّبه ونعرف نقاط قوته وحدوده.</p></div><div><h3>وصف صادق</h3><p class="muted">صور حقيقية، مقاسات دقيقة، ولا وعود لا يحققها المنتج.</p></div><div><h3>سعر نهائي</h3><p class="muted">السعر المعروض يشمل الضريبة، والشحن يظهر قبل تأكيد الطلب.</p></div></div>'],
    shipping: ['الشحن والتوصيل', '<ul><li>نشحن إلى جميع محافظات مصر.</li><li>مدة التوصيل من 2 إلى 5 أيام عمل حسب المحافظة.</li><li>رسوم الشحن ' + money(STORE.shippingFee) + '، ومجاني للطلبات فوق ' + money(STORE.freeShippingFrom) + '.</li><li>نتصل بك لتأكيد الطلب قبل شحنه.</li><li>يمكنك فحص الطلب أمام المندوب قبل الدفع.</li></ul>'],
    returns: ['الاسترجاع والاستبدال', '<ul><li>يمكنك استرجاع أو استبدال أي منتج خلال ' + STORE.returnDays + ' يوماً من الاستلام.</li><li>يجب أن يكون المنتج بحالته الأصلية وبتغليفه.</li><li>إذا كان المنتج معيباً أو مختلفاً عن الوصف نتحمّل نحن تكلفة الشحن بالكامل.</li><li>يُرد المبلغ خلال 7 أيام عمل من استلامنا للمنتج.</li><li>لبدء الاسترجاع، <a href="/contact" data-link style="color:var(--accent)">راسلنا</a> برقم الطلب.</li></ul>'],
    privacy: ['سياسة الخصوصية', '<p>نجمع فقط البيانات اللازمة لتوصيل طلبك والتواصل معك: الاسم، رقم الموبايل، العنوان، والبريد إن أدخلته.</p><ul><li>لا نبيع بياناتك ولا نشاركها إلا مع شركة الشحن لتوصيل طلبك.</li><li>سلة التسوق والمفضّلة محفوظة في متصفحك فقط.</li><li>يمكنك طلب حذف بياناتك في أي وقت عبر صفحة التواصل.</li></ul>'],
    terms: ['الشروط والأحكام', '<ul><li>الأسعار بالجنيه المصري وتشمل الضريبة.</li><li>الطلب لا يُعتبر مؤكداً إلا بعد اتصالنا بك وتأكيده.</li><li>نحتفظ بحق إلغاء الطلب إذا نفدت الكمية، مع إبلاغك فوراً.</li><li>تخضع هذه الشروط لقوانين جمهورية مصر العربية.</li></ul>'],
    faq: ['الأسئلة الشائعة', '<div class="faq">' + [
      ['متى ستنزل المنتجات؟', 'نجهّز أول مجموعة الآن. اشترك في النشرة البريدية أسفل الصفحة لتصلك رسالة يوم الإطلاق.'],
      ['ما طرق الدفع المتاحة؟', 'الدفع نقداً عند الاستلام، مع إمكانية فحص الطلب قبل الدفع.'],
      ['كم يستغرق التوصيل؟', 'من 2 إلى 5 أيام عمل حسب المحافظة.'],
      ['هل أقدر أرجّع المنتج؟', 'نعم، خلال ' + STORE.returnDays + ' يوماً من الاستلام إذا كان بحالته الأصلية.'],
      ['هل أحتاج إلى حساب للشراء؟', 'لا. تقدر تطلب مباشرة باسمك ورقم موبايلك.']
    ].map(function (q) { return '<details><summary>' + q[0] + '</summary><p>' + q[1] + '</p></details>'; }).join('') + '</div>']
  };
  Object.keys(PROSE).forEach(function (k) {
    pages[k] = function () { return pageHead(PROSE[k][0], [[PROSE[k][0]]]) + '<div class="wrap"><div class="prose">' + PROSE[k][1] + '</div></div>'; };
  });

  pages.notfound = function () {
    return pageHead('الصفحة غير موجودة', [['404']]) + '<div class="wrap" style="padding-block:24px 72px">' +
      empty('search', 'لم نجد هذه الصفحة', 'ربما تغيّر الرابط. ابدأ من الرئيسية أو تصفّح المتجر.', '<a class="btn btn-primary" href="/" data-link>الرئيسية</a>') + '</div>';
  };

  /* ---------- Router ---------- */
  var TITLES = { home: 'متجر Zifidit', shop: 'المتجر', cart: 'سلة التسوق', checkout: 'إتمام الطلب', wishlist: 'المفضّلة', track: 'تتبّع طلبك', contact: 'تواصل معنا', about: 'من نحن', shipping: 'الشحن والتوصيل', returns: 'الاسترجاع والاستبدال', privacy: 'سياسة الخصوصية', terms: 'الشروط والأحكام', faq: 'الأسئلة الشائعة', done: 'تم استلام طلبك', notfound: 'غير موجودة' };
  function route() {
    var parts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    if (!parts.length) return { name: 'home' };
    if (parts[0] === 'product' && parts[1]) return { name: 'product', arg: decodeURIComponent(parts[1]) };
    if (parts[0] === 'order' && parts[1]) return { name: 'done', arg: decodeURIComponent(parts[1]) };
    return pages[parts[0]] && parts[0] !== 'product' && parts[0] !== 'done' ? { name: parts[0] } : { name: 'notfound' };
  }
  function render() {
    var r = route();
    main.innerHTML = pages[r.name](r.arg);
    var p = r.name === 'product' && byId(r.arg);
    document.title = r.name === 'home' ? 'متجر Zifidit' : (p ? p.name : TITLES[r.name]) + ' · Zifidit';
    $$('#mainNav a').forEach(function (a) { if (a.dataset.nav === r.name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $$('.card-wish').forEach(function (b) { b.innerHTML = heartSvg(b.getAttribute('aria-pressed') === 'true'); });
    bindPage(r);
  }
  function go(href) {
    if (href === location.pathname) { window.scrollTo(0, 0); return; }
    history.pushState(null, '', href);
    render(); window.scrollTo(0, 0); closeMenu();
    main.focus({ preventScroll: true });
  }

  /* ---------- Page bindings ---------- */
  function post(url, data) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || 'تعذّر الاتصال. حاول مرة أخرى.'); return j; }); });
  }
  function msg(el, text, ok) { el.textContent = text; el.className = 'form-msg ' + (ok ? 'ok' : 'err'); }
  var phoneOk = function (v) { return /^01[0125]\d{8}$/.test(v.replace(/\s|-/g, '')); };

  function bindPage(r) {
    if (r.name === 'shop') {
      var upd = function () { shopState.min = $('#fMin').value; shopState.max = $('#fMax').value; shopState.stock = $('#fStock').checked; shopState.sort = $('#fSort').value; render(); };
      ['#fMin', '#fMax', '#fStock', '#fSort'].forEach(function (s) { $(s).addEventListener('change', upd); });
      $$('[data-cat]').forEach(function (b) { b.addEventListener('click', function () { shopState.cat = b.dataset.cat; render(); }); });
      var cf = $('#clearFilters'); if (cf) cf.addEventListener('click', function () { shopState = { sort: 'new', min: '', max: '', cat: '', stock: false }; render(); });
    }
    if (r.name === 'product' && byId(r.arg)) {
      var q = 1, p = byId(r.arg), max = typeof p.stock === 'number' ? p.stock : 99;
      $$('[data-q]').forEach(function (b) { b.addEventListener('click', function () { q = Math.max(1, Math.min(max, q + +b.dataset.q)); $('#pQty').textContent = q; }); });
      $('#pAdd').addEventListener('click', function () { addToCart(p.id, q); });
      $$('[data-thumb]').forEach(function (b) { b.addEventListener('click', function () { $('#pMain').src = b.dataset.thumb; $$('[data-thumb]').forEach(function (x) { x.setAttribute('aria-current', x === b); }); }); });
    }
    if (r.name === 'checkout' && cart.length) {
      $('#checkoutForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var m = $('#coMsg'), btn = $('#placeOrder');
        var data = { name: $('#cName').value.trim(), phone: $('#cPhone').value.trim(), email: $('#cEmail').value.trim(), gov: $('#cGov').value, city: $('#cCity').value.trim(), address: $('#cAddr').value.trim(), notes: $('#cNotes').value.trim(), items: cart };
        if (!data.name || !data.gov || !data.city || !data.address) return msg(m, 'من فضلك أكمل الاسم والمحافظة والمدينة والعنوان.');
        if (!phoneOk(data.phone)) return msg(m, 'اكتب رقم موبايل مصري صحيح من 11 رقماً يبدأ بـ 01.');
        btn.disabled = true; msg(m, 'جارٍ إرسال الطلب…', true);
        post('/api/order', data).then(function (j) { cart = []; save(); renderDrawer(); go('/order/' + j.ref); })
          .catch(function (err) { btn.disabled = false; msg(m, err.message); });
      });
    }
    if (r.name === 'track') {
      $('#trackForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var m = $('#trMsg'), ref = $('#tRef').value.trim().toUpperCase(), ph = $('#tPhone').value.trim();
        if (!ref || !phoneOk(ph)) return msg(m, 'اكتب رقم الطلب ورقم الموبايل كما في الطلب.');
        msg(m, 'جارٍ البحث…', true);
        post('/api/track', { ref: ref, phone: ph }).then(function (j) { msg(m, 'حالة الطلب ' + ref + ': ' + j.status, true); }).catch(function (err) { msg(m, err.message); });
      });
    }
    if (r.name === 'contact') {
      $('#contactForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var m = $('#kStatus'), d = { name: $('#kName').value.trim(), reach: $('#kPhone').value.trim(), topic: $('#kTopic').value, message: $('#kMsg').value.trim() };
        if (!d.name || !d.reach || d.message.length < 5) return msg(m, 'من فضلك اكتب اسمك ووسيلة التواصل ورسالتك.');
        msg(m, 'جارٍ الإرسال…', true);
        post('/api/contact', d).then(function () { e.target.reset(); msg(m, 'وصلتنا رسالتك. سنرد عليك خلال يوم عمل.', true); }).catch(function (err) { msg(m, err.message); });
      });
    }
  }

  /* ---------- Drawer ---------- */
  function renderDrawer() {
    var t = cartTotals();
    $('#drawerBody').innerHTML = cart.length ? cart.map(lineItem).join('') :
      empty('bag', 'سلتك فارغة', products.length ? 'أضف منتجات من المتجر لتظهر هنا.' : 'المتجر يستعد لاستقبال أول منتجاته.', '<a class="btn btn-ghost" href="/shop" data-link>تصفّح المتجر</a>');
    $('#drawerFoot').innerHTML = cart.length ? freeShipBar(t) + '<div class="sum-row total"><span>الإجمالي</span><span class="num">' + money(t.total) + '</span></div><a class="btn btn-primary btn-block" href="/checkout" data-link>إتمام الطلب</a><a class="btn btn-ghost btn-block" href="/cart" data-link>عرض السلة</a>' : '';
  }
  var lastFocus = null;
  function openDrawer() { lastFocus = document.activeElement; $('#cartDrawer').classList.add('open'); $('#cartDrawer').setAttribute('aria-hidden', 'false'); $('#scrim').hidden = false; $('#cartClose').focus(); }
  function closeDrawer() { $('#cartDrawer').classList.remove('open'); $('#cartDrawer').setAttribute('aria-hidden', 'true'); $('#scrim').hidden = true; if (lastFocus) lastFocus.focus(); }
  function closeMenu() { $('#mainNav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }

  /* ---------- Search ---------- */
  function openSearch() { $('#searchLayer').hidden = false; $('#searchInput').value = ''; doSearch(); $('#searchInput').focus(); }
  function closeSearch() { $('#searchLayer').hidden = true; }
  function doSearch() {
    var q = $('#searchInput').value.trim().toLowerCase(), out = $('#searchResults');
    if (!products.length) { out.innerHTML = empty('search', 'لا توجد منتجات للبحث فيها بعد', 'سيعمل البحث فور إضافة أول المنتجات إلى المتجر.'); return; }
    if (!q) { out.innerHTML = '<p class="note">اكتب اسم منتج أو فئة.</p>'; return; }
    var hits = products.filter(function (p) { return (p.name + ' ' + (p.category || '') + ' ' + (p.description || '')).toLowerCase().indexOf(q) > -1; });
    out.innerHTML = hits.length ? grid(hits.slice(0, 12)) : empty('search', 'لا نتائج لـ «' + esc(q) + '»', 'جرّب كلمة أقصر أو تصفّح المتجر كاملاً.');
    $$('.card-wish', out).forEach(function (b) { b.innerHTML = heartSvg(b.getAttribute('aria-pressed') === 'true'); });
  }

  /* ---------- Toast ---------- */
  var tt;
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('show'); }, 2200); }

  /* ---------- Global events ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-link]');
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey && a.getAttribute('href').charAt(0) === '/') {
      e.preventDefault(); closeDrawer(); closeSearch(); go(a.getAttribute('href')); return;
    }
    var s = e.target.closest('[data-scroll]');
    if (s) { e.preventDefault(); $('.newsletter').scrollIntoView({ behavior: 'smooth' }); setTimeout(function () { $('#' + s.dataset.scroll).focus({ preventScroll: true }); }, 400); return; }
    var b;
    if ((b = e.target.closest('[data-add]'))) { addToCart(b.dataset.add, 1); closeSearch(); }
    else if ((b = e.target.closest('[data-wish]'))) { toggleWish(b.dataset.wish); var on = wish.indexOf(b.dataset.wish) > -1; b.setAttribute('aria-pressed', on); b.innerHTML = heartSvg(on); }
    else if ((b = e.target.closest('[data-inc]'))) { var l = cart.filter(function (x) { return x.id === b.dataset.inc; })[0]; var p = byId(b.dataset.inc); setQty(l.id, Math.min(typeof p.stock === 'number' ? p.stock : 99, l.qty + 1)); }
    else if ((b = e.target.closest('[data-dec]'))) { var l2 = cart.filter(function (x) { return x.id === b.dataset.dec; })[0]; setQty(l2.id, l2.qty - 1); }
    else if ((b = e.target.closest('[data-rm]'))) { setQty(b.dataset.rm, 0); }
  });
  window.addEventListener('popstate', render);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDrawer(); closeSearch(); closeMenu(); }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });
  $('#cartBtn').addEventListener('click', function () { renderDrawer(); openDrawer(); });
  $('#cartClose').addEventListener('click', closeDrawer);
  $('#scrim').addEventListener('click', closeDrawer);
  $('#searchBtn').addEventListener('click', openSearch);
  $('#searchClose').addEventListener('click', closeSearch);
  $('#searchInput').addEventListener('input', doSearch);
  $('#menuBtn').addEventListener('click', function () { var o = $('#mainNav').classList.toggle('open'); this.setAttribute('aria-expanded', o); });
  $('#themeBtn').addEventListener('click', function () {
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('zf-theme', root.dataset.theme); } catch (e) {}
  });
  $('#nlForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var m = $('#nlMsg'), v = $('#nlEmail').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return msg(m, 'اكتب بريداً إلكترونياً صحيحاً.');
    msg(m, 'جارٍ الاشتراك…', true);
    post('/api/subscribe', { email: v }).then(function () { e.target.reset(); msg(m, 'تم الاشتراك. سنراسلك أول ما تنزل المنتجات.', true); }).catch(function (err) { msg(m, err.message); });
  });

  $('#announce').innerHTML = 'شحن مجاني للطلبات فوق <b class="num">' + money(STORE.freeShippingFrom) + '</b> · الدفع عند الاستلام';
  $('#year').textContent = new Date().getFullYear();

  render(); counts();
  load().then(function () { render(); renderDrawer(); });
})();
