#!/usr/bin/env node
/**
 * Dependency-free code formatter for this repo (uses the TypeScript compiler API).
 *   node tools/format-js.js            format every project JS file and the inline scripts of frontend/web-apps/*.html
 *   node tools/format-js.js --check    exit 1 if anything would change (use in CI)
 * Rules: one statement per line, 2-space indent, every block and object literal multi-line.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const JS_FILES = [
  'frontend/website/src/js/app.js', 'frontend/assistant/brain.js', 'frontend/assistant/ui.js',
  'backend/shared/invoice-engine.js', 'backend/mock-server/mock-n8n.js',
];
const HTML_FILES = ['frontend/web-apps/admin.html', 'frontend/web-apps/account.html', 'frontend/web-apps/invoice.html'];

function format(source, fileName) {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
  const expand = (ctx) => {
    const f = ctx.factory;
    const visit = (node) => {
      node = ts.visitEachChild(node, visit, ctx);
      if (ts.isBlock(node) && node.statements.length) {
        return ts.setTextRange(f.createBlock(node.statements, true), node);
      }
      if (ts.isObjectLiteralExpression(node) && node.properties.length > 1) {
        return ts.setTextRange(f.createObjectLiteralExpression(node.properties, true), node);
      }
      return node;
    };
    return (root) => ts.visitNode(root, visit);
  };
  const out = ts.transform(sf, [expand]).transformed[0];
  return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(out);
}

function formatHtml(html, name) {
  return html.replace(/<script>([\s\S]*?)<\/script>/g, (m, body) => `<script>\n${format(body, name + '.js').trimEnd()}\n</script>`);
}

let dirty = 0;
const check = process.argv.includes('--check');
for (const rel of [...JS_FILES, ...HTML_FILES]) {
  const file = path.join(ROOT, rel);
  const before = fs.readFileSync(file, 'utf8');
  const after = rel.endsWith('.html') ? formatHtml(before, rel) : format(before, rel);
  if (after !== before) {
    dirty++;
    if (!check) fs.writeFileSync(file, after);
    console.log((check ? 'would format ' : 'formatted ') + rel);
  }
}
if (check && dirty) process.exit(1);
