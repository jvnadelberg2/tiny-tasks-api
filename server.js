import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tasks = [
  { id: 1, title: 'First Task', completed: false },
  { id: 2, title: 'Second Task', completed: true }
];

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      // Serve API docs HTML
      if ((req.url === '/docs' || req.url === '/openapi.html') && req.method === 'GET') {
        const html = await readFile(join(__dirname, 'openapi.html'), 'utf8');
        res.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store'
        });
        res.end(html);
        return;
      }

      // Serve OpenAPI YAML
      if (req.url === '/openapi.yaml' && req.method === 'GET') {
        const yaml = await readFile(join(__dirname, 'openapi.yaml'), 'utf8');
        res.writeHead(200, {
          'content-type': 'application/yaml; charset=utf-8',
          'cache-control': 'no-store'
        });
        res.end(yaml);
        return;
      }

      // Health
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }

      // Tasks
      if (req.url === '/tasks' && req.method === 'GET') {
        res.writeHead(
