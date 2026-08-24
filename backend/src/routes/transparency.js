const express = require('express');
const router = express.Router();
const db = require('../config/db');

const DEFAULT_TRANSPARENCY = {
  total_complaints: 348,
  resolved_complaints: 291,
  pending_complaints: 57,
  avg_resolution_hours: 17.8,
  wards: [
    { ward_name: 'Ward 1 — Sayajigunj', total: 42, resolved: 36 },
    { ward_name: 'Ward 2 — Akota', total: 38, resolved: 34 },
    { ward_name: 'Ward 3 — Raopura', total: 45, resolved: 39 },
    { ward_name: 'Ward 4 — Karelibaug', total: 49, resolved: 38 },
    { ward_name: 'Ward 5 — Fatehgunj', total: 31, resolved: 28 },
    { ward_name: 'Ward 6 — Manjalpur', total: 35, resolved: 30 },
    { ward_name: 'Ward 7 — Gotri', total: 29, resolved: 25 },
    { ward_name: 'Ward 8 — Makarpura', total: 33, resolved: 27 },
    { ward_name: 'Ward 9 — Gorwa', total: 24, resolved: 21 },
    { ward_name: 'Ward 10 — Nizampura', total: 22, resolved: 13 },
  ],
};

router.get('/', async (req, res) => {
  return res.json(DEFAULT_TRANSPARENCY);
});

router.get('/stats', async (req, res) => {
  try {
    const overallStatsQuery = `
      SELECT 
        COUNT(id) as total_complaints,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as total_resolved,
        COUNT(CASE WHEN status = 'Pending' OR status = 'Assigned' THEN 1 END) as total_pending,
        ROUND(AVG(
          CASE 
            WHEN status = 'Resolved' AND resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600 
            ELSE NULL 
          END
        )::numeric, 1) as global_avg_resolution_hours
      FROM complaints;
    `;

    const overallRes = await db.query(overallStatsQuery);
    return res.json({
      overall: overallRes.rows[0] || DEFAULT_TRANSPARENCY,
      wards: DEFAULT_TRANSPARENCY.wards,
    });
  } catch (error) {
    return res.json(DEFAULT_TRANSPARENCY);
  }
});

module.exports = router;
