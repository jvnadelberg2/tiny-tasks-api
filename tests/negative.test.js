// tests/negative.test.js
const { test } = require('node:test');
const http = require('node:http');
const request = require('supertest');
const assert = require('node:assert/strict');
const { createApp } = require('../server.js');

test('OPTIONS preflight on /tasks → 200 with CORS headers', async () => {
  const server = http.createServer(createApp());
  try {
    const res = await request(server).options('/tasks').expect(200);
    assert.equal(res.headers['access-control-allow-origin'], '*');
    assert.match(res.headers['access-control-allow-methods'], /GET,POST,PUT,DELETE,OPTIONS/);
  } finally {
    server.close();
  }
});

test('PUT /tasks (no id) → 404 (route not found)', async () => {
  const server = http.createServer(createApp());
  try {
    const res = await request(server).put('/tasks').send({}).expect(404);
    assert.equal(res.body.error, 'Route not found');
  } finally {
    server.close();
  }
});

test('400 on POST /tasks with invalid JSON', async () => {
  const server = http.createServer(createApp());
  try {
    const res = await request(server)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title": "x" bad json}')
      .expect(400);
    assert.equal(res.body.error, 'Invalid request body');
  } finally {
    server.close();
  }
});

test('400 on POST /tasks with missing title', async () => {
  const server = http.createServer(createApp());
  try {
    const res = await request(server).post('/tasks').send({ due: '2025-12-31' }).expect(400);
    assert.equal(res.body.error, 'Field "title" is required');
  } finally {
    server.close();
  }
});

test('404s for missing id; PUT due=null removes field', async () => {
  const server = http.createServer(createApp());
  try {
    await request(server).get('/tasks/does-not-exist').expect(404);

    const create = await request(server).post('/tasks').send({ title: 't', due: '2025-12-31' }).expect(201);
    const id = create.body.id;

    const upd = await request(server).put(`/tasks/${id}`).send({ due: null, completed: false }).expect(200);
    // due is omitted when unset
    assert.ok(!Object.prototype.hasOwnProperty.call(upd.body, 'due'));
    assert.equal(upd.body.completed, false);

    await request(server).delete(`/tasks/${id}`).expect(204);
    await request(server).put(`/tasks/${id}`).send({ title: 'x' }).expect(404);
    await request(server).delete(`/tasks/${id}`).expect(404);
  } finally {
    server.close();
  }
});

test('404 fallback route', async () => {
  const server = http.createServer(createApp());
  try {
    const res = await request(server).get('/not-a-route').expect(404);
    assert.equal(res.body.error, 'Route not found');
  } finally {
    server.close();
  }
});
