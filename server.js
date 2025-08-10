// server.js
// Tiny Tasks API
// A minimal Node.js API with built-in Redoc documentation.
// Demonstrates how to implement and document a self-contained API using only Node core modules.

import http from 'node:http';            // HTTP server functionality
import { readFile } from 'node:fs/promises'; // Promise-based file reading
import { fileURLToPath } from 'node:url';    // Convert module URL to file path
import { dirname, join } from 'node:path';  // Path utilities for resolving file locations

// Resolve absolute file and directory paths for the current module.
// This is needed so we can serve local files like openapi.html and openapi.yaml.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory demo dataset for the /tasks endpoint.
// In a real API this would come from a database or external service.
const tasks = [
  { id: 1, title: 'First Task', completed: false },
  { id: 2, title: 'Second Task', completed: true }
];

/**
 * Factory function to create and return an HTTP server instance.
 * This function can be imported and used in tests without automatically starting the server.
 */
export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      // ---- Serve API documentation HTML (Redoc UI) ----
      if ((req.url === '/docs' || req.url === '/openapi.html') && req.method === 'GET') {
        const html = await readFile(join(__dirname, 'openapi.html'), 'utf8');
        res.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store'
        });
        res.end(html);
        return;
      }

      // ---- Serve the raw OpenAPI YAML specification ----
      if (req.url === '/openapi.yaml' && req.method === 'GET') {
        const yaml = await readFile(join(__dirname, 'openapi.yaml'), 'utf8');
        res.writeHead(200, {
          'content-type': 'application/yaml; charset=utf-8',
          'cache-control': 'no-store'
        });
        res.end(yaml);
        return;
      }

      // ---- Health check endpoint ----
      // Returns HTTP 200 with a JSON payload indicating the service is running.
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }

      // ---- Tasks endpoint ----
      // Returns the current list of demo tasks in JSON format.
      if (req.url === '/tasks' && req.method === 'GET') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(tasks));
        return;
      }

      // ---- Fallback for unknown routes ----
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));

    } catch (err) {
      // ---- Error handling ----
      console.error(err);
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  });
}

// ---- Server entry point ----
// Only start listening when this file is run directly via `node server.js`.
// This prevents the server from starting automatically during imports (e.g., in tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Docs:   http://localhost:${port}/docs`);
    console.log(`Health: http://localhost:${port}/health`);
    console.log(`Tasks:  http://localhost:${port}/tasks`);
  });
}
