// tests/one-more-branch.test.js
const { test } = require('node:test');
const http = require('node:http');
const request = require('supertest');
const { createApp } = require('../server.js');

test('PATCH /tasks/{id} → 405', async () => {
  const server = http.createServer(createApp());
  try {
    const create = await request(server).post('/tasks').send({ title: 't' }).expect(201);
    const id = create.body.id;
    await request(server).patch(`/tasks/${id}`).send({ title: 'x' }).expect(405);
  } finally {
    server.close();
  }
});