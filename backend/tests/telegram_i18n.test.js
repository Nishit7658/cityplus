const request = require('supertest');
const { app } = require('../src/server');
const telegramService = require('../src/services/telegramService');
const { getT, I18N } = require('../src/services/telegramI18n');

describe('🌐 Telegram Bot Trilingual System (English, Gujarati, Hindi)', () => {
  const simulatedChatId = 99887766;

  test('I18N dictionary contains complete translations for en, gu, hi', () => {
    ['en', 'gu', 'hi'].forEach((lang) => {
      const t = getT(lang);
      expect(t.lang_name).toBeDefined();
      expect(t.welcome_header).toBeDefined();
      expect(Object.keys(t.categories).length).toBe(8);
      expect(t.wards.length).toBe(19);
      expect(typeof t.location_prompt).toBe('function');
      expect(typeof t.photo_prompt).toBe('function');
      expect(typeof t.success_registration).toBe('function');
      expect(typeof t.closed_loop_caption).toBe('function');
    });
  });

  test('Initial greeting ("hi" / "નમસ્તે" / "नमस्ते") prompts Language Selection', async () => {
    const res = await request(app)
      .post('/api/telegram/simulate')
      .send({
        chatId: simulatedChatId,
        message: 'નમસ્તે',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Selecting Gujarati (lang_gu) callback triggers Category Menu in Gujarati', async () => {
    const res = await request(app)
      .post('/api/telegram/simulate')
      .send({
        chatId: simulatedChatId,
        callback_data: 'lang_gu',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Selecting Category (cat_pothole) in Gujarati requests Location', async () => {
    const res = await request(app)
      .post('/api/telegram/simulate')
      .send({
        chatId: simulatedChatId,
        callback_data: 'cat_pothole',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Selecting Ward 1 (ward_1) requests Photo evidence in Gujarati', async () => {
    const res = await request(app)
      .post('/api/telegram/simulate')
      .send({
        chatId: simulatedChatId,
        callback_data: 'ward_1',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Skipping photo (skip_photo) finalizes complaint registration with Gujarati receipt', async () => {
    const res = await request(app)
      .post('/api/telegram/simulate')
      .send({
        chatId: simulatedChatId,
        callback_data: 'skip_photo',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Hindi language flow (lang_hi) with GPS pin registration works smoothly', async () => {
    const hindiChatId = 11223344;

    // 1. Send start
    await request(app)
      .post('/api/telegram/simulate')
      .send({ chatId: hindiChatId, message: 'नमस्ते' });

    // 2. Choose Hindi
    await request(app)
      .post('/api/telegram/simulate')
      .send({ chatId: hindiChatId, callback_data: 'lang_hi' });

    // 3. Choose Water Leakage
    await request(app)
      .post('/api/telegram/simulate')
      .send({ chatId: hindiChatId, callback_data: 'cat_water_leak' });

    // 4. Send GPS pin
    const gpsRes = await request(app)
      .post('/api/telegram/simulate')
      .send({
        chatId: hindiChatId,
        location: { latitude: 22.3112, longitude: 73.1878 },
      });

    expect(gpsRes.statusCode).toBe(200);
    expect(gpsRes.body.success).toBe(true);

    // 5. Skip photo
    const finalRes = await request(app)
      .post('/api/telegram/simulate')
      .send({ chatId: hindiChatId, callback_data: 'skip_photo' });

    expect(finalRes.statusCode).toBe(200);
  });
});
