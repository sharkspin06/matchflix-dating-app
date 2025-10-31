import { Response } from 'express';
import { PrismaClient, Like, Match } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Check if a reciprocal like exists between two users
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns Like object if exists, null otherwise
 */
const checkReciprocalLike = async (userId1: string, userId2: string): Promise<Like | null> => {
  try {
    return await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: userId2,
          toUserId: userId1,
        },
      },
    });
  } catch (error) {
    console.error('[CheckReciprocalLike] Error:', error);
    return null;
  }
};

/**
 * Create a match between two users
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns Created match object with user profiles
 */
const createMatch = async (userId1: string, userId2: string): Promise<Match | null> => {
  try {
    // Ensure consistent ordering (user1Id < user2Id)
    const [user1Id, user2Id] = [userId1, userId2].sort();

    const match = await prisma.match.create({
      data: {
        user1Id,
        user2Id,
      },
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
      },
    });

    console.log(`[CreateMatch] Match created between ${user1Id} and ${user2Id}`);
    return match;
  } catch (error) {
    console.error('[CreateMatch] Error:', error);
    throw new Error('Failed to create match');
  }
};

export const likeUser = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const { userId: targetUserId } = req.params;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ error: 'Cannot like yourself' });
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        fromUserId: currentUserId,
        toUserId: targetUserId,
      },
    });

    // Check if target user has also liked current user
    const reciprocalLike = await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: targetUserId,
          toUserId: currentUserId,
        },
      },
    });

    let match = null;

    if (reciprocalLike) {
      // Create match (ensure user1Id < user2Id for consistency)
      const [user1Id, user2Id] = [currentUserId, targetUserId].sort();

      match = await prisma.match.create({
        data: {
          user1Id,
          user2Id,
        },
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
        },
      });
    }

    res.json({
      liked: true,
      match: match ? true : false,
      matchData: match,
    });
  } catch (error) {
    console.error('Like user error:', error);
    res.status(500).json({ error: 'Failed to like user' });
  }
};

export const passUser = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const { userId: targetUserId } = req.params;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ error: 'Invalid operation' });
    }

    // Create a "pass" like with a special flag (or just skip creating anything)
    // For MVP, we'll just create a like to mark as "seen"
    await prisma.like.create({
      data: {
        fromUserId: currentUserId,
        toUserId: targetUserId,
      },
    });

    res.json({ passed: true });
  } catch (error) {
    console.error('Pass user error:', error);
    res.status(500).json({ error: 'Failed to pass user' });
  }
};

export const getMatches = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
      },
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
    });

    // Format matches to show the other user
    const formattedMatches = matches.map((match) => {
      const otherUser =
        match.user1Id === currentUserId ? match.user2 : match.user1;
      const lastMessage = match.messages[0] || null;

      return {
        matchId: match.id,
        user: otherUser,
        lastMessage,
        createdAt: match.createdAt,
      };
    });

    res.json(formattedMatches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};

/**
 * Send a like to another user
 * @route POST /api/likes
 * @access Private (requires authentication)
 * @body { likedUserId: string }
 * @returns { success: boolean, isMatch: boolean, match?: Match, message: string }
 */
