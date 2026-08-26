# 🔑 CityPulse (VMC) — Master API & Credential Setup Guide

This guide details **every API** used in the CityPulse project, whether it is required, and step-by-step instructions on how to get it **100% Free of Cost**.

---

## 📋 API Summary Matrix

| Service / API | Cost | Required? | Setup Time | Purpose |
|---|:---:|:---:|:---:|---|
| **1. Telegram Bot API** | **100% Free** | ⭐ Recommended | 60 seconds | Citizen grievance intake & verification on Telegram. |
| **2. WhatsApp Cloud API** | **100% Free** (1k/mo) | Optional | 5 minutes | Citizen grievance intake & verification on WhatsApp. |
| **3. Web GIS & Map Tiles** | **100% Free** | ✅ Built-in | 0 sec (Active) | CARTO Positron & ArcGIS Satellite map layers. |
| **4. Local Evidence Storage** | **100% Free** | ✅ Built-in | 0 sec (Active) | High-resolution photo upload pipeline. |
| **5. PostGIS Database** | **100% Free** | ✅ Built-in | 0 sec (Active) | Spatial clustering & 10-ward boundary GIS engine. |

---

## 1. 🤖 Telegram Bot API (100% Free — Takes 60 Seconds)

Telegram is the **easiest and fastest** free messaging channel to test citizen grievance submission and interactive feedback loops.

### Step-by-Step Guide:
1. Open the **Telegram** app on your phone or desktop.
2. Search for the official bot: **`@BotFather`** (it has a blue verification checkmark).
3. Click **Start** or send the message:
   ```text
   /newbot
   ```
4. BotFather will ask: *"Alright, a new bot. How are we going to call it? Please choose a name for your bot."*
   * Example reply: `VMC CityPulse Grievance Bot`
5. BotFather will ask for a username ending in `bot`:
   * Example reply: `vmc_citypulse_test_bot`
6. BotFather will instantly reply with your **API Token**:
   ```text
   Use this token to access the HTTP API:
   7123456789:AAFn_your_unique_token_here...
   ```
7. Copy this token and paste it into `backend/.env`:
   ```env
   TELEGRAM_BOT_TOKEN=7123456789:AAFn_your_unique_token_here...
   ```

### How to use your bot:
* Open your bot on Telegram: `https://t.me/your_bot_username`
* Click **Start** or send a photo / location:
  * Send a photo of a pothole or garbage dump.
  * Send your location pin (Paperclip icon -> Location).
  * The bot will automatically categorize it, assign the VMC Ward, calculate severity, and create the ticket live on the dashboard!

---

## 2. 💬 WhatsApp Cloud API (Meta — 100% Free for 1,000 Conversations/Month)

The official Meta WhatsApp Cloud API allows real WhatsApp users to chat with the VMC portal.

### Step-by-Step Guide:
1. Go to the **Meta for Developers** portal: [https://developers.facebook.com/](https://developers.facebook.com/)
2. Log in with your Facebook account and click **"My Apps"** -> **"Create App"**.
3. Select **"Other"** -> Next -> Select **"Business"** -> Next.
4. Enter an App Name (e.g. `CityPulse VMC`) and click **"Create App"**.
5. On the App Dashboard, scroll to **"WhatsApp"** and click **"Set up"**.
6. Under **WhatsApp -> API Setup** on the left menu, you will find:
   * **Temporary Access Token** (or create a permanent System User token under Business Settings).
   * **Phone Number ID** (e.g. `105938274619384`).
   * **Test Phone Number**: Meta provides a free sandbox test number.
7. Copy these values into `backend/.env`:
   ```env
   WHATSAPP_TOKEN=EAAG...
   PHONE_NUMBER_ID=105938274619384
   VERIFY_TOKEN=my_custom_secret_verify_token_123
   ```
8. **Configure the Webhook** (for local testing, use [ngrok](https://ngrok.com) or [localtunnel](https://localtunnel.me)):
   ```bash
   npx localtunnel --port 5000
   ```
   * Set Callback URL in Meta Dashboard to: `https://your-tunnel-url.loca.lt/webhook`
   * Set Verify Token to: `my_custom_secret_verify_token_123`
   * Under Webhook Fields, subscribe to: **`messages`**.

---

## 3. 🗺️ Map Tiles & GIS Boundaries (100% Free — Already Active)

No API key or registration is needed! The project is already configured with high-performance public tile providers:

* **CARTO Positron Light Tiles**:
  ```text
  https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
  ```
* **Esri ArcGIS World Imagery Satellite**:
  ```text
  https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
  ```
* **VMC 10-Ward GeoJSON Boundaries**: Built directly into the frontend dataset (`src/data/vadodaraWardsGeoJSON.ts`).

---

## 4. 🗄️ Database & Cloud Deployment (100% Free Tiers)

* **Local Development**: Built-in in-memory fallback store & local Docker PostgreSQL (`docker-compose up -d db`).
* **Free Cloud Database Option (Supabase)**:
  1. Go to [https://supabase.com/](https://supabase.com/) and create a free project.
  2. Under Database Settings, enable the **PostGIS** extension with 1 click.
  3. Copy the `DATABASE_URL` (Connection String) into `backend/.env`.

---

## 🚀 Summary of `backend/.env` File

Create a file named `.env` in the `backend/` folder:

```env
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000
ALLOWED_ORIGINS=http://localhost:3000

# Database (PostgreSQL + PostGIS)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/citypulse

# JWT Auth Secret
JWT_SECRET=vmc_citypulse_gov_jwt_secret_key_2026

# Telegram Bot (100% Free via @BotFather)
TELEGRAM_BOT_TOKEN=
TELEGRAM_SECRET_TOKEN=vmc_telegram_webhook_secret_2026

# WhatsApp Cloud API (Meta for Developers)
WHATSAPP_TOKEN=
PHONE_NUMBER_ID=
VERIFY_TOKEN=my_custom_secret_verify_token_123
META_APP_SECRET=
```
