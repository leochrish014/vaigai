/* Vaigai Assistant brain: understands English, Tamil and Tanglish; works offline; no external calls. */
const VaigaiBrain = (function () {
    'use strict';
    const AREAS = [{
            k: ['anna nagar', 'annanagar', 'அண்ணா நகர்'], en: 'Anna Nagar', ta: 'அண்ணா நகர்'
        }, {
            k: ['kk nagar', 'k k nagar', 'k.k. nagar', 'கே.கே. நகர்', 'கே கே நகர்'], en: 'KK Nagar', ta: 'கே.கே. நகர்'
        }, {
            k: ['teppakulam', 'theppakulam', 'தெப்பக்குளம்'], en: 'Teppakulam', ta: 'தெப்பக்குளம்'
        }, {
            k: ['goripalayam', 'கோரிப்பாளையம்'], en: 'Goripalayam', ta: 'கோரிப்பாளையம்'
        }, {
            k: ['thirunagar', 'திருநகர்'], en: 'Thirunagar', ta: 'திருநகர்'
        }, {
            k: ['tallakulam', 'thallakulam', 'தல்லாகுளம்'], en: 'Tallakulam', ta: 'தல்லாகுளம்'
        }];
    const SYN = {
        carton: ['carton', 'pack', 'packet', 'pouch', 'toned', 'பாக்கெட்'], badam: ['badam', 'almond', 'almonds', 'பாதாம்', 'flavoured', 'flavored'], ghee: ['ghee', 'nei', 'நெய்'], curd: ['curd', 'thayir', 'tayir', 'yogurt', 'yoghurt', 'dahi', 'தயிர்'], butter: ['butter', 'vennai', 'வெண்ணெய்', 'வெண்ணை'], hero: ['glass', 'bottle', 'bottles', 'பாட்டில்', 'returnable']
    };
    const MILK = ['milk', 'paal', 'pal', 'பால்'];
    const NUMW = {
        one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, oru: 1, onru: 1, rendu: 2, irandu: 2, moonu: 3, munru: 3, naalu: 4, nangu: 4, anju: 5, aindhu: 5, aaru: 6, 'ஒரு': 1, 'ஒன்று': 1, 'இரண்டு': 2, 'மூன்று': 3, 'நான்கு': 4, 'ஐந்து': 5, 'ஆறு': 6, 'ஏழு': 7, 'எட்டு': 8, 'ஒன்பது': 9, 'பத்து': 10
    };
    const K = {
        greet: ['hi', 'hello', 'hey', 'hai', 'vanakkam', 'namaste', 'good morning', 'good evening', 'good afternoon', 'வணக்கம்'],
        thanks: ['thanks', 'thank you', 'thx', 'nandri', 'நன்றி'],
        bye: ['bye', 'goodbye', 'see you', 'போய் வருகிறேன்'],
        human: ['human', 'agent', 'person', 'staff', 'executive', 'manager', 'support', 'talk to*', 'speak to*', 'pesanum', 'பேசணும்', 'பேச வேண்டும்', 'நபர்'],
        complaint: ['complaint', 'complain', 'bad', 'spoil*', 'spoilt', 'sour', 'late', 'delay*', 'not delivered', 'missing', 'refund', 'wrong', 'damaged', 'leak*', 'problem', 'issue', 'worst', 'புகார்', 'பிரச்சனை', 'கெட்டு', 'தாமதம்', 'புளித்து'],
        checkout: ['checkout', 'check out', 'place order', 'place the order', 'confirm order', 'order now', 'book now', 'proceed', 'pay', 'payment', 'order panna*', 'order pannunga', 'ஆர்டர் செய்', 'ஆர்டர் போடு'],
        remove: ['remove', 'delete', 'clear', 'empty', 'neekku', 'நீக்கு', 'அழி'],
        add: ['add*', 'buy', 'want', 'need', 'get', 'give', 'venum', 'vendum', 'vennum', 'kudunga', 'kodunga', 'வேண்டும்', 'வேணும்', 'கொடுங்க', 'போடு', 'order', 'book'],
        basket: ['basket', 'cart', 'my order', 'kootai', 'கூடை'],
        delivery: ['deliver*', 'delivery', 'slot', 'time', 'timing', 'when', 'epo', 'eppo', 'area', 'areas', 'pincode', 'pin code', 'available in', 'serve', 'எப்போது', 'எப்ப', 'டெலிவரி', 'பகுதி'],
        subscription: ['subscription', 'subscribe', 'daily plan', 'monthly', 'every day', 'daily', 'weekly', 'plan', 'regular', 'தினமும்', 'மாதாந்திர', 'சந்தா'],
        price: ['price', 'cost', 'rate', 'how much', 'evlo', 'evalo', 'evvalavu', 'vilai', 'விலை', 'எவ்வளவு'],
        recommend: ['recommend*', 'suggest*', 'best', 'which one', 'what should', 'ethu nalla', 'எது நல்லது', 'பரிந்துரை'],
        quality: ['pasteur*', 'safe', 'adulter*', 'quality', 'test*', 'preservative*', 'organic', 'hygien*', 'antibiotic*', 'தரம்', 'பாதுகாப்பு', 'கலப்படம்'],
        contact: ['contact', 'phone number', 'address', 'where are you', 'map', 'hours', 'open', 'முகவரி', 'தொலைபேசி'],
        bulk: ['bulk', 'wholesale', 'cafe', 'hotel', 'restaurant', 'catering', 'b2b', 'function', 'event', 'tea shop', 'sweet shop'],
        callback: ['call back', 'callback', 'call me', 'ring me', 'phone me', 'என்னை அழை'],
        language: ['tamil', 'english', 'language', 'தமிழ்', 'ஆங்கிலம்'],
        theme: ['dark mode', 'light mode', 'dark theme', 'light theme', 'night mode'],
        offers: ['offer*', 'discount*', 'coupon*', 'deal*', 'promo*', 'free delivery', 'cashback'],
        health: ['diabet*', 'lactose', 'allerg*', 'baby', 'infant', 'pregnan*', 'cholesterol', 'weight loss', 'medical', 'doctor'],
        products: ['products', 'product', 'menu', 'catalog', 'catalogue', 'what do you sell', 'what do you have', 'what all', 'enna irukku', 'என்ன இருக்கு', 'பொருட்கள்'],
        status: ['status', 'track*', 'where is my order'],
        yes: ['yes', 'y', 'yeah', 'yep', 'ok', 'okay', 'sure', 'confirm', 'confirmed', 'aama', 'aam', 'seri', 'sari', 'ஆம்', 'சரி'],
        no: ['no', 'n', 'nope', 'cancel', 'stop', 'vendam', 'illa', 'இல்லை', 'வேண்டாம்']
    };
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const RX = {};
    for (const k in K)
        RX[k] = K[k].map(w => {
            const pre = w.endsWith('*');
            const b = pre ? w.slice(0, -1) : w;
            const ascii = /^[\x00-\x7f]+$/.test(b);
            return ascii ? new RegExp('(^|\\s)' + esc(b) + (pre ? '' : '(\\s|$)')) : { inc: b };
        });
    const norm = s => String(s || '').toLowerCase().normalize('NFC').replace(/[^\p{L}\p{M}\p{N}\s.@+-]/gu, ' ').replace(/(^|\s)[.-]+|[.-]+(\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
    const has = (t, k) => RX[k].some(r => r.inc ? t.includes(r.inc) : r.test(t));
    const isTa = s => /[\u0B80-\u0BFF]/.test(s);
    const phoneOf = s => {
        const d0 = String(s).replace(/[\s()-]/g, ''), d = /^\+?91[6-9]\d{9}$/.test(d0) ? d0.replace(/^\+?91/, '') : d0;
        return /^[6-9]\d{9}$/.test(d) ? d : null;
    };
    const pinOf = s => {
        const m = String(s).match(/\b(\d{6})\b/);
        return m ? m[1] : null;
    };
    const pinOk = p => p && +p >= 625001 && +p <= 625020;
    const areaOf = t => AREAS.find(a => a.k.some(x => t.includes(x)));
    const money = n => '₹' + n;
    function create(ctx) {
        const cat = ctx.cat, SY = {};
        cat.forEach((p, i) => {
            (SYN[p.k] || []).forEach(w => SY[w] = (SY[w] || []).concat(i));
        });
        const ix = k => cat.findIndex(p => p.k === k);
        const L = (lang, en, ta) => lang === 'ta' ? ta : en;
        const nm = (p, lang) => lang === 'ta' ? p.nt : p.n;
        function findProducts(t) {
            const w = t.split(' '), out = {};
            let milk = false;
            for (let a = 0; a < w.length; a++) {
                let idx = null;
                if (SY[w[a]])
                    idx = SY[w[a]];
                else if (MILK.includes(w[a]))
                    milk = true;
                if (w[a] === 'vaigai' && w[a + 1] === 'fresh')
                    idx = [ix('carton')];
                if (idx) {
                    let q = null, best = 9;
                    for (let b = Math.max(0, a - 2); b <= Math.min(w.length - 1, a + 2); b++) {
                        if (b === a)
                            continue;
                        const n = /^\d{1,2}$/.test(w[b]) ? +w[b] : NUMW[w[b]];
                        if (n && Math.abs(b - a) < best) {
                            q = n;
                            best = Math.abs(b - a);
                        }
                    }
                    idx.forEach(i => {
                        out[i] = out[i] || {
                            i, q: q || 1, has: q !== null
                        };
                    });
                }
            }
            if (milk && !Object.keys(out).length) {
                const q = (t.match(/\b(\d{1,2})\b/) || [])[1];
                [ix('carton'), ix('hero')].forEach(i => out[i] = {
                    i, q: +q || 1, has: !!q, amb: true
                });
            }
            return Object.values(out);
        }
        const payOn = () => !!(ctx.payOnline && ctx.payOnline());
        const basketTxt = (lang) => {
            const b = ctx.getBasket();
            if (!b.length)
                return L(lang, 'Your basket is empty.', 'உங்கள் கூடை காலியாக உள்ளது.');
            const tot = b.reduce((a, x) => a + x.q * cat[x.i].p, 0);
            return b.map(x => x.q + ' × ' + nm(cat[x.i], lang) + ' (' + cat[x.i].u + ') = ' + money(x.q * cat[x.i].p)).join('\n') + '\n' + L(lang, 'Total: ', 'மொத்தம்: ') + money(tot);
        };
        const chips = (...c) => ({
            t: 'chips', c
        });
        const T = x => ({
            t: 'text', x
        });
        function productInfo(i, lang) {
            const p = cat[i];
            return [T(nm(p, lang) + ' (' + p.u + ') — ' + money(p.p) + '. ' + (lang === 'ta' ? p.dt : p.d)), {
                    t: 'products', i: [i]
                }, chips([L(lang, 'Add 1', '1 சேர்') + ' ' + nm(p, lang), (p.k === 'hero' ? 'add 1 glass bottle' : 'add 1 ' + p.n.toLowerCase())], [L(lang, 'My basket', 'என் கூடை'), 'basket'])];
        }
        function recommend(t, lang) {
            const pick = [], why = [];
            const r = (re, i, en, ta) => {
                if (re.test(t)) {
                    i.forEach(x => {
                        const j = ix(x);
                        if (j >= 0 && !pick.includes(j))
                            pick.push(j);
                    });
                    why.push(L(lang, en, ta));
                }
            };
            r(/coffee|tea|chai|காபி|டீ/, ['hero', 'carton'], 'Full cream milk gives the richest coffee and tea.', 'முழு கிரீம் பால் காபி, டீக்கு மிகச் சிறந்தது.');
            r(/kid|child|school|bedtime|குழந்தை|பள்ளி/, ['badam', 'carton'], 'Kids usually love badam milk; sealed cartons suit lunchboxes.', 'குழந்தைகளுக்கு பாதாம் பால் பிடிக்கும்; பாக்கெட் பள்ளிக்கு ஏற்றது.');
            r(/sweet|festival|pongal|diwali|payasam|halwa|பொங்கல்|தீபாவளி|பாயசம்|இனிப்பு/, ['ghee', 'butter'], 'Ghee and butter are the base for festival sweets.', 'பண்டிகை இனிப்புகளுக்கு நெய், வெண்ணெய் அடிப்படை.');
            r(/idli|dosa|breakfast|millet|இட்லி|தோசை|காலை உணவு/, ['curd', 'butter'], 'Curd and butter go with idli and dosa.', 'இட்லி, தோசைக்கு தயிர், வெண்ணெய் ஏற்றது.');
            r(/summer|cool|lunch|buttermilk|மோர்|கோடை/, ['curd'], 'Cool curd is perfect for summer lunches.', 'கோடை மதிய உணவுக்கு குளிர்ந்த தயிர் சிறந்தது.');
            r(/smoothie|shake|dessert|ஸ்மூத்தி|இனிப்பு/, ['badam'], 'Badam milk blends smooth for shakes.', 'ஷேக்குகளுக்கு பாதாம் பால் மென்மையாகக் கலக்கும்.');
            if (!pick.length) {
                ['carton', 'hero', 'ghee'].forEach(x => pick.push(ix(x)));
                why.push(L(lang, 'These are our most popular everyday picks.', 'இவை எங்கள் பிரபலமான தினசரி தேர்வுகள்.'));
            }
            return [T(why.join(' ')), {
                    t: 'products', i: pick.slice(0, 3)
                }, chips([L(lang, 'Add the first one', 'முதலாவது சேர்'), 'add 1 ' + (cat[pick[0]].k === 'hero' ? 'glass bottle' : cat[pick[0]].n.toLowerCase())], [L(lang, 'My basket', 'என் கூடை'), 'basket'])];
        }
        function deliveryAns(raw, t, lang) {
            const pin = pinOf(raw), a = areaOf(t);
            if (pin) {
                return pinOk(pin) ? [T(L(lang, 'Yes, we deliver to ' + pin + '. Morning delivery reaches you by 5:30 AM.', pin + ' பகுதிக்கு விநியோகம் உண்டு. காலை 5:30க்குள் உங்கள் வாசலில் இருக்கும்.')), chips([L(lang, 'Order now', 'இப்போது ஆர்டர்'), 'checkout'], [L(lang, 'Show products', 'பொருட்கள்'), 'products'])] : [T(L(lang, 'We do not deliver to ' + pin + ' yet. I can ask our team to call you in case we can arrange it.', pin + ' பகுதிக்கு இன்னும் விநியோகம் இல்லை. ஏற்பாடு செய்ய முடியுமா என்று எங்கள் குழு அழைக்க வேண்டுமா?')), chips([L(lang, 'Request a call', 'அழைப்பு கோரு'), 'call me back'])];
            }
            if (a)
                return [T(L(lang, 'Yes, ' + a.en + ' is on our morning delivery route. Delivery reaches you by 5:30 AM.', a.ta + ' எங்கள் காலை விநியோக வழியில் உள்ளது. காலை 5:30க்குள் வந்து சேரும்.')), chips([L(lang, 'Order now', 'இப்போது ஆர்டர்'), 'checkout'], [L(lang, 'Show products', 'பொருட்கள்'), 'products'])];
            return [T(L(lang, 'We deliver across Anna Nagar, KK Nagar, Teppakulam, Goripalayam, Thirunagar and Tallakulam, daily by 5:30 AM. Tell me your area or 6-digit pincode and I will confirm.', 'அண்ணா நகர், கே.கே. நகர், தெப்பக்குளம், கோரிப்பாளையம், திருநகர், தல்லாகுளம் பகுதிகளுக்கு தினமும் காலை 5:30க்குள் விநியோகம். உங்கள் பகுதி அல்லது 6 இலக்க பின்கோடு சொல்லுங்கள்.'))];
        }
        function startOrder(st, lang) {
            const b = ctx.getBasket();
            if (!b.length)
                return {
                    st, m: [T(L(lang, 'Your basket is empty. What would you like to order?', 'உங்கள் கூடை காலியாக உள்ளது. என்ன ஆர்டர் செய்ய விரும்புகிறீர்கள்?')), {
                            t: 'products', i: [0, 5, 2, 3]
                        }, chips([L(lang, 'Recommend for me', 'பரிந்துரை'), 'recommend'])]
                };
            st = {
                mode: 'order', step: 'name', d: {}
            };
            return {
                st, m: [T(basketTxt(lang)), T(L(lang, 'Great. To place your order I need a few details. What is your name?', 'சரி. ஆர்டருக்கு சில விவரங்கள் தேவை. உங்கள் பெயர் என்ன?'))]
            };
        }
        const cm = (d, lang) => [T(basketTxt(lang) + '\n\n' + L(lang, 'Name: ', 'பெயர்: ') + d.name + '\n' + L(lang, 'Phone: ', 'தொலைபேசி: ') + d.phone + '\n' + L(lang, 'Address: ', 'முகவரி: ') + d.addr + '\n' + L(lang, 'Slot: ', 'நேரம்: ') + d.slot + (d.payment ? '\n' + L(lang, 'Payment: ', 'பணம்: ') + (d.payment === 'online' ? L(lang, 'Online (UPI / card)', 'ஆன்லைன் (UPI / கார்டு)') : L(lang, 'Cash on delivery', 'டெலிவரியில் பணம்')) : '')), T(L(lang, 'Shall I place this order?', 'இந்த ஆர்டரை உறுதி செய்யவா?')), chips([L(lang, 'Yes, place order', 'ஆம், ஆர்டர் செய்'), 'yes'], [L(lang, 'Cancel', 'ரத்து'), 'cancel'])];
        function flow(raw, t, st, lang) {
            const d = st.d;
            const cancel = has(t, 'no') && st.step !== 'confirm' && t.split(' ').length <= 2 && /cancel|stop|vendam|வேண்டாம்/.test(t);
            if (cancel || /^(menu|start over|exit)$/.test(t))
                return {
                    st: { mode: null }, m: [T(L(lang, 'No problem, I have cancelled that. Anything else?', 'சரி, ரத்து செய்துவிட்டேன். வேறு ஏதாவது?')), chips([L(lang, 'Show products', 'பொருட்கள்'), 'products'])]
                };
            if (st.mode === 'order') {
                if (st.step === 'name') {
                    if (raw.trim().length < 2)
                        return {
                            st, m: [T(L(lang, 'Please tell me your name.', 'உங்கள் பெயரைச் சொல்லுங்கள்.'))]
                        };
                    d.name = raw.trim().slice(0, 60);
                    if (ctx.knownPhone) {
                        d.phone = ctx.knownPhone;
                        st.step = 'addr';
                        return {
                            st, m: [T(L(lang, 'Thanks ' + d.name + '. Your delivery address with area and pincode? (We will use this WhatsApp number.)', 'நன்றி ' + d.name + '. டெலிவரி முகவரி (பகுதி, பின்கோடுடன்)? (இந்த வாட்ஸ்அப் எண்ணைப் பயன்படுத்துவோம்.)'))]
                        };
                    }
                    st.step = 'phone';
                    return {
                        st, m: [T(L(lang, 'Thanks ' + d.name + '. Your mobile number? (10 digits)', 'நன்றி ' + d.name + '. உங்கள் மொபைல் எண்? (10 இலக்கம்)'))]
                    };
                }
                if (st.step === 'phone') {
                    const p = phoneOf(raw);
                    if (!p)
                        return {
                            st, m: [T(L(lang, 'That does not look like a valid Indian mobile number. Please send 10 digits.', 'சரியான மொபைல் எண் போல இல்லை. 10 இலக்கம் அனுப்புங்கள்.'))]
                        };
                    d.phone = p;
                    st.step = 'addr';
                    return {
                        st, m: [T(L(lang, 'Your delivery address with area and pincode?', 'டெலிவரி முகவரி (பகுதி, பின்கோடுடன்)?'))]
                    };
                }
                if (st.step === 'addr') {
                    if (raw.trim().length < 8)
                        return {
                            st, m: [T(L(lang, 'Please share the full address with area and pincode.', 'முழு முகவரியை பகுதி, பின்கோடுடன் அனுப்புங்கள்.'))]
                        };
                    const pin = pinOf(raw), a = areaOf(t);
                    d.addr = raw.trim().slice(0, 200);
                    d.pin = pin || '';
                    d.area = a ? a.en : '';
                    if (!(a || pinOk(pin)))
                        return {
                            st, m: [T(L(lang, 'I could not confirm that area is on our route. Please check the area name or pincode, or I can request a call from our team.', 'அந்தப் பகுதி எங்கள் வழியில் உள்ளதா என உறுதி செய்ய முடியவில்லை. பகுதி/பின்கோடை சரிபாருங்கள் அல்லது குழுவின் அழைப்பைக் கோரலாம்.')), chips([L(lang, 'Request a call', 'அழைப்பு கோரு'), 'call me back'])]
                        };
                    st.step = 'slot';
                    return {
                        st, m: [T(L(lang, 'When should we deliver?', 'எப்போது டெலிவரி வேண்டும்?')), {
                                t: 'chips', c: [[L(lang, 'By 5:30 AM', 'காலை 5:30க்குள்'), 'slot1'], [L(lang, '6:30 to 7:30 AM', 'காலை 6:30 முதல் 7:30'), 'slot2']]
                            }]
                    };
                }
                if (st.step === 'slot') {
                    d.slot = /2|6:30|7:30|இரண்டாவது/.test(t) ? '6:30-7:30 AM' : 'By 5:30 AM';
                    if (payOn()) {
                        st.step = 'pay';
                        return {
                            st, m: [T(L(lang, 'How would you like to pay?', 'எப்படி பணம் செலுத்த விரும்புகிறீர்கள்?')), chips([L(lang, 'Pay online (UPI / card)', 'ஆன்லைனில் செலுத்து'), 'pay_online'], [L(lang, 'Cash on delivery', 'டெலிவரியில் பணம்'), 'pay_cod'])]
                        };
                    }
                    st.step = 'confirm';
                    return {
                        st, m: [T(basketTxt(lang) + '\n\n' + L(lang, 'Name: ', 'பெயர்: ') + d.name + '\n' + L(lang, 'Phone: ', 'தொலைபேசி: ') + d.phone + '\n' + L(lang, 'Address: ', 'முகவரி: ') + d.addr + '\n' + L(lang, 'Slot: ', 'நேரம்: ') + d.slot), T(L(lang, 'Shall I place this order? Payment is on delivery or as your team confirms on WhatsApp.', 'இந்த ஆர்டரை உறுதி செய்யவா? பணம் டெலிவரியில் அல்லது வாட்ஸ்அப்பில் குழு உறுதிசெய்யும்படி.')), chips([L(lang, 'Yes, place order', 'ஆம், ஆர்டர் செய்'), 'yes'], [L(lang, 'Cancel', 'ரத்து'), 'cancel'])]
                    };
                }
                if (st.step === 'pay') {
                    if (/online|upi|card|razorpay|pay now|ஆன்லைன்/.test(t))
                        d.payment = 'online';
                    else if (/cod|cash|delivery|பணம்|டெலிவரி/.test(t))
                        d.payment = 'cod';
                    else
                        return {
                            st, m: [T(L(lang, 'Please choose Pay online or Cash on delivery.', 'ஆன்லைனில் செலுத்து அல்லது டெலிவரியில் பணம் என்பதைத் தேர்ந்தெடுங்கள்.'))]
                        };
                    st.step = 'confirm';
                    return {
                        st, m: cm(d, lang)
                    };
                }
                if (st.step === 'confirm') {
                    if (has(t, 'yes')) {
                        const b = ctx.getBasket();
                        const order = {
                            items: b.map(x => ({
                                sku: cat[x.i].sku, name: cat[x.i].n, qty: x.q, unit_price: cat[x.i].p
                            })), total: b.reduce((a, x) => a + x.q * cat[x.i].p, 0), customer: {
                                name: d.name, phone: d.phone
                            }, address: d.addr, area: d.area, pincode: d.pin, slot: d.slot, payment: d.payment === 'online' ? 'online' : 'cod', lang
                        };
                        return {
                            st: { mode: null }, m: [T(L(lang, 'Placing your order…', 'உங்கள் ஆர்டரை பதிவு செய்கிறேன்…'))], a: [{
                                    type: 'submit_order', order
                                }]
                        };
                    }
                    if (has(t, 'no'))
                        return {
                            st: { mode: null }, m: [T(L(lang, 'Order cancelled. Your basket is still saved.', 'ஆர்டர் ரத்து செய்யப்பட்டது. கூடை அப்படியே உள்ளது.'))]
                        };
                    return {
                        st, m: [T(L(lang, 'Please say yes to confirm or cancel to stop.', 'உறுதி செய்ய "ஆம்" அல்லது நிறுத்த "ரத்து" என்று சொல்லுங்கள்.'))]
                    };
                }
            }
            if (st.mode === 'lead') {
                if (st.step === 'detail') {
                    d.detail = raw.trim().slice(0, 400);
                    if (ctx.knownPhone) {
                        return {
                            st: { mode: null }, m: [T(L(lang, 'Done. Our team will call you on this number shortly. Reference: ', 'முடிந்தது. எங்கள் குழு இதே எண்ணில் விரைவில் அழைக்கும். குறிப்பு எண்: ') + '{ref}')], a: [{
                                    type: 'submit_lead', lead: {
                                        type: d.type, phone: ctx.knownPhone, detail: d.detail, lang, basket: ctx.getBasket().map(x => x.q + ' x ' + cat[x.i].n).join(', ')
                                    }
                                }]
                        };
                    }
                    st.step = 'phone';
                    return {
                        st, m: [T(L(lang, 'Thank you. What mobile number can our team reach you on?', 'நன்றி. எந்த மொபைல் எண்ணில் அழைக்கலாம்?'))]
                    };
                }
                if (st.step === 'phone') {
                    const p = phoneOf(raw);
                    if (!p)
                        return {
                            st, m: [T(L(lang, 'Please send a valid 10 digit mobile number.', 'சரியான 10 இலக்க மொபைல் எண்ணை அனுப்புங்கள்.'))]
                        };
                    const lead = {
                        type: d.type, phone: p, detail: d.detail || '', lang, basket: ctx.getBasket().map(x => x.q + ' x ' + cat[x.i].n).join(', ')
                    };
                    return {
                        st: { mode: null }, m: [T(L(lang, 'Done. Our team will call you shortly. Reference: ', 'முடிந்தது. எங்கள் குழு விரைவில் அழைக்கும். குறிப்பு எண்: ') + '{ref}')], a: [{
                                type: 'submit_lead', lead
                            }]
                    };
                }
            }
            if (st.mode === 'sub') {
                if (has(t, 'yes')) {
                    st = {
                        mode: 'lead', step: 'phone', d: {
                            type: 'subscription', detail: d.detail
                        }
                    };
                    return {
                        st, m: [T(L(lang, 'Lovely. What mobile number can our team reach you on to set it up?', 'சரி. இதை அமைக்க எந்த மொபைல் எண்ணில் அழைக்கலாம்?'))]
                    };
                }
                return {
                    st: { mode: null }, m: [T(L(lang, 'No problem. Ask me anything else.', 'சரி. வேறு எதாவது கேளுங்கள்.'))]
                };
            }
            return {
                st: { mode: null }, m: []
            };
        }
        function subscription(raw, t, lang) {
            const f = findProducts(t), p = f.length ? cat[f[0].i] : cat[0], q = f.length && f[0].has ? f[0].q : ((t.match(/\b(\d{1,2})\b/) || [])[1] ? +t.match(/\b(\d{1,2})\b/)[1] : 1), weekly = /weekly|week|வாரம்/.test(t), n = weekly ? 4 : 30, tot = q * n * p.p;
            const text = L(lang, q + ' × ' + p.n + ' (' + p.u + ') ' + (weekly ? 'every week' : 'every day') + ' comes to about ' + money(tot) + ' a month at current prices. Our team confirms the plan and any change on WhatsApp.', q + ' × ' + p.nt + ' (' + p.u + ') ' + (weekly ? 'வாரந்தோறும்' : 'தினமும்') + ' தற்போதைய விலையில் மாதத்திற்கு சுமார் ' + money(tot) + '. திட்டத்தை எங்கள் குழு வாட்ஸ்அப்பில் உறுதி செய்யும்.');
            return {
                m: [T(text), T(L(lang, 'Shall I ask our team to set this up for you?', 'உங்களுக்காக இதை அமைக்க குழுவிடம் கேட்கவா?')), chips([L(lang, 'Yes, set it up', 'ஆம், அமை'), 'yes'], [L(lang, 'No thanks', 'வேண்டாம்'), 'no'])], detail: q + ' x ' + p.n + (weekly ? ' weekly' : ' daily') + ' (~' + money(tot) + '/month)'
            };
        }
        function intentOf(raw) {
            const t = norm(raw), f = findProducts(t), o = {
                t, products: f
            };
            if (/vgm-\d{6}-[a-z0-9]{3,6}/i.test(raw))
                return Object.assign(o, { intent: 'status' });
            const order = ['human', 'complaint', 'status', 'checkout', 'remove', 'callback', 'subscription', 'bulk', 'delivery', 'price', 'recommend', 'quality', 'offers', 'health', 'contact', 'language', 'theme', 'basket', 'thanks', 'bye', 'greet'];
            if (f.length && has(t, 'price') && !has(t, 'add') && !has(t, 'subscription'))
                return Object.assign(o, { intent: 'price' });
            if (f.length && (has(t, 'add') || /^\d/.test(t) || f.some(x => x.has)))
                if (!has(t, 'delivery') && !has(t, 'subscription') && !has(t, 'recommend') && !has(t, 'checkout') && !has(t, 'remove'))
                    return Object.assign(o, { intent: 'add' });
            if (pinOf(raw) && !has(t, 'add'))
                return Object.assign(o, { intent: 'delivery' });
            if (areaOf(t) && !has(t, 'add'))
                return Object.assign(o, { intent: 'delivery' });
            for (const k of order) {
                if (has(t, k)) {
                    if (k === 'delivery' && f.length && !has(t, 'deliver*') && !/time|when|slot|epo|எப்போது/.test(t))
                        continue;
                    return Object.assign(o, { intent: k });
                }
            }
            if (has(t, 'products'))
                return Object.assign(o, { intent: 'products' });
            if (has(t, 'add'))
                return Object.assign(o, { intent: 'add' });
            if (f.length)
                return Object.assign(o, { intent: 'info' });
            if (has(t, 'yes'))
                return Object.assign(o, { intent: 'yes' });
            if (has(t, 'no'))
                return Object.assign(o, { intent: 'no' });
            return Object.assign(o, { intent: 'unknown' });
        }
        function respond(raw, st, uiLang) {
            st = st || { mode: null };
            const tt = norm(raw);
            let lang = isTa(raw) ? 'ta' : (uiLang || 'en');
            if (st.mode && !/^(menu|start over|exit)$/.test(tt)) {
                const r = flow(String(raw), tt, st, lang);
                if (r.m.length || r.a)
                    return Object.assign({
                        intent: 'flow:' + st.mode, lang
                    }, r);
            }
            const I = intentOf(raw), t = I.t, f = I.products;
            let m = [], a = [], ns = { mode: null };
            switch (I.intent) {
                case 'greet':
                    m = [T(L(lang, 'Vanakkam! I am the Vaigai assistant. I can show products, build your basket, check delivery to your area, set up daily plans and place your order.', 'வணக்கம்! நான் வைகை உதவியாளர். பொருட்களைக் காட்ட, கூடை அமைக்க, உங்கள் பகுதிக்கு டெலிவரி சரிபார்க்க, தினசரி திட்டம் அமைக்க, ஆர்டர் செய்ய உதவுவேன்.')), chips([L(lang, 'Show products', 'பொருட்கள்'), 'products'], [L(lang, 'Recommend for coffee', 'காபிக்கு பரிந்துரை'), 'recommend for coffee'], [L(lang, 'Delivery in my area', 'என் பகுதியில் டெலிவரி'), 'delivery'], [L(lang, 'Talk to the team', 'குழுவுடன் பேச'), 'talk to human'])];
                    break;
                case 'thanks':
                    m = [T(L(lang, 'You are welcome! Anything else I can help with?', 'நன்றி! வேறு ஏதாவது உதவி வேண்டுமா?'))];
                    break;
                case 'bye':
                    m = [T(L(lang, 'Thank you for visiting Vaigai Milk. Have a fresh day!', 'வைகை பால் வருகைக்கு நன்றி. இனிய நாளாகட்டும்!'))];
                    break;
                case 'products':
                    m = [T(L(lang, 'Here is our range. Tap Add to put anything in your basket.', 'எங்கள் பொருட்கள் இதோ. கூடையில் சேர்க்க "Add" தட்டுங்கள்.')), {
                            t: 'products', i: cat.map((_, i) => i)
                        }];
                    break;
                case 'price':
                case 'info': {
                    if (!f.length) {
                        m = [T(L(lang, 'Which product? Milk, badam milk, ghee, curd or butter?', 'எந்தப் பொருள்? பால், பாதாம் பால், நெய், தயிர் அல்லது வெண்ணெய்?')), {
                                t: 'products', i: cat.map((_, i) => i)
                            }];
                        break;
                    }
                    if (f.length > 1 && f.some(x => x.amb)) {
                        m = [T(L(lang, 'We have two kinds of milk:', 'எங்களிடம் இரண்டு வகை பால் உள்ளது:')), {
                                t: 'products', i: f.map(x => x.i)
                            }];
                        break;
                    }
                    m = f.length === 1 ? productInfo(f[0].i, lang) : [T(f.map(x => nm(cat[x.i], lang) + ' ' + money(cat[x.i].p) + ' (' + cat[x.i].u + ')').join('\n')), {
                            t: 'products', i: f.map(x => x.i)
                        }];
                    break;
                }
                case 'add': {
                    if (!f.length) {
                        m = [T(L(lang, 'What would you like to add?', 'என்ன சேர்க்க வேண்டும்?')), {
                                t: 'products', i: [0, 5, 1, 2, 3, 4]
                            }];
                        break;
                    }
                    if (f.some(x => x.amb)) {
                        m = [T(L(lang, 'Which milk would you like?', 'எந்தப் பால் வேண்டும்?')), {
                                t: 'products', i: f.map(x => x.i)
                            }];
                        break;
                    }
                    f.forEach(x => a.push({
                        type: 'add', i: x.i, q: x.q
                    }));
                    m = [T(L(lang, 'Added: ', 'சேர்க்கப்பட்டது: ') + f.map(x => x.q + ' × ' + nm(cat[x.i], lang)).join(', ')), chips([L(lang, 'Checkout', 'ஆர்டர் செய்'), 'checkout'], [L(lang, 'My basket', 'என் கூடை'), 'basket'], [L(lang, 'Add more', 'மேலும் சேர்'), 'products'])];
                    break;
                }
                case 'remove':
                    if (/clear|empty|all|அழி/.test(t) || !f.length) {
                        a.push({ type: 'clear' });
                        m = [T(L(lang, 'Basket cleared.', 'கூடை காலி செய்யப்பட்டது.'))];
                    }
                    else {
                        f.forEach(x => a.push({
                            type: 'remove', i: x.i
                        }));
                        m = [T(L(lang, 'Removed ' + f.map(x => cat[x.i].n).join(', ') + '.', 'நீக்கப்பட்டது: ' + f.map(x => cat[x.i].nt).join(', ')))];
                    }
                    break;
                case 'basket':
                    m = [T(basketTxt(lang)), chips([L(lang, 'Checkout', 'ஆர்டர் செய்'), 'checkout'], [L(lang, 'Add more', 'மேலும் சேர்'), 'products'])];
                    break;
                case 'checkout': {
                    const r = startOrder({}, lang);
                    ns = r.st.mode ? r.st : { mode: null };
                    m = r.m;
                    break;
                }
                case 'delivery':
                    m = deliveryAns(raw, t, lang);
                    break;
                case 'subscription': {
                    const r = subscription(raw, t, lang);
                    m = r.m;
                    ns = {
                        mode: 'sub', d: { detail: r.detail }
                    };
                    break;
                }
                case 'recommend':
                    m = recommend(t, lang);
                    break;
                case 'quality':
                    m = [T(L(lang, 'Every batch is checked at the farm, at the chilling centre and again at our dairy before it is sealed. Milk is chilled within hours and delivered cold.', 'ஒவ்வொரு தொகுப்பும் பண்ணையிலும், குளிர்விப்பு நிலையத்திலும், பால் நிலையத்திலும் சோதிக்கப்பட்டு மூடப்படுகிறது. சில மணி நேரத்தில் குளிர்விக்கப்பட்டு குளிர்ந்த நிலையில் வழங்கப்படுகிறது.'))];
                    break;
                case 'contact':
                    m = [T(L(lang, 'You can reach us on WhatsApp or call the number in the footer. Orders are taken 6 AM to 9 PM, with delivery daily by 5:30 AM.', 'வாட்ஸ்அப் அல்லது அடிக்குறிப்பில் உள்ள எண்ணில் அழைக்கலாம். ஆர்டர்: காலை 6 முதல் இரவு 9 வரை; விநியோகம் தினமும் காலை 5:30க்குள்.')), chips([L(lang, 'Open WhatsApp', 'வாட்ஸ்அப் திற'), 'talk to human'])];
                    break;
                case 'offers':
                    m = [T(L(lang, 'I do not have any running offers listed. Our team can share current offers on WhatsApp.', 'தற்போது எந்தச் சலுகையும் பட்டியலில் இல்லை. தற்போதைய சலுகைகளை வாட்ஸ்அப்பில் குழு பகிரும்.')), chips([L(lang, 'Ask on WhatsApp', 'வாட்ஸ்அப்பில் கேள்'), 'talk to human'])];
                    break;
                case 'health':
                    m = [T(L(lang, 'I cannot give medical advice. Please check with your doctor about milk products for your condition. I can tell you what is in each product.', 'நான் மருத்துவ ஆலோசனை வழங்க முடியாது. உங்கள் நிலைக்கு பால் பொருட்கள் பற்றி மருத்துவரிடம் கேளுங்கள். ஒவ்வொரு பொருளிலும் என்ன உள்ளது என்று சொல்ல முடியும்.')), {
                            t: 'products', i: [0, 1, 3]
                        }];
                    break;
                case 'language': {
                    const toTa = /tamil|தமிழ்/.test(t);
                    a.push({
                        type: 'lang', v: toTa ? 'ta' : 'en'
                    });
                    m = [T(toTa ? 'சரி, தமிழில் பேசுகிறேன்.' : 'Sure, switching to English.')];
                    break;
                }
                case 'theme':
                    a.push({
                        type: 'theme', v: /dark|night/.test(t) ? 'dark' : 'light'
                    });
                    m = [T(L(lang, 'Done.', 'முடிந்தது.'))];
                    break;
                case 'human':
                    a.push({
                        type: 'whatsapp', text: L('en', 'Hi Vaigai Milk, I need help from your team.', 'Hi Vaigai Milk, I need help from your team.') + (ctx.getBasket().length ? '\nMy basket: ' + ctx.getBasket().map(x => x.q + ' x ' + cat[x.i].n).join(', ') : '')
                    });
                    m = [T(L(lang, 'I am opening WhatsApp so you can chat with our team directly.', 'எங்கள் குழுவுடன் நேரடியாகப் பேச வாட்ஸ்அப்பை திறக்கிறேன்.'))];
                    break;
                case 'callback':
                    if (ctx.knownPhone) {
                        a.push({
                            type: 'submit_lead', lead: {
                                type: 'callback', phone: ctx.knownPhone, detail: '', lang, basket: ctx.getBasket().map(x => x.q + ' x ' + cat[x.i].n).join(', ')
                            }
                        });
                        m = [T(L(lang, 'Done. Our team will call you on this number shortly. Reference: {ref}', 'சரி. எங்கள் குழு இதே எண்ணில் விரைவில் அழைக்கும். குறிப்பு எண்: {ref}'))];
                        break;
                    }
                    ns = {
                        mode: 'lead', step: 'phone', d: { type: 'callback' }
                    };
                    m = [T(L(lang, 'Sure. What mobile number can our team call you on?', 'சரி. எந்த மொபைல் எண்ணில் அழைக்கலாம்?'))];
                    break;
                case 'bulk':
                    ns = {
                        mode: 'lead', step: 'detail', d: { type: 'bulk' }
                    };
                    m = [T(L(lang, 'We supply cafes, hotels and caterers in Madurai. Tell me your business name and what you need each day.', 'மதுரையில் கஃபே, ஹோட்டல், கேட்டரிங் நிறுவனங்களுக்கு விநியோகம் செய்கிறோம். உங்கள் நிறுவனப் பெயர், தினசரி தேவையைச் சொல்லுங்கள்.'))];
                    break;
                case 'complaint':
                    ns = {
                        mode: 'lead', step: 'detail', d: { type: 'complaint' }
                    };
                    m = [T(L(lang, 'I am sorry about that. Please tell me what happened (product, date and the problem) and I will get our team to fix it.', 'மன்னிக்கவும். என்ன நடந்தது (பொருள், தேதி, பிரச்சனை) என்று சொல்லுங்கள்; எங்கள் குழு சரிசெய்யும்.'))];
                    break;
                case 'status': {
                    const id = (raw.match(/vgm-\d{6}-[a-z0-9]{3,6}/i) || [''])[0].toUpperCase();
                    a.push({
                        type: 'status', id
                    });
                    m = [T(L(lang, 'Checking ' + id + '…', 'சரிபார்க்கிறேன் ' + id + '…'))];
                    if (!id)
                        m = [T(L(lang, 'Please send your order number (it looks like VGM-250101-AB12).', 'உங்கள் ஆர்டர் எண்ணை அனுப்புங்கள் (VGM-250101-AB12 போல).'))];
                    break;
                }
                case 'yes':
                case 'no':
                    m = [T(L(lang, 'Okay. What would you like to do next?', 'சரி. அடுத்து என்ன செய்யலாம்?')), chips([L(lang, 'Show products', 'பொருட்கள்'), 'products'], [L(lang, 'My basket', 'என் கூடை'), 'basket'])];
                    break;
                default: m = [T(L(lang, 'I am not sure I understood. I can help with products, prices, your basket, delivery, daily plans and orders. Or I can connect you to our team.', 'நான் சரியாகப் புரிந்துகொள்ளவில்லை. பொருட்கள், விலை, கூடை, டெலிவரி, தினசரி திட்டம், ஆர்டர் ஆகியவற்றில் உதவ முடியும். அல்லது குழுவுடன் இணைக்கலாம்.')), chips([L(lang, 'Show products', 'பொருட்கள்'), 'products'], [L(lang, 'Talk to the team', 'குழுவுடன் பேச'), 'talk to human'])];
            }
            return {
                intent: I.intent, lang, st: ns, m, a
            };
        }
        return {
            respond, intentOf, findProducts
        };
    }
    return {
        create, norm, phoneOf, pinOf, pinOk, AREAS
    };
})();
if (typeof module !== 'undefined')
    module.exports = VaigaiBrain;
