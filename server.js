// server.js
//
// Tiny Tasks API — dependency-free Node.js HTTP server with built-in docs,
// CORS on /tasks*, strict JSON handling, simple pluggable storage, and exports
// for test and programmatic use.

const http = require('http');
const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');
const { URL } = require('url');
const { createStorage } = require('./storage');

/* ------------------------- Config ------------------------- */

const DEFAULT_PORT = Number(process.env.PORT || 3000);
const PROJECT_ROOT = resolve(__dirname);
const OPENAPI_PATH = resolve(PROJECT_ROOT, 'openapi.yaml');
const SWAGGER_HTML_PATH = resolve(PROJECT_ROOT, 'swagger.html');

// Storage selection via env
const STORAGE_DRIVER = process.env.STORAGE || 'memory';
const TASKS_JSON_PATH = process.env.TASKS_JSON_PATH || resolve(PROJECT_ROOT, 'data', 'tasks.json');
const TASKS_SQLITE_PATH =
  process.env.TASKS_SQLITE_PATH || resolve(PROJECT_ROOT, 'data', 'tasks.db');

// Instantiate storage once per process
const storage = createStorage({
  driver: STORAGE_DRIVER,
  jsonPath: TASKS_JSON_PATH,
  sqlitePath: TASKS_SQLITE_PATH,
});

// Dynamic getters so tests can adjust limits via env
function getMaxBodyBytes() {
  const n = Number(process.env.MAX_BODY_BYTES);
  return Number.isFinite(n) && n > 0 ? n : 10 * 1024; // 10KB default
}
function getMaxTitleLen() {
  const n = Number(process.env.MAX_TITLE_LEN);
  return Number.isFinite(n) && n > 0 ? n : 200;
}
function logEnabled() {
  return process.env.LOG_JSON === '1';
}

/* --------------------- Utilities: HTTP -------------------- */

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function isJsonContentType(req) {
  const ct = req.headers['content-type'] || '';
  return ct === 'application/json' || ct.startsWith('application/json;');
}

function applyCors(res) {
  // Permissive CORS for /tasks* (can later be gated by env)
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('access-control-allow-headers', 'Content-Type, Accept');
}

function readJsonBody(req, res, maxBytes = getMaxBodyBytes()) {
  return new Promise((resolveBody, rejectBody) => {
    let total = 0;
    const chunks = [];
    let tooLarge = false;

    function onData(chunk) {
      if (tooLarge) return;
      total += chunk.length;
      if (total > maxBytes) {
        tooLarge = true;
        // Stop accumulating; respond 413 without killing the socket
        req.off('data', onData);
        req.on('data', () => {}); // drain remaining
        sendError(res, 413, 'Payload too large');
        rejectBody(new Error('PAYLOAD_TOO_LARGE'));
        return;
      }
      chunks.push(chunk);
    }

    req.on('data', onData);

    req.on('end', () => {
      if (tooLarge) return; // response already sent
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        const obj = raw ? JSON.parse(raw) : {};
        resolveBody(obj);
      } catch {
        sendError(res, 400, 'Malformed JSON');
        rejectBody(new Error('BAD_JSON'));
      }
    });

    req.on('error', (err) => {
      try { sendError(res, 400, 'Bad request'); } catch {}
      rejectBody(err);
    });
  });
}

/* --------------------- Validation Helpers ----------------- */

