// tests/health.test.js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server.js');

test('GET /health returns 200 and { status: "ok" }', async () => {
  const res = await request(app).get('/health');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { status: 'ok' });
});
