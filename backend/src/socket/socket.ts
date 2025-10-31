import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthSocket extends Socket {
  userId?: string;
}

export const initializeSocket = (io: Server) => {
  // Authentication middleware for Socket.io
  io.use((socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join match room
    socket.on('join_match', async (matchId: string) => {
      try {
        // Verify user is part of this match
        const match = await prisma.match.findUnique({
          where: { id: matchId },
        });

        if (
          match &&
          (match.user1Id === socket.userId || match.user2Id === socket.userId)
        ) {
          socket.join(`match:${matchId}`);
          console.log(`User ${socket.userId} joined match ${matchId}`);
        }
      } catch (error) {
        console.error('Join match error:', error);
      }
    });

    // Send message
    socket.on('send_message', async (data: { matchId: string; content: string }) => {
      try {
        const { matchId, content } = data;

        // Verify user is part of this match
        const match = await prisma.match.findUnique({
          where: { id: matchId },
        });

        if (
          !match ||
          (match.user1Id !== socket.userId && match.user2Id !== socket.userId)
        ) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            matchId,
            senderId: socket.userId!,
            content,
          },
          include: {
            sender: {
              include: {
                profile: {
                  select: {
                    name: true,
                    photos: true,
                  },
                },
              },
            },
          },
        });

        // Emit to match room
        io.to(`match:${matchId}`).emit('new_message', message);

        // Notify the other user
        const otherUserId =
          match.user1Id === socket.userId ? match.user2Id : match.user1Id;
        io.to(`user:${otherUserId}`).emit('notification', {
          type: 'new_message',
          matchId,
          message,
        });
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { matchId: string; isTyping: boolean }) => {
      socket.to(`match:${data.matchId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
