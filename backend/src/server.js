const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const socketService = require('./services/socketService');
const telegramService = require('./services/telegramService');

// Route Imports
const complaintsRouter = require('./routes/complaints');
const wardsRouter = require('./routes/wards');
const officersRouter = require('./routes/officers');
const transparencyRouter = require('./routes/transparency');
const webhookRouter = require('./routes/webhook');
const telegramRouter = require('./routes/telegramWebhook');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
socketService.initSocket(io);

// Mount API Routes
app.use('/api/complaints', complaintsRouter);
app.use('/api/wards', wardsRouter);
app.use('/api/officers', officersRouter);
app.use('/api/transparency', transparencyRouter);
app.use('/webhook', webhookRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/telegram', telegramRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CityPulse Backend', timestamp: new Date() });
});

// Start Telegram Bot Long-Polling if Token is present in .env
telegramService.startPolling();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 CityPulse Backend running on port ${PORT}`);
  console.log(`📍 WhatsApp Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`📍 Telegram Webhook endpoint: http://localhost:${PORT}/api/telegram/webhook`);
  console.log(`===================================================`);
});
