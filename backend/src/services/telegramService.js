const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const gisService = require('./gisService');
const socketService = require('./socketService');
const db = require('../config/db');
const { getT } = require('./telegramI18n');
require('dotenv').config();

function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN || '';
}

function getTelegramApi() {
  return `https://api.telegram.org/bot${getBotToken()}`;
}

// State tracking for Telegram users
// States: 'LANG' | 'CATEGORY' | 'LOCATION' | 'PHOTO' | 'START'
const telegramSessions = new Map();

const WARDS_DATA = [
  {
    id: 1,
    name: 'Ward 1 — Sayajigunj',
    lat: 22.3112,
    lng: 73.1878,
    keywords: [
      'sayajigunj', 'sayaji', 'railway', 'station', 'ward 1', 'ward1', 'msu', 'university', 'kala ghoda',
      'pratapgunj', 'kadakbazar', 'dairy den', 'natubhai circle', 'jetalpur', 'sayaji baug', 'kamati baug',
      'સયાજીગંજ', 'સયાજી', 'સ્ટેશન', 'રેલ્વે', 'વોર્ડ ૧', 'એમએસયુ', 'યુનિવર્સિટી', 'કાલા ઘોડા', 'પ્રતાપગંજ', 'જેતલપુર', 'સયાજી બાગ', 'કમાટી બાગ',
      'सयाजीगंज', 'सयाजी', 'स्टेशन', 'रेलवे', 'वार्ड १', 'एमएसयू', 'यूनिवर्सिटी', 'काला घोड़ा', 'प्रतापगंज', 'जेतलपुर', 'सयाजी बाग', 'कमाटी बाग'
    ]
  },
  {
    id: 2,
    name: 'Ward 2 — Akota',
    lat: 22.2981,
    lng: 73.1642,
    keywords: [
      'akota', 'dandia', 'bazaar', 'ward 2', 'ward2', 'alkapuri', 'rc dutt', 'productivity', 'sheetal studio',
      'akota bridge', 'harinagar', 'bpc road', 'old padra road', 'op road', 'sun pharma', 'chakraputi', 'chapad',
      'અકોટા', 'દાંડિયા', 'બજાર', 'વોર્ડ ૨', 'અલકાપુરી', 'અકોટા બ્રિજ', 'હરિબાગ', 'હરીનગર', 'ઓપી રોડ', 'ઓલ્ડ પાદરા રોડ',
      'अकोटा', 'दांडिया', 'बाजार', 'वार्ड २', 'अलकापुरी', 'अकोटा ब्रिज', 'हरिनगर', 'ओपी रोड', 'ओल्ड पादरा रोड'
    ]
  },
  {
    id: 3,
    name: 'Ward 3 — Raopura',
    lat: 22.3025,
    lng: 73.2054,
    keywords: [
      'raopura', 'mandvi', 'nyayamandir', 'ward 3', 'ward3', 'tower', 'chokhandi', 'lehripura', 'jubilee baug',
      'champaner gate', 'gendi gate', 'fatehpura', 'mg road', 'khanderao market', 'sur sagar', 'sursagar',
      'રાવપુરા', 'માંડવી', 'ન્યાયમંદિર', 'વોર્ડ ૩', 'ચોખંડી', 'લહેરીપુરા', 'જુબિલી બાગ', 'ચાંપાનેર દરવાજો', 'ગેંડી ગેટ', 'ફતેહપુરા', 'સૂર સાગર', 'સુરસાગર',
      'रावपुरा', 'मांडवी', 'न्यायमंदिर', 'वार्ड ३', 'चोखंडी', 'लहेरीपुरा', 'जुबली बाग', 'चंपानेर गेट', 'गैंडी गेट', 'फतेहपुरा', 'सूर सागर', 'सूरतसागर'
    ]
  },
  {
    id: 4,
    name: 'Ward 4 — Karelibaug',
    lat: 22.3214,
    lng: 73.1989,
    keywords: [
      'karelibaug', 'kareli', 'amit nagar', 'ward 4', 'ward4', 'harni', 'airport', 'sangam', 'vip road',
      'muktanand circle', 'bright school', 'water tank', 'anand nagar', 'harni ring road', 'motnath',
      'કારેલીબાગ', 'કારેલી', 'અમિત નગર', 'વોર્ડ ૪', 'હરણી', 'એરપોર્ટ', 'સંગમ', 'વીઆઇપી રોડ', 'મુક્તાનંદ સર્કલ', 'મોતનાથ',
      'कारेलीबाग', 'कारेली', 'अमित नगर', 'वार्ड ४', 'हरणी', 'एयरपोर्ट', 'संगम', 'वीआईपी रोड', 'मुक्तानंद सर्कल', 'मोतनाथ'
    ]
  },
  {
    id: 5,
    name: 'Ward 5 — Fatehgunj',
    lat: 22.3168,
    lng: 73.1895,
    keywords: [
      'fatehgunj', 'fateh', 'sama', 'chhani', 'ward 5', 'ward5', 'nizampura', 'sama savli', 'chhani jakatnaka',
      'abhilasha', 'tp 13', 'gsfc', 'navrachana', 'chhani village', 'sama canal', 'dumad', 'ranoli',
      'ફતેહગંજ', 'ફતેહ', 'સમા', 'છાણી', 'વોર્ડ ૫', 'નિઝામપુરા', 'સમા સાવલી', 'અભિલાષા', 'નવરચના', 'દુમાડ', 'રણોલી',
      'फतेहगंज', 'फतेह', 'समा', 'छाणी', 'वार्ड ५', 'निजामपुरा', 'समा सावली', 'अभिलाषा', 'नवरचना', 'दुमाड', 'रणोली'
    ]
  },
  {
    id: 6,
    name: 'Ward 6 — Manjalpur',
    lat: 22.2684,
    lng: 73.1956,
    keywords: [
      'manjalpur', 'tarsali', 'ward 6', 'ward6', 'lalbaug', 'darbar chowkdi', 'eva mall', 'kubereshwar',
      'shreyas school', 'susen', 'tarsali ring road', 'vrajdham', 'makarpura road',
      'માંજલપુર', 'તરસાલી', 'વોર્ડ ૬', 'લાલબાગ', 'દરબાર ચોકડી', 'ઇવા મોલ', 'કુબેરેશ્વર', 'સુસેન', 'વ્રજધામ',
      'मांजलपुर', 'तरसाली', 'वार्ड ६', 'लालबाग', 'दरबार चौकड़ी', 'इवा मॉल', 'कुबेरेश्वर', 'सुसेन', 'व्रजधाम'
    ]
  },
  {
    id: 7,
    name: 'Ward 7 — Makarpura',
    lat: 22.2512,
    lng: 73.1923,
    keywords: [
      'makarpura', 'gidc', 'jambuva', 'ward 7', 'ward7', 'air force', 'airforce', 'novino', 'maneja',
      'vadsar', 'danteshwar', 'ongc colony', 'makarpura palace', 'tarsali bypass', 'por', 'kelanpur',
      'મકરપુરા', 'જીઆઇડીસી', 'જાંબુવા', 'વોર્ડ ૭', 'માણેજા', 'વડસર', 'દાંતેશ્વર', 'પોર', 'કેલનપુર',
      'मकरपुरा', 'जीआईडीसी', 'जांबुवा', 'वार्ड ७', 'मानेजा', 'वडसर', 'दांतेश्वर', 'पोर', 'केलनपुर'
    ]
  },
  {
    id: 8,
    name: 'Ward 8 — Gotri',
    lat: 22.3125,
    lng: 73.1412,
    keywords: [
      'gotri', 'sevasi', 'vasna', 'bhayli', 'ward 8', 'ward8', 'laxmipura', 'vasna road', 'bhayli road',
      'sterling hospital', 'yash complex', 'priya cinema', 'new alkapuri', 'bil', 'khanpur', 'ampad',
      'ગોત્રી', 'સેવાસી', 'વાસણા', 'ભાયલી', 'વોર્ડ ૮', 'લક્ષ્મીપુરા', 'વાસણા રોડ', 'ન્યૂ અલકાપુરી', 'બીલ', 'ખાનપુર',
      'गोत्री', 'सेवासा', 'वासना', 'भायली', 'वार्ड ८', 'लक्ष्मीपुरा', 'वासना रोड', 'न्यू अलकापुरी', 'बील', 'खानपुर'
    ]
  },
  {
    id: 9,
    name: 'Ward 9 — Gorwa',
    lat: 22.3341,
    lng: 73.1624,
    keywords: [
      'gorwa', 'subhanpura', 'panchvati', 'ward 9', 'ward9', 'ellora park', 'high tension', 'refinery road',
      'karodiya', 'undera', 'alembic road', 'madhavnagar', 'ipcl', 'bapod',
      'ગોરવા', 'સુભાનપુરા', 'પંચવટી', 'વોર્ડ ૯', 'એલોરા પાર્ક', 'રિફાઇનરી રોડ', 'કરોડિયા', 'ઉંડેરા', 'એલેમ્બિક રોડ', 'બાપોદ',
      'गोरवा', 'सुभानपुरा', 'पंचवटी', 'वार्ड ९', 'एलोरा पार्क', 'रिफाइनरी रोड', 'करोड़िया', 'उंडेरा', 'एलेम्बिक रोड', 'बापोद'
    ]
  },
  {
    id: 10,
    name: 'Ward 10 — Waghodia Road',
    lat: 22.2987,
    lng: 73.2341,
    keywords: [
      'waghodia', 'kapurai', 'panigate', 'ajwa', 'ward 10', 'ward10', 'parivar char rasta', 'kendranagar',
      'soma talav', 'dabhoi road', 'golden chowkdi', 'ajwa road', 'waghodia road', 'gurukul', 'khatamba',
      'વાઘોડિયા', 'કપુરાઈ', 'પાણીગેટ', 'આજવા', 'વોર્ડ ૧૦', 'પરિવાર ચાર રસ્તા', 'સોમા તળાવ', 'ડભોઈ રોડ', 'ગોલ્ડન ચોકડી', 'આજવા રોડ', 'વાઘોડિયા રોડ',
      'वाघोडिया', 'कपुराई', 'पानीगेट', 'आजवा', 'वार्ड १०', 'परिवार चार रास्ता', 'सोमा तालाब', 'डभोई रोड', 'गोल्डन चौकड़ी', 'आजवा रोड', 'वाघोडिया रोड'
    ]
  },
];

