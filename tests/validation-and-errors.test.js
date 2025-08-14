// tests/item1.validation-and-errors.test.js
// Final coverage for Item 0 + Item 1 (aligned with compat server):
// - /health OK
// - Wrong content-type → 415 (use text/plain so Supertest doesn't auto-set JSON)
// - Malformed JSON → 400
// - Body size cap → 413 (no ECONNRESET)
// - Near-cap success
// - Validation errors (missing title, invalid due, title length)
// - Unknown fields rejected (POST/PUT)
// - Empty PUT rejected
// - Happy path CRUD
// - 404/405 with Allow headers
// - Edge date cases
// - LOG_JSON smoke

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createServer } = require('../server');
function app() { return createServer(); }

test('GET /health → 200 {status:"ok"}', async () => {
  const res = await request(app()).get('/health');
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['content-type'].startsWith('application/json'), true);
  assert.deepEqual(res.body, { status: 'ok' });
});

test('POST /tasks with wrong content-type → 415', async () => {
  const res = await request(app())
    .post('/tasks')
    .set('Content-Type', 'text/plain')
    .send('title=ok&due=2025-12-31');
  assert.equal(res.statusCode, 415);
  assert.ok(res.body && typeof res.body.error === 'string');
});

test('POST /tasks malformed JSON → 400', async () => {
  const res = await request(app())
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send('{"oops":');
  assert.equal(res.statusCode, 400);
  assert.ok(res.body && typeof res.body.error === 'string');
});

test('POST /tasks over MAX_BODY_BYTES → 413', async () => {
  process.env.MAX_BODY_BYTES = '20';
  const bigPayload = { title: 'x'.repeat(50), due: '2025-12-31' };
  const res = await request(app())
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send(bigPayload);
  assert.equal(res.statusCode, 413);
  assert.ok(res.body && typeof res.body.error === 'string');
  delete process.env.MAX_BODY_BYTES;
});

test('POST /tasks near-cap valid payload succeeds', async () => {
  process.env.MAX_BODY_BYTES = '200';
  const payload = { title: 'a'.repeat(100), due: '2025-12-31' };
  const res = await request(app())
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send(payload);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.title.length, 100);
  delete process.env.MAX_BODY_BYTES;
});

test('POST /tasks validation: missing title → 400', async () => {
  const res = await request(app())
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send({ due: '2025-12-31' });
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /title/i);
});

test('POST /tasks validation: invalid due → 400', async () => {
  const res = await request(app())
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send({ title: 'ok', due: '31-12-2025' });
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /YYYY-MM-DD/);
});

test('POST /tasks validation: title length bound → 400 when exceeded', async () => {
  process.env.MAX_TITLE_LEN = '10';
  const res = await request(app())
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send({ title: 'x'.repeat(11), due: '2025-12-31' });
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /at most/i);
  delete process.env.MAX_TITLE_LEN;
});

test('POST /tasks rejects unknown fields → 400', async () => {
  const res = await request(app())
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send({ title: 'ok', due: '2025-12-31', bogus: true });
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /Unknown field/i);
});

test('Edge date cases → 400', async () => {
  const badDates = ['2025-02-29', '2025-13-01', '2025-00-10', '2025-04-31', 'abcd-ef-gh'];
  for (const due of badDates) {
    const res = await request(app())
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send({ title: 'x', due });
    assert.equal(res.statusCode, 400, `due=${due}`);
  }
});

test('Happy path: create → get → update → delete', async () => {
  // Create
  let res = await request(app())
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send({ title: 'demo', due: '2025-12-31' });
  assert.equal(res.statusCode, 201);
  const id = res.body.id;

  // Get by id
  res = await request(app()).get(`/tasks/${id}`);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.id, id);

  // Update guard: wrong content-type
  res = await request(app()).put(`/tasks/${id}`).set('Content-Type', 'text/plain').send('title=updated');
  assert.equal(res.statusCode, 415);

  // Update unknown field rejected
  res = await request(app())
    .put(`/tasks/${id}`)
    .set('Content-Type', 'application/json')
    .send({ nope: 1 });
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /Unknown field/);

  // Update empty payload (no changes) rejected
  res = await request(app())
    .put(`/tasks/${id}`)
    .set('Content-Type', 'application/json')
    .send({});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /At least one/);

  // Update valid
  res = await request(app())
    .put(`/tasks/${id}`)
    .set('Content-Type', 'application/json')
    .send({ title: 'updated', completed: true });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.title, 'updated');
  assert.equal(res.body.completed, true);

  // Delete
  res = await request(app()).delete(`/tasks/${id}`);
  assert.equal(res.statusCode, 204);

  // Get after delete → 404
  res = await request(app()).get(`/tasks/${id}`);
  assert.equal(res.statusCode, 404);
  assert.ok(res.body && typeof res.body.error === 'string');
});

test('405 with Allow header: PATCH on /tasks → 405 Allow: GET, POST', async () => {
  const res = await request(app()).patch('/tasks');
  assert.equal(res.statusCode, 405);
  assert.match(String(res.headers['allow'] || ''), /GET/);
  assert.match(String(res.headers['allow'] || ''), /POST/);
});

test('405 with Allow header: PATCH on /tasks/:id → 405 Allow: GET, PUT, DELETE', async () => {
  const res = await request(app()).patch('/tasks/any');
  assert.equal(res.statusCode, 405);
  assert.match(String(res.headers['allow'] || ''), /GET/);
  assert.match(String(res.headers['allow'] || ''), /PUT/);
  assert.match(String(res.headers['allow'] || ''), /DELETE/);
});

test('Unknown route → 404 with {error}', async () => {
  const res = await request(app()).get('/nope');
  assert.equal(res.statusCode, 404);
  assert.ok(res.body && typeof res.body.error === 'string');
});

test('LOG_JSON smoke: enable and make one request (no assertions on stdout)', async () => {
  process.env.LOG_JSON = '1';
  const res = await request(app()).get('/health');
  assert.equal(res.statusCode, 200);
  delete process.env.LOG_JSON;
});