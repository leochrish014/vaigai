# Architecture

## 1. Layers and rules
| Layer | Responsibility | Must not |
|---|---|---|
| Presentation (`frontend/website/`, `frontend/web-apps/`, `frontend/assistant/ui.js`) | Show data, collect input, run animation | Calculate prices, decide order validity, hold secrets |
| Conversation core (`frontend/assistant/brain.js`) | Understand text, run the dialogue state machine, return **actions** | Touch the DOM, the network or storage |
| Application services (n8n workflows) | Validate, price, persist, notify, schedule | Trust browser-supplied prices or ids |
| Domain logic (`backend/shared/invoice-engine.js`) | GST maths, invoice numbers, constant-time compare | Do I/O |
| Data (Google Sheets tabs) | Durable state | Be queried by browsers directly |
| Integrations | WhatsApp Cloud API, Razorpay, Telegram, OpenAI | Be called from the browser except Razorpay Checkout |

Dependency direction is one way: presentation → brain → (actions) → services → data. The brain returns plain objects; the UI executes them. That is why the same brain runs in the browser and inside an n8n Code node (WhatsApp).

## 2. Main flows
**Order (website assistant)**: chat → brain collects name, phone, address, slot, payment → UI posts `/vaigai-order` → workflow 02 validates and **re-prices from its own catalogue**, saves the row, alerts staff → if online payment, UI calls `/vaigai-pay-create` → Razorpay Checkout → `/vaigai-pay-verify` (HMAC check) → workflow 06 saves payment, creates a GST invoice, returns a secret link → `invoice.html`.

**Order (WhatsApp)**: Meta → `/vaigai-whatsapp` (signature verified) → session row loaded → same brain → payloads back through the Cloud API; order posts to `/vaigai-order` like any other client.

**Morning operations**: 9 PM workflow 03 builds the delivery plan and route rows; 7 PM workflow 05 turns subscriptions into tomorrow's orders; 7:30 AM check lists undelivered orders; every 15 min workflow 04 escalates overdue complaints.

## 3. Data model (Google Sheets tabs)
Orders, Leads, Subscriptions, Feedback, Delivery routes, Conversations, Invoices, OTP, Sessions, Stock, WA Sessions. Headers are in `backend/sheets/*.csv`. Keys: `order_id`, `lead_id`, `sub_id`, `invoice_no`, `token`, `stock_id` (`sku|date`).

## 4. Security model
Webhook key header (deters casual abuse), admin key header, per-customer session token, hashed OTP, HMAC signatures (Razorpay, Meta), server-side prices, SKU whitelist, quantity caps, status whitelists, spreadsheet-formula neutralisation, HTML escaping in every page, secret invoice links, CORS origin lock, no card data anywhere.

## 5. Scalability and known limits
Google Sheets is fine to roughly a few hundred orders a day. Move to a database (Postgres/Supabase) behind the same webhook contract when needed: only the Sheets nodes change. Invoice numbering uses a read-then-append, which is safe at low concurrency only.

## 6. Technical debt (honest list)
1. Python generators compose parts with `exec` and shared globals; a stricter design would use modules with explicit imports.
2. `build.py` still holds large CSS/HTML strings; move to template files (Jinja2) as the site grows.
3. `frontend/website/src/js/app.js` is one closure (about 880 lines); split into ES modules with a bundler (esbuild) when more than one developer works on it.
4. n8n Code-node JavaScript lives in Python strings; extracting to `.js` files with direct imports would be cleaner. They are unit-tested by extraction today.
5. No live-environment tests (n8n, Meta, Razorpay) because those need your accounts.
