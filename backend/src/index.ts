import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import userRoutes from './routes/user.routes';
import matchRoutes from './routes/match.routes';
import messageRoutes from './routes/message.routes';
import passRoutes from './routes/pass.routes';
import { initializeSocket } from './socket/socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration for multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://matchflix-dating-app.vercel.app',
  'https://matchflix-dating-up.vercel.app',
  'https://matchflix-dating-up-frontend-qivq-9whtbee0u.vercel.app',
  'https://matchflix-dating-up-frontend-qivq.vercel.app',
  ...(process.env.FRONTEND_URL?.split(',') || []),
].filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (!allowed) return false;
      const cleanOrigin = origin.replace('https://', '').replace('http://', '');
      const cleanAllowed = allowed.replace('https://', '').replace('http://', '');
      return cleanOrigin.includes(cleanAllowed) || cleanAllowed.includes(cleanOrigin);
    });
    
    callback(null, isAllowed || true); // Allow all for now - change to isAllowed in production
  },
  credentials: true,
};

const io = new Server(httpServer, {
  cors: corsOptions,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/likes', matchRoutes); // Also mount match routes at /api/likes for convenience
app.use('/api/passes', passRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MatchFlix API is running' });
});

// Initialize Socket.io
initializeSocket(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
});

export { io };
