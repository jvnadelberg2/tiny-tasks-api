// server.js
// Tiny Tasks API — CommonJS, no dependencies.

const http = require('node:http');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { URL } = require('node:url');

const tasks = [];

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  res.end(body);
}
function notFound(res) { sendJson(res, 404, { error: 'Not Found' }); }
function badRequest(res, msg = 'Bad Request') { sendJson(res, 400, { error: msg }); }
function methodNotAllowed(res, allow) { res.writeHead(405, { allow }); res.end(); }
function nextId() { return tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1; }
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => {
      data += c;
      if (data.length > 1e6) { req.destroy(); reject(new Error('Payload too large')); }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const { pathname } = url;

      // Docs HTML
      if ((pathname === '/docs' || pathname === '/openapi.html') && req.method === 'GET') {
        const html = await readFile(join(__dirname, 'openapi.html'), 'utf8');
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        return res.end(html);
      }

      // OpenAPI YAML
      if (pathname === '/openapi.yaml' && req.method === 'GET') {
        const yaml = await readFile(join(__dirname, 'openapi.yaml'), 'utf8');
        res.writeHead(200, { 'content-type': 'application/yaml; charset=utf-8', 'cache-control': 'no-store' });
        return res.end(yaml);
      }

      // Health
      if (pathname === '/health' && req.method === 'GET') {
        return sendJson(res, 200, { status: 'ok' });
      }

      // Collection: /tasks
      if (pathname === '/tasks') {
        if (req.method === 'GET') {
          return sendJson(res, 200, tasks);
        }
        if (req.method === 'POST') {
          let body;
          try { body = await readJsonBody(req); } catch (e) { return badRequest(res, e.message); }
          const title = typeof body.title === 'string' ? body.title.trim() : '';
          if (!title) return badRequest(res, 'title is required');
          const due = body.due !== undefined ? String(body.due) : undefined;
          const completed = body.completed === true;
          const task = { id: nextId(), title, completed };
          if (due !== undefined) task.due = due;
          tasks.push(task);
          res.writeHead(201, { 'content-type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify(task));
        }
        return methodNotAllowed(res, 'GET, POST');
      }

      // Item: /tasks/{id}
      const m = pathname.match(/^\/tasks\/(\d+)$/);
      if (m) {
        const id = Number(m[1]);
        const idx = tasks.findIndex(t => t.id === id);

        if (req.method === 'GET') {
          if (idx === -1) return notFound(res);
          return sendJson(res, 200, tasks[idx]);
        }

        if (req.method === 'PUT') {
          if (idx === -1) return notFound(res);
          let body;
          try { body = await readJsonBody(req); } catch (e) { return badRequest(res, e.message); }
          if (body.title !== undefined) {
            if (typeof body.title !== 'string' || !body.title.trim()) return badRequest(res, 'title must be a non-empty string');
            tasks[idx].title = body.title.trim();
          }
          if (body.due !== undefined) tasks[idx].due = String(body.due);
          if (body.completed !== undefined) {
            if (typeof body.completed !== 'boolean') return badRequest(res, 'completed must be boolean');
            tasks[idx].completed = body.completed;
          }
          return sendJson(res, 200, tasks[idx]);
        }

        if (req.method === 'DELETE') {
          if (idx === -1) return notFound(res);
          tasks.splice(idx, 1);
          res.writeHead(204).end();
          return;
        }

        return methodNotAllowed(res, 'GET, PUT, DELETE');
      }

      // Fallback
      return notFound(res);
    } catch (err) {
      console.error(err);
      return sendJson(res, 500, { error: 'Internal Server Error' });
    }
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Health: http://localhost:${port}/health`);
    console.log(`Tasks:  http://localhost:${port}/tasks`);
    console.log(`Docs:   http://localhost:${port}/docs`);
  });
}

module.exports = { createServer };
