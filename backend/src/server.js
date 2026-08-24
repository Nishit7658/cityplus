const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const socketService = require('./services/socketService');

// Route Imports
const complaintsRouter = require('./routes/complaints');
const wardsRouter = require('./routes/wards');
const officersRouter = require('./routes/officers');
const transparencyRouter = require('./routes/transparency');
const webhookRouter = require('./routes/webhook');

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CityPulse Backend', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 CityPulse Backend running on port ${PORT}`);
  console.log(`📍 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`===================================================`);
});
