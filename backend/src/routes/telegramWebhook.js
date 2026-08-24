const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegramService');
const gisService = require('../services/gisService');
const socketService = require('../services/socketService');

/**
 * POST /api/telegram/webhook
 * Incoming webhook endpoint for Telegram Bot API
 */
router.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    if (req.body) {
      await telegramService.handleTelegramUpdate(req.body);
    }
  } catch (error) {
    console.error('[Telegram Webhook Error]:', error);
  }
});

/**
 * POST /api/telegram/simulate
 * Local developer testing endpoint for Telegram Bot interactions
 */
router.post('/simulate', async (req, res) => {
  const { chatId = 12345678, message, location, callback_data } = req.body;

  try {
    // 1. Callback query simulation (button click)
    if (callback_data) {
      await telegramService.handleTelegramUpdate({
        callback_query: {
          data: callback_data,
          message: { chat: { id: chatId } },
        },
      });
      return res.json({ success: true, action: 'callback_processed', callback_data });
    }

    // 2. GPS Location simulation
    if (location && location.latitude && location.longitude) {
      await telegramService.handleTelegramUpdate({
        message: {
          chat: { id: chatId },
          from: { first_name: 'Simulated', username: 'sim_user' },
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      });
      return res.json({ success: true, action: 'location_processed', location });
    }

    // 3. Text message simulation
    if (message) {
      await telegramService.handleTelegramUpdate({
        message: {
          chat: { id: chatId },
          from: { first_name: 'Simulated', username: 'sim_user' },
          text: message,
        },
      });
      return res.json({ success: true, action: 'message_processed', message });
    }

    return res.status(400).json({ error: 'Provide message, location, or callback_data' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
