import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { extname, join, normalize, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(__filename);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

const server = createServer((req, res) => {
  const url = req.url.split('?')[0];
  let rel  = url === '/' ? '/index.html' : url;
  let full = resolve(ROOT, '.' + normalize(rel));

  // Security: disallow path traversal outside root
  if (!full.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  // Directory → index.html
  if (existsSync(full) && statSync(full).isDirectory()) {
    full = join(full, 'index.html');
  }

  if (!existsSync(full)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + rel);
    return;
  }

  const ext  = extname(full).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const body = readFileSync(full);
  res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
  res.end(body);
});

const PORT = 3000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Luminary Gallery dev server`);
  console.log(`  http://localhost:${PORT}\n`);
});
