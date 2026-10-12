/**
 * Shared test environment: every path is derived from the repo root, never hard-coded.
 * Override with env vars:  SITE_DIR, CHROMIUM_PATH, ARTIFACTS_DIR
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const SITE = process.env.SITE_DIR || path.join(ROOT_DIR, 'frontend', 'website', 'dist', 'public');
const WEB = path.join(ROOT_DIR, 'frontend', 'web-apps');
const MOCK = path.join(ROOT_DIR, 'backend', 'mock-server', 'mock-n8n.js');
const SHOTS = process.env.ARTIFACTS_DIR || path.join(ROOT_DIR, 'tests', '.artifacts');
if (!process.env.CHROMIUM_PATH) {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      process.env.CHROMIUM_PATH = c;
      break;
    }
  }
}

module.exports = { ROOT_DIR, SITE, WEB, MOCK, SHOTS };
