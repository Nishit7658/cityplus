const axios = require('axios');
const gisService = require('./gisService');
const socketService = require('./socketService');
const db = require('../config/db');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// State tracking for Telegram users
// States: 'START' | 'CATEGORY' | 'LOCATION'
const telegramSessions = new Map();

/**
 * Send Photo via Telegram Bot API
 */
async function sendPhoto(chatId, photoUrl, caption, extra = {}) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'your_telegram_bot_token_here') {
    console.log(`[Telegram Simulation] Send Photo to #${chatId} (${photoUrl}): ${caption}`);
    return { ok: true, result: { message_id: 100 } };
  }

  return callTelegram('sendPhoto', {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: 'HTML',
    ...extra,
  });
}

/**
 * Section 4: Closed-Loop Verification
 * Outbound inline button message asking user if fix is verified
 */
async function sendClosedLoopVerification(chatId, complaintId, category, photoAfterUrl) {
  const caption = `🔧 <b>VMC Resolution Verification</b>\n\nYour civic grievance report #${complaintId} regarding <b>${category}</b> has been marked as <b>Resolved</b> by VMC engineering crews.\n\n<i>Did this repair meet municipal standards? Please confirm below:</i>`;
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '✅ Yes, Verified Fixed', callback_data: `verify_yes_${complaintId}` },
        { text: '❌ No, Still Broken', callback_data: `verify_no_${complaintId}` },
      ],
    ],
  };

  if (photoAfterUrl) {
    const fullPhotoUrl = photoAfterUrl.startsWith('http')
      ? photoAfterUrl
      : `${process.env.APP_URL || 'http://localhost:5000'}${photoAfterUrl.startsWith('/') ? '' : '/'}${photoAfterUrl}`;
    try {
      return await sendPhoto(chatId, fullPhotoUrl, caption, { reply_markup: replyMarkup });
    } catch {
      return await sendMessage(chatId, caption, { reply_markup: replyMarkup });
    }
  }

  return await sendMessage(chatId, caption, { reply_markup: replyMarkup });
}

/**
 * Send HTTP request to Telegram Bot API
 */
async function callTelegram(method, payload) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'your_telegram_bot_token_here') {
    console.log(`[Telegram Simulation] ${method}:`, JSON.stringify(payload, null, 2));
    return { ok: true, simulated: true };
  }

  try {
    const response = await axios.post(`${TELEGRAM_API}/${method}`, payload);
    return response.data;
  } catch (error) {
    console.error(`[Telegram API Error - ${method}]:`, error.response ? error.response.data : error.message);
    return null;
  }
}

/**
 * Send plain text message
 */
async function sendMessage(chatId, text, extra = {}) {
  return callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  });
}

/**
 * Send category selection menu (Inline Keyboard)
 */
async function sendCategoryMenu(chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🕳️ Road Pothole', callback_data: 'cat_pothole' },
        { text: '💧 Water Leakage', callback_data: 'cat_water_leak' },
      ],
      [
        { text: '💡 Broken Streetlight', callback_data: 'cat_broken_streetlight' },
        { text: '🗑️ Garbage Overflow', callback_data: 'cat_garbage_overflow' },
      ],
      [
        { text: '⚠️ Open Manhole', callback_data: 'cat_open_manhole' },
        { text: '⚡ Exposed Wiring', callback_data: 'cat_exposed_wiring' },
      ],
      [
        { text: '🔥 Gas Pipeline Leak', callback_data: 'cat_gas_leak' },
        { text: '🚦 Traffic Signal', callback_data: 'cat_traffic_signal' },
      ],
    ],
  };

  return sendMessage(
    chatId,
    `🏛️ <b>Vadodara Municipal Corporation (VMC)</b>\n<i>Citizen Grievance Redressal Portal</i>\n\nWelcome! Please select the type of civic issue you would like to report:`,
    { reply_markup: keyboard }
  );
}

/**
 * Request GPS Location using native Telegram location sharing button
 */
