// Top imports if not present:
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inside request handler:
if (req.url === '/docs' || req.url === '/openapi.html') {
  const html = await readFile(join(__dirname, 'openapi.html'), 'utf8');
  res.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(html);
  return;
}

if (req.url === '/openapi.yaml') {
  const yaml = await readFile(join(__dirname, 'openapi.yaml'), 'utf8');
  res.writeHead(200, {
    'content-type': 'application/yaml; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(yaml);
  return;
}
