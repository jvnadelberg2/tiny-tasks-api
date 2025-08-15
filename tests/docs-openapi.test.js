// Node test runner + supertest
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../server');

test('GET /docs → 200 HTML (Redoc)', async () => {
  const app = createApp();
  const res = await request(app).get('/docs');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'] || '', /html/);
});

test('GET /openapi.html → 200 HTML (static Redoc)', async () => {
  const app = createApp();
  const res = await request(app).get('/openapi.html');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'] || '', /html/);
});

test('GET /swagger-docs → 200 HTML when swagger.html present', async () => {
  const app = createApp();
  const res = await request(app).get('/swagger-docs');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'] || '', /html/);
});

test('GET /openapi.yaml → 200 and contains openapi header', async () => {
  const app = createApp();
  const res = await request(app).get('/openapi.yaml');
  assert.equal(res.status, 200);
  assert.match(res.text, /^openapi:\s*3\./m);
});
