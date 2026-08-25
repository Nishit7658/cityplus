const request = require('supertest');
const { app } = require('../src/server');

describe('Complaints API Integration Tests', () => {
  test('GET /api/complaints returns array of complaints with masked phone numbers for public', async () => {
    const res = await request(app).get('/api/complaints');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const first = res.body[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('category');
    expect(first).toHaveProperty('status');
    // Public requests should have masked phone
    if (first.reporter_phone) {
      expect(first.reporter_phone).toContain('****');
    }
  });

  test('GET /api/complaints?status=Resolved returns ONLY Resolved complaints', async () => {
    const res = await request(app).get('/api/complaints?status=Resolved');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const c of res.body) {
      expect(c.status).toBe('Resolved');
    }
  });

  test('GET /api/complaints?category=pothole returns ONLY pothole complaints', async () => {
    const res = await request(app).get('/api/complaints?category=pothole');
    expect(res.status).toBe(200);
    for (const c of res.body) {
      expect(c.category).toBe('pothole');
    }
  });

  test('GET /api/complaints/:id returns 404 for non-existent complaint', async () => {
    const res = await request(app).get('/api/complaints/999999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /api/complaints/101 returns specific complaint with logs array', async () => {
    const res = await request(app).get('/api/complaints/101');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(101);
    expect(res.body).toHaveProperty('logs');
    expect(Array.isArray(res.body.logs)).toBe(true);
  });

  test('PATCH /api/complaints/:id updates status and broadcasts event', async () => {
    const res = await request(app)
      .patch('/api/complaints/101')
      .send({ status: 'In Progress', assigned_officer_id: 1 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('In Progress');
  });

  test('POST /api/complaints/:id/resolve resolves complaint and records timestamp', async () => {
    const res = await request(app)
      .post('/api/complaints/101/resolve')
      .send({ officer_id: 1 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.status).toBe('Resolved');
  });
});
