const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
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
// States: 'START' | 'CATEGORY' | 'LOCATION' | 'PHOTO'
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
 * Send Photo via Telegram Bot API (Supports local files via binary stream and remote URLs)
 */
async function sendPhoto(chatId, photoPathOrUrl, caption, extra = {}) {
  const token = getBotToken();
  if (!token || token === 'your_telegram_bot_token_here') {
    console.log(`[Telegram Simulation] Send Photo to #${chatId} (${photoPathOrUrl}): ${caption}`);
    return { ok: true, result: { message_id: 100 } };
  }

  // Check if it's a local file in /uploads
  let localFilePath = null;
  if (typeof photoPathOrUrl === 'string') {
    if (photoPathOrUrl.startsWith('/uploads/') || photoPathOrUrl.startsWith('uploads/')) {
      const filename = photoPathOrUrl.replace(/^\/?uploads\//, '');
      const fullPath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(fullPath)) {
        localFilePath = fullPath;
      }
    } else if (fs.existsSync(photoPathOrUrl)) {
      localFilePath = photoPathOrUrl;
    }
  }

  // If local file exists, send actual binary file stream to Telegram
  if (localFilePath) {
    try {
      const form = new FormData();
      form.append('chat_id', String(chatId));
      form.append('photo', fs.createReadStream(localFilePath));
      if (caption) form.append('caption', caption);
      form.append('parse_mode', 'HTML');
      if (extra && extra.reply_markup) {
        form.append('reply_markup', typeof extra.reply_markup === 'string' ? extra.reply_markup : JSON.stringify(extra.reply_markup));
      }

      const response = await axios.post(`${getTelegramApi()}/sendPhoto`, form, {
        headers: form.getHeaders(),
        timeout: 25000,
      });
      console.log(`📸 [Telegram Bot] Sent local photo "${path.basename(localFilePath)}" to chat #${chatId}`);
      return response.data;
    } catch (err) {
      console.error('[Telegram sendPhoto Local File Upload Error]:', err.response ? err.response.data : err.message);
      return await sendMessage(chatId, caption, extra);
    }
  }

  return callTelegram('sendPhoto', {
    chat_id: chatId,
    photo: photoPathOrUrl,
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
    return await sendPhoto(chatId, photoAfterUrl, caption, { reply_markup: replyMarkup });
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
 * STEP 1: Send Greeting & Category Selection Menu
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
    `👋 <b>Namaste / Hello!</b>\nWelcome to <b>Vadodara Municipal Corporation (VMC)</b> Citizen Grievance Portal.\n\nPlease select the type of civic issue you would like to report:`,
    { reply_markup: keyboard }
  );
}

/**
 * STEP 2: Request Location
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
      [
        { text: '❌ Cancel', callback_data: 'cancel_report' },
      ],
    ],
  };

  return sendMessage(
    chatId,
    `Issue selected: <b>${categoryTitle}</b>\n\n📍 <b>Please tell us where this problem is located:</b>\n\n1️⃣ <b>Tap your Ward button below</b> 👇\n2️⃣ <b>Or type your landmark/area</b> (e.g. <i>Sayajigunj, Akota, Gotri, MSU, Alkapuri</i>)\n3️⃣ <b>Or attach a Location Pin</b> (📎 ➔ Location)`,
    { reply_markup: inlineWards }
  );
}

/**
 * STEP 3: Request Photo Evidence (Optional with Skip button)
 */
async function sendPhotoPrompt(chatId, session) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '⏭️ Skip Photo & Register', callback_data: 'skip_photo' },
      ],
      [
        { text: '❌ Cancel', callback_data: 'cancel_report' },
      ],
    ],
  };

  return sendMessage(
    chatId,
    `📍 <b>Location Set:</b> ${session.locationName || 'Ward Assigned'}\n⚡ <b>Coordinates:</b> ${session.lat.toFixed(4)}, ${session.lng.toFixed(4)}\n\n📷 <b>Attach Photo Evidence (Optional):</b>\n• <b>Send a photo</b> of the issue using Telegram camera/gallery 📷\n• Or tap <b>"⏭️ Skip Photo & Register"</b> to submit directly without a photo:`,
    { reply_markup: keyboard }
  );
}

/**
 * STEP 4: Finalize Registration and Send Final Confirmation
 */
