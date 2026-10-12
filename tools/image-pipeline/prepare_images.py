#!/usr/bin/env python3
"""Prepare website images from the original uploads.

    python3 tools/image-pipeline/prepare_images.py

Reads  frontend/website/assets/originals/<id>.png
Writes frontend/website/assets/masters/<key>.png   (lossless master, visible corner mark removed)
       frontend/website/assets/images/<key>.webp   (what the site uses, quality 90)

What it does (the exact method used for this project):
  1. Find the small star mark in the bottom-right corner by local contrast (value minus a blurred copy).
  2. Keep only the compact cluster around the known star centre and grow it a little (dilate).
  3. Fill it with OpenCV inpainting (Telea). For the two wide landscape pictures (farm, dairy) the corner
     is replaced by a shifted copy of the picture blended with a soft mask, because pure inpainting looks smeary there.

Honest note: this removes the VISIBLE mark only. AI-generated pictures can also carry invisible watermarks,
and pictures of a product that does not exist can mislead customers. Replace them with real photos
(see photoshoot/BRIEF.md) before launch.
Needs: opencv-python, numpy, Pillow.
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

REPO = Path(__file__).resolve().parents[2]
ASSETS = REPO / "frontend" / "website" / "assets"
SOURCE = {  # site key -> original upload id
    "hero": "1000676049", "farm": "1000676052", "dairy": "1000676050", "combo": "1000676053",
    "curd": "1000676056", "carton": "1000676051", "crate": "1000676048", "ghee": "1000676054",
    "badam": "1000676045", "family": "1000676059", "butter": "1000676057",
}
SHIFT = {"farm": (-130, -8), "dairy": (-120, 6)}  # landscape pictures: borrow nearby sky/field instead of inpainting


def corner_mask(image: np.ndarray) -> np.ndarray:
    h, w = image.shape[:2]
    x0, x1, y0, y1 = w - 190, w - 50, 585, 705
    gray = cv2.cvtColor(image[y0:y1, x0:x1], cv2.COLOR_BGR2GRAY).astype(np.float32)
    diff = gray - cv2.GaussianBlur(gray, (0, 0), 9)
    local = ((diff > 7) | (diff < -9)).astype(np.uint8) * 255
    full = np.zeros((h, w), np.uint8)
    full[y0:y1, x0:x1] = local
    disc = np.zeros((h, w), np.uint8)
    cv2.circle(disc, (w - 121, 648), 44, 255, -1)
    return cv2.dilate(cv2.bitwise_and(full, disc), np.ones((9, 9), np.uint8), iterations=2)


def clean(image: np.ndarray, key: str) -> np.ndarray:
    h, w = image.shape[:2]
    mask = corner_mask(image)
    fixed = cv2.inpaint(image, mask, 6, cv2.INPAINT_TELEA)
    if key in SHIFT:
        dx, dy = SHIFT[key]
        moved = cv2.warpAffine(image, np.float32([[1, 0, dx], [0, 1, dy]]), (w, h), borderMode=cv2.BORDER_REFLECT)
        alpha = cv2.GaussianBlur(cv2.dilate(mask, np.ones((7, 7), np.uint8)).astype(np.float32) / 255, (0, 0), 6)[..., None]
        fixed = (moved * alpha + fixed * (1 - alpha)).astype(np.uint8)
    return fixed


def main() -> None:
    (ASSETS / "masters").mkdir(exist_ok=True)
    (ASSETS / "images").mkdir(exist_ok=True)
    for key, upload_id in SOURCE.items():
        image = cv2.imread(str(ASSETS / "originals" / f"{upload_id}.png"))
        fixed = clean(image, key)
        cv2.imwrite(str(ASSETS / "masters" / f"{key}.png"), fixed)
        Image.fromarray(cv2.cvtColor(fixed, cv2.COLOR_BGR2RGB)).save(ASSETS / "images" / f"{key}.webp", "WEBP", quality=90, method=6)
        print("prepared", key)


if __name__ == "__main__":
    main()
