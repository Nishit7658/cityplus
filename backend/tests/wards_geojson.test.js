const request = require('supertest');
const { app } = require('../src/server');

describe('🗺️ Step 4: Geographic Ward Boundary Polygons & GIS Spatial Data', () => {
  test('GET /api/wards/geojson should return valid RFC 7946 FeatureCollection with 10 wards', async () => {
    const res = await request(app).get('/api/wards/geojson');

    expect(res.statusCode).toBe(200);
    expect(res.body.type).toBe('FeatureCollection');
    expect(Array.isArray(res.body.features)).toBe(true);
    expect(res.body.features.length).toBe(10);

    // Verify properties of first ward (Sayajigunj)
    const ward1 = res.body.features.find((f) => f.id === 1 || f.properties.id === 1);
    expect(ward1).toBeDefined();
    expect(ward1.properties.name).toMatch(/Sayajigunj/i);
    expect(ward1.geometry.type).toBe('Polygon');
    expect(Array.isArray(ward1.geometry.coordinates[0])).toBe(true);
    expect(ward1.geometry.coordinates[0].length).toBeGreaterThanOrEqual(4);
  });

  test('GET /api/wards should list 10 municipal wards with complaint counts', async () => {
    const res = await request(app).get('/api/wards');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(10);
    expect(res.body[0]).toHaveProperty('total_complaints');
  });
});
