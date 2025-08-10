// server.js
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
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(tasks));
        return;
      }

      // Not found
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  });
}

// Only start when run directly (not during tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Docs:   http://localhost:${port}/docs`);
    console.log(`Health: http://localhost:${port}/health`);
    console.log(`Tasks:  http://localhost:${port}/tasks`);
  });
}

