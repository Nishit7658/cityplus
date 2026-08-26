const request = require('supertest');
const { app } = require('../src/server');

describe('🔄 Step 3: Field Officer Resolution & Closed-Loop Verification Protocol', () => {
  let testComplaintId = 101;

  test('POST /api/complaints/:id/resolve should mark as Resolved and attach repair photo', async () => {
    const res = await request(app)
      .post(`/api/complaints/${testComplaintId}/resolve`)
      .send({
        officer_id: 1,
        photo_after_url: '/uploads/pothole_sayajigunj_after.svg',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.status).toBe('Resolved');
    expect(res.body.complaint.photo_after_url).toBe('/uploads/pothole_sayajigunj_after.svg');
  });

  test('GET /api/complaints/:id should return audit status_logs showing resolution', async () => {
    const res = await request(app).get(`/api/complaints/${testComplaintId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(testComplaintId);
    expect(res.body.status).toBe('Resolved');
    expect(Array.isArray(res.body.logs)).toBe(true);
    expect(res.body.logs.some((l) => l.new_status === 'Resolved')).toBe(true);
  });

  test('POST /api/webhook/simulate with "No" should auto-reopen complaint to Pending', async () => {
    const res = await request(app)
      .post('/api/webhook/simulate')
      .send({
        phone: '+919876543210',
        message: 'No',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.status).toBe('Pending');
    expect(res.body.complaint.reopened_count).toBeGreaterThanOrEqual(1);
    expect(res.body.botReply).toMatch(/RE-OPENED/i);
  });

  test('POST /api/webhook/simulate with "Yes" should permanently close ticket as verified', async () => {
    // First resolve complaint #102
    await request(app).post('/api/complaints/102/resolve').send({ officer_id: 5 });

    // Citizen verifies with Yes
    const res = await request(app)
      .post('/api/webhook/simulate')
      .send({
        phone: '+919876543210',
        message: 'Yes',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.status).toBe('Resolved');
    expect(res.body.botReply).toMatch(/Verified/i);
  });
});
