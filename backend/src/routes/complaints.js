const express = require('express');
const router = express.Router();
const db = require('../config/db');
const whatsappService = require('../services/whatsappService');
const telegramService = require('../services/telegramService');
const socketService = require('../services/socketService');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { validateCreateComplaint, validateUpdateComplaint } = require('../middleware/validation');

/**
 * Redacts citizen phone numbers for public privacy (e.g. "+91 98250 11111" -> "+91 98****1111")
 */
function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const clean = phone.trim();
  if (clean.length < 8) return '****';
  return clean.slice(0, 6) + '****' + clean.slice(-4);
}

/**
 * Sanitizes complaint row based on requester's auth status
 */
function sanitizeComplaint(row, isStaff = false) {
  if (!row) return null;
  return {
    ...row,
    reporter_phone: isStaff ? row.reporter_phone : maskPhone(row.reporter_phone),
  };
}

/**
 * GET /api/complaints
 * Lists complaints with filtering by status, category, ward_id.
 * Masks PII unless authenticated staff.
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, category, ward_id } = req.query;
    const isStaff = Boolean(req.user);

    let queryText = `
      SELECT 
        c.id, c.category, c.description, c.reporter_phone, c.status,
        c.confirmation_count, c.severity_score, c.is_recurring, c.reopened_count,
        c.photo_url, c.photo_after_url,
        c.resolved_at, c.created_at, c.updated_at,
        ST_Y(c.location::geometry) as latitude,
        ST_X(c.location::geometry) as longitude,
        c.ward_id, w.name as ward_name,
        c.assigned_officer_id, o.name as officer_name, o.department as officer_department,
        p.total_cycles, p.total_reports, p.first_reported_at,
        CEIL(EXTRACT(EPOCH FROM (NOW() - p.first_reported_at))/2592000) as months_span
      FROM complaints c
      LEFT JOIN wards w ON c.ward_id = w.id
      LEFT JOIN officers o ON c.assigned_officer_id = o.id
      LEFT JOIN problem_spots p ON c.problem_spot_id = p.id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      params.push(status);
      queryText += ` AND c.status = $${params.length}`;
    }
    if (category) {
      params.push(category);
      queryText += ` AND c.category = $${params.length}`;
    }
    if (ward_id && ward_id !== 'all') {
      params.push(parseInt(ward_id, 10));
      queryText += ` AND c.ward_id = $${params.length}`;
    }

    queryText += ` ORDER BY c.severity_score DESC, c.created_at DESC;`;

    const result = await db.query(queryText, params);
    const sanitized = result.rows.map((r) => sanitizeComplaint(r, isStaff));
    return res.json(sanitized);
  } catch (error) {
    console.error('[GET /api/complaints Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/complaints/:id
 * Single complaint + status history logs with proper 404 handling
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isStaff = Boolean(req.user);

    const complaintQuery = `
      SELECT 
        c.id, c.category, c.description, c.reporter_phone, c.status,
        c.confirmation_count, c.severity_score, c.is_recurring, c.reopened_count,
        c.photo_url, c.photo_after_url,
        c.resolved_at, c.created_at, c.updated_at,
        ST_Y(c.location::geometry) as latitude,
        ST_X(c.location::geometry) as longitude,
        c.ward_id, w.name as ward_name,
        c.assigned_officer_id, o.name as officer_name, o.department as officer_department,
        p.total_cycles, p.total_reports, p.first_reported_at,
        CEIL(EXTRACT(EPOCH FROM (NOW() - p.first_reported_at))/2592000) as months_span
      FROM complaints c
      LEFT JOIN wards w ON c.ward_id = w.id
      LEFT JOIN officers o ON c.assigned_officer_id = o.id
      LEFT JOIN problem_spots p ON c.problem_spot_id = p.id
      WHERE c.id = $1;
    `;

    const complaintRes = await db.query(complaintQuery, [id]);
    if (!complaintRes.rows || complaintRes.rows.length === 0) {
      return res.status(404).json({ error: `Complaint #${id} not found.` });
    }

    const logsQuery = `
      SELECT sl.id, sl.old_status, sl.new_status, sl.changed_at, o.name as officer_name
      FROM status_logs sl
      LEFT JOIN officers o ON sl.changed_by = o.id
      WHERE sl.complaint_id = $1
      ORDER BY sl.changed_at DESC;
    `;
    const logsRes = await db.query(logsQuery, [id]);

    return res.json({
      ...sanitizeComplaint(complaintRes.rows[0], isStaff),
      logs: logsRes.rows || [],
    });
  } catch (error) {
    console.error('[GET /api/complaints/:id Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/complaints/:id
 * Update status or assign officer
 */