function isValidDateYYYYMMDD(s) {
  if (typeof s !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map((n) => Number(n));
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function firstUnknownKey(obj, allowed) {
  const allowedSet = new Set(allowed);
  for (const k of Object.keys(obj || {})) {
    if (!allowedSet.has(k)) return k;
  }
  return null;
}

function validateCreatePayload(body) {
  if (!body || typeof body !== 'object') return 'Body must be a JSON object';

  const unknown = firstUnknownKey(body, ['title', 'due', 'completed']);
  if (unknown) return `Unknown field "${unknown}"`;

  const { title, due, completed } = body;

  if (typeof title !== 'string' || title.trim() === '') {
    return 'Field "title" is required and must be a non-empty string';
  }
  if (title.trim().length > getMaxTitleLen()) {
    return `Field "title" must be at most ${getMaxTitleLen()} characters`;
  }

  if (!isValidDateYYYYMMDD(due)) {
    return 'Field "due" is required and must be in YYYY-MM-DD format';
  }

  if (typeof completed !== 'undefined' && typeof completed !== 'boolean') {
    return 'Field "completed", if provided, must be a boolean';
  }

  return null;
}

function validateUpdatePayload(body) {
  if (!body || typeof body !== 'object') return 'Body must be a JSON object';

  const unknown = firstUnknownKey(body, ['title', 'due', 'completed']);
  if (unknown) return `Unknown field "${unknown}"`;

  const { title, due, completed } = body;

  if (
    typeof title === 'undefined' &&
    typeof due === 'undefined' &&
    typeof completed === 'undefined'
  ) {
    return 'At least one of "title", "due", or "completed" must be provided';
  }

  if (
    typeof title !== 'undefined' &&
    (typeof title !== 'string' || title.trim() === '')
  ) {
    return 'If provided, "title" must be a non-empty string';
  }
  if (typeof title === 'string' && title.trim().length > getMaxTitleLen()) {
    return `If provided, "title" must be at most ${getMaxTitleLen()} characters`;
  }

  if (typeof due !== 'undefined' && !isValidDateYYYYMMDD(due)) {
    return 'If provided, "due" must be in YYYY-MM-DD format';
  }

  if (typeof completed !== 'undefined' && typeof completed !== 'boolean') {
    return 'If provided, "completed" must be a boolean';
  }

  return null;
}

/* --------------------- Logging (opt-in) ------------------- */

function nowMs() { return Date.now(); }
function logJson(obj) {
  if (!logEnabled()) return;
  try { process.stdout.write(JSON.stringify(obj) + '\n'); } catch {}
}

/* ------------------------- Router ------------------------- */

async function handleRequest(req, res) {
  const start = nowMs();

  res.__log = (extra) => {
    const duration_ms = nowMs() - start;
    const base = {
      ts: new Date(start).toISOString(),
      method: req.method,
      path: req.url,
      status: res.statusCode || 0,
      duration_ms,
      remote: req.socket && req.socket.remoteAddress,
    };
    logJson(Object.assign(base, extra || {}));
  };

  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  const allow = (methods) => {
    res.setHeader('allow', methods.join(', '));
    return sendError(res, 405, 'Method not allowed');
  };

  // /health
  if (pathname === '/health') {
    if (req.method !== 'GET') return allow(['GET']);
    sendJson(res, 200, { status: 'ok' });
    res.__log({ route: '/health' });
    return;
  }

  // /openapi.yaml
  if (pathname === '/openapi.yaml') {
    if (req.method !== 'GET') return allow(['GET']);
    if (!existsSync(OPENAPI_PATH)) {
      sendError(res, 404, 'Not found');
      res.__log({ route: '/openapi.yaml', error: 'missing openapi.yaml' });
      return;
    }
    try {
      const body = readFileSync(OPENAPI_PATH);
      res.writeHead(200, {
        'content-type': 'application/yaml; charset=utf-8',
        'content-length': body.length,
      });
      res.end(body);
      res.__log({ route: '/openapi.yaml', bytes: body.length });
      return;
    } catch (e) {
      sendError(res, 500, 'Internal server error');
      res.__log({ route: '/openapi.yaml', error: String(e && e.message) });
      return;
    }
  }

  // /openapi.html (alias pointing to docs/spec)
  if (pathname === '/openapi.html') {
    if (req.method !== 'GET') return allow(['GET']);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>OpenAPI</title></head><body><p>See <a href="/docs">/docs</a> (Redoc) or download <a href="/openapi.yaml">openapi.yaml</a>.</p></body></html>`;
    const buf = Buffer.from(html, 'utf8');
    res.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'content-length': buf.length,
    });
    res.end(buf);
    res.__log({ route: '/openapi.html', bytes: buf.length });
    return;
  }

  // /swagger-docs (serves swagger.html if present)
  if (pathname === '/swagger-docs') {
    if (req.method !== 'GET') return allow(['GET']);
    if (!existsSync(SWAGGER_HTML_PATH)) {
      sendError(res, 404, 'Not found');
      res.__log({ route: '/swagger-docs', error: 'missing swagger.html' });
      return;
    }
    try {
      const body = readFileSync(SWAGGER_HTML_PATH);
      res.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'content-length': body.length,
      });
      res.end(body);
      res.__log({ route: '/swagger-docs', bytes: body.length });
      return;
    } catch (e) {
      sendError(res, 500, 'Internal server error');
      res.__log({ route: '/swagger-docs', error: String(e && e.message) });
      return;
    }
  }

  // /docs (Redoc page)
  if (pathname === '/docs') {
    if (req.method !== 'GET') return allow(['GET']);
    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Tiny Tasks API Docs</title>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <style>
      body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
      redoc { height: 100vh; }
    </style>
  </head>
  <body>
    <redoc spec-url="/openapi.yaml"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>`;
    const buf = Buffer.from(html, 'utf8');
    res.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'content-length': buf.length,
    });
    res.end(buf);
    res.__log({ route: '/docs', bytes: buf.length });
    return;
  }

  // CORS preflight for /tasks and /tasks/:id
  if (req.method === 'OPTIONS' && (pathname === '/tasks' || pathname.startsWith('/tasks/'))) {
    applyCors(res);
    res.writeHead(200, { 'content-length': 0 });
    res.end();
    res.__log({ route: 'OPTIONS preflight' });
    return;
  }

  // Ensure PATCH /tasks returns 405 (not 404)
  if (pathname === '/tasks' && !['GET', 'POST', 'OPTIONS'].includes(req.method)) {
    applyCors(res);
    return allow(['GET', 'POST']);
  }

  // /tasks and /tasks/:id
  if (pathname === '/tasks' || pathname.startsWith('/tasks/')) {
    applyCors(res);

    const parts = pathname.split('/').filter(Boolean); // ['tasks'] or ['tasks','id']
    const id = parts[1];

    // GET /tasks
    if (pathname === '/tasks' && req.method === 'GET') {
      const data = storage.list();
      sendJson(res, 200, data);
      res.__log({ route: 'GET /tasks', count: data.length });
      return;
    }

    // POST /tasks
    if (pathname === '/tasks' && req.method === 'POST') {
      if (!isJsonContentType(req)) {
        sendError(res, 415, 'Unsupported Media Type: application/json required');
        res.__log({ route: 'POST /tasks', error: '415 content-type' });
        return;
      }
      let body;
      try {
        body = await readJsonBody(req, res);
      } catch {
        res.__log({ route: 'POST /tasks', error: 'bad json / too large' });
        return; // error already sent
      }
      const err = validateCreatePayload(body);
      if (err) {
        sendError(res, 400, err);
        res.__log({ route: 'POST /tasks', error: err });
        return;
      }

      const task = storage.create({
        title: body.title.trim(),
        due: body.due,
        completed: typeof body.completed === 'boolean' ? body.completed : false,
      });
      sendJson(res, 201, task);
      res.__log({ route: 'POST /tasks', id: task.id });
      return;
    }

    // All id-based routes require an id
    if (!id) {
      if (req.method === 'GET') {
        const data = storage.list();
        sendJson(res, 200, data);
        res.__log({ route: 'GET /tasks', count: data.length });
        return;
      }
      sendError(res, 404, 'Not found');
      res.__log({ route: `${req.method} /tasks`, error: 'missing id' });
      return;
    }

    const existing = storage.get(id);

    if (req.method === 'GET') {
      if (!existing) {
        sendError(res, 404, 'Not found');
        res.__log({ route: `GET /tasks/${id}`, error: 'not found' });
        return;
      }
      sendJson(res, 200, existing);
      res.__log({ route: `GET /tasks/${id}` });
      return;
    }

    if (req.method === 'PUT') {
      if (!isJsonContentType(req)) {
        sendError(res, 415, 'Unsupported Media Type: application/json required');
        res.__log({ route: `PUT /tasks/${id}`, error: '415 content-type' });
        return;
      }
      let body;
      try {
        body = await readJsonBody(req, res);
      } catch {
        res.__log({ route: `PUT /tasks/${id}`, error: 'bad json / too large' });
        return; // error already sent
      }
      if (!existing) {
        sendError(res, 404, 'Not found');
        res.__log({ route: `PUT /tasks/${id}`, error: 'not found' });
        return;
      }
      const err = validateUpdatePayload(body);
      if (err) {
        sendError(res, 400, err);
        res.__log({ route: `PUT /tasks/${id}`, error: err });
        return;
      }

      const updated = storage.update(id, {
        ...(typeof body.title !== 'undefined' ? { title: body.title.trim() } : {}),
        ...(typeof body.due !== 'undefined' ? { due: body.due } : {}),
        ...(typeof body.completed !== 'undefined' ? { completed: body.completed } : {}),
      });
      sendJson(res, 200, updated);
      res.__log({ route: `PUT /tasks/${id}` });
      return;
    }

    if (req.method === 'DELETE') {
      if (!existing) {
        sendError(res, 404, 'Not found');
        res.__log({ route: `DELETE /tasks/${id}`, error: 'not found' });
        return;
      }
      storage.delete(id);
      res.writeHead(204);
      res.end();
      res.__log({ route: `DELETE /tasks/${id}` });
      return;
    }

    // Unsupported method on /tasks or /tasks/:id
    if (pathname === '/tasks') return allow(['GET', 'POST']);
    return allow(['GET', 'PUT', 'DELETE']);
  }

  // 404 for all other routes
  sendError(res, 404, 'Not found');
  res.__log({ route: pathname, error: '404' });
}

/* --------------------- Server Factory --------------------- */

function createServer() {
  return http.createServer((req, res) => {
    Promise.resolve(handleRequest(req, res)).catch((e) => {
      try {
        sendError(res, 500, 'Internal server error');
        if (res.__log) res.__log({ error: 'uncaught', detail: String(e && e.message) });
      } catch {}
    });
  });
}

/* -------------------- Exports & Startup ------------------- */

function start(port = DEFAULT_PORT) {
  const server = createServer();
  server.listen(port);
  return server;
}

module.exports = {
  createServer,
  createApp: createServer, // back-compat alias
  start,                   // back-compat helper
};

if (require.main === module) {
  const server = start(DEFAULT_PORT);
  if (logEnabled()) {
    try {
      process.stdout.write(JSON.stringify({ ts: new Date().toISOString(), msg: 'listening', port: DEFAULT_PORT }) + '\n');
    } catch {}
  } else {
    // eslint-disable-next-line no-console
    console.log(`Tiny Tasks API listening on http://localhost:${DEFAULT_PORT} (storage=${STORAGE_DRIVER})`);
  }
  process.on('SIGINT', () => server.close(() => process.exit(0)));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}
