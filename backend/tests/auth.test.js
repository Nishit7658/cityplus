const request = require('supertest');
const { app } = require('../src/server');

describe('Staff Authentication & RBAC Tests', () => {
  test('POST /api/auth/login rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vmc.gov.in', password: 'WrongPassword123!' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/auth/login succeeds with valid seeded staff credentials and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vmc.gov.in', password: 'VmcGov2026!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'admin');

    // Verify GET /api/auth/me with Bearer token
    const token = res.body.token;
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user).toHaveProperty('email', 'admin@vmc.gov.in');
  });

  test('GET /api/officers returns aligned workload metrics', async () => {
    const res = await request(app).get('/api/officers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const officer = res.body[0];
    expect(officer).toHaveProperty('active_complaints');
    expect(officer).toHaveProperty('resolved_complaints');
    expect(officer).toHaveProperty('assigned_total');
  });
});
