# Vaigai Milk: complete technical guide

How to read each topic: **Concept** (what it is), **Logic** (how it works here), **Syntax** (the real code pattern), **Where** (file and function). Paths are relative to the repo root.

## 0. The mental model
1. The **website** is static files. All animation and UI run in the browser.
2. The **assistant** is a pure JavaScript "brain" (`frontend/assistant/brain.js`) that reads text and returns *actions*; a small UI (`frontend/assistant/ui.js`) shows messages and carries out the actions.
3. Anything that must be trusted (prices, orders, payments, invoices, logins) runs in **n8n workflows** (`backend/n8n/dist/*.json`) and is stored in **Google Sheets**.
4. **Staff and customers** use three standalone pages: `frontend/web-apps/admin.html`, `account.html`, `invoice.html`.
5. **Tests** (`tests/`) run the whole thing in a real browser against a local fake backend (`backend/mock-server`).

## 1. Tech stack at a glance
| Layer | Technology | Why | Where |
|---|---|---|---|
| Markup | HTML5, semantic landmarks, JSON-LD | SEO, accessibility | `frontend/website/src/build/build.py` |
| Styling | CSS custom properties, grid, flex, `clamp()`, `svh`, CSS 3D transforms | Themeable, fluid, no framework | `build.py` (CSS string) |
| Behaviour | Vanilla JavaScript (ES2020), one closure, no framework | Zero build step at runtime, tiny | `frontend/website/src/js/app.js` |
| Animation | GSAP 3 + ScrollTrigger, Lenis smooth scroll, Canvas 2D, CSS keyframes | Cinematic but optional | `app.js`, `build.py` |
| Assistant | Rule-based NLU + state machine, optional LLM through n8n | Works offline, safe | `frontend/assistant/` |
| Build | Python 3 (Pillow, BeautifulSoup), Node (sharp) | Static generation, SEO pages | `frontend/website/src/build/` |
| Back end | n8n (webhooks, Code nodes, schedules), Google Sheets | No server to maintain | `backend/n8n/` |
| Payments | Razorpay Orders API + Checkout.js, HMAC-SHA256 | Standard India stack | workflow 06 |
| Messaging | WhatsApp Cloud API, Telegram | Orders and alerts | workflows 02, 04, 09 |
| Tests | Playwright (Chromium), Node scripts, Python audits | Real-browser proof | `tests/` |

---
# PART A: FRONT END

## 2. HTML and SEO
**Concept.** Search engines read the HTML and structured data; screen readers use landmarks.
**Logic.** `page(prod)` in `build.py` builds one complete document: `<head>` (title, description, canonical, Open Graph, hreflang, JSON-LD), skip link, `<header>`, `<main>` sections (`#hero`, `#intro`, `#story`, `#range`, `#beyond`, `#flav`, `#moments`, `#quality`, `#faq`, `#cta`), `<footer>`. JSON-LD blocks: `LocalBusiness`, `WebSite`, `ItemList` of products, `FAQPage` (identical to the visible FAQ).
**Syntax.**
```html
<link rel="canonical" href="https://www.example.com/">
<link rel="alternate" hreflang="ta-in" href="https://www.example.com/ta/">
<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[...]}</script>
```
**Where.** `build.py: page()`, `head` template; secondary pages in `site_pages.py`, `recipes_pages.py`.

## 3. CSS
### 3.1 Design tokens and light/dark themes
**Concept.** Colours and sizes are variables (`--ink`, `--bg`, `--gold`); changing the variables re-themes everything.
**Logic.** Three selectors give: automatic theme from the OS, a manual override that wins, and no flash because an inline script sets `data-theme` before paint.
```css
:root{ /* light tokens */ color-scheme:light }
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){ /* dark tokens */ } }
:root[data-theme="dark"]{ /* dark tokens */ }
:root[data-theme="light"]{ /* light tokens */ }
```
**Where.** `build.py: TOKENS`, `tok(LIGHT)`, `tok(DARK)`; toggle in `app.js` (`setTheme`, key `vaigai-theme`).

