const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const gisService = require('../services/gisService');
const socketService = require('../services/socketService');
const db = require('../config/db');

// In-memory conversation state machine per phone number
// States: START, CATEGORY, LOCATION
const userSessions = new Map();

/**
 * GET /webhook
 * Meta Developer Webhook Handshake Verification
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_custom_secret_verify_token_123';

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Webhook Verification] Verified successfully!');
      return res.status(200).send(challenge);
    } else {
      console.warn('[Webhook Verification Failed] Tokens do not match.');
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

/**
 * POST /webhook
 * Incoming WhatsApp Message & Interaction Handler
 */
router.post('/', async (req, res) => {
  // Acknowledge Meta immediately to avoid retries
  res.sendStatus(200);

  try {
    const body = req.body;

    if (!body || body.object !== 'whatsapp_business_account') {
      return;
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return;
    }

    const msg = messages[0];
    const fromPhone = msg.from; // Sender phone number

    let session = userSessions.get(fromPhone) || { state: 'START', category: null };

    // 1. Handle Quick-Reply Button Responses (Closed-Loop Verification)
    if (msg.type === 'interactive' && msg.interactive?.type === 'button_reply') {
      const buttonId = msg.interactive.button_reply.id;
      
      if (buttonId.startsWith('verify_yes_')) {
        const complaintId = parseInt(buttonId.replace('verify_yes_', ''), 10);
        
        await db.query(
          `UPDATE complaints SET status = 'Resolved', updated_at = NOW() WHERE id = $1;`,
          [complaintId]
        );

        await whatsappService.sendTextMessage(
          fromPhone,
          `Thank you for confirming! Report #${complaintId} is now permanently closed as Resolved. VMC appreciates your feedback.`
        );

        const updatedRes = await db.query(
          `SELECT id, category, description, status, confirmation_count, severity_score, is_recurring, reopened_count,
                  ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude
           FROM complaints WHERE id = $1;`,
          [complaintId]
        );

        if (updatedRes.rows.length > 0) {
          socketService.emitEvent('complaint:updated', updatedRes.rows[0]);
        }
        return;
      }

      if (buttonId.startsWith('verify_no_')) {
        const complaintId = parseInt(buttonId.replace('verify_no_', ''), 10);
        
        // Reopen complaint: status = 'Pending', increment reopened_count
        const updateRes = await db.query(
          `UPDATE complaints
           SET status = 'Pending',
               reopened_count = reopened_count + 1,
               updated_at = NOW()
           WHERE id = $1
           RETURNING id, category, description, status, confirmation_count, severity_score, is_recurring, reopened_count,
                     ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude;`,
          [complaintId]
        );

        const reopenedComplaint = updateRes.rows[0];

        // Log in status_logs
        await db.query(
          `INSERT INTO status_logs (complaint_id, old_status, new_status) VALUES ($1, 'Resolved', 'Pending');`,
          [complaintId]
        );

        await whatsappService.sendTextMessage(
          fromPhone,
          `We apologize for the inconvenience. Report #${complaintId} has been RE-OPENED and flagged as high priority for VMC department heads.`
        );

        // Re-emit Socket.IO event so dashboard turns map marker red live without refresh!
        socketService.emitEvent('complaint:reopened', reopenedComplaint);
        socketService.emitEvent('complaint:updated', reopenedComplaint);
        return;
      }
    }

    // 2. Handle Interactive Category Selection List Response
    if (msg.type === 'interactive' && msg.interactive?.type === 'list_reply') {
      const selectedId = msg.interactive.list_reply.id;
      const selectedTitle = msg.interactive.list_reply.title;

      session.category = selectedTitle;
      session.state = 'LOCATION';
      userSessions.set(fromPhone, session);

      await whatsappService.sendLocationPrompt(fromPhone, selectedTitle);
      return;
    }

    // 3. Handle Location Message Response
    if (msg.type === 'location') {
      const latitude = msg.location.latitude;
      const longitude = msg.location.longitude;
      const category = session.category || 'pothole';

      // Run PostGIS 18m deduplication and recurring detection
      const result = await gisService.processIncomingReport({
        latitude,
        longitude,
        category,
        reporterPhone: fromPhone,
        description: `WhatsApp report from ${fromPhone} (${category})`,
      });

      // Send WhatsApp confirmation back to user
      await whatsappService.sendTextMessage(fromPhone, result.message);

      // Reset user session back to START
      userSessions.set(fromPhone, { state: 'START', category: null });

      // Emit real-time update to Next.js dashboard
      if (result.action === 'created') {
        socketService.emitEvent('complaint:created', result.complaint);
      } else {
        socketService.emitEvent('complaint:updated', result.complaint);
      }
      return;
    }

    // 4. Handle Text Input ("VMC" trigger)
    if (msg.type === 'text') {
      const text = (msg.text?.body || '').trim();

      if (text.toUpperCase() === 'VMC' || session.state === 'START') {
        session.state = 'CATEGORY';
        userSessions.set(fromPhone, session);

        await whatsappService.sendCategoryList(fromPhone);
        return;
      }

      if (session.state === 'CATEGORY') {
        // User sent text instead of tapping list - set category and ask for location
        session.category = text;
        session.state = 'LOCATION';
        userSessions.set(fromPhone, session);

        await whatsappService.sendLocationPrompt(fromPhone, text);
        return;
      }

      if (session.state === 'LOCATION') {
        await whatsappService.sendTextMessage(
          fromPhone,
          `Please share your location using WhatsApp attachment (📎 → Location) so we can pinpoint the issue accurately.`
        );
        return;
      }
    }
  } catch (error) {
    console.error('[Webhook Processing Error]:', error);
  }
});

/**
 * POST /webhook/simulate
 * Local testing endpoint to simulate WhatsApp reports without Meta credentials
 */
router.post('/simulate', async (req, res) => {
  const { reporterPhone, latitude, longitude, category, description } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude and longitude are required' });
  }

  try {
    const result = await gisService.processIncomingReport({
      latitude,
      longitude,
      category: category || 'Pothole',
      reporterPhone: reporterPhone || '+919876543210',
      description: description || 'Simulated report',
    });

    if (result.action === 'created') {
      socketService.emitEvent('complaint:created', result.complaint);
    } else {
      socketService.emitEvent('complaint:updated', result.complaint);
    }

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Simulate Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
