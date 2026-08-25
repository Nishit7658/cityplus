const request = require('supertest');
const { app } = require('../src/server');

describe('Transparency API Integration Tests', () => {
  test('GET /api/transparency returns dynamic verified metrics from database records', async () => {
    const res = await request(app).get('/api/transparency');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total_complaints');
    expect(res.body).toHaveProperty('resolved_complaints');
    expect(res.body).toHaveProperty('pending_complaints');
    expect(res.body).toHaveProperty('avg_resolution_hours');
    expect(res.body).toHaveProperty('wards');

    expect(typeof res.body.total_complaints).toBe('number');
    expect(typeof res.body.resolved_complaints).toBe('number');
    expect(typeof res.body.pending_complaints).toBe('number');

    // Total must equal resolved + pending
    expect(res.body.total_complaints).toBe(
      res.body.resolved_complaints + res.body.pending_complaints
    );

    // Must return all 10 VMC Wards
    expect(Array.isArray(res.body.wards)).toBe(true);
    expect(res.body.wards.length).toBe(10);
    expect(res.body.wards[0]).toHaveProperty('ward_name');
    expect(res.body.wards[0]).toHaveProperty('total');
    expect(res.body.wards[0]).toHaveProperty('resolved');
  });

  test('GET /health returns healthy system readiness report', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('uptime');
  });
});
