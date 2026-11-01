const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
let adminToken;
let memberToken;
let testMemberId;
let testPlanId;

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

test('1. Health Check Endpoint', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'online');
  assert.strictEqual(res.body.system, 'Gym Management System API');
});

test('2. Admin Registration and Login Flow', async () => {
  // Register Admin
  const regRes = await request(app).post('/api/auth/register').send({
    name: 'Test Super Admin',
    email: 'admin.test@gym.com',
    password: 'password123',
    role: 'admin',
    phone: '+1 555-9000',
  });
  assert.strictEqual(regRes.status, 201);
  assert.ok(regRes.body.data.token);

  // Login Admin
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'admin.test@gym.com',
    password: 'password123',
  });
  assert.strictEqual(loginRes.status, 200);
  assert.ok(loginRes.body.data.token);
  assert.strictEqual(loginRes.body.data.user.role, 'admin');
  adminToken = loginRes.body.data.token;
});

test('3. Rejection of Invalid Login Credentials', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin.test@gym.com',
    password: 'wrong_password',
  });
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('4. Membership Plan Creation (Admin Only)', async () => {
  const res = await request(app)
    .post('/api/memberships')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Test Gold Plan',
      durationMonths: 6,
      price: 249,
      description: 'Half-year gold tier membership',
      features: ['Locker', 'Sauna', 'Pool'],
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.name, 'Test Gold Plan');
  assert.strictEqual(res.body.data.durationMonths, 6);
  testPlanId = res.body.data._id;
});

test('5. Member Creation with Automatic Expiry Calculation', async () => {
  const res = await request(app)
    .post('/api/members')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'John Doe Member',
      email: 'johndoe@test.com',
      password: 'password123',
      phone: '+1 555-4321',
      membershipPlan: testPlanId,
      gender: 'male',
      dob: '1995-04-10',
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.user.name, 'John Doe Member');
  assert.strictEqual(res.body.data.status, 'active');
  assert.ok(res.body.data.expiryDate);

  testMemberId = res.body.data._id;

  // Login as member
  const memberLogin = await request(app).post('/api/auth/login').send({
    email: 'johndoe@test.com',
    password: 'password123',
  });
  assert.strictEqual(memberLogin.status, 200);
  memberToken = memberLogin.body.data.token;
});

test('6. RBAC Enforcement - Member Cannot Access Admin Endpoint', async () => {
  const res = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${memberToken}`);

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

test('7. Duplicate Email Registration Prevention', async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Duplicate John',
    email: 'johndoe@test.com',
    password: 'password123',
  });
  assert.strictEqual(res.status, 400);
});

test('8. Attendance Check-in and Duplicate Prevention', async () => {
  // First check-in
  const checkInRes = await request(app)
    .post('/api/attendance/check-in')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      memberId: testMemberId,
      notes: 'Test morning workout',
    });
  assert.strictEqual(checkInRes.status, 201);
  assert.strictEqual(checkInRes.body.data.status, 'present');

  // Second check-in on the same day must be rejected
  const dupRes = await request(app)
    .post('/api/attendance/check-in')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      memberId: testMemberId,
    });
  assert.strictEqual(dupRes.status, 400);
  assert.ok(dupRes.body.message.includes('already recorded'));
});

test('9. Attendance Check-out', async () => {
  const checkOutRes = await request(app)
    .post('/api/attendance/check-out')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      memberId: testMemberId,
    });
  assert.strictEqual(checkOutRes.status, 200);
  assert.ok(checkOutRes.body.data.checkOutTime);
});

test('10. Payment Processing and Invoice Generation', async () => {
  const payRes = await request(app)
    .post('/api/payments')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      member: testMemberId,
      membershipPlan: testPlanId,
      amount: 249,
      paymentMethod: 'card',
      status: 'paid',
      notes: 'Initial test payment',
    });

  assert.strictEqual(payRes.status, 201);
  assert.ok(payRes.body.data.invoiceNumber);
  assert.ok(payRes.body.data.transactionId);
  assert.strictEqual(payRes.body.data.amount, 249);
});

test('11. Progress Recording & Automatic BMI Calculation', async () => {
  // 80 kg and 180 cm -> BMI should be 80 / (1.8 * 1.8) = 24.69
  const progRes = await request(app)
    .post('/api/progress')
    .set('Authorization', `Bearer ${memberToken}`)
    .send({
      memberId: testMemberId,
      weightKg: 80,
      heightCm: 180,
      measurements: {
        chestCm: 102,
        waistCm: 84,
        armsCm: 37,
      },
      notes: 'Starting baseline',
    });

  assert.strictEqual(progRes.status, 201);
  assert.strictEqual(progRes.body.data.weightKg, 80);
  assert.strictEqual(progRes.body.data.heightCm, 180);
  assert.strictEqual(progRes.body.data.bmi, 24.69);
});

test('12. Workout Plan Creation and Retrieval', async () => {
  const planRes = await request(app)
    .post('/api/workouts')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Full Body Starter',
      member: testMemberId,
      goal: 'General Conditioning',
      level: 'beginner',
      exercises: [
        {
          name: 'Push-ups',
          sets: 3,
          reps: 15,
          durationMinutes: 5,
          restSeconds: 60,
          instructions: 'Keep body in straight plank',
        },
      ],
    });

  assert.strictEqual(planRes.status, 201);
  assert.strictEqual(planRes.body.data.name, 'Full Body Starter');
  assert.strictEqual(planRes.body.data.exercises.length, 1);
});

test('13. Admin Dashboard Analytics Aggregate Data', async () => {
  const dashRes = await request(app)
    .get('/api/dashboard/admin')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(dashRes.status, 200);
  assert.ok(dashRes.body.data.kpis);
  assert.ok(dashRes.body.data.charts);
  assert.strictEqual(dashRes.body.data.kpis.totalMembers >= 1, true);
});

test('14. Inactive or Expired Member Check-in is Rejected with 403', async () => {
  const Member = require('../models/Member');
  await Member.findByIdAndUpdate(testMemberId, { status: 'inactive' });

  const res = await request(app)
    .post('/api/attendance/check-in')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      memberId: testMemberId,
    });

  assert.strictEqual(res.status, 403);
  assert.ok(res.body.message.includes('inactive or expired'));

  await Member.findByIdAndUpdate(testMemberId, { status: 'active' });
});