async function sendLocationPrompt(chatId, categoryTitle) {
  const keyboard = {
    keyboard: [
      [
        {
          text: '📍 Share Current Location',
          request_location: true,
        },
      ],
      [{ text: '❌ Cancel' }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };

  return sendMessage(
    chatId,
    `Category selected: <b>${categoryTitle}</b>\n\n📍 Please tap the button below to share your <b>Current GPS Location</b> so VMC field teams can dispatch directly to the spot:`,
    { reply_markup: keyboard }
  );
}

/**
 * Process incoming Telegram Update (Message / Callback Query)
 */
async function handleTelegramUpdate(update) {
  try {
    // 1. Handle Inline Button Callback Queries (Category / Verification)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const data = cb.data;

      // Closed-Loop Verification: Yes
      if (data.startsWith('verify_yes_')) {
        const complaintId = parseInt(data.replace('verify_yes_', ''), 10);
        await db.query(`UPDATE complaints SET status = 'Resolved', updated_at = NOW() WHERE id = $1;`, [complaintId]);

        await sendMessage(
          chatId,
          `✅ <b>Thank you for confirming!</b> Report #${complaintId} is now permanently closed as <b>Resolved</b> in VMC audit records.`
        );

        const updatedRes = await db.query(`SELECT * FROM complaints WHERE id = $1;`, [complaintId]);
        if (updatedRes.rows && updatedRes.rows.length > 0) {
          socketService.emitEvent('complaint:updated', updatedRes.rows[0]);
        }
        return;
      }

      // Closed-Loop Verification: No
      if (data.startsWith('verify_no_')) {
        const complaintId = parseInt(data.replace('verify_no_', ''), 10);
        const updateRes = await db.query(
          `UPDATE complaints SET status = 'Pending', reopened_count = reopened_count + 1, updated_at = NOW() WHERE id = $1 RETURNING *;`,
          [complaintId]
        );
        const reopened = (updateRes.rows && updateRes.rows[0]) || { id: complaintId, status: 'Pending', reopened_count: 1 };
        await db.query(`INSERT INTO status_logs (complaint_id, old_status, new_status) VALUES ($1, 'Resolved', 'Pending');`, [complaintId]);

        await sendMessage(
          chatId,
          `⚠️ <b>We apologize for the inconvenience.</b> Report #${complaintId} has been <b>RE-OPENED</b> and escalated with high priority to executive engineers.`
        );

        socketService.emitEvent('complaint:reopened', reopened);
        return;
      }

      // Category Selection
      if (data.startsWith('cat_')) {
        const categoryKey = data.replace('cat_', '');
        const categoryMap = {
          pothole: 'Pothole',
          water_leak: 'Water Leak',
          broken_streetlight: 'Broken Streetlight',
          garbage_overflow: 'Garbage Overflow',
          open_manhole: 'Open Manhole',
          exposed_wiring: 'Exposed Wiring',
          gas_leak: 'Gas Leak',
          traffic_signal: 'Traffic Signal',
        };
        const categoryTitle = categoryMap[categoryKey] || categoryKey;

        telegramSessions.set(chatId, { state: 'LOCATION', category: categoryTitle });
        await sendLocationPrompt(chatId, categoryTitle);
        return;
      }
    }

    // 2. Handle Messages
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const session = telegramSessions.get(chatId) || { state: 'START', category: null };

      // Handle Cancel Button
      if (msg.text === '❌ Cancel') {
        telegramSessions.set(chatId, { state: 'START', category: null });
        await sendMessage(chatId, 'Report cancelled. Send /start or /report whenever you wish to report an issue.', {
          reply_markup: { remove_keyboard: true },
        });
        return;
      }

      // Handle Photo Evidence
      if (msg.photo && msg.photo.length > 0) {
        const storageService = require('./storageService');
        const bestPhoto = msg.photo[msg.photo.length - 1];
        const photoUrl = await storageService.saveTelegramPhoto(bestPhoto.file_id);
        session.photo_url = photoUrl;
        telegramSessions.set(chatId, session);

        await sendMessage(
          chatId,
          `📸 <b>Photo evidence received successfully!</b>\n\nNow please tap <b>📍 Share Current Location</b> below to complete registration.`
        );
        return;
      }

      // Handle GPS Location Message
      if (msg.location) {
        const latitude = msg.location.latitude;
        const longitude = msg.location.longitude;
        const category = session.category || 'Pothole';
        const senderName = msg.from.first_name ? `${msg.from.first_name} ${msg.from.last_name || ''}`.trim() : `User ${chatId}`;

        const result = await gisService.processIncomingReport({
          latitude,
          longitude,
          category,
          reporterPhone: `tg_${chatId}`,
          description: `Telegram report from ${senderName} (@${msg.from.username || chatId})`,
          photoUrl: session.photo_url || null,
        });

        await sendMessage(
          chatId,
          `✅ <b>${result.message}</b>\n\n📍 <i>Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}</i>\n🏢 Designated Ward jurisdiction assigned.`,
          { reply_markup: { remove_keyboard: true } }
        );

        telegramSessions.set(chatId, { state: 'START', category: null });

        if (result.action === 'created') {
          socketService.emitEvent('complaint:created', result.complaint);
        } else {
          socketService.emitEvent('complaint:updated', result.complaint);
        }
        return;
      }

const VADODARA_LANDMARKS = [
  { keywords: ['sayajigunj', 'sayaji', 'railway', 'station', 'ward 1', 'ward1', 'msu', 'university'], lat: 22.3112, lng: 73.1878, ward: 'Ward 1 — Sayajigunj' },
  { keywords: ['akota', 'dandia', 'bazaar', 'ward 2', 'ward2', 'alkapuri'], lat: 22.2981, lng: 73.1642, ward: 'Ward 2 — Akota' },
  { keywords: ['raopura', 'mandvi', 'nyayamandir', 'ward 3', 'ward3', 'tower'], lat: 22.3025, lng: 73.2054, ward: 'Ward 3 — Raopura' },
  { keywords: ['karelibaug', 'kareli', 'amit', 'nagar', 'ward 4', 'ward4'], lat: 22.3214, lng: 73.1989, ward: 'Ward 4 — Karelibaug' },
  { keywords: ['fatehgunj', 'fateh', 'sama', 'chhani', 'ward 5', 'ward5', 'nizampura'], lat: 22.3168, lng: 73.1895, ward: 'Ward 5 — Fatehgunj' },
  { keywords: ['manjalpur', 'tarsali', 'ward 6', 'ward6', 'lalbaug'], lat: 22.2684, lng: 73.1956, ward: 'Ward 6 — Manjalpur' },
  { keywords: ['makarpura', 'gidc', 'jambuva', 'ward 7', 'ward7', 'airforce'], lat: 22.2512, lng: 73.1923, ward: 'Ward 7 — Makarpura' },
  { keywords: ['gotri', 'sevasi', 'vasna', 'bhayli', 'ward 8', 'ward8'], lat: 22.3125, lng: 73.1412, ward: 'Ward 8 — Gotri' },
  { keywords: ['gorwa', 'subhanpura', 'panchvati', 'ward 9', 'ward9', 'ellora'], lat: 22.3341, lng: 73.1624, ward: 'Ward 9 — Gorwa' },
  { keywords: ['waghodia', 'kapurai', 'panigate', 'ajwa', 'ward 10', 'ward10'], lat: 22.2987, lng: 73.2341, ward: 'Ward 10 — Waghodia Road' },
];

function resolveLandmarkCoordinates(text) {
  if (!text) return { lat: 22.3072, lng: 73.1812, name: 'Vadodara Central' };
  const lower = text.toLowerCase();
  for (const lm of VADODARA_LANDMARKS) {
    if (lm.keywords.some((k) => lower.includes(k))) {
      return { lat: lm.lat, lng: lm.lng, name: lm.ward };
    }
  }
  return { lat: 22.3072, lng: 73.1812, name: 'Vadodara Municipal Area' };
}

      // Handle Commands / Text
      if (msg.text) {
        const text = msg.text.trim();
        const lower = text.toLowerCase();

        if (lower === '/start' || lower === '/report' || lower === 'hi' || lower === 'help') {
          telegramSessions.set(chatId, { state: 'CATEGORY', category: null });
          await sendCategoryMenu(chatId);
          return;
        }

        // If user typed their location or address manually
        if (session.state === 'LOCATION' || session.category) {
          const loc = resolveLandmarkCoordinates(text);
          const category = session.category || 'Pothole';
          const senderName = msg.from.first_name ? `${msg.from.first_name} ${msg.from.last_name || ''}`.trim() : `User ${chatId}`;

          const result = await gisService.processIncomingReport({
            latitude: loc.lat,
            longitude: loc.lng,
            category,
            reporterPhone: `tg_${chatId}`,
            description: `Telegram report: "${text}" from ${senderName} (@${msg.from.username || chatId})`,
            photoUrl: session.photo_url || null,
          });

          await sendMessage(
            chatId,
            `✅ <b>${result.message}</b>\n\n📍 <b>Location:</b> ${loc.name} (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})\n🏢 Assigned to VMC Field Response Team.`,
            { reply_markup: { remove_keyboard: true } }
          );

          telegramSessions.set(chatId, { state: 'START', category: null });

          if (result.action === 'created') {
            socketService.emitEvent('complaint:created', result.complaint);
          } else {
            socketService.emitEvent('complaint:updated', result.complaint);
          }
          return;
        }

        // Default greeting
        telegramSessions.set(chatId, { state: 'CATEGORY', category: null });
        await sendCategoryMenu(chatId);
      }
    }
  } catch (err) {
    console.error('[handleTelegramUpdate Error]:', err);
  }
}

/**
 * Background Long-Polling Worker for local dev without requiring Webhook / Ngrok
 */
let pollingActive = false;
let lastUpdateId = 0;

async function startPolling() {
  if (process.env.NODE_ENV === 'test') return;
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'your_telegram_bot_token_here') {
    return;
  }

  pollingActive = true;
  console.log('🤖 [Telegram Bot] Polling started. Listening for Telegram messages...');

  while (pollingActive) {
    try {
      const res = await axios.get(`${TELEGRAM_API}/getUpdates`, {
        params: {
          offset: lastUpdateId + 1,
          timeout: 25,
        },
        timeout: 30000,
      });

      if (res.data && res.data.ok && Array.isArray(res.data.result)) {
        for (const update of res.data.result) {
          lastUpdateId = update.update_id;
          await handleTelegramUpdate(update);
        }
      }
    } catch (err) {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

function stopPolling() {
  pollingActive = false;
}

module.exports = {
  sendMessage,
  sendCategoryMenu,
  sendLocationPrompt,
  sendClosedLoopVerification,
  handleTelegramUpdate,
  startPolling,
  stopPolling,
};
