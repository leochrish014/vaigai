# backend/

Everything that runs on the server side (n8n) plus its data templates and test double.

| Folder | Contents |
|---|---|
| `n8n/src/build_workflows.py` | node factories (webhook, code, sheet, respond, crypto, WhatsApp HTTP...) and the build order |
| `n8n/src/flows/` | one file per workflow graph: `wf01_05_core` (assistant, orders, daily ops, leads, subscriptions), `wf06_payments`, `wf07_account`, `wf08_admin`, `wf09_whatsapp` |
| `n8n/src/logic/` | the JavaScript that runs inside Code nodes, kept as testable strings: `core`, `payments`, `account`, `admin`, `whatsapp` |
| `n8n/dist/` | the generated, importable workflow JSON (01 to 09) |
| `n8n/configure.js`, `config.example.json` | write webhook key, Sheet id, Razorpay, WhatsApp, Telegram settings into every workflow |
| `shared/invoice-engine.js` | GST maths, invoice numbering, constant-time compare (single source of truth) |
| `sheets/*.csv` | headers for the 11 Google Sheet tabs |
| `mock-server/mock-n8n.js` | local stand-in for all webhooks; used by the browser tests |

Build: `npm run build:n8n`. Test: `npm run test:unit`.
