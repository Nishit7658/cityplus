const express = require('express');
const router = express.Router();
const db = require('../config/db');
const whatsappService = require('../services/whatsappService');
const socketService = require('../services/socketService');

/**
 * GET /api/complaints
 * Lists complaints with optional filtering by status, category, ward_id.
 * Includes geographic coordinates, problem spot recurring metrics, and assigned officer details.
 */
router.get('/', async (req, res) => {
  try {
    const { status, category, ward_id } = req.query;

    let queryText = `
      SELECT 
        c.id, c.category, c.description, c.reporter_phone, c.status,
        c.confirmation_count, c.severity_score, c.is_recurring, c.reopened_count,
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
    if (ward_id) {
      params.push(ward_id);
      queryText += ` AND c.ward_id = $${params.length}`;
    }

    queryText += ` ORDER BY c.severity_score DESC, c.created_at DESC;`;

    const result = await db.query(queryText, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('[GET /api/complaints Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/complaints/:id
 * Single complaint + status history logs
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const complaintQuery = `
      SELECT 
        c.id, c.category, c.description, c.reporter_phone, c.status,
        c.confirmation_count, c.severity_score, c.is_recurring, c.reopened_count,
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
    if (complaintRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
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
      ...complaintRes.rows[0],
      logs: logsRes.rows
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
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_officer_id } = req.body;

    // Get existing complaint to log state changes
    const currentRes = await db.query(`SELECT status, assigned_officer_id FROM complaints WHERE id = $1;`, [id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
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

    updates.push(`updated_at = NOW()`);

    const updateQuery = `
      UPDATE complaints
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, category, description, status, confirmation_count, severity_score, is_recurring, reopened_count, assigned_officer_id, ward_id, created_at, updated_at,
                ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude;
    `;

    const updatedRes = await db.query(updateQuery, params);
    const updatedComplaint = updatedRes.rows[0];

    // Log status change if status changed
    if (status && status !== current.status) {
      await db.query(
        `INSERT INTO status_logs (complaint_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4);`,
        [id, current.status, status, assigned_officer_id || null]
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
 * Marks complaint as Resolved, stamps resolved_at, updates problem_spots.last_resolved_at,
 * and triggers WhatsApp outbound closed-loop verification check message.
 */
router.post('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { officer_id } = req.body;

    const currentRes = await db.query(`SELECT * FROM complaints WHERE id = $1;`, [id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const complaint = currentRes.rows[0];

    // 1. Stamp resolved_at on complaint
    const updateRes = await db.query(
      `UPDATE complaints
       SET status = 'Resolved',
           resolved_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, category, description, reporter_phone, status, confirmation_count, severity_score, is_recurring, reopened_count, problem_spot_id, ward_id, created_at, updated_at,
                 ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude;`,
      [id]
    );

    const resolvedComplaint = updateRes.rows[0];

    // Update problem_spot last_resolved_at if attached
    if (complaint.problem_spot_id) {
      await db.query(
        `UPDATE problem_spots SET last_resolved_at = NOW() WHERE id = $1;`,
        [complaint.problem_spot_id]
      );
    }

    // Log status transition
    await db.query(
      `INSERT INTO status_logs (complaint_id, old_status, new_status, changed_by) VALUES ($1, $2, 'Resolved', $3);`,
      [id, complaint.status, officer_id || null]
    );

    // 2. Trigger outbound WhatsApp closed-loop verification message to reporter
    try {
      await whatsappService.sendClosedLoopVerification(
        complaint.reporter_phone,
        complaint.id,
        complaint.category
      );
    } catch (wsErr) {
      console.warn(`[WhatsApp Closed-Loop Trigger Warning]: Could not send WhatsApp to ${complaint.reporter_phone}:`, wsErr.message);
    }

    // Broadcast live event to Next.js dashboard
    socketService.emitEvent('complaint:updated', resolvedComplaint);

    return res.json({
      success: true,
      message: `Complaint #${id} marked as Resolved. Closed-loop verification sent to ${complaint.reporter_phone}.`,
      complaint: resolvedComplaint,
    });
  } catch (error) {
    console.error('[POST /api/complaints/:id/resolve Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
