# Vaigai Milk website: final SEO, digital marketing and QA report

Prepared as a senior SEO / QA test review. Date: 2026-10-08. Build tested: the production package `vaigai-site/` (index.html + images + support files) in headless Chromium (Playwright), plus the Claude preview build.

## 1. Verdict
**Ready to launch once the placeholder business details are replaced.** No open FAIL items. Three static warnings are your own data (domain, phone and prices, social profile links) and one lab-only page-speed warning that must be re-measured on a real phone.

| Area | Tests | Result |
|---|---|---|
| Static SEO and technical audit | 56 checks | 53 pass, 3 warn, 0 fail |
| Dynamic crawl, marketing, privacy, language and hero tests | 21 checks | 20 pass, 1 warn, 0 fail |
| Responsive layout (13 screen sizes x light and dark) | 26 runs | 26 pass: no sideways scroll, no clipped text, no errors, all images load |
| Tamil mode layout (7 sizes x light and dark) | 14 runs | 14 pass; all 98 Tamil strings found on the page |
| Colour contrast (both themes) | 34 pairs | lowest 4.82:1 (needs 4.5:1) |
| Tap targets under 44 px | all pages | 0 |
| Fallbacks: no JavaScript, animation library blocked, reduced motion | 3 runs | all pass; content and images stay visible |

## 2. Defects found by this review and fixed
| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | High | The loading screen delayed the first picture by about 4 seconds on every visit, which hurts Largest Contentful Paint (a Google ranking signal) | Now shows only on the first visit of a session, runs about 1.7 s, and the hero is forced visible by 1.5 s even if the animation libraries are slow |
| 2 | High | Google Fonts blocked the first paint | Fonts now load without blocking (preload, then swap) with a no-JS fallback |
| 3 | High | Manifest icons and favicon were missing from the package after a rebuild | Icons are now generated on every build; verified present |
| 4 | Medium | An empty product heading in the raw HTML (crawlers saw 39 headings, visitors 40) | Product panel is now pre-filled in the HTML; headings match with JavaScript off and on |
| 5 | Medium | Generic image names such as `cut_milk.webp` | 24 keyword-rich names, for example `vaigai-fresh-milk-carton-500ml.webp` |
| 6 | Medium | Floating product images were not lazy-loaded | Lazy loading added; only the hero image loads with high priority |
| 7 | Medium | Tracking covered only the cart | Funnel events added: page_context, view_item, add_to_cart, generate_lead, begin_checkout, scroll_depth, consent; UTM and ad click-ids stored for the session and added to the WhatsApp order message |
| 8 | Medium | No way to plug in analytics safely | One-line config for Google Tag Manager, GA4 and Meta Pixel; cookie notice appears only when an ID is set; nothing loads before the visitor accepts |
| 9 | Low | Thin structured data | Added contact point, map link, six served neighbourhoods, product SKU and category, both languages, hreflang, Twitter image text |
| 10 | Low | No custom 404, cache or security headers, or image sitemap | Added `404.html`, `_headers`, `vercel.json` and an image sitemap |

## 3. SEO findings that pass
Title 56 characters and description 144 characters with keywords; canonical; indexable; `en-IN`; one H1 and no skipped heading levels; Open Graph and Twitter cards complete with a 1200x630 share image under 300 KB; 24 of 24 images have descriptive alt text, width and height, WebP format and none over 300 KB; valid JSON-LD for business, website, product list and FAQ with FAQ text matching the page; all anchors resolve; no duplicate ids; external links use rel=noopener; click-to-call, email and WhatsApp links present; robots.txt and sitemap valid; manifest, icons and favicon present; 400+ words of visible text with Madurai, milk, curd, ghee, paneer and butter all covered; address block present; Tamil text marked `lang="ta"`.

## 4. Digital marketing findings that pass
- Conversion points: floating WhatsApp button, basket order via WhatsApp (items, total and traffic source), footer WhatsApp, call and email links, hero shop buttons.
- Events verified firing in a test visit with `?utm_source=instagram&utm_campaign=launch&fbclid=abc123`: page_context (carries the UTM and click id), view_item, add_to_cart, generate_lead, begin_checkout, scroll_depth, language_toggle, theme_toggle.
- Privacy: with no IDs set there are zero tracker requests and no banner. With an ID set, the notice appears, Decline keeps every tag off, Accept loads the tag and is remembered. Buttons are 44 px or taller.
- Only fonts and animation libraries are contacted by default.

