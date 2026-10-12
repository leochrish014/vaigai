const TA = __TA__, CUT = __CUT__, FNC = __FNC__, IMG = __IMG__, PR = __PR__, MO = __MO__, WA = '__WA__', PROD = __PROD__;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches, fine = matchMedia('(pointer:fine)').matches;
const HAS = !!(window.gsap && window.ScrollTrigger);
window.dataLayer = window.dataLayer || [];
const track = (e, p) => {
    try {
        dataLayer.push(Object.assign({ event: e }, p || {}));
    }
    catch (x) { }
};
/* ---- marketing: UTM capture, tag loader with consent, conversion events ---- */
const CFG = window.VAIGAI_CONFIG || {};
const UTM = (() => {
    let u = {};
    try {
        u = JSON.parse(sessionStorage.getItem('vaigai-utm') || '{}');
    }
    catch (e) { }
    try {
        new URLSearchParams(location.search).forEach((v, k) => {
            if (/^(utm_|gclid$|fbclid$)/.test(k))
                u[k] = v;
        });
        sessionStorage.setItem('vaigai-utm', JSON.stringify(u));
    }
    catch (e) { }
    return u;
})();
track('page_context', Object.assign({
    page_type: 'home', language: 'en'
}, UTM));
function loadTags() {
    if (CFG.gtm) {
        (function (w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': Date.now(), event: 'gtm.js'
            });
            const f = d.getElementsByTagName(s)[0], j = d.createElement(s);
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', CFG.gtm);
    }
    if (CFG.ga4) {
        const g = document.createElement('script');
        g.async = true;
        g.src = 'https://www.googletagmanager.com/gtag/js?id=' + CFG.ga4;
        document.head.appendChild(g);
        window.gtag = function () {
            dataLayer.push(arguments);
        };
        gtag('js', new Date());
        gtag('config', CFG.ga4);
    }
    if (CFG.pixel) {
        !function (f, b, e, v, n, t, s) {
            if (f.fbq)
                return;
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq)
                f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = 'https://connect.facebook.net/en_US/fbevents.js';
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }(window, document, 'script');
        fbq('init', CFG.pixel);
        fbq('track', 'PageView');
    }
}
if (CFG.gtm || CFG.ga4 || CFG.pixel) {
    let c;
    try {
        c = localStorage.getItem('vaigai-consent');
    }
    catch (e) { }
    if (c === 'yes')
        loadTags();
    else if (c !== 'no') {
        const b = document.createElement('div');
        b.className = 'consent';
        b.setAttribute('role', 'region');
        b.setAttribute('aria-label', 'Cookie notice');
        b.innerHTML = '<p>We use cookies to measure visits and improve this site. Accept to allow analytics and ad measurement.</p><button class="y" type="button">Accept</button><button class="n" type="button">Decline</button>';
        document.body.appendChild(b);
        const done = v => {
            try {
                localStorage.setItem('vaigai-consent', v);
            }
            catch (e) { }
            b.remove();
            track('consent', { choice: v });
            if (v === 'yes')
                loadTags();
        };
        b.querySelector('.y').onclick = () => done('yes');
        b.querySelector('.n').onclick = () => done('no');
    }
}
$$('img[data-img]').forEach(i => {
    if (IMG[i.dataset.img])
        i.src = IMG[i.dataset.img];
});
const tick = f => HAS ? gsap.ticker.add(f) : (function l() {
    f();
    requestAnimationFrame(l);
})();
if (!HAS) {
    document.body.classList.add('nogs');
    const p = $('#pre');
    if (p)
        p.remove();
}
let lang = 'en', tr = [];
/* ---- theme (light / dark) ---- */
const tb = $('#themebtn');
function setTheme(t, user) {
    root.setAttribute('data-theme', t);
    tb.setAttribute('aria-pressed', String(t === 'dark'));
    tb.setAttribute('aria-label', lang === 'ta' ? (t === 'dark' ? 'ஒளிப் பயன்முறைக்கு மாற்று' : 'இருண்ட பயன்முறைக்கு மாற்று') : (t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'));
    if (user) {
        $$('meta[name=theme-color]').forEach(m => {
            m.removeAttribute('media');
            m.content = t === 'dark' ? '#06303a' : '#f7f5ee';
        });
        try {
            localStorage.setItem('vaigai-theme', t);
        }
        catch (e) { }
        track('theme_toggle', { theme: t });
    }
}
setTheme(root.getAttribute('data-theme') || 'light', false);
tb.addEventListener('click', () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true));
/* ---- language: English / Tamil ---- */
const norm = s => s.replace(/\s+/g, ' ').trim();
{
    const els = $$('header *,main *,footer *');
    const keep = els.filter(el => {
        const k = norm(el.textContent);
        return TA[k] && ![...el.children].some(c => norm(c.textContent) === k);
    });
    tr = keep.map(el => ({
        el, en: el.innerHTML, ta: TA[norm(el.textContent)]
    }));
    window.__i18n = {
        matched: tr.length, keys: Object.keys(TA).length, missing: Object.keys(TA).filter(k => !tr.some(o => norm(o.el.textContent) === k))
    };
}
const lb = $('#langbtn');
function setLang(l, user) {
    lang = l;
    root.setAttribute('lang', l === 'ta' ? 'ta' : 'en-IN');
    tr.forEach(o => {
        o.el.innerHTML = l === 'ta' ? o.ta : o.en;
    });
    lb.textContent = l === 'ta' ? 'EN' : 'தமிழ்';
    lb.setAttribute('aria-label', l === 'ta' ? 'View in English' : 'தமிழில் பார்க்க. View in Tamil');
    lb.setAttribute('lang', l === 'ta' ? 'en' : 'ta');
    setTheme(root.getAttribute('data-theme') || 'light', false);
    if (typeof upd === 'function') {
        upd();
        paint();
    }
    if (user) {
        try {
            localStorage.setItem('vaigai-lang', l);
        }
        catch (e) { }
        track('language_toggle', { language: l });
        if (HAS)
            setTimeout(() => ScrollTrigger.refresh(), 60);
    }
}
lb.addEventListener('click', () => {
    if (window.VAIGAI_ALT_URL) {
        track('language_toggle', { language: 'en' });
        location.href = window.VAIGAI_ALT_URL;
        return;
    }
    setLang(lang === 'ta' ? 'en' : 'ta', true);
});
let lenis;
if (HAS && !reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
}
const goTo = t => {
    if (!t)
        return;
    lenis ? lenis.scrollTo(t) : t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
};
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t)
        return;
    e.preventDefault();
    goTo(t);
}));
$('#cartbtn').addEventListener('click', () => goTo($('#cta')));
/* ---- marketing events ---- */
document.addEventListener('click', e => {
    const a = e.target.closest('[data-track]');
    if (a)
        track(a.dataset.track);
    if (e.target.closest('#fab'))
        track('whatsapp_fab');
    const w = e.target.closest('a[href*="wa.me"]');
    if (w)
        track('generate_lead', Object.assign({
            method: 'whatsapp', location: w.id || w.dataset.track || 'link'
        }, UTM));
});
const hit = {};
addEventListener('scroll', () => {
    const d = Math.round((scrollY + innerHeight) / document.documentElement.scrollHeight * 100);
    [25, 50, 75, 100].forEach(m => {
        if (d >= m && !hit[m]) {
            hit[m] = 1;
            track('scroll_depth', { percent: m });
        }
    });
}, { passive: true });
/* ---- 3D depth carousel ---- */
const N = PR.length, cards = $$('.dcard'), dc = $('#dc');
let cT = 0, cP = 0, dx = null, moved = false;
const cur = () => ((Math.round(cT) % N) + N) % N;
let lastView = -1, viewReady = false;
function upd() {
    const p = PR[cur()], t = lang === 'ta';
    if (viewReady && cur() !== lastView) {
        track('view_item', {
            item_name: p.n, price: p.p, currency: 'INR'
        });
    }
    lastView = cur();
    $('#pn1').textContent = t ? p.nt : p.n;
    $('#pt1').textContent = p.ta + ' · ' + p.u;
    $('#pp1').textContent = '₹' + p.p;
    $('#pd1').textContent = t ? p.dt : p.d;
}
tick(() => {
    cP += (cT - cP) * .09;
    cards.forEach((c, i) => {
        let o = ((i - cP + N / 2) % N + N) % N - N / 2;
        const a = Math.abs(o);
        c.style.transform = `translateX(${o * 58}%) translateZ(${-a * 190}px) rotateY(${-o * 34}deg) scale(${1 - a * .05})`;
        c.style.opacity = a > 2.6 ? 0 : Math.max(0, 1 - a * .28);
        c.style.zIndex = 10 - Math.round(a);
        c.style.pointerEvents = a > 2.6 ? 'none' : 'auto';
    });
});
$('#cp').addEventListener('click', () => {
    cT = Math.round(cT) - 1;
    upd();
});
$('#cnx').addEventListener('click', () => {
    cT = Math.round(cT) + 1;
    upd();
});
dc.addEventListener('click', e => {
    const c = e.target.closest('.dcard');
    if (c && !moved) {
        let o = ((+c.dataset.i - Math.round(cT)) % N + N) % N;
        if (o > N / 2)
            o -= N;
        cT = Math.round(cT) + o;
        upd();
    }
});
dc.addEventListener('pointerdown', e => {
    dx = e.clientX;
    moved = false;
});
addEventListener('pointermove', e => {
    if (dx === null)
        return;
    const d = e.clientX - dx;
    if (Math.abs(d) > 3)
        moved = true;
    cT -= d / (innerWidth * .16);
    dx = e.clientX;
    upd();
});
const snap = () => {
    if (dx !== null) {
        cT = Math.round(cT);
        dx = null;
        upd();
        setTimeout(() => moved = false, 50);
    }
};
addEventListener('pointerup', snap);
addEventListener('pointercancel', snap);
addEventListener('touchend', snap);
dc.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
        cT = Math.round(cT) + 1;
        upd();
        e.preventDefault();
    }
    if (e.key === 'ArrowLeft') {
        cT = Math.round(cT) - 1;
        upd();
        e.preventDefault();
    }
});
upd();
viewReady = true;
/* ---- basket + WhatsApp order ---- */
const basket = {};
$('#addb').addEventListener('click', () => {
    const i = cur();
    basket[i] = (basket[i] || 0) + 1;
    paint();
    track('add_to_cart', {
        item_name: PR[i].n, price: PR[i].p, currency: 'INR'
    });
});
function paint() {
    const ks = Object.keys(basket), cnt = ks.reduce((a, k) => a + basket[k], 0), tot = ks.reduce((a, k) => a + basket[k] * PR[k].p, 0);
    $('#cc').textContent = cnt;
    const msg = 'Hi Vaigai Milk, I would like to order:\n' + ks.map(k => basket[k] + ' x ' + PR[k].n + ' (' + PR[k].u + ')').join('\n') + '\nTotal: Rs ' + tot + (UTM.utm_source ? '\nSource: ' + UTM.utm_source + (UTM.utm_campaign ? ' / ' + UTM.utm_campaign : '') : '');
    const t = lang === 'ta';
    $('#basket').innerHTML = ks.length ? `<ul>${ks.map(k => `<li><span>${basket[k]} × ${t ? PR[k].nt : PR[k].n} (${PR[k].u})</span><b>₹${basket[k] * PR[k].p}</b></li>`).join('')}</ul><div class="bt"><b>${t ? 'மொத்தம்' : 'Total'} ₹${tot}</b><a class="btn wa mag" id="wao" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent(msg)}">${t ? 'வாட்ஸ்அப்பில் ஆர்டர் செய்' : 'Order on WhatsApp'}</a><button class="btn" id="aco" type="button">${t ? 'உதவியாளருடன் முடி' : 'Checkout with assistant'}</button></div>` : `<p>${t ? 'உங்கள் கூடை காலியாக உள்ளது. மேலே உள்ள பொருட்களிலிருந்து சேர்க்கவும்.' : 'Your basket is empty. Add something from the products above.'}</p>`;
    const w = $('#wao');
    if (w)
        w.addEventListener('click', () => track('begin_checkout', {
            value: tot, currency: 'INR'
        }));
}
paint();
/* ---- moments ---- */
const mb = $$('#ml button'), mi = $$('#mp img'), mc = $$('.mcx');
function setM(i) {
    mb.forEach((b, k) => {
        b.classList.toggle('on', k === i);
        b.setAttribute('aria-pressed', String(k === i));
    });
    mi.forEach((im, k) => im.classList.toggle('on', k === i));
    mc.forEach((c, k) => c.classList.toggle('on', k === i));
}
$('#ml').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b)
        setM(+b.dataset.i);
});
$('#ml').addEventListener('pointerover', e => {
    const b = e.target.closest('button');
    if (b && fine)
        setM(+b.dataset.i);
});
$('#mcap').addEventListener('click', e => {
    const a = e.target.closest('[data-p]');
    if (a) {
        cT = +a.dataset.p;
        upd();
        track('moment_cta');
    }
});
setM(0);
{
    let sl;
    try {
        sl = localStorage.getItem('vaigai-lang');
    }
    catch (e) { }
    if (window.VAIGAI_FORCE_LANG)
        sl = window.VAIGAI_FORCE_LANG;
    else if (sl !== 'ta' && sl !== 'en')
        sl = (navigator.language || '').toLowerCase().startsWith('ta') ? 'ta' : 'en';
    if (sl === 'ta')
        setLang('ta', false);
}
/* ---- hero carousel + floating 3D particles (no GSAP needed) ---- */
const hero = $('#hero'), hs = $$('.hs'), hbg = $$('.hbgc'), ht = $$('.htabs button'), HN = hs.length;
let hi = 0, htimer, hpause = false;
function hRestart() {
    clearTimeout(htimer);
    if (reduce || hpause)
        return;
    htimer = setTimeout(() => hGo(hi + 1, 'next'), 6500);
}
function hGo(i, dir) {
    i = (i + HN) % HN;
    if (i === hi)
        return;
    hero.setAttribute('data-dir', dir || (i > hi ? 'next' : 'prev'));
    const old = hs[hi];
    old.classList.remove('on');
    old.classList.add('out');
    setTimeout(() => old.classList.remove('out'), 1400);
    hbg[hi].classList.remove('on');
    hi = i;
    hs[i].classList.add('on');
    hs[i].classList.remove('out');
    hbg[i].classList.add('on');
    ht.forEach((b, k) => {
        b.setAttribute('aria-selected', String(k === i));
        b.tabIndex = k === i ? 0 : -1;
    });
    hs.forEach((s, k) => k === i ? s.removeAttribute('aria-hidden') : s.setAttribute('aria-hidden', 'true'));
    track('hero_slide', { slide: i + 1 });
    hRestart();
}
function heroReady() {
    hero.classList.add('ready');
    hRestart();
}
ht.forEach((b, k) => {
    b.tabIndex = k === 0 ? 0 : -1;
    b.addEventListener('click', () => hGo(k));
    b.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            const n = (k + (e.key === 'ArrowRight' ? 1 : -1) + HN) % HN;
            hGo(n);
            ht[n].focus();
            e.preventDefault();
        }
    });
});
$('#hprev').addEventListener('click', () => hGo(hi - 1, 'prev'));
$('#hnext').addEventListener('click', () => hGo(hi + 1, 'next'));
const pauseH = p => {
    hpause = p;
    hero.classList.toggle('paused', p);
    if (p)
        clearTimeout(htimer);
    else {
        const a = ht[hi];
        a.setAttribute('aria-selected', 'false');
        void a.offsetWidth;
        a.setAttribute('aria-selected', 'true');
        hRestart();
    }
};
hero.addEventListener('pointerenter', () => {
    if (fine)
        pauseH(true);
});
hero.addEventListener('pointerleave', () => {
    if (fine)
        pauseH(false);
});
hero.addEventListener('focusin', () => pauseH(true));
hero.addEventListener('focusout', () => pauseH(false));
document.addEventListener('visibilitychange', () => {
    if (document.hidden)
        clearTimeout(htimer);
    else if (!hpause)
        hRestart();
});
let sx = null;
$('.hslides').addEventListener('pointerdown', e => {
    if (!e.target.closest('a,button'))
        sx = e.clientX;
});
addEventListener('pointerup', e => {
    if (sx !== null && Math.abs(e.clientX - sx) > 50)
        hGo(hi + (e.clientX < sx ? 1 : -1), e.clientX < sx ? 'next' : 'prev');
    sx = null;
});
$$('.hs-copy a[data-p]').forEach(a => a.addEventListener('click', () => {
    cT = +a.dataset.p;
    upd();
}));
/* particles */
const KIND = {
    milk: ['drop', 'drop', 'drop', 'mist'], gold: ['gdrop', 'gdrop', 'drop', 'mote'], butter: ['crumb', 'crumb', 'drop', 'salt'], curd: ['berry', 'almond', 'drop', 'almond'], mint: ['leaf', 'drop', 'leaf', 'drop'], farm: ['mote', 'mote', 'leaf', 'drop'], mix: ['drop', 'almond', 'berry', 'leaf', 'gdrop'], drop: ['drop']
};
$$('.parts').forEach(el => {
    const set = KIND[el.dataset.parts] || KIND.drop, x0 = innerWidth < 800 ? 0 : +el.dataset.x || 0;
    let n = +el.dataset.n || 14;
    if (innerWidth < 800)
        n = Math.round(n * .6);
    el.innerHTML = Array.from({ length: n }, (_, i) => {
        const t = set[i % set.length], d = .4 + Math.random() * 2.4, s = (.55 + Math.random() * .9) * (.6 + d * .3), v = (Math.random() * 1.4 + .3) * (Math.random() < .5 ? -1 : 1), r = (Math.random() * 2 - 1).toFixed(2), x = x0 + Math.random() * (100 - x0), y = Math.random() * 100;
        return `<span class="pt t-${t}" style="--d:${d.toFixed(2)};--s:${s.toFixed(2)};--v:${v.toFixed(2)};--r:${r};left:${x.toFixed(1)}%;top:${y.toFixed(1)}%"><i style="animation-duration:${(4 + Math.random() * 5).toFixed(1)}s;animation-delay:-${(Math.random() * 6).toFixed(1)}s"></i></span>`;
    }).join('');
});
/* global mouse + scroll depth variables */
let tx = 0, ty = 0, mx = 0, my = 0;
if (!reduce) {
    addEventListener('pointermove', e => {
        tx = e.clientX / innerWidth * 2 - 1;
        ty = e.clientY / innerHeight * 2 - 1;
    });
    tick(() => {
        mx += (tx - mx) * .06;
        my += (ty - my) * .06;
        root.style.setProperty('--mx', mx.toFixed(3));
        root.style.setProperty('--my', my.toFixed(3));
    });
}
const boxes = $$('.parts').filter(el => !el.closest('#hero')), clamp = v => Math.min(1, Math.max(0, v));
let sct = false;
function depth() {
    sct = false;
    if (reduce)
        return;
    const vh = innerHeight;
    hero.style.setProperty('--pp', clamp(scrollY / vh).toFixed(3));
    boxes.forEach(el => {
        const pin = el.closest('.pin'), r = (pin ? pin.parentElement : el.parentElement).getBoundingClientRect();
        const p = pin ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height);
        el.style.setProperty('--pp', (clamp(p) - .5).toFixed(3));
    });
}
addEventListener('scroll', () => {
    if (!sct) {
        sct = true;
        requestAnimationFrame(depth);
    }
}, { passive: true });
addEventListener('resize', depth);
depth();
if (!HAS)
    heroReady();
