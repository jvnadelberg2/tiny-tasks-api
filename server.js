const http = require('http');
const { URL } = require('url');

const tasks = [];

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => (data += c));
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    // CORS for easy testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (method === 'OPTIONS') return res.end();

    try {
      if (method === 'GET' && path === '/health') return json(res, 200, { status: 'ok' });
      if (method === 'GET' && path === '/tasks') return json(res, 200, tasks);

      if (method === 'POST' && path === '/tasks') {
        const body = await parseBody(req);
        if (!body || typeof body.title !== 'string' || !body.title.trim()) {
          return json(res, 400, { error: 'title (non-empty string) is required' });
        }
        const task = { id: tasks.length + 1, title: body.title.trim(), done: false };
        tasks.push(task);
        return json(res, 201, task);
      }

      if (path.startsWith('/tasks/')) {
        const id = Number(path.split('/')[2]);
        if (method === 'GET') {
          const t = tasks.find(t => t.id === id);
          return t ? json(res, 200, t) : json(res, 404, { error: 'not found' });
        }
        if (method === 'DELETE') {
          const i = tasks.findIndex(t => t.id === id);
          if (i === -1) return json(res, 404, { error: 'not found' });
          const [removed] = tasks.splice(i, 1);
          return json(res, 200, removed);
        }
      }

      res.writeHead(404); res.end();
    } catch (err) {
      json(res, 500, { error: 'internal_error', details: String(err && err.message || err) });
    }
  });
}

module.exports = { createServer, _internal: { tasks } };
