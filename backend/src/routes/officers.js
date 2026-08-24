const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/officers
 * List all municipal officers with assigned complaint counts & ward info
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        o.id, 
        o.name, 
        o.department, 
        o.phone,
        o.ward_id,
        w.name as ward_name,
        COUNT(c.id) as assigned_total,
        COUNT(CASE WHEN c.status != 'Resolved' THEN 1 END) as active_assigned
      FROM officers o
      LEFT JOIN wards w ON o.ward_id = w.id
      LEFT JOIN complaints c ON c.assigned_officer_id = o.id
      GROUP BY o.id, o.name, o.department, o.phone, o.ward_id, w.name
      ORDER BY o.id ASC;
    `;
    const result = await db.query(query);
    return res.json(result.rows);
  } catch (error) {
    console.error('[GET /api/officers Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
