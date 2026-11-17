import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { build, root } from './build.mjs';

await build();
const publicRoot = resolve(root, 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return;
    }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let target = resolve(publicRoot, `.${pathname}`);
    if (target !== publicRoot && !target.startsWith(publicRoot + sep)) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    if (pathname.endsWith('/')) target = resolve(target, 'index.html');
    else if (!extname(pathname)) {
      response.writeHead(308, { Location: `${pathname}/` }); response.end(); return;
    }
    let data;
    let status = 200;
    try { data = await readFile(target); }
    catch { data = await readFile(resolve(publicRoot, '404.html')); status = 404; }
    response.writeHead(status, {
      'Content-Type': status === 404 ? mime['.html'] : mime[extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'"
    });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(400); response.end('Bad request'); }
});
const port = Number(process.env.PORT || 4173);
server.listen(port, '127.0.0.1', () => console.log(`BHSL local preview: http://127.0.0.1:${port}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