async function finalizeComplaintRegistration(chatId, session, senderName, username) {
  const result = await gisService.processIncomingReport({
    latitude: session.lat,
    longitude: session.lng,
    category: session.category || 'Pothole',
    reporterPhone: `tg_${chatId}`,
    description: `Telegram report in ${session.locationName || 'Vadodara'} from ${senderName} (@${username || chatId})`,
    photoUrl: session.photo_url || null,
  });

  const complaint = result.complaint;
  const photoStatus = session.photo_url ? '📸 Photo Attached ✓' : '📷 No Photo Attached';

  await sendMessage(
    chatId,
    `🎉 <b>Your Complaint is Successfully Registered!</b>\n\n` +
    `📋 <b>Ticket ID:</b> #${complaint.id}\n` +
    `🕳️ <b>Issue:</b> ${complaint.category}\n` +
    `📍 <b>Location:</b> ${session.locationName || `Ward ${complaint.ward_id}`}\n` +
    `⚡ <b>Coordinates:</b> ${session.lat.toFixed(5)}, ${session.lng.toFixed(5)}\n` +
    `🏢 <b>Assigned Team:</b> VMC Field Response Squad\n` +
    `🖼️ <b>Evidence:</b> ${photoStatus}\n\n` +
    `⏱️ <i>You will receive live status notifications here as VMC crews inspect and resolve your issue.</i>`
  );

  telegramSessions.set(chatId, { state: 'START', category: null, lat: null, lng: null, locationName: null, photo_url: null });

  if (result.action === 'created') {
    socketService.emitEvent('complaint:created', result.complaint);
  } else {
    socketService.emitEvent('complaint:updated', result.complaint);
  }
}

/**
 * Process incoming Telegram Update (Message / Callback Query)
 */
