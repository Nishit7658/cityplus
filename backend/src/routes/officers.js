const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

function maskOfficerPhone(phone) {
  if (!phone) return null;
  const clean = phone.trim();
  if (clean.length < 8) return '****';
  return clean.slice(0, 6) + '****' + clean.slice(-4);
}

/**
 * GET /api/officers
 * List all municipal officers with workload metrics and ward details
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const isStaff = Boolean(req.user);

    const query = `
      SELECT 
        o.id, 
        o.name, 
        o.department, 
        o.phone,
        o.ward_id,
        w.name as ward_name,
        COUNT(c.id) as assigned_total,
        COUNT(CASE WHEN c.status != 'Resolved' THEN 1 END) as active_assigned,
        COUNT(CASE WHEN c.status != 'Resolved' THEN 1 END) as active_complaints,
        COUNT(CASE WHEN c.status = 'Resolved' THEN 1 END) as resolved_complaints
      FROM officers o
      LEFT JOIN wards w ON o.ward_id = w.id
      LEFT JOIN complaints c ON c.assigned_officer_id = o.id
      GROUP BY o.id, o.name, o.department, o.phone, o.ward_id, w.name
      ORDER BY o.id ASC;
    `;

    const result = await db.query(query);

    const officers = result.rows.map((o) => ({
      ...o,
      phone: isStaff ? o.phone : maskOfficerPhone(o.phone),
      assigned_total: parseInt(o.assigned_total || 0, 10),
      active_assigned: parseInt(o.active_assigned || 0, 10),
      active_complaints: parseInt(o.active_complaints || o.active_assigned || 0, 10),
      resolved_complaints: parseInt(o.resolved_complaints || 0, 10),
    }));

    return res.json(officers);
  } catch (error) {
    console.error('[GET /api/officers Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
