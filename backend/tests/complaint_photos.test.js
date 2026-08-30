const request = require('supertest');
const { app } = require('../src/server');

describe('📸 Civic Evidence vs Resolution Proof Separation', () => {
  let complaintId;
  const initialIntakePhoto = '/uploads/evidence_initial_citizen_report.jpg';
  const resolutionPhoto = '/uploads/evidence_officer_repair_proof.jpg';

  test('Create complaint with citizen intake photo', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .send({
        category: 'exposed_wiring',
        latitude: 22.3456,
        longitude: 73.1234,
        reporter_phone: '+919999888877',
        description: 'Dangerous exposed wiring near junction',
        photo_url: initialIntakePhoto,
      });

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.complaint).toBeDefined();
    complaintId = res.body.complaint.id;
    expect(res.body.complaint.photo_url).toBe(initialIntakePhoto);
  });

  test('Resolve complaint with resolution proof photo without overwriting intake photo', async () => {
    const res = await request(app)
      .post(`/api/complaints/${complaintId}/resolve`)
      .send({
        officer_id: 1,
        photo_after_url: resolutionPhoto,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.status).toBe('Resolved');
    // Ensure photo_after_url is updated to resolution proof
    expect(res.body.complaint.photo_after_url).toBe(resolutionPhoto);
    // CRITICAL: Ensure photo_url is STILL the initial intake photo and NOT overwritten!
    expect(res.body.complaint.photo_url).toBe(initialIntakePhoto);
  });

  test('Fetching resolved complaint returns both distinct photos', async () => {
    const res = await request(app).get(`/api/complaints/${complaintId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.photo_url).toBe(initialIntakePhoto);
    expect(res.body.photo_after_url).toBe(resolutionPhoto);
  });
});
