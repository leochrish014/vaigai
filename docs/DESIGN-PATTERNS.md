# Design patterns actually used (and where)

| Pattern | Where | Why it helps |
|---|---|---|
| **State machine** | `frontend/assistant/brain.js` order and lead flows (`mode` + `step`: name → phone → addr → slot → pay → confirm) | Predictable multi-turn conversation; easy to test step by step |
| **Command objects** | Brain returns `{type:'add'|'remove'|'submit_order'|'submit_lead'...}` actions; `ui.js` and the WhatsApp node execute them | Decouples decision from effect; same brain for web and WhatsApp |
| **Strategy** | Intent matching: ordered rule table of keyword sets and handlers per intent | Add an intent without touching others |
| **Adapter** | `ui.js remote()` and n8n `Parse & Validate Reply` convert between website payloads and the AI agent's JSON | Isolates third-party shapes |
| **Facade** | `post()` helper in `ui.js`, `call()` in the web apps (timeout, headers, error mapping) | One place for network behaviour |
| **Observer (pub/sub)** | `dataLayer.push` events from `track()`; GTM subscribes | Analytics without coupling to features |
| **Template Method** | `page()` in `build.py`; `area_page()` and `recipe_page()` | One layout, many pages |
| **Factory** | `node()`, `webhook()`, `code()`, `sheet()`, `wa_http()` in `build_workflows.py` | Consistent n8n nodes, one place to fix schema |
| **Repository** | Google Sheets tabs accessed only through Sheets nodes with a fixed column list | Swap the store later without changing callers |
| **Gateway / Anti-corruption layer** | `Parse & Validate Reply`: the LLM can only produce whitelisted actions with checked arguments | Prompt-injection cannot cause side effects |
| **Idempotency** | Invoice creation checks for an existing invoice per order; WhatsApp duplicate message ids are ignored | Safe retries from Razorpay and Meta |
| **Graceful degradation (fallback chain)** | AI → local brain → WhatsApp link; GSAP missing → plain layout; JS off → static HTML | The site never goes blank |
| **Design tokens** | CSS custom properties for colour, type, spacing, light/dark themes | One source of visual truth |
| **Event delegation** | `#subs`, `#orders`, `#app` click handlers in the web apps | Fewer listeners, dynamic lists just work |
| **Pure functions at the core** | `InvoiceEngine.compute`, `normalise`, brain helpers | Trivial to unit test |
