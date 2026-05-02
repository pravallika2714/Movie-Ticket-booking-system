import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import theaterRoutes from './routes/theaters.js';
import movieRoutes from './routes/movies.js';
import showRoutes from './routes/shows.js';
import paymentRoutes from './routes/payment.js';

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Real-time Seat Locking Map: showId -> seatId -> { socketId, status (selected | locked), timestamp }
global.lockedSeats = new Map();

io.on('connection', (socket) => {

  socket.on('join_show', (showId) => {
    socket.join(showId);
    // Send currently locked seats for this show to the joining user
    const showLocks = global.lockedSeats.get(showId) || new Map();
    const locks = Array.from(showLocks.entries()).map(([seat, data]) => ({ seat, ...data }));
    socket.emit('sync_locked_seats', locks);
  });

  socket.on('select_seat', ({ showId, seatId }) => {
    let showLocks = global.lockedSeats.get(showId);
    if (!showLocks) {
      showLocks = new Map();
      global.lockedSeats.set(showId, showLocks);
    }

    // Check if another user has it
    if (showLocks.has(seatId) && showLocks.get(seatId).socketId !== socket.id) {
      return; // Already taken by someone else
    }

    showLocks.set(seatId, { socketId: socket.id, status: 'selected', timestamp: Date.now() });
    io.to(showId).emit('seat_locked', { seatId, socketId: socket.id, status: 'selected' });
  });

  socket.on('deselect_seat', ({ showId, seatId }) => {
    const showLocks = global.lockedSeats.get(showId);
    if (showLocks && showLocks.has(seatId) && showLocks.get(seatId).socketId === socket.id) {
      // Only unlock if it's not in the 8-minute payment lock
      if (showLocks.get(seatId).status !== 'payment_locked') {
        showLocks.delete(seatId);
        io.to(showId).emit('seat_unlocked', { seatId });
      }
    }
  });

  socket.on('disconnect', () => {
    // Release seats held by this socket that are 'selected' (not in payment)
    for (const [showId, seats] of global.lockedSeats.entries()) {
      for (const [seatId, data] of seats.entries()) {
        if (data.socketId === socket.id && data.status === 'selected') {
          seats.delete(seatId);
          io.to(showId).emit('seat_unlocked', { seatId });
        }
      }
    }
  });
});

// Periodic sweep for 8-min payment locks
setInterval(() => {
  const now = Date.now();
  for (const [showId, seats] of global.lockedSeats.entries()) {
    for (const [seatId, data] of seats.entries()) {
      if (data.status === 'payment_locked') {
        const expiresAt = data.timestamp + 8 * 60 * 1000; // 8 mins
        if (now > expiresAt) {
          seats.delete(seatId);
          io.to(showId).emit('seat_unlocked', { seatId });
        }
      }
    }
  }
}, 30000); // Check every 30 secs

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🎬 Movie Booking API is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
