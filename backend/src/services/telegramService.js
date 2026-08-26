const axios = require('axios');
const gisService = require('./gisService');
const socketService = require('./socketService');
const db = require('../config/db');
require('dotenv').config();

function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN || '';
}

function getTelegramApi() {
  return `https://api.telegram.org/bot${getBotToken()}`;
}

// State tracking for Telegram users
// States: 'START' | 'CATEGORY' | 'LOCATION'
const telegramSessions = new Map();

const WARDS_DATA = [
  { id: 1, name: 'Ward 1 — Sayajigunj', lat: 22.3112, lng: 73.1878, keywords: ['sayajigunj', 'sayaji', 'railway', 'station', 'ward 1', 'ward1', 'msu', 'university', 'kala ghoda'] },
  { id: 2, name: 'Ward 2 — Akota', lat: 22.2981, lng: 73.1642, keywords: ['akota', 'dandia', 'bazaar', 'ward 2', 'ward2', 'alkapuri', 'rc dutt'] },
  { id: 3, name: 'Ward 3 — Raopura', lat: 22.3025, lng: 73.2054, keywords: ['raopura', 'mandvi', 'nyayamandir', 'ward 3', 'ward3', 'tower', 'chokhandi'] },
  { id: 4, name: 'Ward 4 — Karelibaug', lat: 22.3214, lng: 73.1989, keywords: ['karelibaug', 'kareli', 'amit', 'nagar', 'ward 4', 'ward4', 'harni', 'airport'] },
  { id: 5, name: 'Ward 5 — Fatehgunj', lat: 22.3168, lng: 73.1895, keywords: ['fatehgunj', 'fateh', 'sama', 'chhani', 'ward 5', 'ward5', 'nizampura'] },
  { id: 6, name: 'Ward 6 — Manjalpur', lat: 22.2684, lng: 73.1956, keywords: ['manjalpur', 'tarsali', 'ward 6', 'ward6', 'lalbaug', 'darbar'] },
  { id: 7, name: 'Ward 7 — Makarpura', lat: 22.2512, lng: 73.1923, keywords: ['makarpura', 'gidc', 'jambuva', 'ward 7', 'ward7', 'airforce', 'novino'] },
  { id: 8, name: 'Ward 8 — Gotri', lat: 22.3125, lng: 73.1412, keywords: ['gotri', 'sevasi', 'vasna', 'bhayli', 'ward 8', 'ward8', 'laxmipura'] },
  { id: 9, name: 'Ward 9 — Gorwa', lat: 22.3341, lng: 73.1624, keywords: ['gorwa', 'subhanpura', 'panchvati', 'ward 9', 'ward9', 'ellora', 'bapod'] },
  { id: 10, name: 'Ward 10 — Waghodia Road', lat: 22.2987, lng: 73.2341, keywords: ['waghodia', 'kapurai', 'panigate', 'ajwa', 'ward 10', 'ward10', 'parivar'] },
];

function resolveLandmarkCoordinates(text) {
  if (!text) return { matched: false };
  const lower = text.toLowerCase().trim();
  for (const w of WARDS_DATA) {
    if (w.keywords.some((k) => lower.includes(k))) {
      return { matched: true, lat: w.lat, lng: w.lng, name: w.name, wardId: w.id };
    }
  }
  return { matched: false };
}

/**
 * Send Photo via Telegram Bot API
 */
async function sendPhoto(chatId, photoUrl, caption, extra = {}) {
  const token = getBotToken();
  if (!token || token === 'your_telegram_bot_token_here') {
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
  const token = getBotToken();
  if (!token || token === 'your_telegram_bot_token_here') {
    console.log(`[Telegram Simulation] ${method}:`, JSON.stringify(payload, null, 2));
    return { ok: true, simulated: true };
  }

  try {
    const response = await axios.post(`${getTelegramApi()}/${method}`, payload);
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
        { text: '💡 Streetlight', callback_data: 'cat_broken_streetlight' },
        { text: '🗑️ Garbage Dump', callback_data: 'cat_garbage_overflow' },
      ],
      [
        { text: '⚠️ Open Manhole', callback_data: 'cat_open_manhole' },
        { text: '⚡ Exposed Wiring', callback_data: 'cat_exposed_wiring' },
      ],
      [
        { text: '🔥 Gas Pipeline', callback_data: 'cat_gas_leak' },
        { text: '🚦 Traffic Signal', callback_data: 'cat_traffic_signal' },
      ],
    ],
  };

  return sendMessage(
    chatId,
    `🏛️ <b>Vadodara Municipal Corporation (VMC)</b>\n<i>Citizen Grievance Redressal Portal</i>\n\nWelcome! Please tap the type of civic issue you want to report:`,
    { reply_markup: keyboard }
  );
}

/**
 * Request Location using native GPS button + 10-Ward Picker Keyboard
 */
