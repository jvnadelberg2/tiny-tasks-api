import http from 'node:http';

const tasks = [
  { id: 1, title: 'First Task', completed: false },
  { id: 2, title: 'Second Task', completed: true }
];

export function createServer() {
  return http.createServer((req, res) => {
    // Health check
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // List tasks
    if (req.url === '/tasks' && req.method === 'GET') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(tasks));
      return;
    }

    // Not found
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });
}

// Start the server only if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
