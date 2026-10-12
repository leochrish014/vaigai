# Vaigai Milk website: QA report

Tested with headless Chromium (Playwright) on the production package. Date: 7 Oct 2026.

## 1. Responsive and layout (26 runs: 13 screen sizes x light and dark)
Sizes: 320x568, 360x640, 390x844, 430x932, 768x1024, 820x1180, 1024x768, 1280x720, 1366x768, 1536x864, 1920x1080, 2560x1440, and a phone turned sideways (844x390).

| Check | Result |
|---|---|
| Sideways scrolling / content outside screen | None in 26/26 runs |
| Script errors in the console | 0 |
| Broken images | 0 |
| Clipped or cut-off text | 0 |
| Pinned story and flavour scenes fit inside the screen | Pass in 26/26 |
| Tap targets smaller than 44x44 px | 0 (after fix) |

## 2. Light and dark mode
- Starts from the device setting, then remembers the visitor's choice. Toggle works and is announced to screen readers ("Switch to dark mode / light mode").
- No flash of the wrong theme on reload (theme is set before the page paints).
- Contrast: every text and background pair passes WCAG AA in both themes (lowest ratio 4.82:1, required 4.5:1).

## 2b. Tamil / English switch
- Button in the top bar; choice is remembered; phones set to Tamil open in Tamil.
- All 86 translated strings were found on the page (0 missing); 93 elements switch language, including the FAQ, product details, basket and WhatsApp button.
- Tamil layout re-tested at 7 screen sizes x light and dark (14 runs): no overflow, no clipped text, no script errors. A bug found and fixed: the top bar was too wide on 320 px phones and tablets once the language button was added.
- The WhatsApp order message stays in English so your team can read it.
- Note: the test machine could not load the Tamil web font, so conjunct letters in my screenshots used a fallback font. Please read the Tamil text once on a phone.

## 2c. Hero carousel and floating 3D scenes (latest build)
- Hero carousel with Milk, Ghee, Butter and Curd slides: each slide has its own colour (blue, amber, golden yellow, wine) that fades on change; 3D flip between slides; autoplay with pause on hover; tabs, arrows, swipe.
- Products were cut out of your pictures; droplets, almonds, berries and leaves were separated into their own layers that float at different depths and react to mouse and scroll (Beyond milk, Badam / Vaigai Fresh scenes, final order scene).
- Re-tested after this change: English 26/26 layout runs pass, Tamil 14/14 pass, no script errors, 24/24 images load, contrast minimum 4.82:1, no small tap targets.
- Checked visually in a real browser at laptop and phone sizes (screenshots reviewed): all four hero slides and the three floating scenes display complete products with no cut-off.

## 3. SEO
| Item | Result |
|---|---|
| Title (56 chars) and description (144 chars) | Pass, within recommended length |
| Canonical, robots, language `en-IN`, viewport | Present |
| Open Graph and Twitter card tags | Present (1200x630 share image included) |
| JSON-LD: Organization/LocalBusiness, WebSite, product list, FAQPage | All valid; FAQ markup matches the visible questions |
| One H1, no skipped heading levels | Pass |
| Landmarks: header, nav, main, footer | Pass |
| Images: 23 of 23 have alt text and width/height | Pass |
| Hero image: high priority; 22 other images load lazily | Pass |
| Page content readable with JavaScript off | Pass (text, FAQ and all 23 images show; loading screen is skipped) |
| sitemap.xml, robots.txt, manifest, icons | Included |

## 4. Marketing readiness
- Floating WhatsApp button and a basket that sends the full order (items and total) to WhatsApp.
- Events pushed to `dataLayer`: add_to_cart, begin_checkout, whatsapp clicks, scroll depth 25/50/75/100, theme toggle, CTA clicks. Verified: add_to_cart fired correctly.
- Place for a Google Tag Manager / GA4 snippet is marked in the page head.

## 5. Accessibility and resilience
- Skip link, visible focus ring, keyboard order is logical (nav, hero, carousel, buttons, moments list).
- Carousel works with arrow keys, buttons, drag and swipe; product name and price are announced when they change.
- Reduced-motion setting: no errors, smooth scroll turned off.
- If the animation library cannot load: the page falls back to a plain, fully usable layout (verified; the 3D carousel still works).

## 6. Performance (file weight)
- index.html 57 KB; images 976 KB in total; whole site 1.0 MB.
- First screen needs about 106 KB (page + hero image).

## 7. Issues found and fixed during QA
1. Dark-mode price and accent text on the product section had low contrast (3.1:1). Background darkened; now above 4.5:1.
2. WhatsApp button white text was 4.42:1. Green darkened; now passes.
3. Theme button and menu links were smaller than 44 px. Enlarged.
4. Phone turned sideways: the pinned scenes did not fit the screen. Layout switched to side-by-side; now fits.
5. Product carousel broke into a list when animations were unavailable. Fixed; carousel works in fallback too.

## 8. Not verified here (please check once on real devices)
- The scroll animations (door-flip scenes, circle reveals, tilting images, smooth scroll) were checked for code errors but could not be played back in this test, because the animation libraries load from the internet and the test machine is offline.
- Lighthouse score, Google Rich Results Test and real-phone touch behaviour (iPhone Safari, Android Chrome).
- Real indexing: only happens after you host the production package on your own domain.
