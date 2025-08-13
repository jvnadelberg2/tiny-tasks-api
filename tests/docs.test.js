// tests/docs.test.js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const request = require('supertest');

const { createApp } = require('../server.js');

let server;

before(() => {
  server = http.createServer(createApp());
  server.listen(0);
});

after((t) => new Promise((resolve) => server.close(resolve)));

test('GET /docs (Redoc) returns HTML', async () => {
  const res = await request(server).get('/docs').expect(200);
  assert.match(res.headers['content-type'], /text\/html/);
  assert.match(res.text, /redoc/i);
});

test('GET /openapi.html returns HTML', async () => {
  const res = await request(server).get('/openapi.html').expect(200);
  assert.match(res.headers['content-type'], /text\/html/);
  assert.match(res.text, /redoc/i);
});

test('GET /openapi.yaml returns YAML', async () => {
  const res = await request(server).get('/openapi.yaml').expect(200);
  assert.match(res.headers['content-type'], /application\/yaml/);
  assert.ok(res.text.includes('openapi: 3.'));
});

test('GET /swagger-docs returns HTML when swagger.html exists', async (t) => {
  const swaggerPath = path.join(__dirname, '..', 'swagger.html');
  if (!fs.existsSync(swaggerPath)) {
    t.diagnostic('swagger.html not present; skipping swagger-docs test');
    return t.skip();
  }
  const res = await request(server).get('/swagger-docs').expect(200);
  assert.match(res.headers['content-type'], /text\/html/);
  assert.match(res.text, /SwaggerUIBundle/);
});