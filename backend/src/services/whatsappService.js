const axios = require('axios');
require('dotenv').config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/**
 * Low-level call to Meta WhatsApp Graph API
 */
async function postToMeta(payload) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID || WHATSAPP_TOKEN === 'your_meta_whatsapp_temporary_or_permanent_token') {
    console.log('[WhatsApp API Simulation Mode] Payload:', JSON.stringify(payload, null, 2));
    return { data: { messaging_product: 'whatsapp', contacts: [{ input: payload.to }], messages: [{ id: 'wamid.simulated' }] } };
  }

  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('[WhatsApp Service Error]:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Sends plain text message
 */
async function sendTextMessage(to, text) {
  return postToMeta({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text },
  });
}

/**
 * Sends interactive list message for selecting issue categories
 */
async function sendCategoryList(to) {
  return postToMeta({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: 'CityPulse - VMC Helpline' },
      body: { text: 'Welcome to VMC Citizen Portal. Please select the category of the issue you wish to report:' },
      footer: { text: 'Vadodara Municipal Corporation' },
      action: {
        button: 'Select Category',
        sections: [
          {
            title: 'Infrastructure & Safety',
            rows: [
              { id: 'cat_pothole', title: 'Pothole', description: 'Road damage or potholes' },
              { id: 'cat_water_leak', title: 'Water Leak', description: 'Pipe leakages or water waste' },
              { id: 'cat_broken_streetlight', title: 'Broken Streetlight', description: 'Dark streets or unlit lamps' },
              { id: 'cat_garbage_overflow', title: 'Garbage Overflow', description: 'Uncollected waste or bins' },
              { id: 'cat_open_manhole', title: 'Open Manhole ⚠️', description: 'Uncovered drain or manhole' },
              { id: 'cat_exposed_wiring', title: 'Exposed Wiring ⚠️', description: 'Hazardous electrical wires' },
              { id: 'cat_gas_leak', title: 'Gas Leak ⚠️', description: 'Piped gas leak emergency' },
            ],
          },
        ],
      },
    },
  });
}

/**
 * Prompt user to send live location
 */
async function sendLocationPrompt(to, categoryTitle) {
  return postToMeta({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      body: `Category selected: *${categoryTitle}*\n\nPlease share your *live location* (or pin location) using WhatsApp attachment (📎 → Location) so VMC field officers can navigate directly to the spot.`,
    },
  });
}

/**
 * Section 4: Closed-Loop Verification
 * Outbound quick-reply message asking user if fix is verified
 */
async function sendClosedLoopVerification(to, complaintId, category, photoAfterUrl) {
  const fullPhotoUrl = photoAfterUrl
    ? (photoAfterUrl.startsWith('http')
        ? photoAfterUrl
        : `${process.env.APP_URL || 'http://localhost:5000'}${photoAfterUrl.startsWith('/') ? '' : '/'}${photoAfterUrl}`)
    : null;

  const header = fullPhotoUrl
    ? { type: 'image', image: { link: fullPhotoUrl } }
    : { type: 'text', text: 'VMC Resolution Verification' };

  return postToMeta({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      header,
      body: {
        text: `Your civic grievance report #${complaintId} regarding *${category}* has been marked as fixed by VMC engineering crews.\n\nDid this repair meet municipal standards?`,
      },
      footer: { text: 'Please tap below to confirm' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: `verify_yes_${complaintId}`, title: 'Yes, Verified' } },
          { type: 'reply', reply: { id: `verify_no_${complaintId}`, title: 'No, Reopen' } },
        ],
      },
    },
  });
}

module.exports = {
  sendTextMessage,
  sendCategoryList,
  sendLocationPrompt,
  sendClosedLoopVerification,
};
