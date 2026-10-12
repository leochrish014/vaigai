# Vaigai Milk
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-Automation-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-Testing-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
A complete direct-to-consumer dairy platform for Madurai: a cinematic 3D website, an AI assistant (website and WhatsApp), online payment with GST invoices, customer accounts, an admin dashboard and the n8n automation behind it.

```
vaigai-milk/
├── frontend/                         EVERYTHING the browser runs
│   ├── website/                      the public website
│   │   ├── src/build/                Python page generator (build.py, build_site.py, ta.py, site_pages.py, recipes_pages.py)
│   │   ├── src/js/app.js             client script: theme, language, carousel, 3D scenes, GSAP, cart, tracking
│   │   ├── assets/images/            web-ready WebP pictures
│   │   ├── assets/cutouts/           product cut-outs + particle sprites (+ JSON placement data)
│   │   ├── assets/masters/           lossless PNG masters (corner mark removed)
│   │   ├── assets/originals/         your original uploaded pictures
│   │   ├── assets/brand/             logo SVGs
│   │   └── dist/                     BUILT OUTPUT: public/ (deploy this) and preview.html (single file)
│   ├── assistant/                    brain.js (language engine + dialogue) and ui.js (chat widget), shared with WhatsApp
│   └── web-apps/                     admin.html, account.html, invoice.html
├── backend/                          EVERYTHING that runs on the server side
│   ├── n8n/src/                      workflow generator: flows/ (graphs), logic/ (Code-node JavaScript), build_workflows.py
│   ├── n8n/dist/                     the 9 importable n8n workflow JSON files
│   ├── n8n/configure.js              writes your settings into every workflow
│   ├── shared/invoice-engine.js      GST maths + invoice numbers (used by n8n, tests and the mock)
│   ├── sheets/                       Google Sheet tab headers (CSV)
│   └── mock-server/                  local fake of every webhook, for testing without n8n
├── tools/                            image-pipeline/ (watermark clean-up, cut-out sprites), format-js.js, test-webhooks.sh, dev-scratch/
├── photoshoot/                       brief, 24-shot list, ingest script for real photos
├── tests/                            unit/, e2e/ (real browser), audit/, helpers/, run-all.js
└── docs/                             COMPLETE-GUIDE, ARCHITECTURE, DESIGN-PATTERNS, API-CONTRACT, QA-REPORT, ROADMAP-STATUS, reports/
```

```
Customer ──► Website (static, 3D, English/Tamil) ──► AI assistant ──► n8n webhooks ──► Google Sheets
                │                                         │                │
                └── WhatsApp order / Razorpay ────────────┴── WhatsApp Cloud API, Telegram, Razorpay
Staff ──► admin.html ──► n8n admin API          Customer ──► account.html ──► n8n account API
```

## Quick start
```bash
npm install                        # playwright + sharp (node_modules is not shipped: it is rebuilt from package.json)
pip install pillow beautifulsoup4
npx playwright install chromium    # once
npm run build                      # frontend/website/dist/public + backend/n8n/dist/*.json
npm test                           # about 635 automated checks (unit, browser, SEO audits)
npm run mock                       # fake backend on http://localhost:5678
```
Open `frontend/website/dist/preview.html` (one file) or serve `frontend/website/dist/public` from any static host. A ready-built copy is already inside the zip.

## Configure and go live (short)
1. Replace placeholders in `frontend/website/src/build/build.py` (`SITE`, `PR`) and `backend/shared/invoice-engine.js` (GSTIN, FSSAI, address, HSN rates: **your CA must confirm**).
2. Copy `backend/n8n/config.example.json` to `config.json`, fill it, run `node backend/n8n/configure.js backend/n8n/config.json`, import `backend/n8n/configured/*.json` into n8n, set credentials, create the Google Sheet tabs from `backend/sheets/*.csv`.
3. Put the webhook URLs in `window.VAIGAI_CONFIG` (see `build.py`) and in the three `frontend/web-apps/*.html` config lines.
4. `npm run build`, upload `frontend/website/dist/public` (and the admin and account pages behind your own access rule).
5. Follow the live checklist in `docs/COMPLETE-GUIDE.md` section 18.

## Documents
`docs/COMPLETE-GUIDE.md` (every technology, concept, logic, syntax and where it is used), `docs/ARCHITECTURE.md`, `docs/DESIGN-PATTERNS.md`, `docs/API-CONTRACT.md`, `docs/QA-REPORT.md`, `docs/ROADMAP-STATUS.md`, `docs/BUSINESS-REPORT.md`, `docs/reports/` (all earlier reports).
