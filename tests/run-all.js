#!/usr/bin/env node
/**
 * One command for every automated check in the project.
 *
 *   npm test                 everything (build first if frontend/website/dist is missing)
 *   npm run test:unit        logic only (no browser, seconds)
 *   npm run test:e2e         real-browser tests against the built site + local mock backend
 *   npm run test:audit       SEO / crawl / generated-pages audits
 *
 * Suites run one after another because the e2e tests share the mock server port (5678).
 * Each suite is parsed into  { passed, failed, warned }  and summarised at the end.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ROOT_DIR, SITE } = require('./helpers/env');

const T = (...p) => path.join(ROOT_DIR, 'tests', ...p);
const parseDone = (out) => {
  const m = out.match(/(\d+) passed, (\d+) failed/);
  return m ? { passed: +m[1], failed: +m[2] } : null;
};
const parseDict = (out) => {
  const m = out.match(/\{[^}]*\}/);
  if (!m) return null;
  const d = JSON.parse(m[0].replace(/'/g, '"'));
  return { passed: d.PASS || 0, failed: d.FAIL || 0, warned: d.WARN || 0 };
};

const SUITES = [
  { kind: 'unit', name: 'Assistant brain (intents, flows, Tamil, WhatsApp mode)', cmd: 'node', args: [path.join(ROOT_DIR, 'frontend', 'assistant', 'brain.test.js')], parse: parseDone },
  { kind: 'unit', name: 'GST invoice engine', cmd: 'node', args: [path.join(ROOT_DIR, 'backend', 'shared', 'engine.test.js')], parse: parseDone },
  { kind: 'unit', name: 'n8n workflows (structure + every Code node)', cmd: 'node', args: [T('unit', 'n8n-workflows.test.js')], parse: parseDone },
  { kind: 'e2e', name: 'Layout matrix: 13 sizes x light/dark', cmd: 'node', args: [T('e2e', 'layout-matrix.e2e.js')], parse: (o) => { const m = o.match(/layout runs: (\d+) failures: (\d+)/); return m && { passed: +m[1] - +m[2], failed: +m[2] }; }, timeout: 280 },
  { kind: 'e2e', name: 'Tamil layout', cmd: 'node', args: [T('e2e', 'tamil-layout.e2e.js')], parse: (o) => ({ passed: (o.match(/^ok /gm) || []).length, failed: (o.match(/^FAIL/gm) || []).length }), timeout: 200 },
  { kind: 'e2e', name: 'Assistant in browser (local, AI, fallback)', cmd: 'node', args: [T('e2e', 'assistant-ui.e2e.js')], parse: parseDone, timeout: 200 },
  { kind: 'e2e', name: 'Payment + GST invoice in browser', cmd: 'node', args: [T('e2e', 'payment-invoice.e2e.js')], parse: parseDone },
  { kind: 'e2e', name: 'Customer account (OTP, repeat, pause, skip)', cmd: 'node', args: [T('e2e', 'customer-account.e2e.js')], parse: parseDone },
  { kind: 'e2e', name: 'Admin dashboard', cmd: 'node', args: [T('e2e', 'admin-dashboard.e2e.js')], parse: parseDone },
  { kind: 'e2e', name: 'Tamil, area and recipe pages in browser', cmd: 'node', args: [T('e2e', 'generated-pages.e2e.js')], parse: parseDone, timeout: 250 },
  { kind: 'audit', name: 'SEO static audit', cmd: 'python3', args: [T('audit', 'seo-static.audit.py')], parse: parseDict },
  { kind: 'audit', name: 'SEO dynamic audit (crawl, marketing, privacy)', cmd: 'node', args: [T('audit', 'seo-dynamic.audit.js')], parse: parseDict },
  { kind: 'audit', name: 'Generated pages audit (hreflang, schema, links)', cmd: 'python3', args: [T('audit', 'generated-pages.audit.py')], parse: parseDict },
];

const only = process.argv[2];
if (!fs.existsSync(path.join(SITE, 'index.html'))) {
  console.log('frontend/website/dist missing: building first...');
  const b = spawnSync('npm', ['run', 'build'], { cwd: ROOT_DIR, stdio: 'inherit' });
  if (b.status !== 0) process.exit(1);
}

const rows = [];
for (const s of SUITES.filter((x) => !only || x.kind === only)) {
  const t0 = Date.now();
  const r = spawnSync(s.cmd, s.args, { cwd: ROOT_DIR, encoding: 'utf8', timeout: (s.timeout || 150) * 1000, env: { ...process.env, ARTIFACTS_DIR: process.env.ARTIFACTS_DIR || T('.artifacts') } });
  const out = (r.stdout || '') + (r.stderr || '');
  const res = s.parse(out) || { passed: 0, failed: 1 };
  if (res.failed || r.error) console.log(out.split('\n').filter((l) => /FAIL|Error/.test(l)).slice(0, 8).join('\n'));
  rows.push({ ...s, ...res, secs: ((Date.now() - t0) / 1000).toFixed(1) });
  console.log(`${res.failed ? '✗' : '✓'} ${s.name}: ${res.passed} passed, ${res.failed} failed${res.warned ? ', ' + res.warned + ' warnings' : ''} (${rows[rows.length - 1].secs}s)`);
}
const sum = (k) => rows.reduce((a, r) => a + (r[k] || 0), 0);
console.log(`\nTOTAL: ${sum('passed')} passed, ${sum('failed')} failed, ${sum('warned')} warnings across ${rows.length} suites`);
fs.writeFileSync(T('.artifacts', 'last-run.json'), JSON.stringify(rows.map(({ name, kind, passed, failed, warned, secs }) => ({ name, kind, passed, failed, warned, secs })), null, 2));
process.exit(sum('failed') ? 1 : 0);
