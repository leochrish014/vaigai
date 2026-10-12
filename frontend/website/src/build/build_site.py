#!/usr/bin/env python3
"""Build the Vaigai Milk website.

    python3 frontend/website/src/build/build_site.py

Outputs (all under frontend/website/dist/):
  preview.html   single self-contained file (images inlined) for quick review
  public/        the deployable static site (host this folder)
Needs: Python 3.10+, Pillow, beautifulsoup4, Node 18+ with `sharp` (npm install).
"""
import datetime
import json
import runpy
import shutil
import subprocess
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
DIST = REPO / "frontend" / "website" / "dist"
PUBLIC = DIST / "public"

# Reuse the page generator as a namespace (content, design tokens, templates).
NS = runpy.run_path(str(HERE / "build.py"), init_globals={"REPO": REPO, "HERE": HERE})
SITE, FN, FNC, FSK, IMGS, MARK = (NS[k] for k in ("SITE", "FN", "FNC", "FSK", "IMGS", "MARK"))
OGF, LOGOF, DESC, esc, page = (NS[k] for k in ("OGF", "LOGOF", "DESC", "esc", "page"))
ASSETS = REPO / "frontend" / "website" / "assets"

IMAGE_CAPTIONS = [
    ("hero", "Vaigai Milk glass bottle in a crown splash of fresh milk"),
    ("farm", "Aerial view of a Madurai dairy farm with grazing cattle"),
    ("dairy", "Vaigai Milk dairy in Madurai at sunrise"),
    ("combo", "Vaigai paneer, ghee and set curd"),
    ("curd", "Vaigai set curd in a clay pot"),
    ("carton", "Vaigai Fresh 500 ml milk carton"),
    ("crate", "Vaigai Milk glass bottles in a wooden crate"),
    ("ghee", "Vaigai farm ghee jar"),
    ("badam", "Vaigai badam flavoured milk"),
    ("family", "The Vaigai Milk product range"),
    ("butter", "Vaigai fresh butter"),
]


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def copy_images() -> None:
    """Product photos get SEO file names; cut-out sprites go to images/cut/."""
    for key in IMGS:
        if not key.startswith("fs_"):
            shutil.copy(ASSETS / "images" / f"{key}.webp", PUBLIC / "images" / f"{FN[key]}.webp")
    for key in FSK:
        shutil.copy(ASSETS / "cutouts" / f"{key}_main.webp", PUBLIC / "images" / "cut" / f"{FNC[key]}.webp")
        shutil.copy(ASSETS / "cutouts" / f"{key}_atl.webp", PUBLIC / "images" / "cut" / f"{FNC[key]}-particles.webp")
    og = Image.open(ASSETS / "images" / "hero.webp").convert("RGB")
    width, height = og.size
    og = og.resize((1200, round(height * 1200 / width)))
    top = (og.height - 630) // 2
    og.crop((0, top, 1200, top + 630)).save(PUBLIC / "images" / OGF, quality=86, optimize=True)


def write_brand_assets() -> None:
    """Favicon (SVG) plus PNG icons rendered with sharp (Node)."""
    brand = DIST / "brand"
    write(PUBLIC / "favicon.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 62">{MARK}</svg>')
    icon = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#06303a"/>'
            f'<g transform="translate(14 15) scale(1.1)">{MARK}</g></svg>')
    logo = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 62" width="512" height="496">{MARK}</svg>'
    write(brand / "icon.svg", icon)
    write(brand / "logo.svg", logo)
    script = (
        "const sharp=require('sharp');(async()=>{"
        f"const P={json.dumps(str(PUBLIC) + '/')};const B={json.dumps(str(brand) + '/')};"
        "for(const [n,s] of [['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]])"
        "await sharp(B+'icon.svg').resize(s,s).png().toFile(P+n);"
        f"await sharp(B+'logo.svg').resize({{width:512}}).png().toFile(P+'images/{LOGOF}')"
        "})()"
    )
    subprocess.run(["node", "-e", script], check=True, cwd=REPO)


def write_secondary_pages() -> list:
    pages = runpy.run_path(str(HERE / "site_pages.py"), init_globals={**NS, "HERE": HERE, "os": __import__("os")})
    return pages["write_pages"](str(PUBLIC), (PUBLIC / "index.html").read_text(encoding="utf-8"))


