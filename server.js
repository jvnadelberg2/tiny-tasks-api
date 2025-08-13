// server.js
// Tiny Tasks API — pure Node.js HTTP server with in-memory store + docs & CORS.

const { createServer } = require('node:http');
const { URL } = require('node:url');
const { readFile } = require('node:fs/promises');
const { join, extname } = require('node:path');

const ROOT = __dirname;
const INVALID_JSON = Symbol('INVALID_JSON');

// In-memory tasks: id -> { id, title, completed, [due] }
const tasks = new Map();

// ---------- helpers ----------
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
}

function send(res, status, body = '', headers = {}) {
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.statusCode = status;
  if (body && typeof body !== 'string' && !Buffer.isBuffer(body)) body = String(body);
  res.end(body);
}

function json(res, status, obj) {
  setCors(res);
  return obj == null
    ? send(res, status, '')
    : send(res, status, JSON.stringify(obj), { 'content-type': 'application/json; charset=utf-8' });
}

function notFound(res, msg = 'Route not found') { return json(res, 404, { error: msg }); }
function badRequest(res, msg = 'Invalid request body') { return json(res, 400, { error: msg }); }
function methodNotAllowed(res) { return json(res, 405, { error: 'Method not allowed' }); }

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      if (!data) return resolve({}); // treat empty body as {}
      try { resolve(JSON.parse(data)); } catch { resolve(INVALID_JSON); }
    });
    req.on('error', () => resolve(INVALID_JSON));
  });
}

function isValidDateYYYYMMDD(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(t.getTime());
}

async function serveStatic(res, filePath, method = 'GET') {
  const allowed = new Set([
    join(ROOT, 'openapi.html'),
    join(ROOT, 'openapi.yaml'),
    join(ROOT, 'swagger.html'),
    join(ROOT, 'docs', 'site', 'openapi.html'), // optional extra
  ]);
  if (!allowed.has(filePath)) return notFound(res, 'Not found');

  let content;
  try { content = await readFile(filePath); }
  catch { return notFound(res, 'Not found'); }

  const ext = extname(filePath);
  const ct =
    ext === '.html' ? 'text/html; charset=utf-8'
    : (ext === '.yaml' || ext === '.yml') ? 'application/yaml; charset=utf-8'
    : 'application/octet-stream';

  setCors(res);
  res.statusCode = 200;
  res.setHeader('content-type', ct);
  res.setHeader('content-length', content.length);
  if (method === 'HEAD') return res.end();
  return res.end(content);
}

// ---------- app ----------
function createApp() {
  return async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const { pathname } = url;
    const method = req.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      setCors(res);
      return send(res, 200, '');
    }

    // health
    if (pathname === '/health') {
      if (method !== 'GET') return methodNotAllowed(res);
      return json(res, 200, { status: 'ok' });
    }

    // docs (Redoc, raw spec, Swagger UI)
    if (pathname === '/docs') {
      if (method !== 'GET' && method !== 'HEAD') return methodNotAllowed(res);
      return serveStatic(res, join(ROOT, 'openapi.html'), method);
    }
    if (pathname === '/openapi.html') {
      if (method !== 'GET' && method !== 'HEAD') return methodNotAllowed(res);
      return serveStatic(res, join(ROOT, 'openapi.html'), method);
    }
    if (pathname === '/openapi.yaml') {
      if (method !== 'GET' && method !== 'HEAD') return methodNotAllowed(res);
      return serveStatic(res, join(ROOT, 'openapi.yaml'), method);
    }
    if (pathname === '/swagger-docs' || pathname === '/swagger.html') {
      if (method !== 'GET' && method !== 'HEAD') return methodNotAllowed(res);
      return serveStatic(res, join(ROOT, 'swagger.html'), method);
    }

    // /tasks collection
    if (pathname === '/tasks') {
      if (method === 'GET') {
        return json(res, 200, Array.from(tasks.values()));
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        if (body === INVALID_JSON) return badRequest(res, 'Invalid request body');

        const { title, due, completed = false } = body || {};
        if (!title) return json(res, 400, { error: 'Field "title" is required' });

        // due is optional on create; if present, validate; null/"" means omit field
        if (Object.prototype.hasOwnProperty.call(body, 'due')) {
          if (due !== null && due !== '' && !isValidDateYYYYMMDD(due)) {
            return badRequest(res, 'Invalid request body');
          }
        }

        const id = String(Date.now());
        const task = { id, title, completed: Boolean(completed) };
        if (Object.prototype.hasOwnProperty.call(body, 'due') && due !== null && due !== '') {
          task.due = due;
        }
        tasks.set(id, task);
        return json(res, 201, task);
      }
      // tests expect PUT /tasks -> 404 (not 405)
      return notFound(res, 'Route not found');
    }

    // /tasks/{id}
    if (pathname.startsWith('/tasks/')) {
      const id = pathname.slice('/tasks/'.length);
      if (!id) return notFound(res);

      if (method === 'GET') {
        const t = tasks.get(id);
        return t ? json(res, 200, t) : notFound(res, 'Task not found');
      }

      if (method === 'PUT') {
        const body = await parseBody(req);
        if (body === INVALID_JSON) return badRequest(res, 'Invalid request body');

        const t = tasks.get(id);
        if (!t) return notFound(res, 'Task not found');

        if ('title' in body) {
          if (!body.title) return badRequest(res, 'Invalid request body');
          t.title = body.title;
        }
        if ('due' in body) {
          if (body.due === null || body.due === '') {
            delete t.due; // remove field entirely
          } else if (!isValidDateYYYYMMDD(body.due)) {
            return badRequest(res, 'Invalid request body');
          } else {
            t.due = body.due;
          }
        }
        if ('completed' in body) t.completed = Boolean(body.completed);

        return json(res, 200, t);
      }

      if (method === 'DELETE') {
        const existed = tasks.delete(id);
        if (!existed) return notFound(res, 'Task not found');
        return send(res, 204, '');
      }

      if (method === 'PATCH' || method === 'POST') {
        // explicitly disallowed per tests
        return methodNotAllowed(res);
      }

      return methodNotAllowed(res);
    }

    // fallback
    return notFound(res, 'Route not found');
  };
}

function start(port = process.env.PORT ? Number(process.env.PORT) : 3000) {
  const server = createServer(createApp());
  server.listen(port, () => {
    console.log(`Tiny Tasks API listening on http://localhost:${port}`);
  });
  return server;
}

if (require.main === module) start();

module.exports = { createApp, start };
