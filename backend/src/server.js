const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const socketService = require('./services/socketService');
const telegramService = require('./services/telegramService');
const db = require('./config/db');

// Route Imports
const authRouter = require('./routes/auth');
const complaintsRouter = require('./routes/complaints');
const wardsRouter = require('./routes/wards');
const officersRouter = require('./routes/officers');
const transparencyRouter = require('./routes/transparency');
const webhookRouter = require('./routes/webhook');
const telegramRouter = require('./routes/telegramWebhook');

const app = express();
const server = http.createServer(app);

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed separately for Next.js map tiles
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Strict CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Hub-Signature-256', 'X-Telegram-Bot-Api-Secret-Token'],
  })
);

// 3. Rate Limiting Protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/', apiLimiter);

// 4. Request Body Parsers with Raw Body Capture for HMAC Verification
app.use(
  express.json({
    limit: '2mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 5. Initialize Socket.IO with CORS validation
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
socketService.initSocket(io);

// 6. Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/wards', wardsRouter);
app.use('/api/officers', officersRouter);
app.use('/api/transparency', transparencyRouter);
app.use('/webhook', webhookRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/telegram', telegramRouter);

// 7. Comprehensive, Safe Health Check
const startTime = Date.now();
app.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'healthy',
    service: 'CityPulse Backend (VMC Redressal)',
    version: '1.0.0',
    uptime: `${uptimeSeconds}s`,
    database: {
      connected: db.getIsDbConnected(),
      mode: db.getIsDbConnected() ? 'PostgreSQL PostGIS' : 'In-Memory Transactional Engine',
    },
    sockets: {
      activeClients: io.engine ? io.engine.clientsCount : 0,
    },
    timestamp: new Date().toISOString(),
  });
});

// Start Telegram Bot Long-Polling if Token is present in .env
telegramService.startPolling();

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 CityPulse Backend running on port ${PORT}`);
    console.log(`📍 WhatsApp Webhook: http://localhost:${PORT}/webhook`);
    console.log(`📍 Telegram Webhook: http://localhost:${PORT}/api/telegram/webhook`);
    console.log(`===================================================`);
  });
}

module.exports = { app, server };