router.patch('/:id', optionalAuth, validateUpdateComplaint, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_officer_id, photo_url, photo_after_url } = req.body;
    const actorId = req.user?.id || assigned_officer_id || null;

    // Check existing complaint
    const currentRes = await db.query(`SELECT status, assigned_officer_id FROM complaints WHERE id = $1;`, [id]);
    if (!currentRes.rows || currentRes.rows.length === 0) {
      return res.status(404).json({ error: `Complaint #${id} not found.` });
    }
    const current = currentRes.rows[0];

    const updates = [];
    const params = [id];

    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }
    if (assigned_officer_id !== undefined) {
      params.push(assigned_officer_id);
      updates.push(`assigned_officer_id = $${params.length}`);
    }
    if (photo_url !== undefined) {
      params.push(photo_url);
      updates.push(`photo_url = $${params.length}`);
    }
    if (photo_after_url !== undefined) {
      params.push(photo_after_url);
      updates.push(`photo_after_url = $${params.length}`);
    }

    updates.push(`updated_at = NOW()`);

    const updateQuery = `
      UPDATE complaints
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, category, description, status, confirmation_count, severity_score, is_recurring, reopened_count, assigned_officer_id, ward_id, photo_url, photo_after_url, created_at, updated_at,
                ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude;
    `;

    const updatedRes = await db.query(updateQuery, params);
    const updatedComplaint = updatedRes.rows[0];

    // Log status change
    if (status && status !== current.status) {
      await db.query(
        `INSERT INTO status_logs (complaint_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4);`,
        [id, current.status, status, actorId]
      );
    }

    socketService.emitEvent('complaint:updated', updatedComplaint);
    return res.json(updatedComplaint);
  } catch (error) {
    console.error('[PATCH /api/complaints/:id Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/complaints/:id/resolve
 * Marks complaint as Resolved, stamps resolved_at, logs officer ID in audit history,
 * stores optional photo_after_url repair proof, and triggers closed-loop verification.
 */
router.post('/:id/resolve', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { officer_id, photo_after_url } = req.body;
    const actorId = req.user?.id || officer_id || null;

    const currentRes = await db.query(`SELECT * FROM complaints WHERE id = $1;`, [id]);
    if (!currentRes.rows || currentRes.rows.length === 0) {
      return res.status(404).json({ error: `Complaint #${id} not found.` });
    }

    const complaint = currentRes.rows[0];

    // 1. Stamp resolved_at & photo_after_url
    const updateRes = await db.query(
      `UPDATE complaints
       SET status = 'Resolved',
           photo_after_url = COALESCE($2, photo_after_url),
           resolved_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, category, description, reporter_phone, status, confirmation_count, severity_score, is_recurring, reopened_count, problem_spot_id, ward_id, photo_url, photo_after_url, created_at, updated_at,
                 ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude;`,
      [id, photo_after_url || null]
    );

    const resolvedComplaint = updateRes.rows[0];

    // Update problem_spot if recurring
    if (complaint.problem_spot_id) {
      await db.query(
        `UPDATE problem_spots SET last_resolved_at = NOW() WHERE id = $1;`,
        [complaint.problem_spot_id]
      );
    }

    // Log status transition with acting officer ID
    await db.query(
      `INSERT INTO status_logs (complaint_id, old_status, new_status, changed_by) VALUES ($1, $2, 'Resolved', $3);`,
      [id, complaint.status, actorId]
    );

    // 2. Trigger outbound closed-loop citizen verification
    try {
      if (complaint.reporter_phone) {
        const phoneStr = String(complaint.reporter_phone);
        if (phoneStr.startsWith('tg_')) {
          const chatId = phoneStr.replace('tg_', '');
          await telegramService.sendClosedLoopVerification(
            chatId,
            complaint.id,
            complaint.category,
            photo_after_url || resolvedComplaint.photo_after_url
          );
        } else {
          await whatsappService.sendClosedLoopVerification(
            complaint.reporter_phone,
            complaint.id,
            complaint.category,
            photo_after_url || resolvedComplaint.photo_after_url
          );
        }
      }
    } catch (wsErr) {
      console.warn('⚠️ [Outbound Verification Notice]:', wsErr.message);
    }

    socketService.emitEvent('complaint:resolved', resolvedComplaint);
    socketService.emitEvent('complaint:updated', resolvedComplaint);

    return res.json({
      success: true,
      message: `Complaint #${id} marked as resolved. Outbound verification prompt dispatched to citizen.`,
      complaint: resolvedComplaint,
    });
  } catch (error) {
    console.error('[POST /api/complaints/:id/resolve Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