/* ---- cut-out products with image-derived floating particles (3D depth, mouse + scroll) ---- */
const FSN = [], fsAtl = {};
const loadAtl = k => fsAtl[k] || (fsAtl[k] = new Promise(res => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = IMG['fs_' + k + '_atl'] || ('images/cut/' + FNC[k] + '-particles.webp');
}));
const FPAL = {
    combo: ['255,255,255', '190,235,200'], badam: ['255,238,190', '255,214,120'], carton: ['255,255,255', '200,240,220'], family: ['255,255,255', '255,226,150']
};
const dotTex = (rgb, size) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d'), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, `rgba(${rgb},.95)`);
    gr.addColorStop(.5, `rgba(${rgb},.45)`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, size, size);
    return c;
};
$$('.fs').forEach(el => {
    const k = el.dataset.fs, m = CUT[k];
    if (!m)
        return;
    const o = {
        el, m, cb: $('.fs-b', el), cf: $('.fs-f', el), sp: [], dots: [], vis: false, fx: 0, fy: 0, fs: 0, atl: null, dpr: 1, rw: 1, rh: 1
    };
    o.tex = (FPAL[k] || FPAL.combo).map(c => dotTex(c, 64));
    for (let i = 0; i < (innerWidth < 800 ? 9 : 16); i++)
        o.dots.push({
            x: Math.random() * 1.3 - .15, y: Math.random() * 1.3 - .15, s: 8 + Math.random() * 30, d: .3 + Math.random() * 1.6, ph: Math.random() * 6.28, sp: .15 + Math.random() * .5, t: i % 2
        });
    loadAtl(k).then(a => {
        o.atl = a;
        if (a)
            o.sp = m.p.map(p => ({
                x: p[0], y: p[1], w: p[2], h: p[3], ax: p[4], ay: p[5], d: Math.min(1.7, .35 + Math.sqrt(p[2] * p[3]) / 22 + Math.random() * .35), ph: Math.random() * 6.28, sp: .3 + Math.random() * .9, r: (Math.random() * 2 - 1) * .5
            }));
    });
    new IntersectionObserver(es => {
        o.vis = es[0].isIntersecting;
    }, { rootMargin: '80px' }).observe(el);
    const size = () => {
        const r = el.getBoundingClientRect();
        o.dpr = Math.min(devicePixelRatio || 1, innerWidth < 800 ? 1.5 : 2);
        o.rw = Math.max(1, r.width);
        o.rh = Math.max(1, r.height);
        [o.cb, o.cf].forEach(c => {
            c.width = Math.round(o.rw * 1.28 * o.dpr);
            c.height = Math.round(o.rh * 1.28 * o.dpr);
        });
    };
    size();
    if (window.ResizeObserver)
        new ResizeObserver(size).observe(el);
    else
        addEventListener('resize', size);
    FSN.push(o);
});
function drawFS(o, t) {
    const { m, cb, cf, dpr } = o, sc = o.rw / m.sw * dpr, ox = .14 * o.rw * dpr, oy = .14 * o.rh * dpr, A = cb.getContext('2d'), B = cf.getContext('2d');
    A.clearRect(0, 0, cb.width, cb.height);
    B.clearRect(0, 0, cf.width, cf.height);
    const sp = o.fs;
    if (o.atl)
        o.sp.forEach(s => {
            const ctx = s.d < .75 ? A : B, bx = Math.sin(t * s.sp + s.ph) * 7 * s.d, by = Math.cos(t * s.sp * .8 + s.ph) * 10 * s.d, k = 1 + (s.d - 1) * .12;
            ctx.save();
            ctx.translate(ox + (s.x + s.w / 2 + bx) * sc - o.fx * 26 * s.d * dpr, oy + (s.y + s.h / 2 + by) * sc - (o.fy * 18 * s.d + sp * 90 * s.d) * dpr);
            ctx.rotate(Math.sin(t * s.sp * .6 + s.ph) * .25 * s.r + sp * s.r);
            ctx.drawImage(o.atl, s.ax, s.ay, s.w, s.h, -s.w / 2 * sc * k, -s.h / 2 * sc * k, s.w * sc * k, s.h * sc * k);
            ctx.restore();
        });
    o.dots.forEach(p => {
        const ctx = p.d < .8 ? A : B, yy = ((p.y - (t * p.sp * .02 * p.d) % 1.3 + 1.3) % 1.3) - .15, xx = p.x + Math.sin(t * p.sp + p.ph) * .015 * p.d, s = p.s * p.d * sc;
        ctx.globalAlpha = p.d < .8 ? .55 : .8;
        ctx.drawImage(o.tex[p.t], ox + xx * o.rw * dpr - s / 2 - o.fx * 30 * p.d * dpr, oy + yy * o.rh * dpr - s / 2 - sp * 110 * p.d * dpr, s, s);
    });
    A.globalAlpha = 1;
    B.globalAlpha = 1;
}
function fsLoop(ms) {
    requestAnimationFrame(fsLoop);
    const t = reduce ? 0 : ms / 1000, vh = innerHeight;
    FSN.forEach(o => {
        if (!o.vis)
            return;
        const r = o.el.getBoundingClientRect(), spv = Math.max(-1, Math.min(1, ((vh - r.top) / (vh + r.height)) * 2 - 1));
        o.fx += ((reduce ? 0 : mx) - o.fx) * .12;
        o.fy += ((reduce ? 0 : my) - o.fy) * .12;
        o.fs += ((reduce ? 0 : spv) - o.fs) * .15;
        o.el.style.setProperty('--fx', o.fx.toFixed(3));
        o.el.style.setProperty('--fy', o.fy.toFixed(3));
        o.el.style.setProperty('--fs', o.fs.toFixed(3));
        drawFS(o, t);
    });
}
requestAnimationFrame(fsLoop);
/* ---- animation layer (needs GSAP; page stays fully usable without it) ---- */
const WA_ = 'M0 70C240 40 480 100 720 70S1200 40 1440 70V120H0Z', WB = 'M0 38C240 100 480 14 720 82S1200 112 1440 28V120H0Z';
$$('section[data-next]').forEach(s => {
    const sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sv.setAttribute('class', 'wave');
    sv.setAttribute('viewBox', '0 0 1440 120');
    sv.setAttribute('preserveAspectRatio', 'none');
    sv.setAttribute('aria-hidden', 'true');
    sv.innerHTML = `<path d="${WA_}" style="fill:${s.dataset.next}"/>`;
    s.append(sv);
    if (HAS && !reduce)
        gsap.fromTo($('path', sv), { attr: { d: WB } }, {
            attr: { d: WA_ }, ease: 'none', scrollTrigger: {
                trigger: s, start: 'bottom 100%', end: 'bottom 25%', scrub: true
            }
        });
});
if (HAS) {
    function split(n) {
        [...n.childNodes].forEach(c => {
            if (c.nodeType === 3) {
                const f = document.createDocumentFragment();
                c.textContent.split(/(\s+)/).forEach(w => {
                    if (!w.trim()) {
                        f.append(w);
                        return;
                    }
                    const o = document.createElement('span');
                    o.className = 'w';
                    const i = document.createElement('span');
                    i.textContent = w;
                    o.append(i);
                    f.append(o);
                });
                c.replaceWith(f);
            }
            else if (c.nodeType === 1)
                split(c);
        });
    }
    gsap.registerPlugin(ScrollTrigger);
    $$('[data-split],[data-scrub]').forEach(split);
    const reveal = el => gsap.fromTo($$('.w>span', el), {
        yPercent: 115, rotate: 4
    }, {
        yPercent: 0, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: .07
    });
    $$('[data-split]:not([data-split=hero])').forEach(el => {
        if (reduce)
            return;
        gsap.set($$('.w>span', el), { yPercent: 115 });
        ScrollTrigger.create({
            trigger: el, start: 'top 88%', once: true, onEnter: () => reveal(el)
        });
    });
    $$('[data-scrub]').forEach(el => gsap.fromTo($$('.w>span', el), { opacity: .14 }, {
        opacity: 1, stagger: .12, ease: 'none', scrollTrigger: {
            trigger: el, start: 'top 78%', end: 'bottom 52%', scrub: true
        }
    }));
    /* pinned 3D scenes */
    function flip(sel, bar) {
        const sc = $$(sel + ' .sc'), cp = $$(sel + ' .cap'), n = sc.length;
        sc.forEach((s, i) => gsap.set(s, i ? {
            opacity: 0, rotateY: 50, x: '38%', scale: .78, z: -300
        } : {
            opacity: 1, rotateY: 0, x: 0, scale: 1, z: 0
        }));
        cp.forEach((c, i) => gsap.set(c, {
            opacity: i ? 0 : 1, y: i ? 40 : 0
        }));
        const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' }, scrollTrigger: {
                trigger: sel, start: 'top top', end: 'bottom bottom', scrub: .8, onUpdate: s => {
                    $(bar).style.transform = `scaleX(${s.progress})`;
                }
            }
        });
        for (let i = 0; i < n - 1; i++) {
            const t = i * 1.6 + .6;
            tl.to(sc[i], {
                opacity: 0, rotateY: -50, x: '-38%', scale: .78, z: -300, duration: 1
            }, t).to(cp[i], {
                opacity: 0, y: -40, duration: .5
            }, t - .05)
                .fromTo(sc[i + 1], {
                opacity: 0, rotateY: 50, x: '38%', scale: .78, z: -300
            }, {
                opacity: 1, rotateY: 0, x: 0, scale: 1, z: 0, duration: 1
            }, t).fromTo(cp[i + 1], {
                opacity: 0, y: 40
            }, {
                opacity: 1, y: 0, duration: .5
            }, t + .5);
        }
        tl.set({}, {}, (n - 1) * 1.6 + 1.1);
    }
    flip('#story', '#pf');
    (function () {
        const sel = '#flav', sc = $$(sel + ' .sc'), cp = $$(sel + ' .cap'), n = sc.length;
        sc.forEach((s, i) => gsap.set(s, i ? {
            clipPath: 'circle(0% at 70% 55%)', scale: 1.2
        } : {
            clipPath: 'circle(150% at 70% 55%)', scale: 1
        }));
        cp.forEach((c, i) => gsap.set(c, {
            opacity: i ? 0 : 1, y: i ? 40 : 0
        }));
        const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' }, scrollTrigger: {
                trigger: sel, start: 'top top', end: 'bottom bottom', scrub: .8, onUpdate: s => {
                    $('#pf2').style.transform = `scaleX(${s.progress})`;
                }
            }
        });
        for (let i = 0; i < n - 1; i++) {
            const t = i * 1.6 + .6;
            tl.to(cp[i], {
                opacity: 0, y: -40, duration: .5
            }, t - .05).to(sc[i], {
                scale: .9, duration: 1
            }, t)
                .fromTo(sc[i + 1], {
                clipPath: 'circle(0% at 70% 55%)', scale: 1.2
            }, {
                clipPath: 'circle(150% at 70% 55%)', scale: 1, duration: 1
            }, t).fromTo(cp[i + 1], {
                opacity: 0, y: 40
            }, {
                opacity: 1, y: 0, duration: .5
            }, t + .5);
        }
        tl.set({}, {}, (n - 1) * 1.6 + 1.1);
    })();
    gsap.fromTo('#beyond .stagebox', {
        rotateX: 34, scale: .82, y: 90, opacity: .3
    }, {
        rotateX: 0, scale: 1, y: 0, opacity: 1, ease: 'none', scrollTrigger: {
            trigger: '#beyond .plane', start: 'top 95%', end: 'top 30%', scrub: true
        }
    });
    gsap.to('#beyond .stagebox', {
        rotateX: -10, y: -50, scale: 1.03, ease: 'none', scrollTrigger: {
            trigger: '#beyond .plane', start: 'bottom 70%', end: 'bottom 5%', scrub: true
        }
    });
    gsap.fromTo('.qimg img', {
        rotateY: -28, rotateZ: -4, y: 60, scale: .9
    }, {
        rotateY: 28, rotateZ: 4, y: -60, scale: 1.05, ease: 'none', scrollTrigger: {
            trigger: '#quality', start: 'top bottom', end: 'bottom top', scrub: true
        }
    });
    gsap.fromTo('.cframe .fs', {
        rotateY: -22, scale: .88
    }, {
        rotateY: 0, scale: 1, ease: 'none', scrollTrigger: {
            trigger: '#cta', start: 'top bottom', end: 'bottom bottom', scrub: true
        }
    });
    if (fine && !reduce) {
        const mp = $('#mp');
        mp.addEventListener('pointermove', e => {
            const r = mp.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
            gsap.to(mp, {
                rotateY: x * 8, rotateX: -y * 6, duration: .5
            });
        });
        mp.addEventListener('pointerleave', () => gsap.to(mp, {
            rotateY: 0, rotateX: 0, duration: .8
        }));
    }
    $$('[data-count]').forEach(el => {
        const v = +el.dataset.count, o = { n: 0 };
        if (reduce)
            return;
        el.textContent = '0';
        ScrollTrigger.create({
            trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, {
                n: v, duration: 1.6, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.n)
            })
        });
    });
    if (fine && !reduce) {
        const c = $('#cur');
        let cx = -50, cy = -50, px = -50, py = -50;
        addEventListener('pointermove', e => {
            px = e.clientX;
            py = e.clientY;
        });
        gsap.ticker.add(() => {
            cx += (px - cx) * .2;
            cy += (py - cy) * .2;
            c.style.transform = `translate(${cx}px,${cy}px)`;
        });
        document.addEventListener('pointerover', e => c.classList.toggle('big', !!e.target.closest('a,button')));
        document.addEventListener('pointermove', e => {
            $$('.mag').forEach(b => {
                const r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
                if (Math.hypot(dx, dy) < 110)
                    gsap.to(b, {
                        x: dx * .3, y: dy * .4, duration: .3, overwrite: 'auto'
                    });
                else
                    gsap.to(b, {
                        x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)', overwrite: 'auto'
                    });
            });
        });
    }
    gsap.to('#bar', {
        scaleX: 1, ease: 'none', scrollTrigger: {
            trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .2
        }
    });
    /* boot: short loading screen on first visit only (keeps Largest Contentful Paint fast) */
    (async () => {
        let seen = false;
        try {
            seen = sessionStorage.getItem('vaigai-seen') === '1';
        }
        catch (e) { }
        if (!$('#pre')) {
            heroReady();
            ScrollTrigger.refresh();
            return;
        }
        const hi = $('#hero img');
        await Promise.race([hi && hi.decode ? hi.decode().catch(() => { }) : 0, new Promise(r => setTimeout(r, 900))]);
        const finish = () => {
            const p = $('#pre');
            if (p)
                p.remove();
            ScrollTrigger.refresh();
        };
        try {
            sessionStorage.setItem('vaigai-seen', '1');
        }
        catch (e) { }
        if (seen || reduce) {
            finish();
            heroReady();
            return;
        }
        const o = { n: 0 };
        gsap.to(o, {
            n: 100, duration: .9, ease: 'power2.inOut', onUpdate: () => {
                const pn = $('#pn');
                if (pn) pn.textContent = Math.round(o.n);
            }, onComplete: () => {
                heroReady();
                gsap.to('#pre', {
                    yPercent: -100, duration: .8, ease: 'expo.inOut', onComplete: finish
                });
            }
        });
    })();
}
