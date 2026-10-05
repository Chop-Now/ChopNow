/**
 * Mobile regression guard, run after `npm run build` (see .github/workflows/ci.yml).
 *
 * It fails the build when one of the things that made ChopNow slow or awkward on
 * phones creeps back: huge images, a swollen entry bundle, a missing mobile
 * viewport / install files, or text smaller than 12px. It checks the build
 * output and the source, so it needs no browser or backend.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const dist = join(root, 'dist');
const src = join(root, 'src');
const failures = [];
const kb = (bytes) => Math.round(bytes / 1024);

if (!existsSync(dist)) {
  console.error('dist/ not found - run `npm run build` first.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

// 1. No image larger than 250 KB ships in the build (phones pay for every byte).
const MAX_IMAGE_KB = 250;
for (const file of walk(join(dist, 'assets'))) {
  if (!/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file)) continue;
  const size = kb(statSync(file).size);
  if (size > MAX_IMAGE_KB) {
    failures.push(
      `${relative(dist, file)} is ${size} KB (limit ${MAX_IMAGE_KB} KB) - resize it or convert to WebP`
    );
  }
}

// 2. The entry bundle every visitor downloads stays small.
const MAX_ENTRY_KB = 450;
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const entry = html.match(/src="\/assets\/(index-[^"]+\.js)"/)?.[1];
if (!entry) failures.push('could not find the entry script in dist/index.html');
else {
  const size = kb(statSync(join(dist, 'assets', entry)).size);
  if (size > MAX_ENTRY_KB)
    failures.push(`entry bundle ${entry} is ${size} KB (limit ${MAX_ENTRY_KB} KB)`);
}
if (/modulepreload/.test(html)) {
  failures.push(
    'index.html preloads extra chunks - heavy libraries must stay out of the entry path'
  );
}

// 3. Mobile page setup and installability.
for (const [needle, why] of [
  ['viewport-fit=cover', 'viewport meta needs viewport-fit=cover (notches)'],
  ['rel="manifest"', 'web app manifest link is missing'],
  ['name="theme-color"', 'theme-color meta is missing'],
]) {
  if (!html.includes(needle)) failures.push(`index.html: ${why}`);
}
for (const f of ['manifest.webmanifest', 'sw.js', 'offline.html', 'icon-192.png', 'icon-512.png']) {
  if (!existsSync(join(dist, f))) failures.push(`dist/${f} is missing (PWA install / offline)`);
}

// 4. Source rules: no text under 12px, no 16px-defeating input sizes.
for (const file of walk(src)) {
  if (!/\.(jsx?|css)$/.test(extname(file) ? file : '')) continue;
  const text = readFileSync(file, 'utf8');
  const tiny = text.match(/text-\[(?:[0-9]|1[01])px\]/g);
  if (tiny)
    failures.push(
      `${relative(root, file)}: ${tiny.length}x text under 12px (${tiny[0]}) - use text-xs or larger`
    );
  const chart = text.match(/fontSize=\{(?:[0-9]|1[01])\}/g);
  if (chart) failures.push(`${relative(root, file)}: chart font under 12px (${chart[0]})`);
}

if (failures.length > 0) {
  console.error('Mobile budget FAILED:\n - ' + failures.join('\n - '));
  process.exit(1);
}
console.log('Mobile budget OK');