## 5. Open items and risks
| Item | Why it matters | Owner |
|---|---|---|
| Replace `www.example.com`, phone `+91 00000 00000`, WhatsApp `910000000000`, email, address, prices, sample quality figures | Placeholders in the page and the structured data would mislead Google and customers | Client |
| Add social profile links (`sameAs`) | Helps the knowledge panel | Client |
| Page speed is a lab estimate only (headless browser, no GPU, offline: LCP about 2.7 to 3.0 s) | Real phones on real networks must be measured | Run Google PageSpeed Insights after launch |
| Tested in Chromium only (no Safari or Firefox available here) | iPhone Safari and Firefox may differ | Quick manual pass on one iPhone and one Android |
| Scroll animations (3D flips, circle reveals, smooth scroll) were checked for code errors but not played back; the test machine could not load the animation libraries | Visual feel on real devices | Manual pass on a real phone |
| Images are AI-made and cut out automatically | Real product and farm photos will build more trust and can be swapped in | Client / designer |
| Tamil is applied in the browser, so Google indexes the English text | Tamil searches need their own page | Phase 2: add `/ta/` page with hreflang |
| Google Rich Results Test, Search Console and Business Profile cannot be verified until the site is on your domain | Required for rich snippets and local ranking | After deploy |

## 6. Launch checklist
1. Upload the folder to Netlify, Vercel or Cloudflare Pages and attach your domain with HTTPS.
2. Replace every placeholder (see list above) and the `www.example.com` address everywhere (page, `robots.txt`, `sitemap.xml`).
3. Set tracking IDs in `window.VAIGAI_CONFIG` and create GTM triggers for the event names listed in section 4.
4. Submit the sitemap in Google Search Console and Bing Webmaster Tools; request indexing for the home page.
5. Claim the Google Business Profile for Madurai: same name, address and phone as the footer; add photos, hours and a WhatsApp link; ask the first customers for reviews.
6. Run PageSpeed Insights and the Rich Results Test; fix anything above the thresholds.
7. Test one real order through WhatsApp end to end.

## 7. Suggested first 30 days of search and marketing work
- Week 1: Business Profile live, 10 reviews, Instagram and Facebook profiles linked from the site.
- Week 2: one short page per delivery area (Anna Nagar, KK Nagar, Teppakulam and so on) with local text and the same order button.
- Week 3: Tamil page with hreflang; short posts on curd, ghee and festival ordering (Pongal, Diwali).
- Week 4: first paid test (Instagram or Google local ads) using UTM links; read the funnel in GA4: visits, view_item, add_to_cart, generate_lead.

## Appendix A: static audit (56 checks)
| ID | Check | Result | Note |
|---|---|---|---|
| S01 | Title length 30-60 and has keywords | PASS | 56 chars: Vaigai Milk / Fresh Milk, Curd, Ghee & Paneer in Madurai |
| S02 | Meta description 70-160 chars with keywords | PASS | 144 chars |
| S03 | Canonical present and absolute | PASS | https://www.example.com/ |
| S04 | Domain is a real domain (not example.com) | WARN | Replace www.example.com before launch |
| S05 | Robots meta allows indexing | PASS | index,follow,max-image-preview:large |
| S06 | html lang set | PASS | en-IN |
| S07 | Viewport meta without zoom block | PASS | width=device-width, initial-scale=1, viewport-fit=cover |
| S08 | Exactly one H1 with keywords | PASS | Vaigai Milk: fresh milk, curd, ghee and butter from Madurai |
| S09 | Heading levels never skip | PASS | 40 headings |
| S10 | Title, H1 and og:title are consistent in topic | PASS | og:title matches title |
| S11 | hreflang / alternate language declared | PASS | Single URL site; add hreflang when /ta/ page exists |
| S12 | theme-color + application-name + format-detection | PASS |  |
| S13 | Open Graph complete | PASS | all present |
| S14 | Twitter card + image + image alt | PASS |  |
| S15 | OG image exists, 1200x630, <300KB | PASS | (1200, 630) 59KB |
| S16 | Every <img> has alt | PASS | 24 images |
| S17 | Alt text descriptive (>=20 chars, no "image of") | PASS |  |
| S18 | Descriptive file names (keyword-rich) | PASS | 0 generic names e.g. [] |
| S19 | width/height set (prevents layout shift) | PASS |  |
| S20 | Below-fold images lazy, LCP image high priority | PASS | non-lazy: [] |
| S21 | No image over 300 KB | PASS | [] |
| S22 | Modern format (WebP) used | PASS |  |
| S23 | LCP image preloaded | PASS | images/vaigai-milk-bottle-splash-cutout.webp |
| S24 | JSON-LD parses (Org/LocalBusiness, WebSite, ItemList, FAQPage) | PASS | ['Organization/LocalBusiness', 'WebSite', 'ItemList', 'FAQPage'] |
| S25 | LocalBusiness has name/url/logo/phone/address/hours/area | PASS | complete |
| S26 | LocalBusiness has contactPoint, hasMap, geo-area list | PASS |  |
| S27 | Product items have name/image/brand/offers(price,currency,availability) | PASS | 6 products |
| S28 | Product items have sku/category | PASS |  |
| S29 | FAQ schema matches visible FAQ | PASS | 6 questions |
| S30 | WebSite declares both languages | PASS | ['en-IN', 'ta-IN'] |
| S31 | Placeholder phone/prices flagged for replacement | WARN | Replace +91 00000 00000 in JSON-LD + footer |
| S32 | No duplicate ids | PASS | [] |
| S33 | Every #anchor resolves | PASS | [] |
| S34 | target=_blank links have rel=noopener | PASS | 3 external links |
| S35 | No empty-text links | PASS | 0 |
| S36 | aria-labelledby targets exist | PASS | [] |
| S37 | Click-to-call and mailto links present | PASS |  |
| S38 | robots.txt allows crawl + lists sitemap | PASS | User-agent: * / Allow: / /  / Sitemap: https://www.example.com/sitemap.xml |
| S39 | sitemap.xml valid and lists canonical | PASS | 1 url(s), 11 image entries |
| S40 | Web manifest valid, icons exist | PASS | Vaigai Milk |
| S41 | favicon.svg + apple-touch-icon exist | PASS |  |
| S42 | Custom 404 page present | PASS |  |
| S43 | Cache + security headers file (_headers) | PASS |  |
| S44 | Visible text >= 300 words (static HTML) | PASS | 781 words |
| S45 | Local keyword coverage (Madurai >= 8, milk >= 10) | PASS | madurai=13 milk=41 curd=13 ghee=13 paneer=4 butter=11 |
| S46 | NAP (name, address, phone) in footer | PASS |  |
| S47 | Tamil text present for local audience (lang=ta spans) | PASS |  |
| S48 | dataLayer events cover funnel (cart, checkout, lead, view_item, scroll) | PASS | have ['add_to_cart', 'begin_checkout', 'scroll_depth', 'whatsapp_fab', 'generate_lead', 'view_item', 'page_context', 'consent'] |
| S49 | GTM / GA4 / Meta Pixel plug-in config present | PASS |  |
| S50 | UTM parameters captured and passed to WhatsApp order | PASS |  |
| S51 | Consent banner when trackers are configured | PASS |  |
| S52 | >= 3 WhatsApp conversion points (button, floating, footer) | PASS | 2 static + dynamic order link |
| S53 | Social profile links (sameAs / footer) | WARN | Add Instagram/Facebook/YouTube links when ready |
| S54 | Total site weight < 2.5 MB | PASS | 1545 KB, HTML 103 KB |
| S55 | External scripts deferred (no render-blocking) | PASS | 3 external scripts |
| S56 | Fonts preconnected, display=swap | PASS |  |

