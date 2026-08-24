# Meta WhatsApp Cloud API — Free Setup Guide

Follow these exact steps to connect CityPulse with Meta's free WhatsApp Cloud API test tier:

---

## 1. Create a Meta Developer Account & App

1. Go to [developers.facebook.com](https://developers.facebook.com/) and sign in with your Facebook account.
2. Click **My Apps** → **Create App**.
3. Select **Business** as the app type and click **Next**.
4. Give your app a display name (e.g. `CityPulse-VMC`) and complete the creation steps.

---

## 2. Add WhatsApp Product to Your App

1. In the App Dashboard, scroll to **Add products to your app**.
2. Find **WhatsApp** and click **Set up**.
3. Select or create a Meta Business Portfolio (or proceed with the default test business setup).

---

## 3. Get Test Credentials & Allow-list Your Phone Number

1. In the left sidebar, navigate to **WhatsApp** → **API Setup**.
2. You will see:
   - **Temporary Access Token**: Copy this value. This is your `WHATSAPP_TOKEN`.
   - **Phone Number ID**: Copy this ID. This is your `PHONE_NUMBER_ID`.
   - **Test Phone Number**: Provided by Meta for sending/receiving test messages.
3. Under **To**, select **Manage phone number list** and add your personal WhatsApp phone number.
4. Meta will send a 6-digit verification code via WhatsApp to your phone. Enter it to allow-list your number for free testing.

---

## 4. Configure Backend Environment Variables

In `backend/.env` (and your production host e.g., Render/Railway):

```env
WHATSAPP_TOKEN=EAAG... (your temporary access token)
PHONE_NUMBER_ID=1234567890... (your phone number ID)
VERIFY_TOKEN=my_custom_secret_verify_token_123
```

> Note: `VERIFY_TOKEN` is any custom string you choose. You will enter the exact same string in Meta's Webhook settings below.

---

## 5. Configure Webhook URL in Meta Dashboard

1. Deploy your backend to a public HTTPS URL (e.g., Render `https://citypulse-backend.onrender.com` or ngrok during local testing `https://xxxx.ngrok-free.app`).
2. In the Meta App Dashboard, navigate to **WhatsApp** → **Configuration** → **Webhook**.
3. Click **Edit**.
4. Set **Callback URL** to:
   `https://<your-backend-domain>/webhook`
5. Set **Verify Token** to your `VERIFY_TOKEN` (e.g. `my_custom_secret_verify_token_123`).
6. Click **Verify and Save**. Meta will send a `GET /webhook` request to verify the handshake.
7. Click **Manage** under Webhook fields, find **messages**, and check the **Subscribe** box.

---

## 6. Testing the Bot

1. Open WhatsApp on your allow-listed phone.
2. Send the message `"VMC"` to the Meta test phone number provided in Step 3.
3. The bot will reply with an interactive list of categories:
   - Pothole
   - Water Leak
   - Broken Streetlight
   - Garbage Overflow
   - Open Manhole
   - Exposed Wiring
   - Gas Leak
4. Select a category, then share your live location using WhatsApp's native attachment icon → Location.
5. The backend will deduplicate within 18 meters using PostGIS and reply with confirmation!
