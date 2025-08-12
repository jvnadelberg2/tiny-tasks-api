const { test } = require('node:test');
const http = require('node:http');
const request = require('supertest');
const assert = require('node:assert/strict');
const { createApp } = require('../server.js');

test('PUT /tasks/{id} with empty body (no changes) and due:"" unsets due', async () => {
  const server = http.createServer(createApp());
  try {
    // Create a task with a due date
    const created = await request(server)
      .post('/tasks')
      .send({ title: 'edge', due: '2025-12-31' })
      .expect(201);
    const id = created.body.id;

    // PUT with no body -> 200, no required fields, should not crash
    const noBody = await request(server).put(`/tasks/${id}`).expect(200);
    assert.equal(noBody.body.id, id);

    // PUT with due:"" -> branch that clears due via falsy check
    const cleared = await request(server)
      .put(`/tasks/${id}`)
      .send({ due: '' })
      .expect(200);
    // due omitted when unset
    assert.ok(!Object.prototype.hasOwnProperty.call(cleared.body, 'due'));
  } finally {
    server.close();
  }
});
