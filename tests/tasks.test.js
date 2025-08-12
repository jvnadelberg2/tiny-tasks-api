// tests/tasks.test.js
const { test } = require('node:test');
const http = require('node:http');
const request = require('supertest');
const { createApp } = require('../server.js');

test('tasks CRUD happy path', async () => {
  const server = http.createServer(createApp());
  try {
    // Create
    const createRes = await request(server)
      .post('/tasks')
      .send({ title: 'demo task', due: '2025-12-31' })
      .expect(201);
    const id = createRes.body.id;

    // List includes created
    await request(server)
      .get('/tasks')
      .expect(200)
      .expect((res) => {
        if (!Array.isArray(res.body) || !res.body.find((t) => t.id === id)) {
          throw new Error('Created task not in list');
        }
      });

    // Get by id
    await request(server)
      .get(`/tasks/${id}`)
      .expect(200)
      .expect((res) => {
        if (res.body.id !== id) throw new Error('ID mismatch');
      });

    // Update
    await request(server)
      .put(`/tasks/${id}`)
      .send({ title: 'updated', completed: true })
      .expect(200)
      .expect((res) => {
        if (!res.body.completed || res.body.title !== 'updated') {
          throw new Error('Update failed');
        }
      });

    // Delete
    await request(server).delete(`/tasks/${id}`).expect(204);

    // 404 after delete
    await request(server).get(`/tasks/${id}`).expect(404);
  } finally {
    server.close();
  }
});
