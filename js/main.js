(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Shop details. Every order, Instagram and directions link reads from here.
     There is no public phone number yet, so orders go to an Instagram DM:
     the order text is copied and the chat opens, ready to paste.
     Add a WhatsApp number (country code, no plus, e.g. '919876543210') and
     every order button switches to WhatsApp with the message filled in.
     ------------------------------------------------------------------ */
  const CONFIG = {
    instagram: 'fry.frenchi',
    whatsapp: '',
    directions: 'https://maps.app.goo.gl/3Hs2ZM8tDCYJdWqh7',
  };

  const SIZES = window.FF_SIZES || [];
  const FLAVOURS = window.FF_FLAVOURS || [];
  const SIDES = window.FF_SIDES || [];

  /* ------------------------------------------------------------------ */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anim = !reduce && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const wide = matchMedia('(min-width: 1081px)');
  const inr = (n) => '₹' + n.toLocaleString('en-IN');
  const orderHref = (msg) => (CONFIG.whatsapp
    ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`
    : `https://ig.me/m/${CONFIG.instagram}`);

  if (!anim) root.classList.remove('js');
  if (anim) gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastT = 0;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 4200);
  };

  const copy = (text) => {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => false);
    const t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    t.remove();
    return Promise.resolve(ok);
  };

  /* ---------- Contact wiring ---------- */
  const wireOrder = (a) => { a.href = orderHref(a.dataset.order); };
  $$('[data-order]').forEach(wireOrder);
  $$('[data-dir]').forEach((a) => (a.href = CONFIG.directions));
  $('#year').textContent = new Date().getFullYear();

  // Instagram can't pre-fill a message, so copy the order first and say so.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-order]');
    if (!a || CONFIG.whatsapp) return;
    copy(a.dataset.order).then((ok) => toast(ok
      ? 'Order copied. Paste it in our Instagram chat and hit send.'
      : 'Opening our Instagram chat. Tell us what you\'d like.'));
  });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (anim && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const lock = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); root.classList.toggle('is-locked', on); };

  /* ---------- Mobile sheet ---------- */
  const menuBtn = $('#menuBtn');
  const setSheet = (open) => {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.textContent = open ? 'Close' : 'Menu';
    $('#sheet').setAttribute('aria-hidden', !open);
    lock(open);
  };
  menuBtn.addEventListener('click', () => setSheet(!root.classList.contains('menu-open')));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) setSheet(false); });

  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else if (typeof target === 'number') scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    else target && target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    e.preventDefault();
    if (id === '#') return;
    if (root.classList.contains('menu-open')) setSheet(false);
    scrollToTarget(id === '#top' ? 0 : $(id));
  });

  /* ==================================================================
     Menu board
     ================================================================== */
  let size = 0;
  const loadedPrice = () => SIZES[size].price;
  const sizeLabel = () => SIZES[size].label;

  // One list for everything on the board. Flavours take the chosen size's price.
  const ITEMS = [
    ...FLAVOURS.map((f, i) => ({ id: 'f' + i, group: 'Loaded fries', loaded: true, ...f })),
    ...SIDES.map((s, i) => ({ id: 's' + i, ...s })),
  ];
  const priceOf = (m) => (m.loaded ? loadedPrice() : m.price);
  const msgOf = (m) => `Hi Fry Frenchi! I'd like to order: ${m.name}${m.loaded ? ' loaded fries, ' + sizeLabel() : ''} (${inr(priceOf(m))})`;
  const byId = (id) => ITEMS.find((m) => m.id === id);

  const rowsEl = $('#rows');
  const rowHTML = (m) => `
    <li class="row" data-id="${m.id}">
      <button class="row__btn" type="button" aria-expanded="false" aria-controls="more-${m.id}">
        <span class="row__line"><span class="row__name">${m.name}</span><span class="row__dots" aria-hidden="true"></span></span>
        <span class="row__price" data-price>${inr(priceOf(m))}</span>
        <span class="row__sub">${m.tags}</span>
      </button>
      <div class="row__more" id="more-${m.id}"><div>
        <div class="row__inner">
          <figure class="photo"><img src="assets/img/${m.img}" alt="${m.name}" loading="lazy"></figure>
          <div>
            <p>${m.desc}</p>
            <a class="btn btn--yellow btn--sm" data-order="${msgOf(m)}" href="${orderHref(msgOf(m))}" target="_blank" rel="noopener">Order this</a>
          </div>
        </div>
      </div></div>
    </li>`;

  const groups = [...new Set(ITEMS.map((m) => m.group))];
  rowsEl.innerHTML = groups.map((g) => {
    const items = ITEMS.filter((m) => m.group === g);
    const note = g === 'Loaded fries' ? ' · pick a size above' : '';
    return `<p class="rows__group">${g}${note}</p><ul>${items.map(rowHTML).join('')}</ul>`;
  }).join('') + '<p class="party-note">Feeding a crowd? <a href="#party">We take party orders.</a></p>';

  const plate = {
    photo: $('.plate__photo'), img: $('#pImg'), price: $('#pPrice'), name: $('#pName'),
    tags: $('#pTags'), desc: $('#pDesc'), order: $('#pOrder'),
  };
  let plateId = null;
  const showPlate = (m, force) => {
    if (!m || (plateId === m.id && !force)) return;
    const first = plateId === null;
    const newPhoto = !plate.img.src.endsWith('/' + m.img);
    plateId = m.id;
    plate.img.src = `assets/img/${m.img}`;
    plate.img.alt = m.name;
    plate.price.innerHTML = inr(priceOf(m)) + (m.loaded ? `<small>${sizeLabel()}</small>` : '');
    plate.name.textContent = m.name;
    plate.tags.textContent = m.tags;
    plate.desc.textContent = m.desc;
    plate.order.dataset.order = msgOf(m);
    wireOrder(plate.order);
    $$('.row', rowsEl).forEach((r) => r.classList.toggle('is-active', r.dataset.id === m.id));
    if (anim && !first && !force) {
      if (newPhoto) gsap.fromTo(plate.photo, { rotation: 9, scale: 0.86, y: 24 }, { rotation: -3, scale: 1, y: 0, duration: 0.55, ease: 'back.out(2.2)', overwrite: true });
      gsap.fromTo(plate.name, { x: 26 }, { x: 0, duration: 0.45, ease: 'back.out(2)', overwrite: true });
    }
  };
  showPlate(ITEMS[0]);
  ITEMS.forEach((m) => { const i = new Image(); i.src = `assets/img/${m.img}`; });

  // Desktop: hover or focus a row to fill the plate. Phones and tablets: tap a row to open it.
  rowsEl.addEventListener('pointerover', (e) => {
    if (!wide.matches) return;
    const r = e.target.closest('.row');
    if (r) showPlate(byId(r.dataset.id));
  });
  rowsEl.addEventListener('focusin', (e) => {
    const r = e.target.closest('.row');
    if (r && wide.matches) showPlate(byId(r.dataset.id));
  });
  rowsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.row__btn');
    if (!b) return;
    const r = b.closest('.row');
    if (wide.matches) { showPlate(byId(r.dataset.id)); return; }
    const open = !r.classList.contains('is-open');
    $$('.row.is-open', rowsEl).forEach((o) => { o.classList.remove('is-open'); $('.row__btn', o).setAttribute('aria-expanded', 'false'); });
    r.classList.toggle('is-open', open);
    b.setAttribute('aria-expanded', open);
    if (open && anim) {
      gsap.fromTo($('.photo', r), { rotation: 12, scale: 0.7 }, { rotation: -3, scale: 1, duration: 0.6, ease: 'back.out(2)', delay: 0.08 });
      setTimeout(() => ScrollTrigger.refresh(), 480);
    }
  });

  // Size switch: Regular or Large. Updates every loaded fries price and order message.
  const sizeEl = $('.size');
  sizeEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-size]');
    if (!b) return;
    size = +b.dataset.size;
    sizeEl.dataset.on = size;
    $$('[data-size]', sizeEl).forEach((x) => x.setAttribute('aria-checked', x === b));
    $$('.row', rowsEl).forEach((r) => {
      const m = byId(r.dataset.id);
      if (!m.loaded) return;
      const p = $('[data-price]', r);
      p.textContent = inr(priceOf(m));
      const o = $('[data-order]', r);
      o.dataset.order = msgOf(m);
      wireOrder(o);
      if (anim) gsap.fromTo(p, { scale: 1.5, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(3)' });
    });
    showPlate(byId(plateId), true);
  });

  /* ==================================================================
     Sauce lab: one bowl, six sauces
     ================================================================== */
  const HEAT = ['No heat', 'Mild', 'Medium', 'Fire'];
  const labPin = $('#labPin');
  const labSteps = $('#labSteps');
  labSteps.innerHTML = FLAVOURS.map((f, i) => `
    <li data-i="${i}">
      <b>${i + 1}</b>
      <span>${f.name}
        <small>${f.tags}. ${f.desc}</small>
        <small class="heat" aria-label="Heat: ${HEAT[f.heat]}">${[1, 2, 3].map((n) => `<i class="${n <= f.heat ? 'on' : ''}"></i>`).join('')}<em>${HEAT[f.heat]}</em></small>
      </span>
    </li>`).join('');
  const stepEls = $$('li', labSteps);
  const labName = $('#labName');
  const labOrder = $('#labOrder');
  const sauces = [$('#sauce'), $('#sauceEdge'), $('#sauce2'), $('#sauce2Edge')];
  const [sauce, sauceEdge, sauce2, sauce2Edge] = sauces;
  const bits = $$('#bits circle');

  const showStep = (n) => {
    if (labPin.dataset.step === String(n) && labPin.dataset.ready) return;
    labPin.dataset.step = n;
    labPin.dataset.ready = '1';
    const f = FLAVOURS[n - 1];
    stepEls.forEach((li, i) => {
      li.classList.toggle('is-on', i === n - 1);
      li.classList.toggle('is-past', i < n - 1);
    });
    labName.textContent = f.name;
    labOrder.dataset.order = `Hi Fry Frenchi! I'd like to order: ${f.name} loaded fries (Regular ₹${SIZES[0].price} / Large ₹${SIZES[1].price})`;
    wireOrder(labOrder);
    if (anim) gsap.fromTo(labName, { scale: 0.6, rotation: -12 }, { scale: 1, rotation: -3, duration: 0.5, ease: 'back.out(2.6)', overwrite: true });
  };

  // Without motion: paint the bowl straight away and let a tap pick the flavour.
  const paint = (i) => {
    const f = FLAVOURS[i];
    sauce.style.stroke = f.sauce;
    sauce2.style.stroke = f.sauce;
    bits.forEach((b) => (b.style.fill = f.bits));
  };
  paint(0);
  showStep(1);

  let labTl = null;
  labSteps.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const i = +li.dataset.i;
    if (labTl && labTl.scrollTrigger) { scrollToTarget(labTl.scrollTrigger.labelToScroll('f' + (i + 1)) + 2); return; }
    paint(i);
    showStep(i + 1);
  });

  /* ==================================================================
     Party planner: builds the message, copies it and opens the chat
     ================================================================== */
  const quote = $('#quote');
  const qKinds = $('#qKinds');
  const qCount = $('#qCount');
  const qDate = $('#qDate');
  qDate.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  qKinds.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    $$('button', qKinds).forEach((x) => x.setAttribute('aria-pressed', x === b));
    if (anim) gsap.fromTo(b, { scale: 0.85, rotation: -6 }, { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(3)' });
  });
  const clampCount = (n) => Math.max(10, Math.min(2000, Math.round(n) || 10));
  $$('.q-step', quote).forEach((b) => b.addEventListener('click', () => {
    qCount.value = clampCount(+qCount.value + +b.dataset.step);
    if (anim) gsap.fromTo(qCount, { scale: 1.25 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
  }));
  qCount.addEventListener('change', () => { qCount.value = clampCount(+qCount.value); });

  quote.addEventListener('submit', (e) => {
    e.preventDefault();
    const kind = ($('[aria-pressed="true"]', qKinds) || {}).textContent || 'Party';
    const date = qDate.value ? new Date(qDate.value + 'T12:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Not fixed yet';
    const lines = [
      'Hi Fry Frenchi! Party order enquiry.',
      `Occasion: ${kind}`,
      `Guests: about ${clampCount(+qCount.value)}`,
      `Date: ${date}`,
      $('#qPlace').value.trim() && `Where: ${$('#qPlace').value.trim()}`,
      $('#qName').value.trim() && `Name: ${$('#qName').value.trim()}`,
    ].filter(Boolean).join('\n');
    const win = window.open(orderHref(lines), '_blank');
    if (win) win.opener = null;
    if (CONFIG.whatsapp) { if (!win) location.href = orderHref(lines); return; }
    copy(lines).then((ok) => toast(ok
      ? 'Request copied. Paste it in our Instagram chat and hit send.'
      : 'Opening our Instagram chat. Tell us the date and headcount.'));
    if (!win) location.href = orderHref(lines);
  });

  /* ==================================================================
     Motion. Everything below needs GSAP and no reduced-motion setting.
     ================================================================== */
  if (!anim) {
    root.classList.remove('prep');
    document.body.classList.remove('is-loading');
    return;
  }

  /* ---------- Hero entry: two cartons meet in the middle, fries burst out, FRIES follows ---------- */
  scrollTo(0, 0);
  lenis && lenis.stop();
  const stage = $('#stage');
  const [cartonA, cartonB] = $$('.hero .carton');
  const friesA = $$('.fry', cartonA);
  const friesB = $$('.fry', cartonB);
  const chips = $$('.chip', stage);
  const word = $('.hero__word');
  const letters = $$('.hero__big span');
  const heroLogo = $('.hero__logo');
  const sticker = $('.hero__sticker');
  const drizzle = $$('#drizzle path');
  const REST = { a: -10, b: 9 };
  const SHADOW_OFF = 'drop-shadow(0px 0px 0px rgba(90,40,0,0))';
  const SHADOW_ON = 'drop-shadow(0px 22px 16px rgba(90,40,0,0.28))';
  const drizzleLen = drizzle[0].getTotalLength();
  gsap.set(drizzle, { strokeDasharray: drizzleLen + 2, strokeDashoffset: drizzleLen + 2 });

  const setUpIntro = () => {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const size = cartonA.offsetWidth;
    const whole = Math.min(1.3, (W * 0.8) / (size * 2), (H * 0.78) / (size * 1.2));
    const cx = W / 2;
    const cy = H / 2;
    const gap = size * whole * 0.47;
    const to = (el, tx) => ({ x: tx - (el.offsetLeft + el.offsetWidth / 2), y: cy - (el.offsetTop + el.offsetHeight / 2) });
    gsap.set([cartonA, cartonB], { filter: SHADOW_OFF, scale: whole });
    gsap.set(cartonA, { ...to(cartonA, cx - gap), rotation: 8 });
    gsap.set(cartonB, { ...to(cartonB, cx + gap), rotation: -8 });
    gsap.set([...friesA, ...friesB], { y: 150 });
    gsap.set(chips, { x: 0, y: -size * whole * 0.3, visibility: 'hidden' });
    gsap.set(letters, { visibility: 'hidden' });
    gsap.set(heroLogo, { scale: 0, rotation: 14 });
    gsap.set(sticker, { scale: 0, rotation: -60 });
    gsap.set(drizzle, { strokeDashoffset: drizzleLen + 2 });
    gsap.set('.top', { yPercent: -130 });
    gsap.set('.hero__foot > *', { y: () => innerHeight * 0.45 });
    return { size, whole, cx, cy };
  };

  const playIntro = () => {
    const g = setUpIntro();
    root.classList.remove('prep');
    // Letters burst out of the spot where the cartons met
    const fromX = (i, el) => g.cx - (el.offsetLeft + el.offsetWidth / 2) - word.offsetLeft;
    const fromY = (i, el) => g.cy - (el.offsetTop + el.offsetHeight / 2) - word.offsetTop;

    gsap.timeline({ onComplete: afterIntro })
      // 1. Two cartons slide in from the sides and bump in the middle, like the handshake in the logo
      .from(cartonA, { x: '-=' + innerWidth * 0.8, rotation: -40, duration: 0.6, ease: 'power3.in' })
      .from(cartonB, { x: '+=' + innerWidth * 0.8, rotation: 40, duration: 0.6, ease: 'power3.in' }, '<')
      .add('meet')
      .to([cartonA, cartonB], { scaleX: g.whole * 0.88, scaleY: g.whole * 1.08, duration: 0.08, ease: 'power2.out' }, 'meet')
      .to([cartonA, cartonB], { scaleX: g.whole, scaleY: g.whole, duration: 0.45, ease: 'back.out(3)' }, 'meet+=0.08')
      .fromTo(stage, { x: 0 }, { x: 6, duration: 0.05, yoyo: true, repeat: 3, ease: 'power1.inOut' }, 'meet')
      // 2. Fries shoot up out of both cartons, a few fly loose
      .to([...friesA, ...friesB], { y: 0, duration: 0.5, stagger: { each: 0.02, from: 'random' }, ease: 'back.out(2.2)' }, 'meet+=0.04')
      .set(chips, { visibility: 'visible' }, 'meet')
      .to(chips, {
        x: (i) => (i % 2 ? 1 : -1) * gsap.utils.random(40, 200),
        y: () => '-=' + gsap.utils.random(120, 280),
        rotation: () => gsap.utils.random(-260, 260),
        duration: 0.45, ease: 'power2.out',
      }, 'meet')
      .to(chips, { y: '+=' + innerHeight, rotation: '+=120', duration: 0.9, ease: 'power2.in' }, 'meet+=0.45')
      .set(chips, { visibility: 'hidden' })
      // 3. The cartons step back to their corners and FRIES bursts out from the middle
      .add('open', 'meet+=0.5')
      .add(() => { document.body.classList.remove('is-loading'); lenis && lenis.start(); }, 'open')
      .to(cartonA, { x: 0, y: 0, scale: 1, rotation: REST.a, filter: SHADOW_ON, duration: 0.95, ease: 'back.out(1.5)' }, 'open')
      .to(cartonB, { x: 0, y: 0, scale: 1, rotation: REST.b, filter: SHADOW_ON, duration: 0.95, ease: 'back.out(1.5)' }, 'open+=0.04')
      .set(letters, { visibility: 'visible' }, 'open+=0.04')
      .fromTo(letters, { x: fromX, y: fromY, scale: 0.2, rotation: () => gsap.utils.random(-30, 30) },
        { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.8, stagger: { each: 0.05, from: 'center' }, ease: 'back.out(1.6)' }, 'open+=0.04')
      // 4. Cheese sauce drizzles across the word, then "get fancy"
      .to(drizzle, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 'open+=0.6')
      .to(heroLogo, { scale: 1, rotation: -4, duration: 0.55, ease: 'back.out(2.4)' }, 'open+=0.85')
      .to(sticker, { scale: 1, rotation: -8, duration: 0.6, ease: 'back.out(2.2)' }, 'open+=1')
      .to('.top', { yPercent: 0, duration: 0.7, ease: 'back.out(1.4)' }, 'open+=0.5')
      .to('.hero__foot > *', { y: 0, duration: 0.7, stagger: 0.07, ease: 'back.out(1.4)' }, 'open+=0.55');
  };

  const ready = Promise.race([
    Promise.all([
      document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
      new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }))),
    ]),
    new Promise((r) => setTimeout(r, 3000)),
  ]);
  ready.then(playIntro);

  function afterIntro() {
    gsap.set([cartonA, cartonB], { clearProps: 'filter' });
    // Hero breaks apart as you scroll away: cartons tip over, fries fly, letters scatter
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true } })
      .to(cartonA, { x: () => -innerWidth * 0.06, y: () => innerHeight * 0.18, rotation: REST.a - 22, ease: 'none' }, 0)
      .to(cartonB, { x: () => innerWidth * 0.06, y: () => -innerHeight * 0.06, rotation: REST.b + 22, ease: 'none' }, 0)
      .to([...friesA, ...friesB], { y: (i) => -30 - (i % 4) * 14, ease: 'none' }, 0)
      .to(letters, { y: (i) => (i % 2 ? 90 : -60), rotation: (i) => (i % 2 ? 8 : -8), ease: 'none' }, 0)
      .to(heroLogo, { y: 120, rotation: -12, ease: 'none' }, 0);
    ScrollTrigger.refresh();
  }

  /* ---------- Compact bar + floating order button ---------- */
  ScrollTrigger.create({
    trigger: '.hero', start: 'bottom 90px',
    onEnter: () => { $('#bar').classList.add('is-on'); $('.fab').classList.add('is-on'); },
    onLeaveBack: () => { $('#bar').classList.remove('is-on'); $('.fab').classList.remove('is-on'); },
  });

  /* ---------- Story: lines slide with scroll, photos drift ---------- */
  $$('.story__line').forEach((l) => {
    const dir = +l.dataset.dir;
    gsap.fromTo(l, { xPercent: dir < 0 ? 0 : -18 }, { xPercent: dir < 0 ? -18 : 0, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
  });
  $$('[data-speed]').forEach((el) => {
    const s = +el.dataset.speed;
    gsap.fromTo(el, { yPercent: -s * 100 }, { yPercent: s * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
  });
  gsap.from('.photos__tag', { scale: 0, rotation: 30, duration: 0.6, ease: 'back.out(2.4)', scrollTrigger: { trigger: '.photos', start: 'top 70%' } });

  /* ---------- Sauce lab: scroll pours each sauce in turn ---------- */
  (() => {
    const bowl = $('#bowl');
    const lens = sauces.map((p) => p.getTotalLength() + 2);
    sauces.forEach((p, i) => gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i] }));
    gsap.set(bits, { scale: 0, transformOrigin: '50% 50%' });

    const pour = (tl, f) => tl
      .set([sauce, sauce2], { stroke: f.sauce })
      .set(bits, { fill: f.bits })
      .to(bowl, { y: -18, rotation: -3, duration: 0.25, ease: 'power2.out' })
      .to(bowl, { y: 0, rotation: 0, duration: 0.35, ease: 'bounce.out' })
      .to([sauce, sauceEdge], { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, '<-0.1')
      .to([sauce2, sauce2Edge], { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, '<0.25')
      .to(bits, { scale: 1, duration: 0.4, stagger: 0.03, ease: 'back.out(3)' }, '<0.2');
    const clear = (tl) => tl
      .to(bits, { scale: 0, duration: 0.25, stagger: 0.015, ease: 'power2.in' })
      .to(sauces, { strokeDashoffset: (i) => -lens[i], duration: 0.45, ease: 'power2.in' }, '<')
      .set(sauces, { strokeDashoffset: (i) => lens[i] });

    labTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#flavours', start: 'top top', end: () => '+=' + (wide.matches ? 3600 : 2600), pin: labPin, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
      },
      // Follow the timeline itself so the text matches the sauce on screen
      onUpdate: () => {
        const t = labTl.time();
        let n = 1;
        FLAVOURS.forEach((f, i) => { if (t >= labTl.labels['f' + (i + 1)] - 0.05) n = i + 1; });
        showStep(n);
      },
    });
    FLAVOURS.forEach((f, i) => {
      if (i) clear(labTl);
      labTl.addLabel('f' + (i + 1));
      pour(labTl, f);
      labTl.to({}, { duration: 0.6 });
    });
    // Start with the first sauce already in the bowl
    labTl.progress(0.0001);
    gsap.fromTo(bowl, { y: 120, rotation: 8 }, { y: 0, rotation: 0, ease: 'back.out(1.6)', duration: 0.9, scrollTrigger: { trigger: '#flavours', start: 'top 80%' }, immediateRender: false });
  })();

  /* ---------- Menu board: rows land one by one ---------- */
  gsap.from($$('.row__btn', rowsEl), { x: -40, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'back.out(1.8)', clearProps: 'transform,opacity', scrollTrigger: { trigger: rowsEl, start: 'top 80%' } });

  /* ---------- Party stickers pop in ---------- */
  gsap.from('.kinds .sticker', { scale: 0, rotation: () => gsap.utils.random(-40, 40), duration: 0.6, stagger: 0.08, ease: 'back.out(2.4)', scrollTrigger: { trigger: '.kinds', start: 'top 85%' } });

  /* ---------- The food truck drives in with your scroll ---------- */
  const truck = $('#truck');
  const road = $('#road');
  gsap.set(truck, { xPercent: -50 });
  $$('.truck .wheel').forEach((w, i) => gsap.set(w, { svgOrigin: i ? '222 124' : '62 124' }));
  const drive = { trigger: road, start: 'top bottom', end: 'top 30%', scrub: 0.8 };
  gsap.fromTo(truck, { x: () => -(road.clientWidth / 2 + truck.offsetWidth) }, { x: () => road.clientWidth * 0.18, ease: 'none', scrollTrigger: { ...drive, invalidateOnRefresh: true } });
  gsap.to($$('.truck .wheel'), { rotation: 360 * 8, ease: 'none', scrollTrigger: drive });
  gsap.to('.truck svg', { y: -2.5, duration: 0.16, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.truck__roof', { rotation: -4, svgOrigin: '116 42', duration: 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  /* ---------- Footer: fries drop onto the wordmark ---------- */
  $$('.drop').forEach((d, i) => {
    gsap.fromTo(d, { y: -320 - i * 60, rotation: -140 + i * 70 }, {
      y: 0, rotation: [-8, 62, -28, 18][i], ease: 'bounce.out',
      scrollTrigger: { trigger: '.foot__mark', start: 'top 95%', end: 'top 45%', scrub: 0.6 },
    });
  });

  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
