# tools/

- `image-pipeline/prepare_images.py`: removes the visible corner mark from the original pictures and writes PNG masters + WebP.
- `image-pipeline/cutout_pipeline.py`: builds the transparent product cut-outs and particle sprites used by the floating 3D scenes.
- `image-pipeline/experiments/`: earlier segmentation and matting experiments kept for reference (not used by the build).
- `format-js.js`: dependency-free formatter (`npm run format`, `--check` for CI).
- `test-webhooks.sh`: curl checks for a live n8n.
- `dev-scratch/`: ad-hoc screenshot and rendering scripts used while developing (not part of the product).
