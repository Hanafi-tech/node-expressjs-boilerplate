'use strict';

const { Server } = require('socket.io');

let io;

// Key: socket.id → data user aktif
const activeUsers = new Map();

const initSocket = (server) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    // Join room notifikasi personal
    socket.on('join', (userId) => {
      if (!userId) return;
      socket.join(`user_${userId}`);
    });

    // Tracking user aktif (untuk monitoring online users)
    socket.on('join_portal', (userData) => {
      if (!userData || !userData.userId) return;
      activeUsers.set(socket.id, {
        id:          userData.userId,
        name:        userData.userName  || 'Unknown',
        role:        userData.role      || '',
        currentPage: userData.currentPage || '/',
        connectedAt: new Date(),
      });
      broadcastActiveUsers();
    });

    socket.on('disconnect', () => {
      if (activeUsers.has(socket.id)) {
        activeUsers.delete(socket.id);
        broadcastActiveUsers();
      }
    });
  });

  return io;
};

// Broadcast daftar user online (deduplicate per userId)
const broadcastActiveUsers = () => {
  const seen  = new Set();
  const unique = [];
  for (const user of activeUsers.values()) {
    if (!seen.has(user.id)) {
      seen.add(user.id);
      unique.push(user);
    }
  }
  io.emit('update_online_status', { total: unique.length, users: unique });
};

const getIO = () => {
  if (!io) throw new Error('[socket] Socket.io belum diinisialisasi!');
  return io;
};

module.exports = { initSocket, getIO };
