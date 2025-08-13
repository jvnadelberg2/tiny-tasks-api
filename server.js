// server.js
// Tiny Tasks API — pure Node.js HTTP server with in-memory store + docs routes.
// Exports:
//   - createApp(): request handler function (for tests)
//   - start(port): starts http.Server and returns it (for prod/dev)

const { createServer } = require('node:http');
const { URL } = require('node:url');
const { readFile } = require('node:fs/promises');
const { extname, join } = require('node:path');

const ROOT = __dirname;

// In-memory store (demo)
const tasks = new Map(); // id -> { id, title, due, completed }

// Helpers
function send(res, status, body = '', headers = {}) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (body && typeof body !== 'string' && !Buffer.isBuffer(body)) {
    body = String(body);
  }
  res.end(body);
}

function json(res, status, body) {
  if (body == null) return send(res, status, '');
  return send(res, status, JSON.stringify(body), { 'content-type': 'application/json; charset=utf-8' });
}

function notFound(res, msg = 'Not found') {
  return json(res, 404, { error: msg });
}

function badRequest(res, msg = 'Invalid request body') {
  return json(res, 400, { error: msg });
}

function methodNotAllowed(res) {
  return json(res, 405, { error: 'Method not allowed' });
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      if (!data) return resolve({}); // treat empty body as {}
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(Symbol.for('INVALID_JSON'));
      }
    });
    req.on('error', () => resolve(Symbol.for('INVALID_JSON')));
  });
}

function isValidDateYYYYMMDD(s) {
  if (typeof s !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = new Date(s + 'T00:00:00Z');
  return !isNaN(t.getTime());
}

async function serveStatic(res, filePath) {
  // Minimal, safe static file serving for docs assets we explicitly allow.
  const allowed = new Set([
    join(ROOT, 'openapi.html'),
    join(ROOT, 'openapi.yaml'),
    join(ROOT, 'docs', 'site', 'openapi.html'), // optional secondary location
  ]);
  if (!allowed.has(filePath)) return notFound(res, 'Not found');

  let content;
  try {
    content = await readFile(filePath);
  } catch {
    return notFound(res, 'Not found');
  }

  const ext = extname(filePath);
  const ct =
    ext === '.html'
      ? 'text/html; charset=utf-8'
      : ext === '.yaml' || ext === '.yml'
      ? 'application/yaml; charset=utf-8'
      : 'application/octet-stream';
  return send(res, 200, content, { 'content-type': ct });
}

function createApp() {
  return async (req, res) => {
    const { method } = req;
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;

    // Health
    if (pathname === '/health') {
      if (method !== 'GET') return methodNotAllowed(res);
      return json(res, 200, { status: 'ok' });
    }

    // Docs
    if (pathname === '/docs') {
      if (method !== 'GET') return methodNotAllowed(res);
      // Prefer root openapi.html if present
      const file = join(ROOT, 'openapi.html');
      return serveStatic(res, file);
    }

    if (pathname === '/openapi.html') {
      if (method !== 'GET') return methodNotAllowed(res);
      return serveStatic(res, join(ROOT, 'openapi.html'));
    }

    if (pathname === '/openapi.yaml') {
      if (method !== 'GET') return methodNotAllowed(res);
      return serveStatic(res, join(ROOT, 'openapi.yaml'));
    }

    // Tasks collection
    if (pathname === '/tasks') {
      if (method === 'GET') {
        return json(res, 200, Array.from(tasks.values()));
      }

      if (method === 'POST') {
        const body = await parseBody(req);
        if (body === Symbol.for('INVALID_JSON')) return badRequest(res, 'Invalid request body');

        const { title, due, completed = false } = body || {};
        if (!title || !due || !isValidDateYYYYMMDD(due)) return badRequest(res, 'Invalid request body');

        const id = String(Date.now());
        const task = { id, title, due, completed: Boolean(completed) };
        tasks.set(id, task);
        return json(res, 201, task);
      }

      return methodNotAllowed(res);
    }

    // Task by ID
    if (pathname.startsWith('/tasks/')) {
      const id = pathname.slice('/tasks/'.length);
      if (!id) return notFound(res, 'Not found');

      if (method === 'GET') {
        const t = tasks.get(id);
        return t ? json(res, 200, t) : notFound(res, 'Task not found');
      }

      if (method === 'PUT') {
        const body = await parseBody(req);
        if (body === Symbol.for('INVALID_JSON')) return badRequest(res, 'Invalid request body');

        const t = tasks.get(id);
        if (!t) return notFound(res, 'Task not found');

        // Accept partial updates but enforce basic validation where provided
        if ('title' in body) {
          if (!body.title) return badRequest(res, 'Invalid request body');
          t.title = body.title;
        }
        if ('due' in body) {
          if (body.due === null || body.due === '') {
            t.due = '';
          } else if (!isValidDateYYYYMMDD(body.due)) {
            return badRequest(res, 'Invalid request body');
          } else {
            t.due = body.due;
          }
        }
        if ('completed' in body) {
          t.completed = Boolean(body.completed);
        }

        return json(res, 200, t);
      }

      if (method === 'DELETE') {
        const existed = tasks.delete(id);
        if (!existed) return notFound(res, 'Task not found');
        return send(res, 204, '');
      }

      return methodNotAllowed(res);
    }

    // Fallback
    return notFound(res, 'Route not found');
  };
}

function start(port = process.env.PORT ? Number(process.env.PORT) : 3000) {
  const handler = createApp();
  const server = createServer(handler);
  server.listen(port, () => {
    console.log(`Tiny Tasks API listening on http://localhost:${port}`);
  });
  return server;
}

// If run directly: start the server
if (require.main === module) {
  start();
}

// For tests and embedding
module.exports = { createApp, start };
