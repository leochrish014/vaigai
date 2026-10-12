# Vaigai Milk roadmap: running report

Updated after every step. Status: DONE = built and tested here; BUILT = built, logic tested, needs your live accounts; PENDING = not started.

| # | Item | Status | What exists | How it was tested |
|---|---|---|---|---|
| 0 | Real product and farm photoshoot | DONE (kit) | `vaigai-platform/photoshoot/`: brief, 24-shot list CSV (file names, alt text, where each photo is used), `ingest.py` that turns raw photos into site-ready WebP + alt-text list | Ingest script run on sample photos (matches names, resizes, flags missing and low-resolution shots) |
| 1 | Online payment (UPI / Razorpay) + GST invoices | BUILT | n8n workflow 06 (create Razorpay order, signature check, server webhook, GST invoice numbering VGM/FY/000001, invoice view by secret token); chat flow asks "Pay online or Cash on delivery"; printable `invoice.html` (CGST/SGST, HSN, amount in words, PAID stamp); invoice engine with HSN and GST rates | 12 GST-maths checks, 31 new n8n checks (forged signature rejected, duplicate payment safe, wrong token shows nothing), 6 brain checks, 21 browser checks (full payment, forged payment, closed window, retry, COD, invoice page desktop and phone) |
| 2 | Customer login (repeat, pause, skip) | BUILT | n8n workflow 07 (WhatsApp OTP login: codes stored hashed, 5 min expiry, 3 requests per 10 min, 5 wrong tries; 30-day session; account view; pause / resume / cancel / skip with 9 PM cut-off) and `web/account.html` (English + Tamil, repeat order, plan controls) | 25 n8n logic checks (rate limit, hashing, expiry, ownership, cut-offs) + 24 browser checks (login, wrong code, lockout, repeat order payload, pause, skip, expiry, logout, phone layout)

| 3 | Admin dashboard (orders, routes, stock, leads) | BUILT | n8n workflow 08 (one protected API: list orders / leads / stock, update order, lead, stock; fixed status lists; formula-safe) and `web/admin.html`: overview KPIs, orders table with status and rider, CSV export, printable routes by area with load list and cash to collect, stock vs ordered, leads with SLA flag | 10 n8n checks (filters, clamps, status whitelist, router ends in a response) + 22 browser checks (wrong key, KPIs, search, status save, cash on delivery, CSV, routes, stock alert, lead save, XSS text, phone layout)

| 4 | Assistant on WhatsApp | BUILT | n8n workflow 09: Meta verification, signature check, same brain as the website (Tamil / English / Tanglish), product list and button messages within WhatsApp limits, cash-on-delivery orders using the sender's number, callbacks, complaints, human handoff, AI-agent fallback, session saved per customer | 38 logic checks (signature, parsing, full 5-step order, limits, duplicates, stale session, Tamil, AI routing); NOT tested against real Meta servers |
| 5 | Tamil pages + Madurai area pages | NOT STARTED | Planned only | |
| 6 | Reviews widget + referral points | NOT STARTED | Planned only | |
| 7 | Delivery rider app | NOT STARTED | Planned only | |
| 8 | Recipe blog | NOT STARTED | Planned only | |
| 9 | Real 3D bottle models + hero video | NOT STARTED | Planned only | |

## Notes on Step 1 you must act on
- GST rates in the invoice engine are defaults checked against public sources dated 2025 (after the 22 Sep 2025 changes: UHT milk Nil, butter and ghee 5%, paneer pre-packaged Nil). Sources disagree on pre-packaged curd and flavoured milk, so those two are marked "confirm" and set to 5%. **Your CA must confirm HSN codes, rates, GSTIN, FSSAI number and whether you need a Bill of Supply for fully exempt sales before you issue invoices.**
- Razorpay needs your own account (test keys first). Online payment is off until `payWebhook` is set in `index.html`.
- Invoice numbers use a sheet lookup, which is safe at small volume; at high volume move numbering to a database.