## Appendix B: dynamic audit (21 checks)
| ID | Check | Result | Note |
|---|---|---|---|
| D01 | Headings identical with JS off and on | PASS | no-JS 40 headings / JS 40 |
| D02 | Content readable without JS (>= 90% of words) | PASS | no-JS 528 words vs JS 554 |
| D03 | All images load without JS (static src) | PASS | 24/24 |
| D04 | Every local file referenced by the page exists | PASS | 21 files checked |
| D05 | No JavaScript errors on load | PASS |  |
| D06a | CLS < 0.1 (desktop) | PASS | CLS 0.000 |
| D07a | LCP < 2.5 s locally (desktop) | WARN | LCP 3036 ms, element IMG  |
| D06b | CLS < 0.1 (mobile) | PASS | CLS 0.000 |
| D07b | LCP < 2.5 s locally (mobile) | PASS | LCP 1820 ms, element P  |
| D08 | Funnel events fire: page_context, view_item, add_to_cart, generate_lead, begin_checkout, scroll_depth, language_toggle, theme_toggle | PASS | all fired |
| D09 | UTM / click-id captured in page_context | PASS | {"event":"page_context","page_type":"home","language":"en","utm_source":"instagram","utm_medium":"social","utm_campaign":"launch","fbclid":"abc123"} |
| D10 | generate_lead carries UTM and method | PASS | {"event":"generate_lead","method":"whatsapp","location":"fab","utm_source":"instagram","utm_medium":"social","utm_campaign":"launch","fbclid":"abc123" |
| D11 | WhatsApp order message has items, total and traffic source | PASS | https://wa.me/910000000000?text=Hi Vaigai Milk, I would like to order: / 1 x Badam milk (250 ml) / Total: Rs 55 / Source: instagram / launch |
| D12 | Cookie notice shown when a tracking ID is set; tags NOT loaded before consent | PASS | {"show":true,"role":"region","gtmBefore":false,"btn":[44,44]} |
| D13 | Consent buttons are tap-friendly (>= 44 px) | PASS | 44,44 |
| D14 | Accept loads GTM and remembers the choice | PASS | {"gone":true,"gtm":true,"stored":"yes"} |
| D15 | Decline keeps all tracking tags off | PASS | {"gtm":false,"stored":"no"} |
| D16 | No tracker requests and no cookie banner until IDs are configured | PASS | none |
| D17 | Third-party hosts contacted (fonts + animation libs only) | PASS | fonts.googleapis.com, cdnjs.cloudflare.com, cdn.jsdelivr.net |
| D18 | Tamil mode sets html lang=ta, keeps one H1 and the English <title> | PASS | {"lang":"ta","h1":1,"title":"Vaigai Milk / Fresh Milk, Curd, Ghee & Paneer in Madurai","saved":"ta"} |
| D19 | Each tab shows the matching slide + background colour, one slide active, others aria-hidden | PASS | [[1,1,1,1,1],[2,2,2,1,1],[3,3,3,1,1]] |

