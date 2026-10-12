/* ---- Vaigai Assistant: chat UI, actions, optional n8n webhook mode ---- */
(function () {
    const AC = window.VAIGAI_CONFIG || {};
    const brain = VaigaiBrain.create({
        cat: PR, getBasket: () => Object.keys(basket).filter(k => basket[k] > 0).map(k => ({
            i: +k, q: basket[k]
        })), payOnline: () => !!AC.payWebhook
    });
    const store = {
        get(k, d) {
            try {
                return JSON.parse(sessionStorage.getItem(k)) || d;
            }
            catch (e) {
                return d;
            }
        }, set(k, v) {
            try {
                sessionStorage.setItem(k, JSON.stringify(v));
            }
            catch (e) { }
        }
    };
    const sid = (() => {
        let s = store.get('vaigai-sid', null);
        if (!s) {
            s = 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
            store.set('vaigai-sid', s);
        }
        return s;
    })();
    let st = { mode: null }, hist = store.get('vaigai-hist', []), opened = false, busy = false;
    const t_ = (en, ta) => lang === 'ta' ? ta : en, sleep = ms => new Promise(r => setTimeout(r, ms));
    const MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>', SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>', CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>';
    const root_ = document.createElement('div');
    root_.innerHTML = `<button class="asst-launch" id="asst-launch" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="asst">${CHAT}<span id="asst-lbl"></span></button>
<section class="asst" id="asst" role="dialog" aria-label="Vaigai Assistant" hidden>
<div class="asst-h"><div class="asst-av"><svg viewBox="0 0 64 62" aria-hidden="true"><use href="#mk"/></svg></div><div><b>Vaigai Assistant</b><small id="asst-st"></small></div><button class="asst-x" id="asst-x" type="button" aria-label="Close assistant">&times;</button></div>
<div class="asst-log" id="asst-log" role="log" aria-live="polite"></div><div class="asst-chips" id="asst-chips"></div>
<form class="asst-in" id="asst-form" autocomplete="off"><button type="button" class="mic" id="asst-mic" aria-label="Speak your message" hidden>${MIC}</button><input id="asst-text" maxlength="400" aria-label="Type your message" enterkeyhint="send"><button type="submit" aria-label="Send">${SEND}</button></form>
<p class="asst-note" id="asst-note"></p></section>`;
    document.body.appendChild(root_);
    const $l = $('#asst-launch'), $p = $('#asst'), $log = $('#asst-log'), $ch = $('#asst-chips'), $in = $('#asst-text'), $mic = $('#asst-mic');
    function labels() {
        $('#asst-lbl').textContent = t_('Ask Vaigai', 'வைகையிடம் கேளுங்கள்');
        $l.setAttribute('aria-label', t_('Open Vaigai assistant', 'வைகை உதவியாளரைத் திற'));
        $('#asst-st').textContent = AC.assistantWebhook ? t_('AI assistant · online', 'AI உதவியாளர் · ஆன்லைன்') : t_('Smart assistant · English / தமிழ்', 'ஸ்மார்ட் உதவியாளர் · English / தமிழ்');
        $in.placeholder = t_('Ask about products, delivery, orders…', 'பொருட்கள், டெலிவரி, ஆர்டர் பற்றி கேளுங்கள்…');
        $('#asst-note').textContent = t_('Automated assistant. Please do not share card, UPI or OTP details.', 'தானியங்கி உதவியாளர். கார்டு, UPI, OTP விவரங்களைப் பகிர வேண்டாம்.');
        $('#asst-x').setAttribute('aria-label', t_('Close assistant', 'மூடு'));
    }
    labels();
    const _sl = setLang;
    setLang = function (l, u) {
        _sl(l, u);
        labels();
    };
    /* rendering */
    const scroll = () => {
        $log.scrollTop = $log.scrollHeight;
    };
    function addUser(x) {
        const d = document.createElement('div');
        d.className = 'm u';
        d.textContent = x;
        $log.appendChild(d);
        scroll();
    }
    function addBot(x, save = true) {
        const d = document.createElement('div');
        d.className = 'm b';
        d.textContent = x;
        $log.appendChild(d);
        scroll();
        if (save)
            hist.push({
                r: 'b', x
            });
        return d;
    }
    function typing() {
        const d = document.createElement('div');
        d.className = 'm b typing';
        d.setAttribute('aria-label', t_('Assistant is typing', 'உதவியாளர் தட்டச்சு செய்கிறார்'));
        d.innerHTML = '<i></i><i></i><i></i>';
        $log.appendChild(d);
        scroll();
        return d;
    }
    function cards(ix) {
        const w = document.createElement('div');
        w.className = 'pc';
        ix.forEach(i => {
            const p = PR[i];
            if (!p)
                return;
            const c = document.createElement('div'), im = document.createElement('img'), src = (cardsEls[i] && cardsEls[i].querySelector('img')) ? cardsEls[i].querySelector('img').src : '';
            im.alt = p.n;
            if (src)
                im.src = src;
            im.loading = 'lazy';
            im.width = 220;
            im.height = 124;
            const b = document.createElement('div');
            b.className = 'pb';
            const h = document.createElement('h4');
            h.textContent = lang === 'ta' ? p.nt : p.n;
            const d = document.createElement('p');
            d.textContent = p.u + ' · ' + (lang === 'ta' ? p.dt : p.d);
            const pr = document.createElement('div');
            pr.className = 'pr';
            pr.textContent = '₹' + p.p;
            const bt = document.createElement('button');
            bt.type = 'button';
            bt.textContent = t_('Add to basket', 'கூடையில் சேர்');
            bt.addEventListener('click', () => {
                doAdd(i, 1);
                addBot(t_('Added 1 × ' + p.n + '.', '1 × ' + p.nt + ' சேர்க்கப்பட்டது.'));
                setChips([[t_('Checkout', 'ஆர்டர் செய்'), 'checkout'], [t_('My basket', 'என் கூடை'), 'basket']]);
            });
            b.append(h, d, pr, bt);
            c.append(im, b);
            w.appendChild(c);
        });
        $log.appendChild(w);
        scroll();
    }
    function setChips(c) {
        $ch.textContent = '';
        (c || []).forEach(x => {
            const label = x[0], send_ = x[1], href = x[2];
            let e;
            if (href) {
                e = document.createElement('a');
                e.href = href;
                e.target = '_blank';
                e.rel = 'noopener';
            }
            else {
                e = document.createElement('button');
                e.type = 'button';
                e.addEventListener('click', () => send(send_, label, true));
            }
            e.textContent = label;
            $ch.appendChild(e);
        });
        requestAnimationFrame(scroll);
    }
    const cardsEls = [];
    $$('.dcard').forEach(c => cardsEls[+c.dataset.i] = c);
    /* basket actions */
    function doAdd(i, q) {
        basket[i] = Math.min(99, (basket[i] || 0) + Math.max(1, Math.min(99, q | 0)));
        paint();
        track('assistant_add_to_cart', {
            item_name: PR[i].n, price: PR[i].p, quantity: q, currency: 'INR'
        });
    }
    function waLink(text) {
        return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
    }
    const post = async (url, body) => {
        const c = new AbortController(), to = setTimeout(() => c.abort(), 12000);
        try {
            const r = await fetch(url, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json', 'x-vaigai-key': AC.webhookKey || ''
                }, body: JSON.stringify(body), signal: c.signal
            });
            if (!r.ok)
                throw new Error('http ' + r.status);
            return await r.json();
        }
        finally {
            clearTimeout(to);
        }
    };
    const newId = p => {
        const d = new Date(), y = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
        return p + '-' + y + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    };
    let lastPay = null;
    const loadRzp = () => new Promise((res, rej) => {
        if (window.Razorpay)
            return res();
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = res;
        s.onerror = () => rej(new Error('load'));
        document.head.appendChild(s);
        setTimeout(() => rej(new Error('timeout')), 12000);
    });
    async function startPayment(id) {
        lastPay = id;
        try {
            const c = await post(AC.payWebhook + '/vaigai-pay-create', { order_id: id });
            if (!c || !c.ok)
                throw new Error('create');
            await loadRzp();
            const r = await new Promise(res => {
                const rz = new window.Razorpay({
                    key: c.key_id, amount: c.amount, currency: c.currency, name: 'Vaigai Milk', description: c.description, order_id: c.razorpay_order_id, prefill: c.prefill, theme: { color: '#0b7a3e' }, handler: x => res({
                        ok: true, x
                    }), modal: { ondismiss: () => res({ ok: false }) }
                });
                rz.open();
            });
            if (!r.ok)
                return {
                    m: [t_('Payment was not completed. Your order is saved. You can retry, or our team will help.', 'பணம் செலுத்தல் முடியவில்லை. ஆர்டர் சேமிக்கப்பட்டது; மீண்டும் முயலலாம் அல்லது குழு உதவும்.')], c: [[t_('Retry payment', 'மீண்டும் செலுத்து'), 'retry_pay'], [t_('Talk to the team', 'குழுவுடன் பேச'), 'talk to human']]
                };
            const v = await post(AC.payWebhook + '/vaigai-pay-verify', {
                order_id: id, razorpay_order_id: r.x.razorpay_order_id, razorpay_payment_id: r.x.razorpay_payment_id, razorpay_signature: r.x.razorpay_signature
            });
            if (v && v.ok) {
                track('purchase', {
                    transaction_id: id, value: v.total, currency: 'INR'
                });
                return {
                    m: [t_('Payment received. Thank you! Your GST invoice ' + v.invoice_no + ' is ready.', 'பணம் பெறப்பட்டது. நன்றி! உங்கள் GST இன்வாய்ஸ் ' + v.invoice_no + ' தயார்.')], c: [[t_('View GST invoice', 'GST இன்வாய்ஸ் பார்'), '', v.invoice_url]]
                };
            }
            throw new Error('verify');
        }
        catch (e) {
            return {
                m: [t_('I could not confirm the payment automatically. If money was deducted, our team will match it to your order.', 'பணம் செலுத்தலை உறுதி செய்ய முடியவில்லை. பணம் எடுக்கப்பட்டிருந்தால் குழு உங்கள் ஆர்டருடன் பொருத்தும்.')], c: [[t_('Retry payment', 'மீண்டும் செலுத்து'), 'retry_pay'], [t_('Open WhatsApp', 'வாட்ஸ்அப் திற'), '', waLink('Hi Vaigai Milk, payment help for order ' + id)]]
            };
        }
    }
    async function submitOrder(o) {
        o.order_id = newId('VGM');
        o.source = {
            utm: UTM, page: location.pathname, language: lang
        };
        o.session_id = sid;
        o.created_at = new Date().toISOString();
        const summary = 'New order ' + o.order_id + '\n' + o.items.map(x => x.qty + ' x ' + x.name + ' (' + x.unit_price + ')').join('\n') + '\nTotal: Rs ' + o.total + '\n' + o.customer.name + ' ' + o.customer.phone + '\n' + o.address + '\nSlot: ' + o.slot;
        let ok = false, res = null;
        if (AC.orderWebhook) {
            try {
                res = await post(AC.orderWebhook, o);
                ok = !!(res && res.ok !== false);
            }
            catch (e) {
                ok = false;
            }
        }
        store.set('vaigai-last-order', {
            id: (res && res.order_id) || o.order_id, status: 'received', total: o.total
        });
        Object.keys(basket).forEach(k => delete basket[k]);
        paint();
        track('assistant_order', {
            value: o.total, currency: 'INR', transaction_id: o.order_id, method: AC.orderWebhook ? (ok ? 'webhook' : 'whatsapp_fallback') : 'whatsapp'
        });
        const id = (res && res.order_id) || o.order_id;
        if (ok && res.payment_required && AC.payWebhook) {
            const pr = await startPayment(id);
            return {
                m: [t_('Order ' + id + ' saved. Total ₹' + (res.total || o.total) + '.', 'ஆர்டர் ' + id + ' பதிவானது. மொத்தம் ₹' + (res.total || o.total) + '.')].concat(pr.m), c: pr.c
            };
        }
        if (ok)
            return {
                m: [t_('Your order ' + id + ' is placed. Total ₹' + (res.total || o.total) + '. We will confirm on WhatsApp shortly and deliver ' + (res.delivery_date ? 'on ' + res.delivery_date : 'tomorrow') + '. Thank you!', 'உங்கள் ஆர்டர் ' + id + ' பதிவானது. மொத்தம் ₹' + (res.total || o.total) + '. வாட்ஸ்அப்பில் விரைவில் உறுதி செய்வோம். நன்றி!')], c: [[t_('Open WhatsApp', 'வாட்ஸ்அப் திற'), '', waLink('Hi Vaigai Milk, my order ' + id)]]
            };
        return {
            m: [t_('Almost done! Tap the button to send your order ' + id + ' to our team on WhatsApp. They will confirm it right away.', 'கிட்டத்தட்ட முடிந்தது! உங்கள் ஆர்டர் ' + id + 'ஐ வாட்ஸ்அப்பில் எங்கள் குழுவுக்கு அனுப்ப பட்டனைத் தட்டுங்கள்.')], c: [[t_('Send order on WhatsApp', 'வாட்ஸ்அப்பில் ஆர்டர் அனுப்பு'), '', waLink(summary)]]
        };
    }
    async function submitLead(l, ref) {
        l.lead_id = ref;
        l.session_id = sid;
        l.source = {
            utm: UTM, page: location.pathname
        };
        l.created_at = new Date().toISOString();
        let ok = false;
        if (AC.leadWebhook) {
            try {
                const r = await post(AC.leadWebhook, l);
                ok = r && r.ok !== false;
            }
            catch (e) { }
        }
        track('assistant_lead', { lead_type: l.type });
        track('generate_lead', Object.assign({
            method: 'assistant', lead_type: l.type
        }, UTM));
        if (ok)
            return {
                m: [], c: []
            };
        return {
            m: [t_('Our team will see this on WhatsApp. Tap to send it now so nothing is missed.', 'இதை வாட்ஸ்அப்பில் அனுப்பினால் குழு உடனே பார்க்கும். தட்டுங்கள்.')], c: [[t_('Send on WhatsApp', 'வாட்ஸ்அப்பில் அனுப்பு'), '', waLink('Hi Vaigai Milk, ' + l.type + ' request ' + ref + '\nPhone: ' + l.phone + '\n' + (l.detail || '') + (l.basket ? '\nBasket: ' + l.basket : ''))]]
        };
    }
    async function orderStatus(id) {
        const last = store.get('vaigai-last-order', null);
        if (AC.statusWebhook && id) {
            try {
                const r = await fetch(AC.statusWebhook + (AC.statusWebhook.includes('?') ? '&' : '?') + 'id=' + encodeURIComponent(id), { headers: { 'x-vaigai-key': AC.webhookKey || '' } });
                const j = await r.json();
                if (j.found)
                    return t_('Order ' + id + ' is ' + j.status + (j.delivery_date ? ' · delivery ' + j.delivery_date : '') + '.', 'ஆர்டர் ' + id + ' நிலை: ' + j.status + (j.delivery_date ? ' · டெலிவரி ' + j.delivery_date : '') + '.');
                return t_('I could not find ' + id + '. Please check the number.', id + ' கிடைக்கவில்லை. எண்ணைச் சரிபாருங்கள்.');
            }
            catch (e) { }
        }
        if (last && (!id || last.id === id))
            return t_('Order ' + last.id + ' is received. Our team will confirm it on WhatsApp.', 'ஆர்டர் ' + last.id + ' பெறப்பட்டது. குழு வாட்ஸ்அப்பில் உறுதி செய்யும்.');
        return t_('Live order tracking is handled by our team. Please message us on WhatsApp with your order number.', 'ஆர்டர் நிலையை எங்கள் குழு பகிரும். ஆர்டர் எண்ணுடன் வாட்ஸ்அப்பில் எழுதுங்கள்.');
    }
    /* action runner */
    async function run(acts) {
        const out = {
            m: [], c: null
        };
        for (const a of acts || []) {
            if (a.type === 'add')
                doAdd(a.i, a.q);
            else if (a.type === 'remove') {
                delete basket[a.i];
                paint();
            }
            else if (a.type === 'clear') {
                Object.keys(basket).forEach(k => delete basket[k]);
                paint();
            }
            else if (a.type === 'lang')
                setLang(a.v, true);
            else if (a.type === 'theme')
                setTheme(a.v, true);
            else if (a.type === 'whatsapp') {
                track('whatsapp_assistant');
                out.c = [[t_('Open WhatsApp', 'வாட்ஸ்அப் திற'), '', waLink(a.text || 'Hi Vaigai Milk')]];
            }
            else if (a.type === 'status') {
                out.m.push(await orderStatus(a.id));
            }
            else if (a.type === 'submit_order') {
                const r = await submitOrder(a.order);
                out.m.push(...r.m);
                out.c = r.c;
            }
            else if (a.type === 'submit_lead') {
                const r = await submitLead(a.lead, a.ref);
                out.m.push(...r.m);
                out.c = r.c;
            }
            else if (a.type === 'scroll') {
                const e = $('#' + a.to);
                if (e)
                    goTo(e);
            }
        }
        return out;
    }
    /* local response */
    async function local(text) {
        const pre = brain.respond(text, st, lang);
        st = pre.st;
        const acts = pre.a || [];
        const lead = acts.find(a => a.type === 'submit_lead');
        if (lead)
            lead.ref = newId('LD');
        track('assistant_message', {
            intent: pre.intent, mode: 'local'
        });
        await render(pre.m.map(m => m.t === 'text' && lead ? {
            t: 'text', x: m.x.replace('{ref}', lead.ref)
        } : m));
        const r = await run(acts);
        r.m.forEach(x => addBot(x));
        if (r.c)
            setChips(r.c);
    }
    async function render(msgs) {
        let chips = null;
        for (const m of msgs) {
            if (m.t === 'text') {
                addBot(m.x);
                await sleep(120);
            }
            else if (m.t === 'products')
                cards(m.i);
            else if (m.t === 'chips')
                chips = m.c;
        }
        if (chips)
            setChips(chips);
    }
    /* n8n / AI webhook mode */
    async function remote(text) {
        const body = {
            session_id: sid, message: text, lang: lang, basket: Object.keys(basket).filter(k => basket[k] > 0).map(k => ({
                sku: PR[k].sku, name: PR[k].n, qty: basket[k], price: PR[k].p
            })), context: {
                page: location.pathname, theme: root.getAttribute('data-theme'), utm: UTM, product_in_view: PR[cur()].sku
            }, history: hist.slice(-8)
        };
        track('assistant_message', { mode: 'ai' });
        const j = await post(AC.assistantWebhook, body);
        if (j.lang && j.lang !== lang && (j.lang === 'ta' || j.lang === 'en')) { }
        const idx = sku => PR.findIndex(p => p.sku === sku), acts = [];
        let show = null;
        (j.actions || []).forEach(a => {
            if (a.type === 'add_to_basket' && idx(a.sku) >= 0)
                acts.push({
                    type: 'add', i: idx(a.sku), q: +a.qty || 1
                });
            else if (a.type === 'remove_from_basket' && idx(a.sku) >= 0)
                acts.push({
                    type: 'remove', i: idx(a.sku)
                });
            else if (a.type === 'clear_basket')
                acts.push({ type: 'clear' });
            else if (a.type === 'show_products')
                show = (a.skus || []).map(idx).filter(i => i >= 0);
            else if (a.type === 'open_whatsapp')
                acts.push({
                    type: 'whatsapp', text: a.text
                });
            else if (a.type === 'handoff')
                acts.push({
                    type: 'whatsapp', text: 'Hi Vaigai Milk, I need help from your team.'
                });
            else if (a.type === 'scroll_to')
                acts.push({
                    type: 'scroll', to: String(a.section || '').replace(/[^a-z-]/g, '')
                });
            else if (a.type === 'set_language')
                acts.push({
                    type: 'lang', v: a.lang === 'ta' ? 'ta' : 'en'
                });
            else if (a.type === 'set_theme')
                acts.push({
                    type: 'theme', v: a.theme === 'dark' ? 'dark' : 'light'
                });
        });
        if (j.reply)
            addBot(String(j.reply).slice(0, 1200));
        if (show && show.length)
            cards(show);
        const start = (j.actions || []).find(a => a.type === 'start_checkout'), cb = (j.actions || []).find(a => a.type === 'collect_callback');
        const r = await run(acts);
        r.m.forEach(x => addBot(x));
        let chips = (j.quick_replies || []).slice(0, 4).map(q => [String(q), String(q)]);
        if (r.c)
            chips = r.c.concat(chips);
        setChips(chips);
        if (start) {
            const x = brain.respond('checkout', st, lang);
            st = x.st;
            await render(x.m);
        }
        else if (cb) {
            const x = brain.respond('call me back', st, lang);
            st = x.st;
            await render(x.m);
        }
    }
    const FIXED = /^(yes|no|cancel|checkout|products|basket|slot1|slot2|menu|pay_online|pay_cod|retry_pay)$/i;
    const LOCAL = ['status', 'callback', 'checkout', 'complaint', 'bulk', 'human', 'remove', 'language', 'theme'];
    async function send(text, label, forceLocal) {
        text = String(text || '').trim().slice(0, 400);
        if (!text || busy)
            return;
        busy = true;
        addUser(label || text);
        hist.push({
            r: 'u', x: text
        });
        setChips([]);
        const ty = typing();
        try {
            if (text === 'retry_pay' && lastPay) {
                await sleep(250);
                ty.remove();
                const r = await startPayment(lastPay);
                r.m.forEach(x => addBot(x));
                setChips(r.c || []);
            }
            else if (AC.assistantWebhook && !st.mode && !forceLocal && !FIXED.test(text) && !LOCAL.includes(brain.intentOf(text).intent)) {
                try {
                    await remote(text);
                    ty.remove();
                }
                catch (e) {
                    ty.remove();
                    addBot(t_('I could not reach the AI service, so I am answering in basic mode.', 'AI சேவையை அடைய முடியவில்லை; அடிப்படை முறையில் பதிலளிக்கிறேன்.'), false);
                    await local(text);
                }
            }
            else {
                await sleep(300 + Math.random() * 300);
                ty.remove();
                await local(text);
            }
        }
        catch (e) {
            ty.remove();
            addBot(t_('Sorry, something went wrong. You can also reach our team on WhatsApp.', 'மன்னிக்கவும், ஏதோ தவறு. வாட்ஸ்அப்பிலும் தொடர்பு கொள்ளலாம்.'));
            setChips([[t_('Open WhatsApp', 'வாட்ஸ்அப் திற'), '', waLink('Hi Vaigai Milk')]]);
        }
        store.set('vaigai-hist', hist.slice(-30));
        busy = false;
    }
    /* open / close */
    function open(first) {
        if ($p.hidden) {
            $p.hidden = false;
            $l.setAttribute('aria-expanded', 'true');
            $l.style.display = 'none';
            track('assistant_open');
            if (innerWidth <= 600) {
                document.documentElement.style.overflow = 'hidden';
                if (lenis)
                    lenis.stop();
            }
            if (!opened) {
                opened = true;
                const bn = Object.keys(basket).filter(k => basket[k] > 0).length;
                addBot(t_('Vanakkam! I am the Vaigai assistant. I can show products, build your basket, check delivery, set up daily plans and place your order — in English or Tamil.', 'வணக்கம்! நான் வைகை உதவியாளர். பொருட்கள், கூடை, டெலிவரி சரிபார்ப்பு, தினசரி திட்டம், ஆர்டர் எல்லாவற்றிலும் உதவுவேன் — ஆங்கிலத்திலும் தமிழிலும்.'), false);
                setChips([[t_('Show products', 'பொருட்கள்'), 'products'], [t_('Recommend for coffee', 'காபிக்கு பரிந்துரை'), 'recommend for coffee'], [t_('Delivery in my area', 'என் பகுதியில் டெலிவரி'), 'delivery'], [t_('Talk to the team', 'குழுவுடன் பேச'), 'talk to human']]);
                if (bn)
                    addBot(t_('You have items in your basket. Say "checkout" when you are ready.', 'கூடையில் பொருட்கள் உள்ளன. தயாரானதும் "checkout" என்று சொல்லுங்கள்.'), false);
            }
            setTimeout(() => $in.focus(), 50);
        }
        if (typeof first === 'string')
            send(first);
    }
    function close() {
        $p.hidden = true;
        $l.style.display = '';
        $l.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
        if (lenis)
            lenis.start();
        $l.focus();
    }
    $l.addEventListener('click', () => open());
    $('#asst-x').addEventListener('click', close);
    $p.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            close();
        }
        if (e.key === 'Tab' && innerWidth <= 600) {
            const f = [...$p.querySelectorAll('button:not([hidden]),input,a')].filter(x => x.offsetParent);
            const a = f[0], z = f[f.length - 1];
            if (e.shiftKey && document.activeElement === a) {
                e.preventDefault();
                z.focus();
            }
            else if (!e.shiftKey && document.activeElement === z) {
                e.preventDefault();
                a.focus();
            }
        }
    });
    $('#asst-form').addEventListener('submit', e => {
        e.preventDefault();
        const v = $in.value;
        $in.value = '';
        send(v);
    });
    /* voice */
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
        $mic.hidden = false;
        let rec = null;
        $mic.addEventListener('click', () => {
            if (rec) {
                rec.stop();
                return;
            }
            rec = new SR();
            rec.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
            rec.interimResults = false;
            rec.onstart = () => {
                $mic.classList.add('on');
                $mic.setAttribute('aria-label', t_('Stop listening', 'கேட்பதை நிறுத்து'));
            };
            rec.onend = () => {
                $mic.classList.remove('on');
                $mic.setAttribute('aria-label', t_('Speak your message', 'பேசுங்கள்'));
                rec = null;
            };
            rec.onresult = e => {
                const v = e.results[0][0].transcript;
                if (v)
                    send(v);
            };
            rec.onerror = () => { };
            try {
                rec.start();
            }
            catch (e) {
                rec = null;
            }
        });
    }
    /* proactive nudge (once per session, dismissed on any interaction) */
    if (!store.get('vaigai-nudge', false) && !reduce) {
        setTimeout(() => {
            if (!$p.hidden || store.get('vaigai-nudge', false))
                return;
            store.set('vaigai-nudge', true);
            $l.classList.add('nudge');
            setTimeout(() => $l.classList.remove('nudge'), 6000);
        }, 22000);
    }
    $('#basket').addEventListener('click', e => {
        if (e.target.closest('#aco'))
            open('checkout');
    });
    window.VaigaiAssistant = {
        open, close, send, brain
    };
})();