export const sendLike = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId;

    // Validate authentication
    if (!currentUserId) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: 'Please log in to like users'
      });
    }

    const { likedUserId } = req.body;

    // Validate request body
    if (!likedUserId) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'likedUserId is required' 
      });
    }

    // Prevent self-liking
    if (currentUserId === likedUserId) {
      return res.status(400).json({ 
        error: 'Invalid operation',
        message: 'Cannot like yourself' 
      });
    }

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: currentUserId,
          toUserId: likedUserId,
        },
      },
    });

    if (existingLike) {
      console.log(`[SendLike] User ${currentUserId} already liked ${likedUserId}`);
      return res.status(200).json({
        success: true,
        isMatch: false,
        message: 'Already liked',
      });
    }

    // Create like
    await prisma.like.create({
      data: {
        fromUserId: currentUserId,
        toUserId: likedUserId,
      },
    });

    console.log(`[SendLike] User ${currentUserId} liked ${likedUserId}`);

    // Check for reciprocal like (mutual match)
    const reciprocalLike = await checkReciprocalLike(currentUserId, likedUserId);

    let isMatch = false;
    let match = null;

    if (reciprocalLike) {
      // Create match
      match = await createMatch(currentUserId, likedUserId);
      isMatch = true;
      console.log(`[SendLike] 💕 Match created between ${currentUserId} and ${likedUserId}`);
    }

    res.status(200).json({
      success: true,
      isMatch,
      match: match,
      message: isMatch ? "It's a match!" : 'Like sent successfully',
    });
  } catch (error) {
    console.error('[SendLike] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send like';
    res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage
    });
  }
};

export const getReceivedLikes = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    console.log('📥 Getting received likes for user:', currentUserId);

    // Get all likes where current user is the recipient
    const likes = await prisma.like.findMany({
      where: {
        toUserId: currentUserId,
      },
      include: {
        fromUser: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${likes.length} likes for user ${currentUserId}`);

    // Format the response to return user profiles who liked you
    const profiles = likes.map((like) => {
      const user = like.fromUser;
      const profile = user.profile;

      return {
        userId: user.id,
        name: profile?.name || 'Unknown',
        age: profile?.age || null,
        location: profile?.location || null,
        bio: profile?.bio || null,
        photos: profile?.photos || [],
        interests: profile?.interests || [],
        zodiac: profile?.zodiac || null,
        education: profile?.education || null,
        pets: profile?.pets || null,
        drinkingHabits: profile?.drinkingHabits || null,
        smokingHabits: profile?.smokingHabits || null,
        gender: profile?.gender || null,
        topFilms: profile?.topFilms || [],
        preferredGender: profile?.preferredGender || [],
        relationshipGoals: profile?.relationshipGoals || [],
      };
    });

    console.log('Returning profiles:', profiles.map(p => ({ userId: p.userId, name: p.name })));
    res.json(profiles);
  } catch (error) {
    console.error('Get received likes error:', error);
    res.status(500).json({ error: 'Failed to get received likes' });
  }
};

/**
 * Unmatch with another user
 * @route DELETE /api/matches/:userId
 * @access Private (requires authentication)
 * @returns { success: boolean, message: string }
 */
export const unmatchUser = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId;
    const { userId: targetUserId } = req.params;

    // Validate authentication
    if (!currentUserId) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        message: 'Please log in to unmatch users'
      });
    }

    // Validate target user ID
    if (!targetUserId) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'User ID is required' 
      });
    }

    // Prevent self-unmatching
    if (currentUserId === targetUserId) {
      return res.status(400).json({ 
        error: 'Invalid operation',
        message: 'Cannot unmatch yourself' 
      });
    }

    // Find the match (ensure consistent ordering)
    const [user1Id, user2Id] = [currentUserId, targetUserId].sort();

    const match = await prisma.match.findFirst({
      where: {
        user1Id,
        user2Id,
      },
    });

    if (!match) {
      return res.status(404).json({ 
        error: 'Match not found',
        message: 'No match exists between these users' 
      });
    }

    // Delete the match
    await prisma.match.delete({
      where: {
        id: match.id,
      },
    });

    // Optionally, delete the mutual likes as well
    await prisma.like.deleteMany({
      where: {
        OR: [
          { fromUserId: currentUserId, toUserId: targetUserId },
          { fromUserId: targetUserId, toUserId: currentUserId },
        ],
      },
    });

    console.log(`[Unmatch] User ${currentUserId} unmatched with ${targetUserId}`);

    res.status(200).json({
      success: true,
      message: 'Successfully unmatched',
    });
  } catch (error) {
    console.error('[Unmatch] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to unmatch';
    res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage
    });
  }
};
