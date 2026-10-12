# frontend/

Everything that runs in the visitor's, customer's or staff member's browser.

| Folder | Contents | Edit when you want to... |
|---|---|---|
| `website/src/build/build.py` | content (`SITE`, `PR`, FAQ), CSS design tokens and CSS, HTML sections, SEO head and JSON-LD | change text, prices, colours, sections |
| `website/src/build/ta.py` | English to Tamil text map (98 keys) | change Tamil wording |
| `website/src/build/site_pages.py`, `recipes_pages.py` | Tamil home, 6 area pages, 6 recipes + index | add an area or recipe |
| `website/src/build/build_site.py` | the build entry point (copies images, icons, sitemap, robots, headers) | rarely |
| `website/src/js/app.js` | client behaviour (marked sections): consent/UTM/tracking, theme, language, 3D carousel, basket + WhatsApp order, hero carousel, canvas cut-outs, GSAP scenes, boot | change behaviour or animation |
| `assistant/brain.js`, `ui.js` | the assistant (see COMPLETE-GUIDE section 8) | add intents, change chat UI |
| `web-apps/` | admin, account, invoice pages (each one file) | change the staff and customer screens |
| `website/assets/` | images (WebP), cut-outs, PNG masters, originals, logos | replace pictures (see `photoshoot/`) |
| `website/dist/` | **generated**; do not edit | n/a |

Build: `npm run build` from the repo root. Format: `npm run format`.
