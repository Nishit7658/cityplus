const express = require('express');
const router = express.Router();
const db = require('../config/db');

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

module.exports = router;
