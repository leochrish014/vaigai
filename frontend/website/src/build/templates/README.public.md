# Vaigai Milk website: deploy and launch checklist

## Deploy (5 minutes)
1. Upload this whole folder to Netlify, Vercel, Cloudflare Pages or any static host (drag and drop works).
2. Open `index.html`, search for `www.example.com` and replace with your real domain (canonical, Open Graph, JSON-LD). Do the same in `robots.txt` and `sitemap.xml`.
3. Replace the placeholders: phone `+91 00000 00000`, WhatsApp number `910000000000` (top of the script as `WA`, and in the footer and the floating button), email `hello@example.com`, address, pincode, product prices and the sample quality figures.
4. Submit `https://YOUR-DOMAIN/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
5. Claim your Google Business Profile for Madurai and add its link to `sameAs` in the Organization JSON-LD.

## What is in the page
- Hero carousel: Milk, Ghee, Butter, Curd. Each slide has its own background colour that fades when the slide changes, a 3D flip transition, mouse tilt and floating particles. Pause on hover, swipe on phones, arrow keys on the tabs.
- Cut-out product scenes (`images/cut/`): the product and its splash droplets, almonds, berries and leaves are separate layers that float at different depths and move with the mouse and with scroll. To use your own photos, cut out the product on a transparent background and replace the `_main.webp` files; the `_atl.webp` files hold the small floating pieces.
- Light and dark mode, Tamil / English switch, FAQ, WhatsApp ordering, product carousel.

## Analytics and marketing
Events pushed to `window.dataLayer`: `add_to_cart`, `begin_checkout`, `whatsapp_fab`, `whatsapp_footer`, `hero_slide`, `hero_shop_*`, `moment_cta`, `theme_toggle`, `language_toggle`, `scroll_depth` (25/50/75/100). Plug in your tracking IDs in one line near the top of `index.html`: `window.VAIGAI_CONFIG={gtm:"GTM-XXXX",ga4:"G-XXXX",pixel:"1234567890"}`. When any ID is set, a cookie notice appears and the tags load only after the visitor accepts. Visitors arriving with `utm_*`, `gclid` or `fbclid` have them stored for the session and the WhatsApp order message shows the source. Extra events: `generate_lead` (every WhatsApp click), `view_item` (product browsed), `page_context`, `consent`.

## SEO included
Title, meta description, canonical, robots, Open Graph and Twitter cards, `en-IN`, geo tags, JSON-LD (Organization/LocalBusiness, WebSite, product ItemList, FAQPage), one H1 with clean heading order, alt text on every image, image width/height, hero preload, lazy-loaded images, sitemap.xml, robots.txt, manifest and icons, no-JS and no-animation fallbacks. After launch, test in Google's Rich Results Test and PageSpeed Insights.

## Files added for launch
`404.html` (branded not-found page), `_headers` (cache and security headers for Netlify / Cloudflare Pages), `vercel.json` (same for Vercel), `sitemap.xml` with image entries. Image file names are keyword-rich (for example `vaigai-fresh-milk-carton-500ml.webp`) for image search.

## AI assistant (built in)
A chat assistant (English, Tamil, Tanglish; voice input) is already inside `index.html`. It works on its own with no backend. For the full AI + automation version, set the webhook URLs in `window.VAIGAI_CONFIG` and import the workflows from the separate `vaigai-ai-assistant` package (see its README).
