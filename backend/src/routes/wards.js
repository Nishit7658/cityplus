const express = require('express');
const router = express.Router();
const db = require('../config/db');
const wardsGeoJSON = require('../data/vadodaraWardsGeoJSON.json');

/**
 * GET /api/wards
 * List all municipal wards with total & pending complaint counts
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        w.id, 
        w.name,
        COUNT(c.id) as total_complaints,
        COUNT(CASE WHEN c.status != 'Resolved' THEN 1 END) as pending_complaints,
        COUNT(CASE WHEN c.status = 'Resolved' THEN 1 END) as resolved_complaints
      FROM wards w
      LEFT JOIN complaints c ON c.ward_id = w.id
      GROUP BY w.id, w.name
      ORDER BY w.id ASC;
    `;
    const result = await db.query(query);
    return res.json(result.rows);
  } catch (error) {
    console.error('[GET /api/wards Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/wards/geojson
 * Returns 10-ward RFC 7946 FeatureCollection enriched with live complaint stats
 */
router.get('/geojson', async (req, res) => {
  try {
    const query = `
      SELECT 
        w.id, 
        COUNT(c.id) as total_complaints,
        COUNT(CASE WHEN c.status != 'Resolved' THEN 1 END) as pending_complaints,
        COUNT(CASE WHEN c.status = 'Resolved' THEN 1 END) as resolved_complaints
      FROM wards w
      LEFT JOIN complaints c ON c.ward_id = w.id
      GROUP BY w.id;
    `;
    const result = await db.query(query);
    const statsMap = new Map();
    (result.rows || []).forEach((r) => {
      statsMap.set(Number(r.id), {
        total_complaints: Number(r.total_complaints) || 0,
        pending_complaints: Number(r.pending_complaints) || 0,
        resolved_complaints: Number(r.resolved_complaints) || 0,
      });
    });

    const enrichedFeatures = wardsGeoJSON.features.map((f) => {
      const stats = statsMap.get(f.id) || { total_complaints: 0, pending_complaints: 0, resolved_complaints: 0 };
      return {
        ...f,
        properties: {
          ...f.properties,
          ...stats,
        },
      };
    });

    return res.json({
      type: 'FeatureCollection',
      features: enrichedFeatures,
    });
  } catch (error) {
    console.error('[GET /api/wards/geojson Error]:', error);
    return res.json(wardsGeoJSON);
  }
});

module.exports = router;
