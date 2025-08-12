// tests/coverage-extra.test.js
const { test } = require('node:test');
const http = require('node:http');
const request = require('supertest');
const assert = require('node:assert/strict');
const { createApp, start } = require('../server.js');

test('start() boots a server and can be closed', async () => {
  const srv = start(0); // ephemeral port
  await new Promise((r) => srv.once('listening', r));
  await new Promise((r) => srv.close(r));
});

test('POST /tasks with no body triggers empty-body path and 400', async () => {
  const server = http.createServer(createApp());
  try {
    const res = await request(server).post('/tasks').expect(400);
    assert.equal(res.body.error, 'Field "title" is required');
  } finally {
    server.close();
  }
});

test('PUT /tasks/{id} with invalid JSON returns 400', async () => {
  const server = http.createServer(createApp());
  try {
    // create a task
    const create = await request(server).post('/tasks').send({ title: 't' }).expect(201);
    const id = create.body.id;

    // send invalid JSON
    const res = await request(server)
      .put(`/tasks/${id}`)
      .set('Content-Type', 'application/json')
      .send('{"title": "x" oops}')
      .expect(400);
    assert.equal(res.body.error, 'Invalid request body');
  } finally {
    server.close();
  }
});

test('POST /tasks/{id} → 405 Method not allowed', async () => {
  const server = http.createServer(createApp());
  try {
    // create a task to get a real id
    const create = await request(server).post('/tasks').send({ title: 't' }).expect(201);
    const id = create.body.id;

    const res = await request(server).post(`/tasks/${id}`).send({}).expect(405);
    assert.equal(res.body.error, 'Method not allowed');
  } finally {
    server.close();
  }
});
