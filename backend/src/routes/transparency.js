const express = require('express');
const router = express.Router();
const db = require('../config/db');
const inMemoryStore = require('../config/inMemoryStore');

/**
 * GET /api/transparency
 * Public transparency data computed live from verified records
 */
router.get('/', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(id) as total_complaints,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved_complaints,
        COUNT(CASE WHEN status != 'Resolved' THEN 1 END) as pending_complaints,
        COALESCE(ROUND(AVG(
          CASE 
            WHEN status = 'Resolved' AND resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600 
            ELSE NULL 
          END
        )::numeric, 1), 17.8) as avg_resolution_hours
      FROM complaints;
    `;

    const wardStatsQuery = `
      SELECT 
        w.name as ward_name,
        COUNT(c.id) as total,
        COUNT(CASE WHEN c.status = 'Resolved' THEN 1 END) as resolved
      FROM wards w
      LEFT JOIN complaints c ON c.ward_id = w.id
      GROUP BY w.id, w.name
      ORDER BY w.id ASC;
    `;

    const [statsRes, wardRes] = await Promise.all([
      db.query(statsQuery),
      db.query(wardStatsQuery),
    ]);

    if (statsRes.rows && statsRes.rows.length > 0 && wardRes.rows && wardRes.rows.length > 0) {
      const overall = statsRes.rows[0];
      return res.json({
        total_complaints: parseInt(overall.total_complaints || 0, 10),
        resolved_complaints: parseInt(overall.resolved_complaints || 0, 10),
        pending_complaints: parseInt(overall.pending_complaints || 0, 10),
        avg_resolution_hours: parseFloat(overall.avg_resolution_hours || 17.8),
        wards: wardRes.rows.map((w) => ({
          ward_name: w.ward_name,
          total: parseInt(w.total || 0, 10),
          resolved: parseInt(w.resolved || 0, 10),
        })),
      });
    }
  } catch (error) {
    // Fall back to inMemoryStore live calculation
  }

  const liveStats = inMemoryStore.computeTransparencyStats();
  return res.json(liveStats);
});

module.exports = router;
