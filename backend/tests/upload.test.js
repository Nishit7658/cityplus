const request = require('supertest');
const { app } = require('../src/server');
const fs = require('fs');
const path = require('path');

describe('📸 100% Free Photo Upload & Evidence Pipeline', () => {
  const dummySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="green"/></svg>`;
  const tempSvgPath = path.join(__dirname, 'test_temp.svg');

  beforeAll(() => {
    fs.writeFileSync(tempSvgPath, dummySvg);
  });

  afterAll(() => {
    if (fs.existsSync(tempSvgPath)) {
      fs.unlinkSync(tempSvgPath);
    }
  });

  test('POST /api/upload should accept image and return public URL', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('photo', tempSvgPath);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toMatch(/^\/uploads\/evidence_\d+_[a-f0-9]+\.svg$/);
    expect(res.body.filename).toBeDefined();

    // Verify static file is readable
    const staticRes = await request(app).get(res.body.url);
    expect(staticRes.statusCode).toBe(200);
  });

  test('POST /api/upload should reject request with no file', async () => {
    const res = await request(app).post('/api/upload');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
