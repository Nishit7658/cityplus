const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

// Upload directory on local filesystem (100% Free Persistent Storage)
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Generates a unique filename based on timestamp & random hex
 */
function generateFilename(originalName = 'image.jpg', extension = '.jpg') {
  const ext = path.extname(originalName) || extension;
  const hash = crypto.randomBytes(8).toString('hex');
  return `evidence_${Date.now()}_${hash}${ext}`;
}

/**
 * Saves a binary Buffer to local storage and returns public URL
 */
async function saveBuffer(buffer, originalName = 'image.jpg') {
  const filename = generateFilename(originalName);
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

/**
 * Downloads and stores image from Meta WhatsApp Cloud API
 */
async function saveWhatsAppImage(mediaId) {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token || !mediaId) return null;

  try {
    // 1. Get media metadata URL from WhatsApp Graph API
    const metaRes = await axios.get(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    const mediaUrl = metaRes.data?.url;
    if (!mediaUrl) return null;

    // 2. Download binary stream
    const imgRes = await axios.get(mediaUrl, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    const buffer = Buffer.from(imgRes.data);
    const mimeType = imgRes.headers['content-type'] || 'image/jpeg';
    const ext = mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg';

    const filename = generateFilename('whatsapp_photo.jpg', ext);
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.promises.writeFile(filePath, buffer);

    console.log(`📸 [Storage] Downloaded WhatsApp media #${mediaId} -> /uploads/${filename}`);
    return `/uploads/${filename}`;
  } catch (err) {
    console.warn(`⚠️ [Storage] Failed to download WhatsApp image #${mediaId}:`, err.message);
    return null;
  }
}

/**
 * Downloads and stores image from Telegram Bot API
 */
async function saveTelegramPhoto(fileId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !fileId) return null;

  try {
    // 1. Get file path from Telegram Bot API
    const fileRes = await axios.get(`https://api.telegram.org/bot${token}/getFile`, {
      params: { file_id: fileId },
      timeout: 10000,
    });

    const filePathOnTelegram = fileRes.data?.result?.file_path;
    if (!filePathOnTelegram) return null;

    // 2. Download binary stream
    const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePathOnTelegram}`;
    const imgRes = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    const buffer = Buffer.from(imgRes.data);
    const ext = path.extname(filePathOnTelegram) || '.jpg';

    const filename = generateFilename('telegram_photo.jpg', ext);
    const localFilePath = path.join(UPLOADS_DIR, filename);
    await fs.promises.writeFile(localFilePath, buffer);

    console.log(`📸 [Storage] Downloaded Telegram media #${fileId} -> /uploads/${filename}`);
    return `/uploads/${filename}`;
  } catch (err) {
    console.warn(`⚠️ [Storage] Failed to download Telegram photo #${fileId}:`, err.message);
    return null;
  }
}

module.exports = {
  UPLOADS_DIR,
  saveBuffer,
  saveWhatsAppImage,
  saveTelegramPhoto,
};