function resolveLandmarkCoordinates(text) {
  if (!text) return { matched: false };
  // Clean punctuation and normalize whitespace
  const cleanText = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const w of WARDS_DATA) {
    if (w.keywords.some((k) => cleanText.includes(k))) {
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
async function sendClosedLoopVerification(chatId, complaintId, category, photoAfterUrl, lang = 'en') {
  const session = telegramSessions.get(chatId) || telegramSessions.get(Number(chatId)) || {};
  const effectiveLang = session.lang || lang || 'en';
  const t = getT(effectiveLang);

  const caption = t.closed_loop_caption(complaintId, category);
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: t.yes_verified_btn, callback_data: `verify_yes_${complaintId}` },
        { text: t.no_broken_btn, callback_data: `verify_no_${complaintId}` },
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
async function callTelegram(method, payload, retries = 2) {
  const token = getBotToken();
  if (!token || token === 'your_telegram_bot_token_here') {
    console.log(`[Telegram Simulation] ${method}:`, JSON.stringify(payload, null, 2));
    return { ok: true, simulated: true };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(`${getTelegramApi()}/${method}`, payload, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (attempt < retries && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED')) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      console.error(`[Telegram API Error - ${method}]:`, error.response ? error.response.data : error.message);
      return null;
    }
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
 * STEP 0: Send Language Selection Menu
 */
async function sendLanguageMenu(chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🇬🇧 English', callback_data: 'lang_en' },
      ],
      [
        { text: '🇮🇳 ગુજરાતી (Gujarati)', callback_data: 'lang_gu' },
      ],
      [
        { text: '🇮🇳 हिन्दी (Hindi)', callback_data: 'lang_hi' },
      ],
    ],
  };

  const greetingText =
    `🏛️ <b>Vadodara Municipal Corporation (VMC)</b>\n` +
    `વડોદરા મહાનગરપાલિકા નાગરિક ફરિયાદ નિવારણ પોર્ટલ\n` +
    `वडोदरा महानगर पालिका नागरिक शिकायत निवारण पोर्टल\n\n` +
    `🌐 <b>Please choose your language / આપની ભાષા પસંદ કરો / अपनी भाषा चुनें:</b>`;

  return sendMessage(chatId, greetingText, { reply_markup: keyboard });
}

/**
 * STEP 1: Send Greeting & Category Selection Menu (Localized)
 */
async function sendCategoryMenu(chatId, lang = 'en') {
  const t = getT(lang);
  const keyboard = {
    inline_keyboard: [
      [
        { text: t.categories.pothole, callback_data: 'cat_pothole' },
        { text: t.categories.water_leak, callback_data: 'cat_water_leak' },
      ],
      [
        { text: t.categories.broken_streetlight, callback_data: 'cat_broken_streetlight' },
        { text: t.categories.garbage_overflow, callback_data: 'cat_garbage_overflow' },
      ],
      [
        { text: t.categories.open_manhole, callback_data: 'cat_open_manhole' },
        { text: t.categories.exposed_wiring, callback_data: 'cat_exposed_wiring' },
      ],
      [
        { text: t.categories.gas_leak, callback_data: 'cat_gas_leak' },
        { text: t.categories.traffic_signal, callback_data: 'cat_traffic_signal' },
      ],
      [
        { text: t.change_language_btn, callback_data: 'change_language' },
      ],
    ],
  };

  return sendMessage(
    chatId,
    t.welcome_header,
    { reply_markup: keyboard }
  );
}

/**
 * STEP 2: Request Location (Localized)
 */
async function sendLocationPrompt(chatId, categoryKey, lang = 'en') {
  const t = getT(lang);
  const categoryTitle = t.categories[categoryKey] || categoryKey;

  const inlineWards = {
    inline_keyboard: [
      [
        { text: t.wards[0].label, callback_data: 'ward_1' },
        { text: t.wards[1].label, callback_data: 'ward_2' },
      ],
      [
        { text: t.wards[2].label, callback_data: 'ward_3' },
        { text: t.wards[3].label, callback_data: 'ward_4' },
      ],
      [
        { text: t.wards[4].label, callback_data: 'ward_5' },
        { text: t.wards[5].label, callback_data: 'ward_6' },
      ],
      [
        { text: t.wards[6].label, callback_data: 'ward_7' },
        { text: t.wards[7].label, callback_data: 'ward_8' },
      ],
      [
        { text: t.wards[8].label, callback_data: 'ward_9' },
        { text: t.wards[9].label, callback_data: 'ward_10' },
      ],
      [
        { text: t.location_off_btn, callback_data: 'location_off_help' },
      ],
      [
        { text: t.cancel_btn, callback_data: 'cancel_report' },
      ],
    ],
  };

  const gpsReplyKeyboard = {
    keyboard: [
      [{ text: t.share_gps_btn, request_location: true }],
      [{ text: t.cancel_btn }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };

  await sendMessage(
    chatId,
    t.location_prompt(categoryTitle),
    { reply_markup: inlineWards }
  );

  return sendMessage(chatId, t.location_keyboard_hint, {
    reply_markup: gpsReplyKeyboard,
  });
}

/**
 * STEP 3: Request Photo Evidence (Localized)
 */
async function sendPhotoPrompt(chatId, session) {
  const lang = session.lang || 'en';
  const t = getT(lang);

  const keyboard = {
    inline_keyboard: [
      [
        { text: t.take_photo_btn, callback_data: 'action_take_photo' },
      ],
      [
        { text: t.skip_photo_btn, callback_data: 'skip_photo' },
      ],
      [
        { text: t.cancel_btn, callback_data: 'cancel_report' },
      ],
    ],
  };

  return sendMessage(
    chatId,
    t.photo_prompt(session.locationName || 'Ward Assigned', session.lat || 22.3112, session.lng || 73.1878),
    { reply_markup: keyboard }
  );
}

/**
 * STEP 4: Finalize Registration and Send Final Confirmation (Localized)
 */
async function finalizeComplaintRegistration(chatId, session, senderName, username) {
  const lang = session.lang || 'en';
  const t = getT(lang);

  const rawCategoryKey = session.categoryKey || 'pothole';
  const englishCategoryMap = {
    pothole: 'Road Pothole',
    water_leak: 'Water Leakage',
    broken_streetlight: 'Broken Streetlight',
    garbage_overflow: 'Garbage Dump',
    open_manhole: 'Open Manhole',
    exposed_wiring: 'Exposed Wiring',
    gas_leak: 'Gas Pipeline',
    traffic_signal: 'Traffic Signal',
  };
  const categoryForDb = englishCategoryMap[rawCategoryKey] || session.category || 'Road Pothole';
  const localizedCategory = (t.categories && t.categories[rawCategoryKey]) || categoryForDb;

  const result = await gisService.processIncomingReport({
    latitude: session.lat,
    longitude: session.lng,
    category: categoryForDb,
    reporterPhone: `tg_${chatId}`,
    description: `Telegram (${lang.toUpperCase()}) report in ${session.locationName || 'Vadodara'} from ${senderName} (@${username || chatId})`,
    photoUrl: session.photo_url || null,
  });

  const complaint = result.complaint;
  const hasPhoto = Boolean(session.photo_url);

  await sendMessage(
    chatId,
    t.success_registration(
      { ...complaint, category: localizedCategory },
      session.locationName,
      session.lat,
      session.lng,
      hasPhoto
    ),
    { reply_markup: { remove_keyboard: true } }
  );

  // Preserve user language preference for subsequent notifications
  telegramSessions.set(chatId, {
    state: 'START',
    lang: session.lang || 'en',
    categoryKey: null,
    category: null,
    lat: null,
    lng: null,
    locationName: null,
    photo_url: null,
  });

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
      const session = telegramSessions.get(chatId) || { state: 'START', lang: 'en' };
      const senderName = cb.from.first_name ? `${cb.from.first_name} ${cb.from.last_name || ''}`.trim() : `User ${chatId}`;
      const username = cb.from.username || '';
      const t = getT(session.lang);

      // Immediately acknowledge callback query to stop button loading spinner on Telegram UI
      if (cb.id) {
        callTelegram('answerCallbackQuery', { callback_query_id: cb.id }).catch(() => {});
      }

      // STEP 0: Language Selection Callback
      if (data.startsWith('lang_')) {
        const selectedLang = data.replace('lang_', ''); // 'en', 'gu', 'hi'
        session.lang = ['en', 'gu', 'hi'].includes(selectedLang) ? selectedLang : 'en';
        session.state = 'CATEGORY';
        telegramSessions.set(chatId, session);

        await sendCategoryMenu(chatId, session.lang);
        return;
      }

      // Change Language Action
      if (data === 'change_language') {
        session.state = 'LANG';
        telegramSessions.set(chatId, session);
        await sendLanguageMenu(chatId);
        return;
      }

      // Cancel Report Action
      if (data === 'cancel_report') {
        telegramSessions.set(chatId, { state: 'START', lang: session.lang || 'en', categoryKey: null, category: null, lat: null, lng: null, locationName: null, photo_url: null });
        await sendMessage(chatId, t.cancelled, { reply_markup: { remove_keyboard: true } });
        return;
      }

      // Closed-Loop Verification: Yes
      if (data.startsWith('verify_yes_')) {
        const complaintId = parseInt(data.replace('verify_yes_', ''), 10);
        await db.query(`UPDATE complaints SET status = 'Resolved', updated_at = NOW() WHERE id = $1;`, [complaintId]);

        await sendMessage(chatId, t.verification_yes_ack(complaintId));

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

        await sendMessage(chatId, t.verification_no_ack(complaintId));

        socketService.emitEvent('complaint:reopened', reopened);
        return;
      }

      // STEP 1 -> STEP 2: Category Selected -> Ask for Location
      if (data.startsWith('cat_')) {
        const categoryKey = data.replace('cat_', '');
        const currentT = getT(session.lang || 'en');
        const categoryTitle = (currentT.categories && currentT.categories[categoryKey]) || categoryKey;

        session.state = 'LOCATION';
        session.categoryKey = categoryKey;
        session.category = categoryTitle;
        telegramSessions.set(chatId, session);

        await sendLocationPrompt(chatId, categoryKey, session.lang || 'en');
        return;
      }

      // STEP 2 -> STEP 3: Ward Selected -> Ask for Photo
      if (data.startsWith('ward_')) {
        const wardId = parseInt(data.replace('ward_', ''), 10);
        const ward = WARDS_DATA.find((w) => w.id === wardId) || WARDS_DATA[0];
        const currentT = getT(session.lang || 'en');
        const localizedWard = (currentT.wards && currentT.wards.find((w) => w.id === wardId)) || ward;

        session.state = 'PHOTO';
        session.lat = ward.lat;
        session.lng = ward.lng;
        session.locationName = localizedWard.name || ward.name;
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

      // Location OFF Help Guide
      if (data === 'location_off_help') {
        await sendMessage(chatId, t.location_off_help);
        return;
      }

      // Take Photo Action Button
      if (data === 'action_take_photo' || data === 'prompt_photo_help') {
        await sendMessage(chatId, t.photo_help);
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
      const session = telegramSessions.get(chatId) || { state: 'START', lang: 'en' };
      const senderName = msg.from.first_name ? `${msg.from.first_name} ${msg.from.last_name || ''}`.trim() : `User ${chatId}`;
      const username = msg.from.username || '';
      const t = getT(session.lang || 'en');

      // Check text commands & greetings
      if (msg.text) {
        const text = msg.text.trim();
        const lower = text.toLowerCase();

        // Language change command
        if (['/lang', '/language', 'language', 'ભાષા', 'भाषा'].includes(lower)) {
          session.state = 'LANG';
          telegramSessions.set(chatId, session);
          await sendLanguageMenu(chatId);
          return;
        }

        // Cancel command in all 3 languages
        if (['/cancel', 'cancel', '❌ cancel', '/exit', 'રદ કરો', 'રદ', 'रद्द करें', 'रद्द', '❌ રદ કરો', '❌ રદ કરો (cancel)', '❌ ફરિયાદ રદ કરો (cancel)', '❌ शिकायत रद्द करें (cancel)'].includes(lower)) {
          telegramSessions.set(chatId, { state: 'START', lang: session.lang || 'en', categoryKey: null, category: null, lat: null, lng: null, locationName: null, photo_url: null });
          await sendMessage(chatId, t.cancelled, { reply_markup: { remove_keyboard: true } });
          return;
        }

        // Reset / Greeting commands in all 3 languages
        const greetingKeywords = [
          '/start', '/report', '/restart', '/reset', '/menu', 'hi', 'hello', 'hey', 'start',
          'namaste', 'kem cho', 'kemcho', 'નમસ્તે', 'નમસ્કાર', 'કેમ છો', 'કેમછો', 'હેલો', 'હાય',
          'नमस्ते', 'नमस्कार', 'हेलो', 'हाय', 'शुरू', 'શરૂ'
        ];

        if (greetingKeywords.includes(lower)) {
          // Always prompt language selection first on initial greeting/start
          session.state = 'LANG';
          telegramSessions.set(chatId, session);
          await sendLanguageMenu(chatId);
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
        session.categoryKey = session.categoryKey || 'pothole';
        telegramSessions.set(chatId, session);

        if (session.photo_url) {
          await finalizeComplaintRegistration(chatId, session, senderName, username);
          return;
        }

        await sendPhotoPrompt(chatId, session);
        return;
      }

      // Handle WebApp Camera Data (from Telegram Mini App)
      if (msg.web_app_data) {
        try {
          const parsed = JSON.parse(msg.web_app_data.data);
          if (parsed && parsed.photo_url) {
            session.photo_url = parsed.photo_url;
            telegramSessions.set(chatId, session);
            await finalizeComplaintRegistration(chatId, session, senderName, username);
            return;
          }
        } catch (e) {
          console.error('[Telegram WebApp Data Parse Error]:', e.message);
        }
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
        if (!session.categoryKey) {
          session.state = 'CATEGORY';
          await sendMessage(chatId, t.photo_received_choose_cat);
          await sendCategoryMenu(chatId, session.lang || 'en');
        } else {
          session.state = 'LOCATION';
          await sendMessage(chatId, t.photo_received_choose_loc);
          await sendLocationPrompt(chatId, session.categoryKey, session.lang || 'en');
        }
        return;
      }

      // Handle Text Location or general text input
      if (msg.text) {
        const text = msg.text.trim();

        // If waiting for Language Selection and user typed a language name
        if (session.state === 'LANG') {
          const lower = text.toLowerCase();
          if (lower.includes('guj') || lower.includes('ગુજ')) {
            session.lang = 'gu';
          } else if (lower.includes('hin') || lower.includes('હિન્') || lower.includes('हिन्द')) {
            session.lang = 'hi';
          } else {
            session.lang = 'en';
          }
          session.state = 'CATEGORY';
          telegramSessions.set(chatId, session);
          await sendCategoryMenu(chatId, session.lang);
          return;
        }

        // If waiting for Location
        if (session.state === 'LOCATION' || session.categoryKey) {
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
              t.unrecognized_location(text)
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

        // Default greeting / initial prompt -> Send Language Menu
        session.state = 'LANG';
        telegramSessions.set(chatId, session);
        await sendLanguageMenu(chatId);
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
          try {
            console.log(`📩 [Telegram Bot] Received update #${update.update_id}:`, JSON.stringify(update.message ? update.message.text || 'media/location' : update.callback_query ? update.callback_query.data : 'update'));
            await handleTelegramUpdate(update);
          } catch (updateErr) {
            console.error(`[Telegram Update #${update.update_id} Error]:`, updateErr.message);
          }
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
  sendLanguageMenu,
  sendCategoryMenu,
  sendLocationPrompt,
  sendPhotoPrompt,
  sendClosedLoopVerification,
  handleTelegramUpdate,
  startPolling,
  stopPolling,
};
