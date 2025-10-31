import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const { matchId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string | undefined;

    // Verify that the match exists and user is part of it
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Build where clause
    const whereClause: any = { matchId };

    // Add cursor condition if provided (load messages older than cursor)
    if (cursor) {
      whereClause.createdAt = {
        lt: new Date(cursor),
      };
    }

    // Get messages with pagination (ordered desc to get most recent, then reverse)
    const messages = await prisma.message.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1, // Fetch one extra to determine if there are more
    });

    // Check if there are more results
    const hasMore = messages.length > limit;
    const paginatedMessages = messages.slice(0, limit);

    // Reverse to get chronological order (oldest to newest)
    const orderedMessages = paginatedMessages.reverse();

    // Get next cursor (createdAt of oldest message in this batch)
    const nextCursor = hasMore && orderedMessages.length > 0
      ? orderedMessages[0].createdAt.toISOString()
      : null;

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        matchId,
        senderId: { not: currentUserId },
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({
      messages: orderedMessages,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    // Find or create match between users
    let match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: currentUserId },
        ],
      },
    });

    if (!match) {
      // Create new match if it doesn't exist
      match = await prisma.match.create({
        data: {
          user1Id: currentUserId,
          user2Id: receiverId,
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        matchId: match.id,
        senderId: currentUserId,
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

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string | undefined;

    // Build where clause
    const whereClause: any = {
      OR: [
        { user1Id: currentUserId },
        { user2Id: currentUserId },
      ],
    };

    // Add cursor condition if provided
    if (cursor) {
      whereClause.createdAt = {
        lt: new Date(cursor),
      };
    }

    // Get matches for current user with pagination
    const matches = await prisma.match.findMany({
      where: whereClause,
      include: {
        user1: {
          include: {
            profile: true,
          },
        },
        user2: {
          include: {
            profile: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1, // Fetch one extra to determine if there are more
    });

    // Check if there are more results
    const hasMore = matches.length > limit;
    const conversations = matches.slice(0, limit);

    // Format response
    const formattedConversations = conversations.map((match) => {
      const otherUser = match.user1Id === currentUserId ? match.user2 : match.user1;
      const lastMessage = match.messages[0];

      return {
        matchId: match.id,
        user: otherUser,
        lastMessage,
        createdAt: match.createdAt,
      };
    });

    // Get next cursor (createdAt of last item)
    const nextCursor = hasMore && conversations.length > 0 
      ? conversations[conversations.length - 1].createdAt.toISOString()
      : null;

    res.json({
      conversations: formattedConversations,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

export const getMessagesByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const { userId } = req.params;

    // Find match between users
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: userId },
          { user1Id: userId, user2Id: currentUserId },
        ],
      },
    });

    if (!match) {
      return res.json([]);
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { matchId: match.id },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        matchId: match.id,
        senderId: { not: currentUserId },
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({ messages, matchId: match.id });
  } catch (error) {
    console.error('Get messages by user ID error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;

    // Get all matches for current user
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUserId },
          { user2Id: currentUserId },
        ],
      },
      select: {
        id: true,
      },
    });

    const matchIds = matches.map(m => m.id);

    // Count unread messages
    const unreadCount = await prisma.message.count({
      where: {
        matchId: { in: matchIds },
        senderId: { not: currentUserId },
        read: false,
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};