async function sendLocationPrompt(chatId, categoryTitle) {
  const inlineWards = {
    inline_keyboard: [
      [
        { text: '📍 Ward 1 (Sayajigunj)', callback_data: 'ward_1' },
        { text: '📍 Ward 2 (Akota)', callback_data: 'ward_2' },
      ],
      [
        { text: '📍 Ward 3 (Raopura)', callback_data: 'ward_3' },
        { text: '📍 Ward 4 (Karelibaug)', callback_data: 'ward_4' },
      ],
      [
        { text: '📍 Ward 5 (Fatehgunj)', callback_data: 'ward_5' },
        { text: '📍 Ward 6 (Manjalpur)', callback_data: 'ward_6' },
      ],
      [
        { text: '📍 Ward 7 (Makarpura)', callback_data: 'ward_7' },
        { text: '📍 Ward 8 (Gotri)', callback_data: 'ward_8' },
      ],
      [
        { text: '📍 Ward 9 (Gorwa)', callback_data: 'ward_9' },
        { text: '📍 Ward 10 (Waghodia)', callback_data: 'ward_10' },
      ],
    ],
  };

  const replyKeyboard = {
    keyboard: [
      [{ text: '📍 Share My Current GPS Location', request_location: true }],
      [{ text: '❌ Cancel' }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };

  await sendMessage(
    chatId,
    `Issue: <b>${categoryTitle}</b>\n\n📌 <b>How to set your location:</b>\n\n1️⃣ <b>Tap your Ward button below</b> 👇\n2️⃣ <b>Or tap "📍 Share GPS Location"</b> (on mobile)\n3️⃣ <b>Or type your area/landmark</b> (e.g. <i>Sayajigunj, Akota, Gotri, MSU, Alkapuri</i>)`,
    { reply_markup: inlineWards }
  );

  return sendMessage(chatId, '👇 Mobile GPS button:', {
    reply_markup: replyKeyboard,
  });
}

/**
 * Process incoming Telegram Update (Message / Callback Query)
 */
async function handleTelegramUpdate(update) {
  try {
    // 1. Handle Inline Button Callback Queries (Category / Ward / Verification)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const data = cb.data;
      const session = telegramSessions.get(chatId) || { state: 'START', category: null };

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

      // Ward Selection Button
      if (data.startsWith('ward_')) {
        const wardId = parseInt(data.replace('ward_', ''), 10);
        const ward = WARDS_DATA.find((w) => w.id === wardId) || WARDS_DATA[0];
        const category = session.category || 'Pothole';
        const senderName = cb.from.first_name ? `${cb.from.first_name} ${cb.from.last_name || ''}`.trim() : `User ${chatId}`;

        const result = await gisService.processIncomingReport({
          latitude: ward.lat,
          longitude: ward.lng,
          category,
          reporterPhone: `tg_${chatId}`,
          description: `Telegram report in ${ward.name} from ${senderName} (@${cb.from.username || chatId})`,
          photoUrl: session.photo_url || null,
        });

        await sendMessage(
          chatId,
          `✅ <b>${result.message}</b>\n\n📍 <b>Location:</b> ${ward.name}\n⚡ <b>Coordinates:</b> ${ward.lat}, ${ward.lng}\n🏢 Assigned to Ward ${ward.id} engineering squad.`,
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
    }

    // 2. Handle Messages
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const session = telegramSessions.get(chatId) || { state: 'START', category: null };

      // Handle Cancel Button
      if (msg.text === '❌ Cancel' || msg.text === '/cancel') {
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
          `📸 <b>Photo evidence received successfully!</b>\n\nPlease select your <b>Ward</b> or tap <b>📍 Share GPS Location</b> below to complete registration.`
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

      // Handle Commands / Text
      if (msg.text) {
        const text = msg.text.trim();
        const lower = text.toLowerCase();

        // System reset commands
        if (['/start', '/report', '/restart', '/reset', '/menu', 'hi', 'hello', 'help'].includes(lower)) {
          telegramSessions.set(chatId, { state: 'CATEGORY', category: null });
          await sendCategoryMenu(chatId);
          return;
        }

        // If user typed their location or address manually
        if (session.state === 'LOCATION' || session.category) {
          const loc = resolveLandmarkCoordinates(text);
          if (loc.matched) {
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
              `✅ <b>${result.message}</b>\n\n📍 <b>Location:</b> ${loc.name} (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})\n🏢 Assigned to VMC response team.`,
              { reply_markup: { remove_keyboard: true } }
            );

            telegramSessions.set(chatId, { state: 'START', category: null });

            if (result.action === 'created') {
              socketService.emitEvent('complaint:created', result.complaint);
            } else {
              socketService.emitEvent('complaint:updated', result.complaint);
            }
            return;
          } else {
            // Not matched - ask user to pick ward or send GPS instead of creating random complaint!
            await sendMessage(
              chatId,
              `⚠️ Location <b>"${text}"</b> was not recognized in Vadodara.\n\nPlease <b>tap your Ward button above</b>, tap <b>📍 Share GPS Location</b>, or type a known area (e.g. <i>Sayajigunj, Akota, Gotri, Raopura, Karelibaug, Manjalpur</i>).`
            );
            return;
          }
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
  const token = getBotToken();
  if (!token || token === 'your_telegram_bot_token_here') {
    return;
  }

  // Clear any existing webhook to ensure getUpdates receives all messages
  try {
    await axios.post(`${getTelegramApi()}/deleteWebhook`, { drop_pending_updates: false });
  } catch {
    // safe fallback
  }

  pollingActive = true;
  console.log('🤖 [Telegram Bot] Polling started. Listening for Telegram messages...');

  while (pollingActive) {
    try {
      const res = await axios.get(`${getTelegramApi()}/getUpdates`, {
        params: {
          offset: lastUpdateId + 1,
          timeout: 20,
        },
        timeout: 25000,
      });

      if (res.data && res.data.ok && Array.isArray(res.data.result)) {
        for (const update of res.data.result) {
          lastUpdateId = update.update_id;
          console.log(`📩 [Telegram Bot] Received update #${update.update_id}:`, JSON.stringify(update.message ? update.message.text || 'media/location' : update.callback_query ? update.callback_query.data : 'update'));
          await handleTelegramUpdate(update);
        }
      }
    } catch (err) {
      console.error('[Telegram Polling Error]:', err.message);
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
