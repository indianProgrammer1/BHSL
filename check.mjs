import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pages } from '../src/pages.mjs';
import { build, root } from './build.mjs';

await build();
const routes = new Map(pages.map(page => [page.path, page]));
const titles = new Set();
let links = 0;
let bytes = 0;
for (const page of pages) {
  const file = join(root, 'dist', page.path === '/' ? 'index.html' : page.path.slice(1) + 'index.html');
  const html = await readFile(file, 'utf8');
  bytes += Buffer.byteLength(html);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, page.path + ': exactly one h1');
  assert(!titles.has(page.title), 'Unique page title: ' + page.title);
  titles.add(page.title);
  assert(!/\{\{[A-Z_]+\}\}/.test(html), 'No unresolved code snippets');
  assert(html.includes('id="main"'), 'Skip-link target is present');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, page.path + ': unique element ids');
  for (const [, attribute, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|data:)/.test(value)) continue;
    const [pathname, hash] = value.split('#');
    const targetPath = pathname || page.path;
    if (targetPath.startsWith('/assets/')) {
      await stat(resolve(root, 'dist', targetPath.slice(1)));
    } else {
      assert(routes.has(targetPath), page.path + ': valid ' + attribute + ' ' + value);
      if (hash) {
        const target = routes.get(targetPath);
        assert(hash === 'main' || target.body.includes('id="' + hash + '"'), page.path + ': anchor ' + value);
      }
    }
    links++;
  }
}
const css = Buffer.concat(await Promise.all(['styles.css','theme.css','depth.css','intro.css','how.css'].map(file => readFile(join(root, 'dist/assets',file)))));
const js = await readFile(join(root, 'dist/assets/site.js'));
assert(js.byteLength < 4096, 'Core JavaScript stays below 4 KiB');
const particles = await readFile(join(root, 'dist/assets/particles.js'));
const clocks = await readFile(join(root, 'dist/assets/clocks.js'));
const motion = await readFile(join(root, 'dist/assets/motion.js'));
const how = Buffer.concat(await Promise.all(['how.js', 'how-progress.js'].map(file => readFile(join(root, 'dist/assets', file)))));
const intro = await readFile(join(root, 'dist/assets/intro.js'));
const commonBytes = js.byteLength + particles.byteLength + motion.byteLength + intro.byteLength;
assert(commonBytes + clocks.byteLength < 16384, 'Homepage JavaScript stays below 16 KiB');
assert(commonBytes + how.byteLength < 20480, 'How? plus the shared brand intro stays below 20 KiB');
for (const page of pages) {
  const html = await readFile(join(root, 'dist', page.path === '/' ? 'index.html' : page.path.slice(1) + 'index.html'), 'utf8');
  assert(html.includes('href="/how/"'), page.path + ': How? is in the shared navigation');
  assert.equal(html.includes('src="/assets/how.js"'), page.path === '/how/', 'Load 3D code only on How?');
}
await import('./check-how.mjs');
await import('./check-intro.mjs');
console.log('PASS: ' + pages.length + ' pages; ' + links + ' local links/assets; unique titles/headings/ids; anchor targets.');
console.log('Payload: CSS ' + css.byteLength + ' B; common JS ' + commonBytes + ' B; homepage JS ' + (commonBytes + clocks.byteLength) + ' B; How? JS ' + (commonBytes + how.byteLength) + ' B; all HTML ' + bytes + ' B (uncompressed).');
