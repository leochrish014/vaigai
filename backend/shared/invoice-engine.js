/* GST invoice engine. Prices on the site are MRP (GST included). Rates below must be confirmed with your CA. */
const InvoiceEngine = (function () {
    const CFG = {
        seller: {
            name: 'Vaigai Milk', gstin: '33XXXXXXXXXXXZX', address: 'Sample Street, Goripalayam, Madurai, Tamil Nadu 625002', state_code: '33', state: 'Tamil Nadu', fssai: 'FSSAI-LICENCE-NUMBER', phone: '+91 00000 00000', email: 'hello@example.com'
        },
        rates: {
            'VGM-CARTON-500ml': {
                hsn: '0401', rate: 0, desc: 'Pasteurised milk'
            }, 'VGM-HERO-500ml': {
                hsn: '0401', rate: 0, desc: 'Pasteurised milk'
            }, 'VGM-BADAM-250ml': {
                hsn: '2202', rate: 5, desc: 'Flavoured milk', confirm: true
            }, 'VGM-GHEE-500ml': {
                hsn: '0405', rate: 5, desc: 'Ghee'
            }, 'VGM-CURD-400g': {
                hsn: '0403', rate: 5, desc: 'Curd, pre-packaged', confirm: true
            }, 'VGM-BUTTER-200g': {
                hsn: '0405', rate: 5, desc: 'Butter'
            }
        }
    };
    const r2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
    function fy(d) {
        const y = d.getUTCFullYear(), m = d.getUTCMonth();
        const a = m >= 3 ? y : y - 1;
        return String(a).slice(2) + '-' + String(a + 1).slice(2);
    }
    function invoiceNo(seq, d) {
        return 'VGM/' + fy(d) + '/' + String(seq).padStart(6, '0');
    }
    function nextSeq(existing, d) {
        const f = fy(d);
        let max = 0;
        (existing || []).forEach(n => {
            const m = String(n).match(/^VGM\/(\d\d-\d\d)\/(\d+)$/);
            if (m && m[1] === f)
                max = Math.max(max, +m[2]);
        });
        return max + 1;
    }
    function compute(items, opts) {
        opts = opts || {};
        const intra = String(opts.state_code || CFG.seller.state_code) === CFG.seller.state_code;
        let gross0 = 0;
        items.forEach(i => gross0 += Math.max(0, i.qty | 0) * i.unit_price);
        const disc = Math.min(Math.max(0, +opts.discount || 0), gross0);
        const f = gross0 ? (gross0 - disc) / gross0 : 1;
        const lines = items.filter(i => (i.qty | 0) > 0).map(i => {
            const t = CFG.rates[i.sku] || {
                hsn: '0401', rate: 0, desc: i.name
            }, gross = r2(i.qty * i.unit_price * f), taxable = r2(gross * 100 / (100 + t.rate)), tax = r2(gross - taxable);
            const cgst = intra ? r2(tax / 2) : 0, sgst = intra ? r2(tax - cgst) : 0, igst = intra ? 0 : tax;
            return {
                sku: i.sku, name: i.name, desc: t.desc, hsn: t.hsn, qty: i.qty | 0, unit_price: i.unit_price, rate: t.rate, gross, taxable, cgst, sgst, igst
            };
        });
        const S = k => r2(lines.reduce((a, l) => a + l[k], 0));
        const grossT = S('gross'), total = Math.round(grossT);
        return {
            lines, discount: r2(disc), taxable_total: S('taxable'), cgst: S('cgst'), sgst: S('sgst'), igst: S('igst'), tax_total: r2(S('cgst') + S('sgst') + S('igst')), gross_total: grossT, round_off: r2(total - grossT), total, intra_state: intra
        };
    }
    function safeEqual(a, b) {
        a = String(a);
        b = String(b);
        if (a.length !== b.length)
            return false;
        let d = 0;
        for (let i = 0; i < a.length; i++)
            d |= a.charCodeAt(i) ^ b.charCodeAt(i);
        return d === 0;
    }
    return {
        CFG, compute, invoiceNo, nextSeq, fy, safeEqual, r2
    };
})();
if (typeof module !== 'undefined')
    module.exports = InvoiceEngine;
