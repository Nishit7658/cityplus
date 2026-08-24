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
  res.sendStatus(200);

  try {
    const body = req.body;
    if (!body || body.object !== 'whatsapp_business_account') return;

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    const msg = messages[0];
    const fromPhone = msg.from;
    let session = userSessions.get(fromPhone) || { state: 'START', category: null };

    // 1. Handle Quick-Reply Button Responses (Closed-Loop Verification)
    if (msg.type === 'interactive' && msg.interactive?.type === 'button_reply') {
      const buttonId = msg.interactive.button_reply.id;
      
      if (buttonId.startsWith('verify_yes_')) {
        const complaintId = parseInt(buttonId.replace('verify_yes_', ''), 10);
        await db.query(`UPDATE complaints SET status = 'Resolved', updated_at = NOW() WHERE id = $1;`, [complaintId]);

        await whatsappService.sendTextMessage(
          fromPhone,
          `Thank you for confirming! Report #${complaintId} is now permanently closed as Resolved. VMC appreciates your feedback.`
        );

        const updatedRes = await db.query(`SELECT * FROM complaints WHERE id = $1;`, [complaintId]);
        if (updatedRes.rows.length > 0) {
          socketService.emitEvent('complaint:updated', updatedRes.rows[0]);
        }
        return;
      }

      if (buttonId.startsWith('verify_no_')) {
        const complaintId = parseInt(buttonId.replace('verify_no_', ''), 10);
        const updateRes = await db.query(
          `UPDATE complaints SET status = 'Pending', reopened_count = reopened_count + 1, updated_at = NOW() WHERE id = $1 RETURNING *;`,
          [complaintId]
        );

        const reopenedComplaint = updateRes.rows[0] || { id: complaintId, status: 'Pending', reopened_count: 1 };
        await db.query(`INSERT INTO status_logs (complaint_id, old_status, new_status) VALUES ($1, 'Resolved', 'Pending');`, [complaintId]);

        await whatsappService.sendTextMessage(
          fromPhone,
          `We apologize for the inconvenience. Report #${complaintId} has been RE-OPENED and flagged as high priority for VMC department heads.`
        );

        socketService.emitEvent('complaint:reopened', reopenedComplaint);
        return;
      }
    }

    // 2. Handle Interactive Category Selection List Response
    if (msg.type === 'interactive' && msg.interactive?.type === 'list_reply') {
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

      const result = await gisService.processIncomingReport({
        latitude,
        longitude,
        category,
        reporterPhone: fromPhone,
        description: `WhatsApp report from ${fromPhone} (${category})`,
      });

      await whatsappService.sendTextMessage(fromPhone, result.message);
      userSessions.set(fromPhone, { state: 'START', category: null });

      if (result.action === 'created') {
        socketService.emitEvent('complaint:created', result.complaint);
      } else {
        socketService.emitEvent('complaint:updated', result.complaint);
      }
      return;
    }

    // 4. Handle Text Input
    if (msg.type === 'text') {
      const text = (msg.text?.body || '').trim();

      if (text.toUpperCase() === 'VMC' || session.state === 'START') {
        session.state = 'CATEGORY';
        userSessions.set(fromPhone, session);
        await whatsappService.sendCategoryList(fromPhone);
        return;
      }

      if (session.state === 'CATEGORY') {
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
 * Local testing endpoint to simulate full WhatsApp chat interactions
 */
router.post('/simulate', async (req, res) => {
  const { reporterPhone, phone, latitude, longitude, category, description, message } = req.body;
  const userPhone = reporterPhone || phone || '+919876543210';
  const text = (message || '').trim();

  let session = userSessions.get(userPhone) || { state: 'START', category: null };

  try {
    // 1. Direct GPS coordinates provided
    if (latitude && longitude) {
      const result = await gisService.processIncomingReport({
        latitude,
        longitude,
        category: category || session.category || 'Pothole',
        reporterPhone: userPhone,
        description: description || `Simulated report (${category || 'Pothole'})`,
      });

      if (result.action === 'created') {
        socketService.emitEvent('complaint:created', result.complaint);
      } else {
        socketService.emitEvent('complaint:updated', result.complaint);
      }

      userSessions.set(userPhone, { state: 'START', category: null });
      return res.json({
        success: true,
        botReply: result.message,
        complaint: result.complaint,
        action: result.action,
      });
    }

    // 2. Simulated coordinate string format: "loc:22.3072,73.1812"
    if (text.startsWith('loc:')) {
      const [latStr, lngStr] = text.replace('loc:', '').split(',');
      const lat = parseFloat(latStr.trim()) || 22.3072;
      const lng = parseFloat(lngStr.trim()) || 73.1812;

      const result = await gisService.processIncomingReport({
        latitude: lat,
        longitude: lng,
        category: session.category || 'pothole',
        reporterPhone: userPhone,
        description: `Simulated report (${session.category || 'pothole'})`,
      });

      if (result.action === 'created') {
        socketService.emitEvent('complaint:created', result.complaint);
      } else {
        socketService.emitEvent('complaint:updated', result.complaint);
      }

      userSessions.set(userPhone, { state: 'START', category: null });
      return res.json({
        success: true,
        botReply: result.message,
        complaint: result.complaint,
        action: result.action,
      });
    }

    // 3. Simulated verification replies ("Yes" / "No")
    if (text.toLowerCase() === 'yes' || text.toLowerCase() === 'confirm yes') {
      return res.json({
        success: true,
        botReply: `Thank you for confirming! Report marked as permanently resolved in VMC records.`,
      });
    }

    if (text.toLowerCase() === 'no' || text.toLowerCase() === 'reject (no)') {
      const fakeComplaint = { id: 101, status: 'Pending', reopened_count: 1 };
      socketService.emitEvent('complaint:reopened', fakeComplaint);
      return res.json({
        success: true,
        botReply: `We apologize for the inconvenience. Report has been RE-OPENED and escalated to high priority.`,
      });
    }

    // 4. Simulated category selection (e.g. "1", "pothole", "manhole", etc.)
    const categoryMap = {
      '1': 'Pothole',
      '2': 'Water Leak',
      '3': 'Broken Streetlight',
      '4': 'Garbage Overflow',
      '5': 'Open Manhole',
      '6': 'Exposed Wiring',
      '7': 'Gas Leak',
    };

    if (session.state === 'CATEGORY' || categoryMap[text]) {
      const selectedCat = categoryMap[text] || text;
      session.category = selectedCat;
      session.state = 'LOCATION';
      userSessions.set(userPhone, session);

      return res.json({
        success: true,
        botReply: `Category selected: *${selectedCat}*\n\nPlease send your GPS location (e.g., "loc:22.3072,73.1812") to register the report.`,
      });
    }

    // 5. Initial Greeting ("Hi" / "VMC")
    session.state = 'CATEGORY';
    userSessions.set(userPhone, session);

    return res.json({
      success: true,
      botReply: `Welcome to VMC Citizen Portal!\n\nPlease choose a category:\n1. Pothole\n2. Water Leak\n3. Broken Streetlight\n4. Garbage Overflow\n5. Open Manhole\n6. Exposed Wiring\n7. Gas Leak`,
    });
  } catch (error) {
    console.error('[Simulate Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
