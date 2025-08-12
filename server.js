// server.js
// Tiny Tasks API — pure Node.js HTTP server with in-memory store.
// Exports:
//   - createApp(): request handler function (for tests)
//   - start(port): starts http.Server and returns it (for prod/dev)

const { createServer } = require('node:http');
const { URL } = require('node:url');

// In-memory store (demo)
const tasks = new Map(); // id -> { id, title, due, completed }

// Helpers
function json(res, status, body) {
  const data = body == null ? '' : JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', Buffer.byteLength(data));
  res.end(data);
}

function notFound(res, msg = 'Not found') {
  json(res, 404, { error: msg });
}

function badRequest(res, msg = 'Bad request') {
  json(res, 400, { error: msg });
}

function methodNotAllowed(res) {
  json(res, 405, { error: 'Method not allowed' });
}

async function readJson(req) {
  return new Promise((resolve, reject) => {
    let buf = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => (buf += chunk));
    req.on('end', () => {
      if (buf.trim() === '') return resolve({});
      try {
        resolve(JSON.parse(buf));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function createApp() {
  return async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const { pathname, searchParams } = url;

    // Simple CORS for local dev/tests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.end();

    // Routes
    // Health
    if (pathname === '/health') {
      if (req.method !== 'GET') return methodNotAllowed(res);
      return json(res, 200, { status: 'ok' });
    }

    // /tasks
    if (pathname === '/tasks' && req.method === 'GET') {
      // Optional simple filters later; for now return all
      const list = Array.from(tasks.values());
      return json(res, 200, list);
    }

    if (pathname === '/tasks' && req.method === 'POST') {
      let body;
      try {
        body = await readJson(req);
      } catch {
        return badRequest(res, 'Invalid request body');
      }
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const due = typeof body.due === 'string' ? body.due.trim() : undefined;
      if (!title) return badRequest(res, 'Field "title" is required');
      const id = String(Date.now());
      const task = { id, title, due, completed: false };
      tasks.set(id, task);
      return json(res, 201, task);
    }

    // /tasks/{id}
    if (pathname.startsWith('/tasks/')) {
      const id = pathname.slice('/tasks/'.length);
      if (!id) return notFound(res, 'Task not found');

      if (req.method === 'GET') {
        const t = tasks.get(id);
        if (!t) return notFound(res, 'Task not found');
        return json(res, 200, t);
      }

      if (req.method === 'PUT') {
        let body;
        try {
          body = await readJson(req);
        } catch {
          return badRequest(res, 'Invalid request body');
        }
        const t = tasks.get(id);
        if (!t) return notFound(res, 'Task not found');

        if (typeof body.title === 'string') t.title = body.title.trim();
        if (typeof body.due === 'string' || body.due === null) t.due = body.due || undefined;
        if (typeof body.completed === 'boolean') t.completed = body.completed;

        tasks.set(id, t);
        return json(res, 200, t);
      }

      if (req.method === 'DELETE') {
        const existed = tasks.delete(id);
        if (!existed) return notFound(res, 'Task not found');
        res.statusCode = 204;
        return res.end();
      }

      return methodNotAllowed(res);
    }

    // Fallback
    return notFound(res, 'Route not found');
  };
}

function start(port = process.env.PORT || 3000) {
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
