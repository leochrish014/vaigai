/* Local stand-in for the n8n webhooks, so you can test the website assistant without n8n or an AI key.
   Run:  node mock-n8n.js        (listens on http://localhost:5678)
   Then set in index.html:  assistantWebhook:"http://localhost:5678/webhook/vaigai-assistant", orderWebhook:".../webhook/vaigai-order", leadWebhook:".../webhook/vaigai-lead", statusWebhook:".../webhook/vaigai-order-status", webhookKey:"dev-key" */
const http = require('http'), crypto = require('crypto');
const E = require('../shared/invoice-engine.js');
const RZP_SECRET = process.env.RZP_SECRET || 'mocksecret', INV_BASE = process.env.INVOICE_BASE || 'http://localhost:8080/invoice.html', invoices = {};
const KEY = process.env.VAIGAI_KEY || 'dev-key';
const CAT = {
    'VGM-CARTON-500ml': {
        n: 'Vaigai Fresh milk', p: 32
    }, 'VGM-BADAM-250ml': {
        n: 'Badam milk', p: 55
    }, 'VGM-GHEE-500ml': {
        n: 'Farm ghee', p: 320
    }, 'VGM-CURD-400g': {
        n: 'Set curd', p: 60
    }, 'VGM-BUTTER-200g': {
        n: 'Fresh butter', p: 110
    }, 'VGM-HERO-500ml': {
        n: 'Glass bottle milk', p: 36
    }
};
const orders = {}, log = [], leads = [], stockMap = {}, otps = {}, sessions = {}, subs = [{
        sub_id: 'S001', phone: '9876501234', status: 'active', customer_name: 'Meena', items: 'VGM-CARTON-500ml:2;VGM-CURD-400g:1', frequency: 'daily', slot: 'By 5:30 AM', skip_dates: '', address: '5 Temple Road, Teppakulam'
    }];
