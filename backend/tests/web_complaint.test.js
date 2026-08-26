const request = require('supertest');
const { app } = require('../src/server');

describe('📢 Step 5: Web Citizen Portal & Grievance Intake API', () => {
  test('POST /api/complaints should create a new complaint with valid coordinates and ward assignment', async () => {
    const payload = {
      category: 'pothole',
      description: 'Dangerous pothole on Sayajigunj main junction',
      reporter_phone: '+91 98250 99999',
      latitude: 22.3112,
      longitude: 73.1878,
      photo_url: 'http://localhost:5000/uploads/test_evidence.jpg',
    };

    const res = await request(app)
      .post('/api/complaints')
      .send(payload);

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint).toBeDefined();
    expect(res.body.complaint.category).toBe('pothole');
    expect(res.body.complaint.ward_id).toBeDefined();
  });

  test('POST /api/complaints should reject invalid category with 400 Bad Request', async () => {
    const payload = {
      category: 'invalid_alien_category',
      description: 'Invalid category test',
      reporter_phone: '+91 98250 99999',
      latitude: 22.3112,
      longitude: 73.1878,
    };

    const res = await request(app)
      .post('/api/complaints')
      .send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid category/i);
  });

  test('POST /api/complaints should reject out-of-bounds coordinates with 400 Bad Request', async () => {
    const payload = {
      category: 'pothole',
      description: 'Out of bounds test (London coordinates)',
      reporter_phone: '+91 98250 99999',
      latitude: 51.5074,
      longitude: -0.1278,
    };

    const res = await request(app)
      .post('/api/complaints')
      .send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/vadodara/i);
  });
});
