import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { socketBus } from './socketBus.js';
import { ensureDemoData } from './services/demoData.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Optional Realtime Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

socketBus.io = io;

io.on('connection', (socket) => {
  socket.on('join_booking_room', (bookingId) => {
    socket.join(`booking_${bookingId}`);
  });

  socket.on('booking_status_change', ({ bookingId, status, payload }) => {
    io.to(`booking_${bookingId}`).emit('booking_status_updated', { bookingId, status, payload });
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  await ensureDemoData();
  server.listen(PORT, () => {
    console.log(`\n🚀 Co-opSeva API Server listening on http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI Engine: ${process.env.AI_MODE || 'demo'} mode active\n`);
  });
};

startServer();

export { app, server, io };
