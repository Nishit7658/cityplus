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
    name: 'Ward 1 — Sayajigunj & Fatehgunj',
    lat: 22.3112,
    lng: 73.1878,
    keywords: [
      'sayajigunj', 'fatehgunj', 'ms university', 'msu', 'railway station', 'kala ghoda', 'pratapgunj',
      'kadakbazar', 'dairy den', 'natubhai circle', 'jetalpur', 'sayaji baug', 'kamati baug', 'ward 1', 'ward1',
      'સયાજીગંજ', 'ફતેહગંજ', 'એમએસયુ', 'સ્ટેશન', 'કાલા ઘોડા', 'પ્રતાપગંજ', 'વોર્ડ ૧',
      'सयाजीगंज', 'फतेहगंज', 'एमएसयू', 'स्टेशन', 'काला घोड़ा', 'प्रतापगंज', 'वार्ड १'
    ]
  },
  {
    id: 2,
    name: 'Ward 2 — Harni & Warasia',
    lat: 22.3385,
    lng: 73.2140,
    keywords: [
      'harni', 'warasia', 'sawad', 'shweta park', 'harni airport', 'sangam char rasta', 'motnath', 'harni road', 'ward 2', 'ward2',
      'હરણી', 'વારસિયા', 'સવાદ', 'શ્વેતા પાર્ક', 'એરપોર્ટ', 'મોતનાથ', 'વોર્ડ ૨',
      'हरणी', 'वारसिया', 'सवाद', 'श्वेता पार्क', 'एयरपोर्ट', 'मोतनाथ', 'वार्ड २'
    ]
  },
  {
    id: 3,
    name: 'Ward 3 — Waghodia Road & Bapod',
    lat: 22.2987,
    lng: 73.2341,
    keywords: [
      'waghodia', 'waghodia road', 'bapod', 'kapurai', 'parivar char rasta', 'kendranagar', 'gurukul', 'khatamba', 'ward 3', 'ward3',
      'વાઘોડિયા', 'વાઘોડિયા રોડ', 'બાપોદ', 'કપુરાઈ', 'પરિવાર ચાર રસ્તા', 'વોર્ડ ૩',
      'वाघोडिया', 'वाघोडिया रोड', 'बापोद', 'कपुराई', 'परिवार चार रास्ता', 'वार्ड ३'
    ]
  },
  {
    id: 4,
    name: 'Ward 4 — Karelibaug & Sangam',
    lat: 22.3214,
    lng: 73.1989,
    keywords: [
      'karelibaug', 'kareli', 'sangam', 'vip road', 'muktanand circle', 'bright school', 'khaswadi', 'bahucharaji', 'amrapali', 'ward 4', 'ward4',
      'કારેલીબાગ', 'સંગમ', 'વીઆઈપી રોડ', 'મુક્તાનંદ', 'ખાસવાડી', 'વોર્ડ ૪',
      'कारेलीबाग', 'संगम', 'वीआईपी रोड', 'मुक्तानंद', 'खासवाड़ी', 'वार्ड ४'
    ]
  },
  {
    id: 5,
    name: 'Ward 5 — Raopura & Mandvi',
    lat: 22.3025,
    lng: 73.2054,
    keywords: [
      'raopura', 'dandia bazar', 'mandvi', 'nyaymandir', 'nyayamandir', 'jubileebaug', 'champaner gate', 'mg road', 'lehripura', 'tower', 'ward 5', 'ward5',
      'રાવપુરા', 'દાંડિયા બજાર', 'માંડવી', 'ન્યાયમંદિર', 'જુબિલી બાગ', 'ચાંપાનેર ગેટ', 'વોર્ડ ૫',
      'रावपुरा', 'दांडिया बाजार', 'मांडवी', 'न्यायमंदिर', 'जुबली बाग', 'चंपानेर गेट', 'वार्ड ५'
    ]
  },
  {
    id: 6,
    name: 'Ward 6 — Akota & Gotri',
    lat: 22.2981,
    lng: 73.1642,
    keywords: [
      'akota', 'gotri', 'hari nagar', 'harinagar', 'alkapuri', 'rc dutt road', 'akota bridge', 'bpc road', 'productivity road', 'ward 6', 'ward6',
      'અકોટા', 'ગોત્રી', 'હરિ નગર', 'અલકાપુરી', 'અકોટા બ્રિજ', 'વોર્ડ ૬',
      'अकोटा', 'गोत्री', 'हरि नगर', 'अलकापुरी', 'अकोटा ब्रिज', 'वार्ड ६'
    ]
  },
  {
    id: 7,
    name: 'Ward 7 — Nizampura & Chhani',
    lat: 22.3340,
    lng: 73.1820,
    keywords: [
      'nizampura', 'chhani', 'tp-13', 'tp 13', 'chhani jakatnaka', 'mehsananagar', 'gsfc', 'swaminarayan chhani', 'ward 7', 'ward7',
      'નિઝામપુરા', 'છાણી', 'ટીપી ૧૩', 'છાણી જકાતનાકા', 'જીએસએફસી', 'વોર્ડ ૭',
      'निजामपुरा', 'छाणी', 'टीपी १३', 'छाणी जकातनाका', 'जीएसएफसी', 'वार्ड ७'
    ]
  },
  {
    id: 8,
    name: 'Ward 8 — Nagarwada',
    lat: 22.3120,
    lng: 73.2010,
    keywords: [
      'nagarwada', 'karelibaug part', 'bhadra kacheri', 'salatwada', 'macchipith', 'panigate road', 'ward 8', 'ward8',
      'નાગરવાડા', 'સલાટવાડા', 'મચ્છીપીઠ', 'ભદ્ર કચેરી', 'વોર્ડ ૮',
      'नागरवाड़ा', 'सलाटवाड़ा', 'मच्छीपीठ', 'भद्र कचेरी', 'वार्ड ८'
    ]
  },
  {
    id: 9,
    name: 'Ward 9 — Ajwa Road',
    lat: 22.3110,
    lng: 73.2315,
    keywords: [
      'ajwa road', 'ajwa', 'kishanwadi', 'sayaji park', 'sardar estate', 'kamlanagar', 'ekta nagar', 'panigate tank', 'ward 9', 'ward9',
      'આજવા રોડ', 'કિશનવાડી', 'સરદાર એસ્ટેટ', 'કમલાનગર', 'એકતા નગર', 'વોર્ડ ૯',
      'आजवा रोड', 'किशनवाड़ी', 'सरदार एस्टेट', 'कमलानगर', 'एकता नगर', 'वार्ड ९'
    ]
  },
  {
    id: 10,
    name: 'Ward 10 — Subhanpura & Gorwa',
    lat: 22.3341,
    lng: 73.1624,
    keywords: [
      'subhanpura', 'gorwa', 'laxmipura', 'panchvati', 'ellora park', 'high tension road', 'alembic', 'samta', 'ward 10', 'ward10',
      'સુભાનપુરા', 'ગોરવા', 'લક્ષ્મીપુરા', 'પંચવટી', 'એલોરા પાર્ક', 'વોર્ડ ૧૦',
      'सुभानपुरा', 'गोरवा', 'लक्ष्मीपुरा', 'पंचवटी', 'एलोरा पार्क', 'वार्ड १०'
    ]
  },
  {
    id: 11,
    name: 'Ward 11 — Vasna-Bhayli & Diwalipura',
    lat: 22.2885,
    lng: 73.1465,
    keywords: [
      'vasna', 'bhayli', 'vasna-bhayli', 'diwalipura', 'court', 'old padra road', 'chakli circle', 'monalisa char rasta', 'ward 11', 'ward11',
      'વાસણા', 'ભાયલી', 'દિવાળીપુરા', 'ઓલ્ડ પાદરા રોડ', 'ચકલી સર્કલ', 'વોર્ડ ૧૧',
      'वासणा', 'भायली', 'दिवालीपुरा', 'ओल्ड पादरा रोड', 'चकली सर्कल', 'वार्ड ११'
    ]
  },
  {
    id: 12,
    name: 'Ward 12 — Makarpura & Maneja',
    lat: 22.2512,
    lng: 73.1923,
    keywords: [
      'makarpura', 'maneja', 'gidc', 'makarpura gidc', 'air force', 'novino', 'ongc', 'makarpura depot', 'ward 12', 'ward12',
      'મકરપુરા', 'માણેજા', 'જીઆઇડીસી', 'નોવિનો', 'ઓએનજીસી', 'વોર્ડ ૧૨',
      'मकरपुरा', 'मानेजा', 'जीआईडीसी', 'नोविनो', 'ओएनजीसी', 'वार्ड १२'
    ]
  },
  {
    id: 13,
    name: 'Ward 13 — Wadi & Ghadiali Pole',
    lat: 22.2965,
    lng: 73.2085,
    keywords: [
      'wadi', 'ghadiali pole', 'khanderao market', 'chokhandi', 'mogalwada', 'gajrawadi', 'panigate darwaja', 'ward 13', 'ward13',
      'વાડી', 'ઘડિયાળી પોળ', 'મોગલવાડા', 'ગાજરાવાડી', 'પાણીગેટ દરવાજો', 'વોર્ડ ૧૩',
      'वाडी', 'घडियाली पोल', 'मोगलवाड़ा', 'गाजरावाड़ी', 'पानीगेट दरवाजा', 'वार्ड १३'
    ]
  },
  {
    id: 14,
    name: 'Ward 14 — Tarsali & Danteshwar',
    lat: 22.2615,
    lng: 73.2045,
    keywords: [
      'tarsali', 'soma talav', 'danteshwar', 'tarsali bypass', 'susen circle', 'kubereshwar marg', 'shreyas school', 'ward 14', 'ward14',
      'તરસાલી', 'સોમા તળાવ', 'દાંતેશ્વર', 'સુસેન સર્કલ', 'કુબેરેશ્વર', 'વોર્ડ ૧૪',
      'तरसाली', 'सोमा तालाब', 'दांतेश्वर', 'सुसेन सर्कल', 'कुबेरेश्वर', 'वार्ड १४'
    ]
  },
  {
    id: 15,
    name: 'Ward 15 — Bapod & Ajwa Outer',
    lat: 22.3180,
    lng: 73.2450,
    keywords: [
      'bapod outer', 'ajwa road outer', 'sikandar nagar', 'madhav park', 'shree hari society', 'nimeta road', 'ward 15', 'ward15',
      'બાપોદ આઉટર', 'આજવા આઉટર', 'સિકંદર નગર', 'માધવ પાર્ક', 'નિમેટા રોડ', 'વોર્ડ ૧૫',
      'बापोद आउटर', 'आजवा आउटर', 'सिकंदर नगर', 'माधव पार्क', 'निमेता रोड', 'वार्ड १५'
    ]
  },
  {
    id: 16,
    name: 'Ward 16 — Kishanwadi & Soma Talav',
    lat: 22.2850,
    lng: 73.2210,
    keywords: [
      'kishanwadi part', 'soma talav cross', 'dabhoi road', 'pratapnagar', 'onkar nagar', 'ramdevnagar', 'ward 16', 'ward16',
      'કિશનવાડી પાર્ટ', 'સોમા તળાવ ક્રોસ', 'ડભોઈ રોડ', 'પ્રતાપનગર', 'ઓમકાર નગર', 'વોર્ડ ૧૬',
      'किशनवाड़ी पार्ट', 'सोमा तालाब क्रॉस', 'डभोई रोड', 'प्रतापनगर', 'ओमकार नगर', 'वार्ड १६'
    ]
  },
  {
    id: 17,
    name: 'Ward 17 — Manjalpur & Atladra',
    lat: 22.2684,
    lng: 73.1780,
    keywords: [
      'manjalpur', 'atladra', 'bill', 'chapad', 'bill-chapad', 'swaminarayan mandir atladra', 'eva mall', 'sun pharma road', 'kalali', 'ward 17', 'ward17',
      'માંજલપુર', 'અટલાદરા', 'બીલ', 'ચાપડ', 'ઇવા મોલ', 'કલાલી', 'વોર્ડ ૧૭',
      'मांजलपुर', 'अटलादरा', 'बील', 'चापड', 'इवा मॉल', 'कलाली', 'वार्ड १७'
    ]
  },
  {
    id: 18,
    name: 'Ward 18 — Tandalja & Vasna Road',
    lat: 22.2840,
    lng: 73.1610,
    keywords: [
      'tandalja', 'vasna road', 'ashwamegh', 'bansal mall', 'tandalja road', 'sun pharma', 'samta char rasta', 'ward 18', 'ward18',
      'તાંદલજા', 'વાસણા રોડ', 'અશ્વમેઘ', 'બંસલ મોલ', 'સમત ચાર રસ્તા', 'વોર્ડ ૧૮',
      'तांदलजा', 'वासणा रोड', 'अश्वमेघ', 'बंसल मॉल', 'समता चार रास्ता', 'वार्ड १८'
    ]
  },
  {
    id: 19,
    name: 'Ward 19 — Kapurai-Tarsali (South)',
    lat: 22.2450,
    lng: 73.2250,
    keywords: [
      'kapurai south', 'tarsali south', 'nh-48', 'national highway bypass', 'jambuva bridge', 'por highway', 'kapurai cross', 'ward 19', 'ward19',
      'કપુરાઈ દક્ષિણ', 'તરસાલી દક્ષિણ', 'જાંબુવા બ્રિજ', 'પોર હાઇવે', 'વોર્ડ ૧૯',
      'कपुराई दक्षिण', 'तरसाली दक्षिण', 'जांबुवा ब्रिज', 'पोर हाईवे', 'वार्ड १९'
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

  // Check possible local file paths
  let localFilePath = null;
  if (typeof photoPathOrUrl === 'string') {
    const rawName = photoPathOrUrl.replace(/^\/?uploads\//, '');
    const candidatePaths = [
      path.join(__dirname, '../../uploads', rawName),
      path.join(__dirname, '../uploads', rawName),
      path.join(process.cwd(), 'uploads', rawName),
      path.join(process.cwd(), 'backend/uploads', rawName),
      photoPathOrUrl,
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        localFilePath = p;
        break;
      }
    }
  }

  // If local file exists, send actual binary file to Telegram
  if (localFilePath) {
    try {
      const fileBuffer = fs.readFileSync(localFilePath);
      const filename = path.basename(localFilePath);
      const ext = path.extname(filename).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

      const form = new FormData();
      form.append('chat_id', String(chatId));
      form.append('photo', fileBuffer, {
        filename,
        contentType: mimeType,
        knownLength: fileBuffer.length,
      });
      if (caption) form.append('caption', caption);
      form.append('parse_mode', 'HTML');
      if (extra && extra.reply_markup) {
        form.append('reply_markup', typeof extra.reply_markup === 'string' ? extra.reply_markup : JSON.stringify(extra.reply_markup));
      }

      const response = await axios.post(`${getTelegramApi()}/sendPhoto`, form, {
        headers: form.getHeaders(),
        timeout: 45000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      console.log(`📸 [Telegram Bot] Sent local photo "${filename}" (${(fileBuffer.length / 1024).toFixed(1)} KB) to chat #${chatId}`);
      return response.data;
    } catch (err) {
      console.error('[Telegram sendPhoto Local Upload Failed, falling back to message]:', err.response ? err.response.data : err.message);
      return await sendMessage(chatId, caption, extra);
    }
  }

  // If remote URL or fallback
  try {
    const result = await callTelegram('sendPhoto', {
      chat_id: chatId,
      photo: photoPathOrUrl,
      caption,
      parse_mode: 'HTML',
      ...extra,
    });
    if (!result) {
      return await sendMessage(chatId, caption, extra);
    }
    return result;
  } catch {
    return await sendMessage(chatId, caption, extra);
  }
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

  const wardButtons = (t.wards || []).map((w) => ({
    text: w.label,
    callback_data: `ward_${w.id}`,
  }));

  const inlineKeyboardRows = [];
  for (let i = 0; i < wardButtons.length; i += 2) {
    inlineKeyboardRows.push(wardButtons.slice(i, i + 2));
  }
  inlineKeyboardRows.push([{ text: t.location_off_btn, callback_data: 'location_off_help' }]);
  inlineKeyboardRows.push([{ text: t.cancel_btn, callback_data: 'cancel_report' }]);

  const inlineWards = {
    inline_keyboard: inlineKeyboardRows,
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

  // Ensure wardId is resolved
  let finalWardId = session.wardId;
  if (!finalWardId && session.lat && session.lng) {
    const inMemoryStore = require('../config/inMemoryStore');
    const nearest = inMemoryStore.findNearestWard(session.lat, session.lng);
    finalWardId = nearest ? nearest.id : 1;
    if (!session.locationName && nearest) {
      session.locationName = nearest.name;
    }
  }

  const result = await gisService.processIncomingReport({
    latitude: session.lat,
    longitude: session.lng,
    category: categoryForDb,
    reporterPhone: `tg_${chatId}`,
    description: `Telegram (${lang.toUpperCase()}) report in ${session.locationName || 'Vadodara'} from ${senderName} (@${username || chatId})`,
    photoUrl: session.photo_url || null,
    wardId: finalWardId || 1,
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

        // Generate realistic point inside this ward (offset by 100-300m so it doesn't collide with static seed demo records)
        const latOffset = (Math.random() * 0.005 - 0.0025);
        const lngOffset = (Math.random() * 0.005 - 0.0025);

        session.state = 'PHOTO';
        session.lat = parseFloat((ward.lat + latOffset).toFixed(5));
        session.lng = parseFloat((ward.lng + lngOffset).toFixed(5));
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
        session.wardId = nearestWard ? nearestWard.id : 1;
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