const send = (res, code, obj) => {
    res.writeHead(code, {
        'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,x-vaigai-key,x-vaigai-token,x-vaigai-admin', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    });
    res.end(JSON.stringify(obj));
};
const tomorrow = () => {
    const d = new Date(Date.now() + 5.5 * 3600e3);
    if (d.getUTCHours() >= 21)
        d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
};
http.createServer((req, res) => {
    if (req.method === 'OPTIONS')
        return send(res, 204, {});
    const u = new URL(req.url, 'http://x');
    let b = '';
    req.on('data', c => b += c);
    req.on('end', () => {
        if (u.pathname === '/_log')
            return send(res, 200, log);
        if (req.headers['x-vaigai-key'] !== KEY && u.pathname.startsWith('/webhook') && !/vaigai-(invoice|account|sub-update|admin)$/.test(u.pathname))
            return send(res, 401, {
                ok: false, error: 'unauthorized'
            });
        let j = {};
        try {
            j = b ? JSON.parse(b) : {};
        }
        catch (e) {
            return send(res, 400, {
                ok: false, error: 'bad json'
            });
        }
        log.push({
            path: u.pathname, body: j
        });
        if (u.pathname === '/webhook/vaigai-otp-request') {
            const ph = String(j.phone || '').replace(/\D/g, '').slice(-10);
            if (!/^[6-9]\d{9}$/.test(ph))
                return send(res, 400, {
                    ok: false, error: 'valid 10 digit mobile required'
                });
            const o = otps[ph] = otps[ph] || { reqs: [] };
            o.reqs = o.reqs.filter(t => t > Date.now() - 600000);
            if (o.reqs.length >= 3)
                return send(res, 429, {
                    ok: false, error: 'too many requests, please try after 10 minutes'
                });
            o.reqs.push(Date.now());
            o.otp = '123456';
            o.exp = Date.now() + 300000;
            o.attempts = 0;
            return send(res, 200, {
                ok: true, expires_in: 300
            });
        }
        if (u.pathname === '/webhook/vaigai-otp-verify') {
            const ph = String(j.phone || '').replace(/\D/g, '').slice(-10), o = otps[ph];
            if (!o || o.exp < Date.now())
                return send(res, 400, {
                    ok: false, error: 'code expired, please request a new one'
                });
            if (o.attempts >= 5)
                return send(res, 400, {
                    ok: false, error: 'too many wrong attempts, please request a new code'
                });
            if (String(j.otp) !== o.otp) {
                o.attempts++;
                return send(res, 400, {
                    ok: false, error: 'wrong code'
                });
            }
            const tok = crypto.randomBytes(12).toString('hex');
            sessions[tok] = {
                phone: ph, exp: Date.now() + 30 * 864e5
            };
            o.exp = 0;
            return send(res, 200, {
                ok: true, token: tok
            });
        }
        if (u.pathname === '/webhook/vaigai-account' || u.pathname === '/webhook/vaigai-sub-update') {
            const s = sessions[req.headers['x-vaigai-token'] || ''];
            if (!s || s.exp < Date.now())
                return send(res, 401, {
                    ok: false, error: 'session expired, please log in again'
                });
            if (u.pathname === '/webhook/vaigai-account') {
                const mine = Object.entries(orders).filter(([id, o]) => o.customer && o.customer.phone === s.phone).map(([id, o]) => ({
                    order_id: id, created_at: o.created_at, status: o.status, items: o.items.map(i => i.qty + ' x ' + CAT[i.sku].n).join('; '), total: o.total, payment: o.payment, items_json: JSON.stringify(o.items), address: o.address, area: o.area, pincode: o.pincode, slot: o.slot
                })).reverse();
                const ms = subs.filter(x => x.phone === s.phone && x.status !== 'cancelled');
                return send(res, 200, {
                    ok: true, customer: {
                        name: (mine[0] && orders[mine[0].order_id].customer.name) || (ms[0] && ms[0].customer_name) || '', phone: s.phone.slice(0, 2) + 'XXXXXX' + s.phone.slice(-2)
                    }, orders: mine, subscriptions: ms
                });
            }
            const x = subs.find(z => z.sub_id === j.sub_id && z.phone === s.phone);
            if (!x || x.status === 'cancelled')
                return send(res, 400, {
                    ok: false, error: 'subscription not found'
                });
            if (j.action === 'pause')
                x.status = 'paused';
            else if (j.action === 'resume')
                x.status = 'active';
            else if (j.action === 'cancel')
                x.status = 'cancelled';
            else if (j.action === 'skip') {
                const ist = new Date(Date.now() + 330 * 60000), first = new Date(ist.getTime() + 864e5 * (ist.getUTCHours() >= 21 ? 2 : 1)).toISOString().slice(0, 10), last = new Date(ist.getTime() + 60 * 864e5).toISOString().slice(0, 10);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(j.date || ''))
                    return send(res, 400, {
                        ok: false, error: 'choose a valid date'
                    });
                if (j.date < first)
                    return send(res, 400, {
                        ok: false, error: 'too late to skip that day (cut-off 9 PM the day before)'
                    });
                if (j.date > last)
                    return send(res, 400, {
                        ok: false, error: 'you can skip up to 60 days ahead'
                    });
                const a = x.skip_dates ? x.skip_dates.split(',') : [];
                if (!a.includes(j.date))
                    a.push(j.date);
                x.skip_dates = a.sort().join(',');
            }
            else
                return send(res, 400, {
                    ok: false, error: 'unknown action'
                });
            return send(res, 200, {
                ok: true, sub_id: x.sub_id, status: x.status, skip_dates: x.skip_dates
            });
        }
        if (u.pathname === '/webhook/vaigai-admin') {
            if (req.headers['x-vaigai-admin'] !== (process.env.ADMIN_KEY || 'admin-key'))
                return send(res, 401, {
                    ok: false, error: 'unauthorized'
                });
            if (j.action === 'list_orders') {
                const L = Object.entries(orders).map(([id, o]) => ({
                    order_id: id, created_at: o.created_at, status: o.status, customer_name: o.customer.name, phone: o.customer.phone, address: o.address, area: o.area || '', pincode: o.pincode || '', slot: o.slot || '', delivery_date: o.delivery_date, items: o.items.map(i => i.qty + ' x ' + CAT[i.sku].n).join('; '), items_json: JSON.stringify(o.items), total: o.total, payment: o.payment, invoice_no: '', rider: o.rider || '', notes: o.notes || '', delivered_at: o.delivered_at || '', collected_inr: o.collected_inr || ''
                })).filter(o => (!j.date_from || o.delivery_date >= j.date_from) && (!j.date_to || o.delivery_date <= j.date_to));
                return send(res, 200, {
                    ok: true, count: L.length, orders: L
                });
            }
            if (j.action === 'list_leads')
                return send(res, 200, {
                    ok: true, count: leads.length, leads
                });
            if (j.action === 'list_stock')
                return send(res, 200, {
                    ok: true, stock: Object.values(stockMap)
                });
            if (j.action === 'order_update') {
                const o = orders[j.order_id];
                if (!o || !['received', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled', 'needs_review', 'failed'].includes(j.status))
                    return send(res, 400, {
                        ok: false, error: 'valid order id and status required'
                    });
                o.status = j.status;
                o.rider = j.rider || '';
                if (j.status === 'delivered') {
                    o.delivered_at = new Date().toISOString();
                    o.collected_inr = String(j.collected_inr);
                }
                return send(res, 200, {
                    ok: true, order_id: j.order_id, status: j.status
                });
            }
            if (j.action === 'lead_update') {
                const l = leads.find(x => x.lead_id === j.lead_id);
                if (!l || !['new', 'contacted', 'resolved', 'closed'].includes(j.status))
                    return send(res, 400, {
                        ok: false, error: 'valid lead id and status required'
                    });
                Object.assign(l, {
                    status: j.status, assignee: j.assignee || '', note: j.note || ''
                });
                return send(res, 200, {
                    ok: true, lead_id: l.lead_id, status: l.status
                });
            }
            if (j.action === 'stock_set') {
                if (!CAT[j.sku] || !/^\d{4}-\d{2}-\d{2}$/.test(j.date || ''))
                    return send(res, 400, {
                        ok: false, error: 'valid sku and date required'
                    });
                const id = j.sku + '|' + j.date;
                stockMap[id] = {
                    stock_id: id, sku: j.sku, date: j.date, capacity: Math.max(0, +j.capacity || 0), produced: Math.max(0, +j.produced || 0), notes: ''
                };
                return send(res, 200, {
                    ok: true, stock_id: id
                });
            }
            return send(res, 400, {
                ok: false, error: 'unknown action'
            });
        }
        if (u.pathname === '/webhook/vaigai-assistant') {
            const m = String(j.message || '').toLowerCase();
            let reply = 'I can help with products, delivery and orders.', actions = [], q = ['Show products', 'Delivery in my area'];
            if (/ghee/.test(m)) {
                reply = 'Our farm ghee is ₹320 for 500 ml. I have added one to your basket.';
                actions = [{
                        type: 'add_to_basket', sku: 'VGM-GHEE-500ml', qty: 1
                    }];
                q = ['Checkout', 'Add curd'];
            }
            else if (/show|products|menu/.test(m)) {
                reply = 'Here is our range.';
                actions = [{
                        type: 'show_products', skus: Object.keys(CAT).slice(0, 3)
                    }];
            }
            else if (/checkout|order/.test(m)) {
                reply = 'Great, let us place your order.';
                actions = [{ type: 'start_checkout' }];
            }
            else if (/human|team/.test(m)) {
                reply = 'Connecting you to our team on WhatsApp.';
                actions = [{ type: 'handoff' }];
            }
            return send(res, 200, {
                reply, lang: j.lang || 'en', actions, quick_replies: q
            });
        }
        if (u.pathname === '/webhook/vaigai-order') {
            const items = (j.items || []).map(i => ({
                sku: i.sku, qty: Math.max(1, Math.min(99, i.qty | 0))
            })).filter(i => CAT[i.sku]);
            if (!items.length || !(j.customer && /^[6-9]\d{9}$/.test(j.customer.phone || '')))
                return send(res, 400, {
                    ok: false, error: 'invalid order'
                });
            const total = items.reduce((a, i) => a + i.qty * CAT[i.sku].p, 0), id = j.order_id || ('VGM-' + Date.now().toString(36).toUpperCase()), online = j.payment === 'online';
            orders[id] = {
                status: 'received', delivery_date: j.test_delivery_date || tomorrow(), payment: online ? 'online_pending' : 'cash_on_delivery', items, total, customer: j.customer, address: j.address, area: j.area, pincode: j.pincode, slot: j.slot, created_at: new Date().toISOString()
            };
            return send(res, 200, {
                ok: true, order_id: id, total, delivery_date: tomorrow(), status: 'received', payment_required: online
            });
        }
        if (u.pathname === '/webhook/vaigai-pay-create') {
            const o = orders[String(j.order_id || '').toUpperCase()] || orders[j.order_id];
            if (!o || o.payment !== 'online_pending')
                return send(res, 400, {
                    ok: false, error: 'order not payable'
                });
            return send(res, 200, {
                ok: true, key_id: 'rzp_test_mock', razorpay_order_id: 'order_' + j.order_id, amount: o.total * 100, currency: 'INR', description: 'Vaigai Milk order ' + j.order_id, prefill: {
                    name: o.customer.name, contact: '+91' + o.customer.phone
                }
            });
        }
        if (u.pathname === '/webhook/vaigai-pay-verify') {
            const exp = crypto.createHmac('sha256', RZP_SECRET).update(j.razorpay_order_id + '|' + j.razorpay_payment_id).digest('hex');
            if (!E.safeEqual(exp, String(j.razorpay_signature || '')))
                return send(res, 400, {
                    ok: false, error: 'signature mismatch'
                });
            const o = orders[j.order_id];
            if (!o)
                return send(res, 400, {
                    ok: false, error: 'order not found'
                });
            if (!invoices[j.order_id]) {
                const lines = o.items.map(i => ({
                    sku: i.sku, name: CAT[i.sku].n, qty: i.qty, unit_price: CAT[i.sku].p
                })), calc = E.compute(lines, {}), now = new Date();
                invoices[j.order_id] = {
                    invoice_no: E.invoiceNo(E.nextSeq(Object.values(invoices).map(x => x.invoice_no), now), now), invoice_date: now.toISOString().slice(0, 10), token: crypto.randomBytes(12).toString('hex'), calc, customer: o.customer, address: o.address, payment_id: j.razorpay_payment_id
                };
                o.payment = 'paid';
            }
            const v = invoices[j.order_id];
            return send(res, 200, {
                ok: true, invoice_no: v.invoice_no, total: v.calc.total, invoice_url: INV_BASE + '?id=' + j.order_id + '&t=' + v.token + '&api=http://localhost:5678/webhook'
            });
        }
        if (u.pathname === '/webhook/vaigai-invoice') {
            const v = invoices[u.searchParams.get('id')];
            if (!v || !E.safeEqual(v.token, u.searchParams.get('t') || ''))
                return send(res, 200, { found: false });
            const c = v.calc, p = String(v.customer.phone);
            return send(res, 200, {
                found: true, seller: E.CFG.seller, invoice_no: v.invoice_no, invoice_date: v.invoice_date, order_id: u.searchParams.get('id'), customer: {
                    name: v.customer.name, phone: p.slice(0, 2) + 'XXXXXX' + p.slice(-2), address: v.address
                }, place_of_supply: 'Tamil Nadu (33)', lines: c.lines, taxable_total: c.taxable_total, cgst: c.cgst, sgst: c.sgst, igst: c.igst, round_off: c.round_off, total: c.total, payment_id: v.payment_id, payment_mode: 'online'
            });
        }
        if (u.pathname === '/webhook/vaigai-lead') {
            const hi = ['complaint', 'bulk', 'handoff'].includes(j.type);
            leads.push({
                lead_id: j.lead_id || ('LD-MOCK' + leads.length), created_at: new Date(Date.now() - (j.age_min || 0) * 60000).toISOString(), type: j.type, priority: hi ? 'high' : 'medium', status: 'new', phone: j.phone, detail: j.detail || '', basket: j.basket || '', sla_minutes: hi ? 15 : 60, assignee: '', note: ''
            });
            return send(res, 200, {
                ok: true, lead_id: j.lead_id || 'LD-MOCK'
            });
        }
        if (u.pathname === '/webhook/vaigai-order-status') {
            const o = orders[u.searchParams.get('id')];
            return send(res, 200, o ? {
                found: true, ...o
            } : { found: false });
        }
        send(res, 404, { ok: false });
    });
}).listen(5678, () => console.log('Mock n8n webhooks on http://localhost:5678 (key: ' + KEY + ')'));
