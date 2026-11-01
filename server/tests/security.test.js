const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  app = require('../app');
});

test.after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('Security 1. HTTP Security Headers are enforced and X-Powered-By is hidden', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);

  // Assert Helmet headers
  assert.strictEqual(res.headers['x-frame-options'], 'DENY');
  assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
  assert.ok(res.headers['content-security-policy']);

  // Assert concealment of server framework
  assert.strictEqual(res.headers['x-powered-by'], undefined);
});

test('Security 2. XSS sanitizer strips malicious script tags from payload inputs', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: '<script>alert("XSS")</script>Secure User',
      email: 'xss.test@gym.com',
      password: 'password123',
      role: 'member',
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.user.name, 'Secure User');
  assert.strictEqual(res.body.data.user.name.includes('<script>'), false);
});

test('Security 3. NoSQL operator injection is sanitized and neutralized', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: { $gt: '' },
      password: 'password123',
    });

  // After sanitize, { $gt: '' } becomes { _gt: '' }, failing email validation or returning 400/401
  assert.ok([400, 401].includes(res.status));
});

test('Security 4. Excessive request payload is rejected with 413 Payload Too Large', async () => {
  const largeString = 'A'.repeat(150 * 1024); // 150KB, exceeding 100KB limit
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@gym.com',
      password: largeString,
    });

  assert.strictEqual(res.status, 413);
});

test('Security 5. Old JWT token is invalidated when password is changed', async () => {
  // 1. Register test user
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Token Revocation Tester',
    email: 'revoke.test@gym.com',
    password: 'password123',
    role: 'member',
  });
  assert.strictEqual(reg.status, 201);
  const oldToken = reg.body.data.token;

  // 2. Change password with old token
  const updateRes = await request(app)
    .put('/api/auth/updatepassword')
    .set('Authorization', `Bearer ${oldToken}`)
    .send({
      currentPassword: 'password123',
      newPassword: 'newpassword456',
    });
  assert.strictEqual(updateRes.status, 200);

  // 3. Request with old token must now be rejected with 401
  const checkRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${oldToken}`);
  assert.strictEqual(checkRes.status, 401);
});
