import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'node_modules', '@fluentui', 'svg-icons', 'icons');
const outFile = join(root, 'src', 'icons', 'symbols.html');
const config = JSON.parse(readFileSync(join(root, 'scripts', 'icons.config.json'), 'utf8'));

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const argCounts = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
const steps = 24;

const flattenArc = (x1, y1, rx, ry, phi, fa, fs, x2, y2) => {
  if (rx === 0 || ry === 0) return [[x2, y2]];
  const rad = (phi * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const coef = (fa === fs ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const angle = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!fs && dt > 0) dt -= 2 * Math.PI;
  if (fs && dt < 0) dt += 2 * Math.PI;
  const pts = [];
  for (let i = 1; i <= steps; i++) {
    const t = t1 + (dt * i) / steps;
    pts.push([cos * rx * Math.cos(t) - sin * ry * Math.sin(t) + cx, sin * rx * Math.cos(t) + cos * ry * Math.sin(t) + cy]);
  }
  return pts;
};

const bezier = (pts, i) => {
  const t = i / steps;
  const u = 1 - t;
  const n = pts.length - 1;
  const w = n === 3 ? [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t] : [u * u, 2 * u * t, t * t];
  return [0, 1].map((k) => pts.reduce((s, p, j) => s + w[j] * p[k], 0));
};

const flatten = (d) => {
  const segments = [];
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let lastCtrl = null;
  const lineTo = (nx, ny) => {
    segments.push([x, y, nx, ny]);
    x = nx;
    y = ny;
  };
  for (const seg of d.matchAll(/([a-zA-Z])([^a-zA-Z]*)/g)) {
    const rel = seg[1] === seg[1].toLowerCase();
    const up = seg[1].toUpperCase();
    const nums = (seg[2].match(/-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi) ?? []).map(Number);
    if (up === 'Z') {
      lineTo(sx, sy);
      lastCtrl = null;
      continue;
    }
    const n = argCounts[up];
    for (let i = 0, first = true; i + n <= nums.length; i += n, first = false) {
      const a = nums.slice(i, i + n);
      const ox = rel ? x : 0;
      const oy = rel ? y : 0;
      let ctrl = null;
      if (up === 'M') {
        if (first) {
          x = a[0] + ox;
          y = a[1] + oy;
          sx = x;
          sy = y;
        } else lineTo(a[0] + ox, a[1] + oy);
      } else if (up === 'L') lineTo(a[0] + ox, a[1] + oy);
      else if (up === 'H') lineTo(a[0] + ox, y);
      else if (up === 'V') lineTo(x, a[0] + oy);
      else if (up === 'A') {
        for (const [px, py] of flattenArc(x, y, a[0], a[1], a[2], a[3], a[4], a[5] + ox, a[6] + oy)) lineTo(px, py);
      } else {
        let pts;
        if (up === 'C') pts = [[x, y], [a[0] + ox, a[1] + oy], [a[2] + ox, a[3] + oy], [a[4] + ox, a[5] + oy]];
        else if (up === 'S') {
          const c1 = lastCtrl ? [2 * x - lastCtrl[0], 2 * y - lastCtrl[1]] : [x, y];
          pts = [[x, y], c1, [a[0] + ox, a[1] + oy], [a[2] + ox, a[3] + oy]];
        } else if (up === 'Q') pts = [[x, y], [a[0] + ox, a[1] + oy], [a[2] + ox, a[3] + oy]];
        else {
          const c1 = lastCtrl ? [2 * x - lastCtrl[0], 2 * y - lastCtrl[1]] : [x, y];
          pts = [[x, y], c1, [a[0] + ox, a[1] + oy]];
        }
        for (let s = 1; s <= steps; s++) {
          const [px, py] = bezier(pts, s);
          lineTo(px, py);
        }
        ctrl = pts[pts.length - 2];
      }
      lastCtrl = ctrl;
    }
  }
  return segments;
};

const pointToSegments = (px, py, segments) => {
  let best = Infinity;
  for (const [x1, y1, x2, y2] of segments) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = dx * dx + dy * dy;
    const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len));
    best = Math.min(best, Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)));
  }
  return best;
};

