import { mkdir, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { layout } from '../src/components.mjs';
import { pages } from '../src/pages.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export async function build() {
  await mkdir(join(root, 'dist'), { recursive: true });
  await cp(join(root, 'src/assets'), join(root, 'dist/assets'), { recursive: true });
  for (const page of pages) {
    const target = join(root, 'dist', page.path === '/' ? 'index.html' : `${page.path.replace(/^\//, '')}index.html`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, layout(page));
  }
  await writeFile(join(root, 'dist/404.html'), layout({ title: 'Page not found', description: 'This page could not be found.', path: '/404/', body: '<section class="page-intro shell"><p class="eyebrow">404 / Off the beaten path</p><h1>This page is<br><em>out of range.</em></h1><p class="intro-copy">The address may have changed. Return to the journal to find your way.</p><a class="button" href="/">Back to BHSL <span aria-hidden="true">↗</span></a></section>' }));
  console.log(`Built ${pages.length} pages into dist.`);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await build();