### 3.2 Fluid layout
`clamp(min, preferred, max)` for type and spacing (38 uses), CSS grid with `repeat(auto-fit,minmax())`, `100svh` for mobile browser bars, `env(safe-area-inset-*)` for phone notches, `aspect-ratio` to reserve image space (prevents layout shift). Where: `build.py` CSS.

### 3.3 3D with CSS
**Concept.** `perspective` on a parent gives depth; children use `transform: rotateY() translateZ()`; `transform-style: preserve-3d` keeps children in 3D.
**Where.** Hero flip cards, product depth carousel, story scenes (10 `perspective` rules in `build.py`). GSAP animates the same properties on scroll (see 5.4).

### 3.4 Accessibility and fallbacks
- Focus rings, 44 px minimum targets, contrast at least 4.5:1 (measured 4.82:1).
- `@media (prefers-reduced-motion: reduce)` turns off parallax and autoplay (`reduce` flag in JS).
- **No-JS / no-animation fallback**: the `NOGS` rule set makes the pinned scenes stack as normal sections, so content is never hidden if GSAP fails.

## 4. JavaScript architecture
**Concept.** One closure (`DOMContentLoaded` callback) keeps variables private; small helpers keep code short.
**Logic.** Helpers: `$` (querySelector), `$$` (querySelectorAll to array), `tick(fn)` (one shared frame loop: GSAP's ticker when GSAP loaded, otherwise a plain `requestAnimationFrame`). State lives in a few variables (`lang`, `cT`, `hi`, `basket`). The DOM is updated by functions (`paint()`, `upd()`, `setLang()`), never by scattered inline code. Events use `addEventListener` (41 uses); lists use event delegation.
```js
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
```
**Persistence.** `localStorage`: `vaigai-theme`, `vaigai-lang`, `vaigai-consent`. `sessionStorage`: `vaigai-seen` (skip loading screen), `vaigai-utm` (campaign data), and the assistant's session keys. The basket is deliberately in memory only.
**Where.** `frontend/website/src/js/app.js` (sections are marked with `/* ---- ... ---- */`).

### 4.1 Language switch (English/Tamil)
Elements whose text exists in the Tamil map (`ta.py`, 98 keys) are registered at start with both texts; `setLang()` swaps `innerHTML`, sets `<html lang>`, saves the choice, and auto-detects a Tamil browser. Tamil fonts: Hind Madurai, Noto Sans Tamil fallback. The `/ta/` page is the same translation applied at build time (section 10).

### 4.2 Tracking and consent
`track(name, params)` pushes to `window.dataLayer`. Events: `page_context`, `view_item`, `add_to_cart`, `begin_checkout`, `generate_lead`, `purchase`, `scroll_depth`, `hero_slide`, `language_toggle`, `theme_toggle`, `consent`, `whatsapp_*`, `assistant_*`. UTM and ad click ids are captured once into `sessionStorage` and sent with every lead and order. GTM / GA4 / Meta Pixel load only after the visitor accepts the consent banner (`VAIGAI_CONFIG.gtm|ga4|pixel`).

## 5. Animation system (five layers, all optional)
### 5.1 CSS particles and keyframes
Floating droplets are `<span class="pt">` elements created from `data-parts` settings; each gets CSS variables (`--d` depth, `--s` size, `--v` speed) and a `@keyframes` float. Count is reduced to 60% on screens under 800 px. Cheap, runs on the GPU (`will-change`, `transform`, `opacity` only).

### 5.2 Mouse and scroll depth through CSS variables
**Concept.** JavaScript writes two numbers; CSS does the rest, so layout never reflows.
```js
tick(() => {
  mx += (tx - mx) * .06;            // lerp = smooth easing toward the pointer
  my += (ty - my) * .06;
  root.style.setProperty('--mx', mx.toFixed(3));
  root.style.setProperty('--my', my.toFixed(3));
});
```
CSS then uses `transform: translate3d(calc(var(--mx) * 20px * var(--d)), ...)`, so deeper layers move more (parallax). Disabled when `prefers-reduced-motion`.

### 5.3 Canvas 2D cut-out scenes
**Concept.** Product cut-outs (transparent WebP) and a "particle atlas" (droplets, almonds, leaves cut from the same picture) are drawn on two canvases (back and front of the product) so particles pass in front of and behind it.
**Logic.** `getContext('2d')`, device-pixel-ratio scaling, per-particle depth `z`, sinusoidal drift, reaction to `--mx/--my` and scroll progress. Used for "Beyond milk", flavour scenes and the final call-to-action. Where: `app.js` (cut-out section), assets `frontend/website/assets/cutouts/`, generator `tools/cutout_pipeline.py`.

### 5.4 GSAP timelines and ScrollTrigger (pinned storytelling)
**Concept.** A tall section (for example 430svh) contains a `position: sticky` stage. A GSAP timeline is *scrubbed* by scroll progress: scroll position = timeline time.
```js
const tl = gsap.timeline({
  defaults: { ease: 'power2.inOut' },
  scrollTrigger: { trigger: sel, start: 'top top', end: 'bottom bottom', scrub: .8 }
});
tl.to(sc[i], { opacity: 0, rotateY: -50, x: '-38%', scale: .78, z: -300, duration: 1 }, t)
  .fromTo(sc[i + 1], { opacity: 0, rotateY: 50, x: '38%', scale: .78, z: -300 },
                      { opacity: 1, rotateY: 0, x: 0, scale: 1, z: 0, duration: 1 }, t);
```
**Logic.** Scene i rotates away like a door while scene i+1 rotates in; captions fade; a progress bar uses `scaleX(progress)`. Word-by-word text reveals use `gsap.fromTo('.w>span', {yPercent:115}, {yPercent:0, stagger})`. A morphing wave uses `attr: {d: path}` tween. Where: `app.js` `flip('#story','#pf')`, flavour scene, `reveal()`.
**Safety.** The animation layer starts only if `window.gsap` exists; otherwise the CSS fallback shows plain sections.

### 5.5 Lenis smooth scroll and the loading screen
Lenis (loaded deferred) gives inertia scrolling and is stopped while the chat is open on phones (`lenis.stop()/start()`). The loading screen shows only on the first visit of a session and a 1.5 s safety timer forces the hero visible, which keeps Largest Contentful Paint fast.

### 5.6 Animation rules we follow
Animate only `transform` and `opacity`; reserve space with `aspect-ratio`; lazy-load below-the-fold images; cap particle counts; respect reduced motion; never hide content behind an animation library.

## 6. Add to cart, order and checkout (website)
**Data model.** `const basket = {}` maps product index to quantity. Product data (`PR`) holds name, Tamil name, unit, price, description, image.
**Add to cart.** The `#addb` button handler does `basket[i] = (basket[i] || 0) + 1` for the product in view, then `paint()` recomputes the count (`#cc`), the drawer list (`#basket`) and the total from `PR[k].p`, and `track('add_to_cart', {item_name, price, quantity, currency:'INR'})` fires. The assistant's add action uses the same object with a cap of 99.
**Order button.** Builds a WhatsApp message (items, quantities, total, UTM source) and opens `https://wa.me/<number>?text=<encoded>`; fires `begin_checkout`.
**Assistant checkout (richer path).** Collects name → phone → address (area and pincode checked against the delivery list) → slot → payment choice → confirmation; then `POST /vaigai-order`. Details in sections 8 and 12.

## 7. Web apps (admin, account, invoice)
All three are single HTML files with the same pattern: config line at the top, a `call()` helper (fetch with the right header), `esc()` for every inserted string, state in a few variables, `draw()` that rebuilds the view, one delegated click handler. See sections 11 and 12.

---
# PART B: AI ASSISTANT

## 8. The assistant
### 8.1 The brain (`frontend/assistant/brain.js`)
**Concept.** A deterministic natural-language engine, no network needed. It must be fast, safe and testable.
**Logic (pipeline).** `respond(text, state, lang)` →
1. `norm()` lower-cases, strips punctuation, keeps Tamil letters.
2. **Language detection**: Tamil script → `ta`; otherwise English (Tanglish is English letters with Tamil words, handled by synonyms).
3. If a flow is active (`state.mode` = `order` or `lead`) → `flow()` continues it; otherwise `intentOf()` picks an intent from an ordered rule table (`K`: keyword lists; a trailing `*` means prefix match, so `deliver*` matches "delivered").
4. **Entity extraction**: product synonyms (`SYN`: `thayir`, `நெய்`, `nei`...), quantities in digits and words including Tamil and Tanglish (`NUMW`: `rendu`, `ஒரு`), areas (`AREAS`), 6-digit pincode (625001 to 625020), 10-digit mobile.
5. The handler returns `{ intent, lang, st, m:[messages], a:[actions] }`. Messages are `{t:'text'|'products'|'chips'}`; actions are commands.
**Syntax (a flow step).**
```js
if (st.step === 'slot') {
  d.slot = /2|6:30|7:30/.test(t) ? '6:30-7:30 AM' : 'By 5:30 AM';
  if (payOn()) { st.step = 'pay'; return { st, m:[T('How would you like to pay?'), chips(['Pay online','pay_online'],['Cash on delivery','pay_cod'])] } }
  st.step = 'confirm'; return { st, m: cm(d, lang) };
}
```
**Intents (26 handlers plus a fallback).** greet, thanks, bye, human, complaint, checkout, remove, add, basket, delivery, subscription, price, recommend, quality, contact, bulk, status, products, language, theme, offers, health, info, yes, no, callback. Order matters: `subscription` is tested before `price` so "daily 1 milk monthly cost" is a plan, not a price question (a real bug caught by tests).
**Safety rules built in.** No medical advice (`health` intent); no invented offers; quantity capped at 99; messages escaped by the UI; never asks for card, UPI PIN or OTP.

### 8.2 The UI (`frontend/assistant/ui.js`)
Floating launcher → dialog (`role="dialog"`, focus trap on phones, Esc closes, `aria-live` log). Renders bubbles with `textContent` (never `innerHTML`), product cards with Add buttons, quick-reply chips, voice input (`SpeechRecognition` when the browser has it). Executes brain actions: `add`, `remove`, `clear`, `lang`, `theme`, `submit_order`, `submit_lead`, `status`, `whatsapp`.
**Hybrid mode.** If `VAIGAI_CONFIG.assistantWebhook` is set, free-text questions go to the n8n AI agent; **checkout, callbacks, complaints, status and order numbers always stay local** (`LOCAL` list) because they are structured and must be reliable. Any failure (timeout 12 s, 401, server down) falls back to the local brain and says so.
**Network facade.** `post(url, body)` adds `x-vaigai-key`, a 12-second `AbortController` timeout and error mapping.

### 8.3 The AI agent (workflow 01)
`Webhook → Config → Key check → Normalize Input → AI Agent (OpenAI chat model + 5 read-only tools) → Parse & Validate Reply → Respond`. Tools (Code nodes): `search_products`, `delivery_check`, `plan_calculator`, `faq_lookup`, `store_info`. The system prompt forces one JSON object. **`Parse & Validate Reply` is the gateway**: it keeps only whitelisted action types, checks every SKU against the catalogue, clamps quantities, truncates text and falls back to a safe reply, so a prompt-injection can never place an order.

### 8.4 WhatsApp (workflow 09)
Meta calls `GET /vaigai-whatsapp` once (verify token) then `POST` for each message. Steps: verify `X-Hub-Signature-256` (HMAC of the raw body with your app secret) → answer `200` at once → parse text/button/list replies → load the sender's session row → run the **same brain** with `knownPhone` (skips the phone question) → build WhatsApp payloads (text; up to 3 reply buttons; list of up to 10 rows, titles ≤ 24 chars) → send → save session → if the brain returned an order or lead, post it to the normal webhooks. Duplicate message ids are ignored; half-finished orders older than 30 minutes reset.

---
# PART C: BACK END (n8n + Google Sheets)

## 9. n8n concepts used
| Concept | Node | Used for |
|---|---|---|
| Webhook + Respond | `Webhook` (responseMode `responseNode`), `Respond to Webhook` | HTTP endpoints you control status code and body of |
| Config | `Set` node (`Config`) | Secrets and settings in one place; `configure.js` fills them |
| Guard | `IF` | Key check, validity check |
| Router | `Switch` (v3.2, fallback output) | Admin API actions |
| Logic | `Code` (JavaScript, `$input.all()`, `$('Node').first().json`) | Validation, pricing, invoices, bot |
| Storage | `Google Sheets` (`read`, `append`, `update`, `appendOrUpdate`) | The database; `alwaysOutputData` so empty tabs do not stop a flow |
| HTTP | `HTTP Request` | Razorpay, WhatsApp, Telegram, AI agent |
| Crypto | `Crypto` (HMAC SHA256, random hex) | Signatures, tokens, OTP hashing |
| Time | `Schedule Trigger` (cron, timezone Asia/Kolkata) | Daily plans, escalations |
| AI | `AI Agent`, chat model, tool nodes | Workflow 01 |
**Expression syntax.** `={{ $json.body.phone }}`; avoid the two characters `}}` inside an expression (the generator inserts a space) because n8n ends the expression there. Error policy: notification nodes use `onError: continueRegularOutput` so an alert failure never blocks an order.

## 10. The workflows
| # | Name | Endpoints / triggers | Main logic |
|---|---|---|---|
| 01 | AI assistant | POST `/vaigai-assistant` | LLM agent, read-only tools, validated reply |
| 02 | Orders + status | POST `/vaigai-order`, GET `/vaigai-order-status` | Validate, **re-price from catalogue**, delivery date (before 9 PM IST = next day, after = day after), area check (outside → `needs_review`), append row, WhatsApp + Telegram alerts |
| 03 | Daily operations | cron 9 PM, 7:30 AM | Plan per product and area, capacity alerts, route rows, undelivered list |
| 04 | Leads + escalation | POST `/vaigai-lead`, cron every 15 min | Priority and SLA (complaint, bulk, handoff = high, 15 min), alert, escalate once |
| 05 | Subscriptions + feedback | cron 7 PM, 11 AM; POST `/vaigai-feedback` | Daily/weekly plan → tomorrow's orders (skips paused, skipped, ended); rating ≤ 2 → complaint lead |
| 06 | Payments + invoices | pay-create, pay-verify, razorpay-webhook, invoice | See section 11 |
| 07 | Customer account | otp-request, otp-verify, account, sub-update | See section 12 |
| 08 | Admin API | POST `/vaigai-admin` | Switch router, whitelisted updates |
| 09 | WhatsApp assistant | GET/POST `/vaigai-whatsapp` | Section 8.4 |
**Where.** Graphs: `backend/n8n/src/flows/`; Code-node JavaScript: `backend/n8n/src/logic/`; node factories: `build_workflows.py`; tests: `tests/unit/n8n-workflows.test.js` extracts every Code node and runs it with a fake `$input`/`$()` and a fixed clock.

## 11. Payments and the invoice generator
### 11.1 Razorpay flow
1. Browser: `POST /vaigai-order` with `payment:'online'` → row saved as `online_pending`, response `payment_required:true`.
2. Browser: `POST /vaigai-pay-create {order_id}` → workflow checks the order is payable, calls Razorpay `POST /v1/orders` with `amount = total*100` (paise) and `receipt = order_id` (HTTP Basic auth with Key Id and Secret) → returns the public key id and Razorpay order id (never the secret).
3. Browser opens Razorpay Checkout (`new Razorpay({...}).open()`); the customer pays by UPI/card.
4. Browser: `POST /vaigai-pay-verify` with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.
5. Workflow: **HMAC-SHA256** of `razorpay_order_id|razorpay_payment_id` with your Key Secret; compare to the signature with a **constant-time** function (`safeEqual`) → if equal, create invoice, mark order `paid`.
6. Razorpay also calls `/vaigai-razorpay-webhook` (`payment.captured`, signature over the raw body) so a closed browser tab still produces the invoice. Both paths converge on the same chain, which is **idempotent**: an existing invoice for the order is returned instead of creating a second one.
```js
// constant-time compare (backend/shared/invoice-engine.js)
function safeEqual(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
```

### 11.2 GST invoice maths (`InvoiceEngine.compute`)
Shelf prices are MRP **including** GST, so tax is extracted: `taxable = gross × 100 ÷ (100 + rate)`, `tax = gross − taxable`, split into CGST and SGST (equal halves) for Tamil Nadu supply, or IGST for another state. Example, ghee ₹320 at 5%: taxable 304.76, tax 15.24, CGST 7.62, SGST 7.62. Discounts reduce each line proportionally. The total is rounded to a whole rupee and the round-off is shown.
**Numbering.** `VGM/<financial year>/<6 digits>` where the financial year runs April to March (`25-26`); the next number is the highest in that year plus one.
**Rates.** `CFG.rates` holds HSN and rate per SKU. Defaults follow public sources after the Sept 2025 changes (milk nil, butter and ghee 5%); curd and flavoured milk are flagged `confirm`. **Your CA must confirm** before you issue invoices.
**Invoice page.** `invoice.html?id=<order>&t=<secret token>` fetches `/vaigai-invoice`, shows seller GSTIN/FSSAI, buyer, HSN lines, tax columns, amount in words (Indian lakh/crore system) and a PAID stamp; print CSS makes "Save as PDF" clean. The token is random hex stored with the invoice; wrong token returns nothing; the buyer's phone is masked.

## 12. Customer account (workflow 07, `frontend/web-apps/account.html`)
**OTP login.** Request: rate limit (3 per 10 minutes per phone) → random hex → 6-digit code → store **HMAC(code|phone)**, never the code → send on WhatsApp template `login_otp`. Verify: HMAC of the submitted code, compare, 5 attempts max, 5-minute expiry; success creates a 24-hex session token valid 30 days.
**Session.** Browser keeps the token in `localStorage` and sends `x-vaigai-token`; the workflow looks it up and checks expiry; every query filters rows by the session's phone, so one customer never sees another's data.
**Features.** Last 15 orders; **Repeat order** re-posts the old items and address to `/vaigai-order`; subscriptions: pause, resume, cancel, skip a date (cut-off 9 PM the day before, up to 60 days ahead).

## 13. Admin panel (workflow 08, `frontend/web-apps/admin.html`)
**Concept.** One protected endpoint with an `action` field; the browser computes dashboards from three lists.
**Logic.** Login stores the admin key in `sessionStorage` (cleared on tab close). On entry: `list_orders` (yesterday to +14 days), `list_leads`, `list_stock`. Tabs: **Overview** (deliveries today, orders and cash for tomorrow, new leads, leads past SLA, stock alerts), **Orders** (filter by date, status, search; change status and rider; delivered asks for cash collected; CSV export), **Routes** (grouped by area, load list per product, collect amount, call and map links, print), **Stock** (capacity, produced, ordered, remaining, low flag), **Leads** (status, assignee, note, SLA).
**Server rules.** Only fixed statuses can be written (`received, confirmed, out_for_delivery, delivered, cancelled, needs_review, failed` for orders; `new, contacted, resolved, closed` for leads); numbers clamped; text cleaned and prefixed with `'` if it starts with `= + - @` (spreadsheet formula injection). Put the page behind a second layer (Cloudflare Access or IP allow-list).

## 14. Operations automation
Subscription engine (`create_sub_orders`): active plans whose frequency matches tomorrow's weekday (`weekly:mon,thu`), not paused, not in `skip_dates`, between start and end dates, SKUs known → orders with `source: subscription`. Delivery plan (`plan_tomorrow`): per-SKU totals, per-area counts, capacity alerts above 90%. Escalation (`find_overdue`): high-priority `new` leads past SLA, alerted once in the 15-minute window.

---
# PART D: GENERATED PAGES, SECURITY, TESTS, DEPLOY

## 15. Page generator (`frontend/website/src/build/`)
`build_site.py` runs `build.py` (content + templates) then `site_pages.py`:
- **Tamil home `/ta/`**: walks the English DOM; where an element's text matches a key in `ta.py`, replaces it with Tamil; sets `lang="ta"`, Tamil title/description, canonical, hreflang, Tamil FAQ schema; rewrites asset paths to `../images/`; the language button links back to English.
- **Area pages** (6): one template (`area_page`) filled from `INFO` (description, local line, payment line, popular products), unique FAQ, `LocalBusiness` with `areaServed`, `BreadcrumbList`, WhatsApp links that carry the area name.
- **Recipes** (6 + index): data in `recipes_pages.py`; each page emits a full `Recipe` schema (ingredients, `HowToStep`, ISO 8601 times where prep + cook = total).
- **Sitemap** with `xhtml:link` alternates for the English/Tamil pair and image entries.
**Edit content.** Products: `PR` in `build.py` (and invoice rates, brain synonyms). Areas: `AREA_LINKS`, `INFO`, brain `AREAS`, `AREAS_JS` in `logic/core.py`. Recipes: `RECIPES`. Then `npm run build && npm test`.

## 16. Security summary
Server-side prices; whitelists for SKUs, statuses and actions; caps and clamps; HMAC verification for Razorpay and Meta with constant-time compare; hashed OTP; secret tokens for sessions and invoices; masked phones; `textContent`/`esc()` everywhere (tests inject `<img onerror>`); formula-injection neutralised; CORS origin lock (`configure.js`); no card data; secrets only in n8n credentials/Config, never in the browser except the public Razorpay key id and the public site key (rate-limit at Cloudflare).

## 17. Testing strategy
Pyramid: many fast **unit** tests (brain, invoice maths, every n8n Code node) → fewer **end-to-end** tests (real Chromium against `frontend/website/dist/public` and the mock backend) → **audits** (SEO, crawl, hreflang, schema, duplicate content). Browser tests stub GSAP so layout is deterministic; separate checks prove the page works without it. Run `npm test`; results table in `docs/QA-REPORT.md`.

## 18. Run, configure, deploy
1. `npm install`, `pip install pillow beautifulsoup4`, `npx playwright install chromium`.
2. Edit placeholders; `npm run build`; `npm test`.
3. **n8n**: host it (Docker or n8n Cloud, HTTPS). `node backend/n8n/configure.js backend/n8n/config.json`, import `backend/n8n/configured/*.json`, add credentials (Google Sheets OAuth, OpenAI, Telegram, Razorpay HTTP Basic), create Sheet tabs from `backend/sheets/*.csv`, activate.
4. **Razorpay**: test keys first; add webhook to `/webhook/vaigai-razorpay-webhook` (`payment.captured`).
5. **WhatsApp**: Meta app, Cloud API, webhook `/webhook/vaigai-whatsapp`, verify token, subscribe to `messages`, approve templates (`docs/WHATSAPP-TEMPLATES.md`).
6. **Website**: set `VAIGAI_CONFIG` URLs and key; deploy `frontend/website/dist/public` (Netlify, Cloudflare Pages, Vercel; `_headers` and `vercel.json` included); gzip/brotli on.
7. Live checklist: 10 test orders (COD and online), refund test, one invoice checked by your CA, two real phones, Search Console sitemap, Business Profile, backups of the Sheet.

## 19. Extending
New intent: add keywords to `K` and a `case` in the handler in `brain.js`, add tests in `brain.test.js`. New workflow: add `logic/<name>.py` (Code strings) and `flows/wf10_<name>.py`, list both in `ORDER` in `build_workflows.py`, add tests in `tests/unit`. New admin action: add a Switch rule and branch in `flows/wf08_admin.py` plus a validator Code node.

## 20. Glossary and syntax cheat sheet
- **Webhook**: a URL that runs a workflow when called. **Idempotent**: repeating a request has no extra effect. **HMAC**: keyed hash proving a message came from someone with the secret. **HSN**: tax classification code for goods. **Paise**: 1/100 rupee (Razorpay amounts). **SLA**: promised response time. **LCP**: time to the largest visible element. **Scrub**: tie animation progress to scroll position. **Lerp**: linear interpolation, `a += (b - a) * k`. **Dead-letter**: not used; failures fall back instead.
- Python f-string with braces in CSS: double them (`{{ }}`). n8n expression: `={{ ... }}`. CSS variable: `var(--ink)`. GSAP: `gsap.to(el,{x:100,duration:1})`, `gsap.timeline({scrollTrigger:{...}})`. Playwright: `await page.click(sel)`, `page.waitForSelector(sel)`, `expect` style handled by the small `ok(name, cond)` helper in each test.
