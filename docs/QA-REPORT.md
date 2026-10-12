# QA report (final)

Run `npm test`. Every number below was produced in this project's final test run.

| Level | Suite | Checks | Result |
|---|---|---|---|
| Unit | Assistant brain: English / Tamil / Tanglish intents, entities, order, callback, complaint, bulk and plan flows, payment step, WhatsApp mode, fuzz inputs | 123 | pass |
| Unit | GST invoice engine: tax split, rounding, discount, inter-state, financial-year numbering, constant-time compare | 12 | pass |
| Unit | n8n: JSON validity, unique ids, connections, reachability, every webhook answers, expressions, no secrets, syntax of every Code node; behaviour of reply sanitiser, tools, pricing, payment signatures, invoices, OTP, sessions, subscriptions, admin API, WhatsApp bot | 219 | pass |
| E2E (real Chromium) | Layout: 13 screen sizes x light/dark | 26 | pass |
| E2E | Tamil layout | 14 | pass |
| E2E | Assistant: local, AI mode, server down, wrong key | 43 | pass |
| E2E | Payment: success, forged signature, closed window, retry, COD, invoice page | 21 | pass |
| E2E | Customer account: OTP, lockout, repeat order, pause, skip, expiry, logout | 24 | pass |
| E2E | Admin dashboard: login, KPIs, orders, CSV, routes, stock, leads, XSS | 22 | pass |
| E2E | Tamil page, 6 area pages, recipes (phones, laptop, light/dark) | 36 | pass |
| Audit | SEO static (title, meta, schema, hreflang, sitemap, images) | 53 pass, 3 warnings | warnings are placeholders (domain, phone, social links) |
| Audit | Dynamic (crawl, marketing events, consent, hero, fallbacks) | 21 | pass (one lab-only speed warning can appear) |
| Audit | Generated pages (15 pages: titles, descriptions, canonical, hreflang, JSON-LD, links, duplicate content, Recipe schema, sitemap) | 21 | pass |
| **Total** | | **about 635** | **0 failures** |

## What the tests prove
Layout never breaks or scrolls sideways; every control is at least 44 px; text contrast passes WCAG AA; the page works with JavaScript off and without the animation library; prices cannot be tampered with from the browser; a forged payment signature is rejected; duplicate payment or WhatsApp events are harmless; wrong OTP codes lock out; customers cannot see each other's data; admin actions only accept whitelisted statuses; user text is never executed as HTML.

## What is NOT proven (needs your live accounts)
Importing the workflows into a running n8n; Google Sheets credentials; Razorpay test mode; Meta WhatsApp templates and webhooks; a real AI model's answer quality; phone speed on real devices (lab LCP is about 3 s offline); screen-reader pass on real devices. The local mock server stands in for n8n in browser tests.

## Defects found and fixed during QA (selection)
Phone parser stripped valid numbers starting with 91; "daily plan" read as a price question; success message erased after reload; missing CORS header for the session token; leftover test server hiding a fallback bug; time-of-day dependent tests; n8n closing-brace expression bug; spreadsheet formula injection; duplicate payment events; heading order and small tap targets on generated pages.
