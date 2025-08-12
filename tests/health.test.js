// tests/health.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const request = require('supertest');
const { createApp } = require('../server.js');

test('GET /health returns 200 and { status: "ok" }', async () => {
  const server = http.createServer(createApp());
  try {
    await request(server)
      .get('/health')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ status: 'ok' });
  } finally {
    server.close();
  }
});