async function handleTelegramUpdate(update) {
  try {
    // 1. Handle Inline Button Callback Queries
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const data = cb.data;
      const session = telegramSessions.get(chatId) || { state: 'START' };
      const senderName = cb.from.first_name ? `${cb.from.first_name} ${cb.from.last_name || ''}`.trim() : `User ${chatId}`;
      const username = cb.from.username || '';

      // Cancel Report
      if (data === 'cancel_report') {
        telegramSessions.set(chatId, { state: 'START', category: null, lat: null, lng: null, locationName: null, photo_url: null });
        await sendMessage(chatId, '❌ Report cancelled. Send /start or "hi" anytime to file a grievance.');
        return;
      }

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

      // STEP 1 -> STEP 2: Category Selected -> Ask for Location
      if (data.startsWith('cat_')) {
        const categoryKey = data.replace('cat_', '');
        const categoryMap = {
          pothole: 'Road Pothole',
          water_leak: 'Water Leakage',
          broken_streetlight: 'Broken Streetlight',
          garbage_overflow: 'Garbage Dump',
          open_manhole: 'Open Manhole',
          exposed_wiring: 'Exposed Wiring',
          gas_leak: 'Gas Pipeline',
          traffic_signal: 'Traffic Signal',
        };
        const categoryTitle = categoryMap[categoryKey] || categoryKey;

        session.state = 'LOCATION';
        session.category = categoryTitle;
        telegramSessions.set(chatId, session);

        await sendLocationPrompt(chatId, categoryTitle);
        return;
      }

      // STEP 2 -> STEP 3: Ward Selected -> Ask for Photo
      if (data.startsWith('ward_')) {
        const wardId = parseInt(data.replace('ward_', ''), 10);
        const ward = WARDS_DATA.find((w) => w.id === wardId) || WARDS_DATA[0];

        session.state = 'PHOTO';
        session.lat = ward.lat;
        session.lng = ward.lng;
        session.locationName = ward.name;
        session.wardId = ward.id;
        telegramSessions.set(chatId, session);

        // If user had already attached photo, finalize immediately
        if (session.photo_url) {
          await finalizeComplaintRegistration(chatId, session, senderName, username);
          return;
        }

        await sendPhotoPrompt(chatId, session);
        return;
      }

      // STEP 3 -> STEP 4: Skip Photo -> Finalize Registration
      if (data === 'skip_photo') {
        if (!session.lat || !session.lng) {
          session.lat = 22.3112;
          session.lng = 73.1878;
          session.locationName = 'Ward 1 — Sayajigunj';
        }
        await finalizeComplaintRegistration(chatId, session, senderName, username);
        return;
      }
    }

    // 2. Handle Incoming Messages (Text, Photo, Location)
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const session = telegramSessions.get(chatId) || { state: 'START' };
      const senderName = msg.from.first_name ? `${msg.from.first_name} ${msg.from.last_name || ''}`.trim() : `User ${chatId}`;
      const username = msg.from.username || '';

      // Reset / Greeting commands
      if (msg.text) {
        const text = msg.text.trim();
        const lower = text.toLowerCase();

        if (['/start', '/report', '/restart', '/reset', '/menu', 'hi', 'hello', 'hey', 'start'].includes(lower)) {
          telegramSessions.set(chatId, { state: 'CATEGORY', category: null, lat: null, lng: null, locationName: null, photo_url: null });
          await sendCategoryMenu(chatId);
          return;
        }

        if (['/cancel', 'cancel', '❌ cancel', '/exit'].includes(lower)) {
          telegramSessions.set(chatId, { state: 'START', category: null, lat: null, lng: null, locationName: null, photo_url: null });
          await sendMessage(chatId, '❌ Report cancelled. Send "hi" or /start anytime to begin.');
          return;
        }
      }

      // Handle GPS Location Pin (STEP 2 -> STEP 3)
      if (msg.location) {
        const latitude = msg.location.latitude;
        const longitude = msg.location.longitude;
        const inMemoryStore = require('../config/inMemoryStore');
        const nearestWard = inMemoryStore.findNearestWard(latitude, longitude);

        session.state = 'PHOTO';
        session.lat = latitude;
        session.lng = longitude;
        session.locationName = nearestWard ? nearestWard.name : 'GPS Location';
        session.category = session.category || 'Road Pothole';
        telegramSessions.set(chatId, session);

        if (session.photo_url) {
          await finalizeComplaintRegistration(chatId, session, senderName, username);
          return;
        }

        await sendPhotoPrompt(chatId, session);
        return;
      }

      // Handle Photo Evidence Upload (STEP 3 -> STEP 4)
      if (msg.photo && msg.photo.length > 0) {
        const storageService = require('./storageService');
        const bestPhoto = msg.photo[msg.photo.length - 1];
        const photoUrl = await storageService.saveTelegramPhoto(bestPhoto.file_id);
        session.photo_url = photoUrl;

        // If location is already known, finalize registration directly!
        if (session.lat && session.lng) {
          await finalizeComplaintRegistration(chatId, session, senderName, username);
          return;
        }

        // If location is not yet selected, save photo and ask for category/location
        telegramSessions.set(chatId, session);
        if (!session.category) {
          session.state = 'CATEGORY';
          await sendMessage(chatId, '📸 <b>Photo received!</b>\nPlease select what issue is shown in the photo:');
          await sendCategoryMenu(chatId);
        } else {
          session.state = 'LOCATION';
          await sendMessage(chatId, '📸 <b>Photo received!</b>\nPlease select the location:');
          await sendLocationPrompt(chatId, session.category);
        }
        return;
      }

      // Handle Text Location or general text input
      if (msg.text) {
        const text = msg.text.trim();

        // If waiting for Location
        if (session.state === 'LOCATION' || session.category) {
          const loc = resolveLandmarkCoordinates(text);
          if (loc.matched) {
            session.state = 'PHOTO';
            session.lat = loc.lat;
            session.lng = loc.lng;
            session.locationName = loc.name;
            session.wardId = loc.wardId;
            telegramSessions.set(chatId, session);

            if (session.photo_url) {
              await finalizeComplaintRegistration(chatId, session, senderName, username);
              return;
            }

            await sendPhotoPrompt(chatId, session);
            return;
          } else {
            await sendMessage(
              chatId,
              `⚠️ Location <b>"${text}"</b> was not recognized in Vadodara.\n\nPlease <b>tap your Ward button</b> above or send a GPS location pin:`
            );
            return;
          }
        }

        // If waiting for Photo and user typed text instead of uploading photo
        if (session.state === 'PHOTO') {
          // Finalize without photo
          await finalizeComplaintRegistration(chatId, session, senderName, username);
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
  sendPhotoPrompt,
  sendClosedLoopVerification,
  handleTelegramUpdate,
  startPolling,
  stopPolling,
};