def write_sitemap(extra: list) -> None:
    url, today = SITE["url"], datetime.date.today().isoformat()
    alternates = (f'<xhtml:link rel="alternate" hreflang="en-in" href="{url}"/>'
                  f'<xhtml:link rel="alternate" hreflang="ta-in" href="{url}ta/"/>'
                  f'<xhtml:link rel="alternate" hreflang="x-default" href="{url}"/>')
    images = "".join(
        f"<image:image><image:loc>{url}images/{FN[k]}.webp</image:loc><image:title>{esc(c)}</image:title>"
        f"<image:caption>{esc(c)}</image:caption></image:image>" for k, c in IMAGE_CAPTIONS)
    entries = (f"<url><loc>{url}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority>{alternates}{images}</url>"
               f"<url><loc>{url}ta/</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>{alternates}</url>")
    entries += "".join(
        f"<url><loc>{url}{path}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>"
        for path, kind in extra if kind in ("area page", "recipe index", "recipe page"))
    write(PUBLIC / "sitemap.xml",
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
          'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
          + entries + "</urlset>\n")


def write_support_files() -> None:
    """robots, manifest, 404, cache/security headers (Netlify/Cloudflare + Vercel)."""
    write(PUBLIC / "robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {SITE['url']}sitemap.xml\n")
    write(PUBLIC / "site.webmanifest", json.dumps({
        "name": "Vaigai Milk", "short_name": "Vaigai", "description": DESC, "start_url": "/", "display": "standalone",
        "background_color": "#06303a", "theme_color": "#06303a", "lang": "en-IN",
        "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
                  {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"}]}, indent=2))
    write(PUBLIC / "404.html", (
        '<!DOCTYPE html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        '<title>Page not found | Vaigai Milk</title><meta name="robots" content="noindex"><link rel="icon" href="favicon.svg" type="image/svg+xml">'
        '<style>body{margin:0;min-height:100vh;display:grid;place-content:center;justify-items:center;gap:14px;background:#06303a;color:#eaf5f0;'
        'font:17px/1.6 system-ui,sans-serif;text-align:center;padding:24px}svg{width:96px;height:92px}'
        'h1{font:400 clamp(2.4rem,7vw,4rem)/1 Georgia,serif;margin:0}'
        'a{background:#e3b341;color:#0a2a24;padding:.8em 1.6em;border-radius:99px;font-weight:600;text-decoration:none;min-height:44px;display:inline-flex;align-items:center}'
        f'</style></head><body><svg viewBox="0 0 64 62" aria-hidden="true">{MARK}</svg><h1>This page took a day off.</h1>'
        '<p>The page you are looking for is not here. Fresh milk is, though.</p><a href="/">Back to Vaigai Milk</a></body></html>'))
    write(PUBLIC / "_headers", (
        "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n"
        "  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/images/*\n  Cache-Control: public, max-age=31536000, immutable\n\n"
        "/*.html\n  Cache-Control: public, max-age=0, must-revalidate\n\n/\n  Cache-Control: public, max-age=0, must-revalidate\n"))
    write(PUBLIC / "vercel.json", json.dumps({"headers": [
        {"source": "/(.*)", "headers": [{"key": "X-Content-Type-Options", "value": "nosniff"},
                                        {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
                                        {"key": "X-Frame-Options", "value": "SAMEORIGIN"}]},
        {"source": "/images/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]}]}, indent=2))
    shutil.copy(REPO / "frontend" / "web-apps" / "invoice.html", PUBLIC / "invoice.html")
    shutil.copy(HERE / "templates" / "README.public.md", PUBLIC / "README.md")


def main() -> None:
    shutil.rmtree(DIST, ignore_errors=True)
    (PUBLIC / "images" / "cut").mkdir(parents=True)
    write(DIST / "preview.html", page(False))
    write(PUBLIC / "index.html", page(True))
    copy_images()
    write_brand_assets()
    extra = write_secondary_pages()
    write_sitemap(extra)
    write_support_files()
    print(f"built preview {(DIST / 'preview.html').stat().st_size // 1024} KB; "
          f"index {(PUBLIC / 'index.html').stat().st_size // 1024} KB; {len(extra)} generated pages")


if __name__ == "__main__":
    main()