const maxDeviation = (from, to) => {
  let worst = 0;
  for (const [x1, y1, x2, y2] of from) {
    for (const t of [0, 0.5, 1]) worst = Math.max(worst, pointToSegments(x1 + t * (x2 - x1), y1 + t * (y2 - y1), to));
  }
  return worst;
};

const tolerance = 0.03;

const pathDeviation = (a, b) => {
  const sa = flatten(a).filter((s) => s[0] !== s[2] || s[1] !== s[3]);
  const sb = flatten(b).filter((s) => s[0] !== s[2] || s[1] !== s[3]);
  return Math.max(maxDeviation(sa, sb), maxDeviation(sb, sa));
};

const parseSymbols = (html) => {
  const map = new Map();
  for (const m of html.matchAll(/<symbol\s+id="([^"]+)"\s+viewBox="([^"]+)"\s*>([\s\S]*?)<\/symbol>/g)) {
    const d = [...m[3].matchAll(/\sd="([^"]+)"/g)].map((p) => p[1].replace(/\s+/g, ' ').trim()).join('|');
    map.set(m[1], { viewBox: m[2], d });
  }
  return map;
};

const baselineFile = process.argv[2] ? resolve(process.argv[2]) : outFile;
const previous = existsSync(baselineFile) ? parseSymbols(readFileSync(baselineFile, 'utf8')) : new Map();
const ids = Object.keys(config).sort();
const missing = [];
const symbols = [];

for (const id of ids) {
  const entry = config[id];
  if (typeof entry === 'object') {
    symbols.push({ id, viewBox: entry.viewBox, body: entry.markup });
    continue;
  }
  const file = join(iconsDir, `${entry}.svg`);
  if (!existsSync(file)) {
    missing.push(`${id} -> ${entry}`);
    continue;
  }
  const svg = readFileSync(file, 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  const body = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<path\s/g, '<path fill="currentColor" ');
  if (!viewBox || !body.trim()) {
    missing.push(`${id} -> ${entry} (invalid svg)`);
    continue;
  }
  symbols.push({ id, viewBox, body });
}

if (missing.length) fail(`Icons not found:\n  ${missing.join('\n  ')}`);

const output =
  '<svg style="display: none;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n  <defs>\n' +
  symbols
    .map(({ id, viewBox, body }) => `    <symbol id="${id}" viewBox="${viewBox}">\n      ${body}\n    </symbol>\n`)
    .join('\n') +
  '  </defs>\n</svg>\n';

const generated = parseSymbols(output);
const changed = [];
for (const [id, now] of generated) {
  const before = previous.get(id);
  if (!before) continue;
  if (before.viewBox !== now.viewBox) changed.push(`${id}: viewBox ${before.viewBox} -> ${now.viewBox}`);
  else {
    const deviation = pathDeviation(before.d, now.d);
    if (deviation > tolerance) changed.push(`${id}: path changed (max deviation ${deviation.toFixed(3)})`);
  }
}

const walk = (dir, exts, acc = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, exts, acc);
    else if (exts.some((e) => entry.name.endsWith(e))) acc.push(full);
  }
  return acc;
};

const sources = [join(root, 'index.html'), ...walk(join(root, 'src'), ['.html', '.ts'])].filter(
  (f) => existsSync(f) && resolve(f) !== outFile
);
const used = new Map();
for (const file of sources) {
  for (const m of readFileSync(file, 'utf8').matchAll(/#(icon-[a-z0-9][a-z0-9-]*)/g)) {
    if (!used.has(m[1])) used.set(m[1], relative(root, file).split(sep).join('/'));
  }
}

const undefinedRefs = [...used].filter(([id]) => !generated.has(id));
if (undefinedRefs.length) {
  fail(`Referenced icons missing from sprite:\n  ${undefinedRefs.map(([id, f]) => `${id} (${f})`).join('\n  ')}`);
}

writeFileSync(outFile, output);

const unused = ids.filter((id) => !used.has(id));
console.log(`Generated ${symbols.length} symbols -> ${relative(root, outFile)}`);
if (changed.length) console.log(`Changed vs previous sprite:\n  ${changed.join('\n  ')}`);
if (unused.length) console.log(`Defined but unused:\n  ${unused.join('\n  ')}`);
