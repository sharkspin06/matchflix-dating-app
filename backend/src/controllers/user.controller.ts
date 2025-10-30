import { Response } from 'express';
import { PrismaClient, Profile } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Interface for profile with match score
 */
interface ProfileWithScore extends Profile {
  matchScore: number;
  user: {
    id: string;
    email: string;
  };
}

/**
 * Calculate match score between two profiles based on common interests
 * @param currentProfile - The current user's profile
 * @param targetProfile - The profile to compare against
 * @returns Match score (number of common interests)
 */
const calculateMatchScore = (currentProfile: Profile, targetProfile: Profile): number => {
  try {
    const commonInterests = targetProfile.interests.filter((interest) =>
      currentProfile.interests.includes(interest)
    );
    return commonInterests.length;
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0;
  }
};

/**
 * Get list of user IDs that current user has already interacted with
 * @param currentUserId - The current user's ID
 * @returns Array of user IDs that have been liked or passed
 */
const getInteractedUserIds = async (currentUserId: string): Promise<string[]> => {
  try {
    const existingLikes = await prisma.like.findMany({
      where: { fromUserId: currentUserId },
      select: { toUserId: true },
    });
    return existingLikes.map((like) => like.toUserId);
  } catch (error) {
    console.error('Error fetching interacted users:', error);
    throw new Error('Failed to fetch user interaction history');
  }
};

/**
 * Fetch potential matches for the current user
 * @param currentUserId - The current user's ID
 * @param excludedUserIds - Array of user IDs to exclude from results
 * @returns Array of potential match profiles
 */
const fetchPotentialMatches = async (
  currentUserId: string,
  excludedUserIds: string[]
): Promise<any[]> => {
  try {
    const potentialMatches = await prisma.profile.findMany({
      where: {
        userId: {
          not: currentUserId,
          notIn: excludedUserIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      take: 50, // Limit to prevent performance issues
    });
    return potentialMatches;
  } catch (error) {
    console.error('Error fetching potential matches:', error);
    throw new Error('Failed to fetch potential matches');
  }
};

/**
 * Discover users endpoint - Returns a list of potential matches for the current user
 * Profiles are sorted by match score (common interests)
 * @route GET /api/users/discover
 * @access Private (requires authentication)
 */
export const discoverUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId;

    // Validate user ID
    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get current user's profile
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: currentUserId },
    });

    if (!currentProfile) {
      return res.status(404).json({ 
        error: 'Profile not found',
        message: 'Please complete your profile setup before discovering users'
      });
    }

    // Get users that current user has already interacted with
    const interactedUserIds = await getInteractedUserIds(currentUserId);

    // Fetch potential matches
    const potentialMatches = await fetchPotentialMatches(currentUserId, interactedUserIds);

    // Calculate match scores for each profile
    const usersWithScores: ProfileWithScore[] = potentialMatches.map((profile) => ({
      ...profile,
      matchScore: calculateMatchScore(currentProfile, profile),
    }));

    // Sort by match score (higher scores first)
    usersWithScores.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`[Discover] Found ${usersWithScores.length} profiles for user ${currentUserId}`);

    res.status(200).json(usersWithScores);
  } catch (error) {
    console.error('[Discover] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to discover users';
    res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage
    });
  }
};

/**
 * Get user by ID endpoint - Returns a specific user's profile
 * @route GET /api/users/:id
 * @access Private (requires authentication)
 * @param id - User ID to fetch
 */
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate user ID parameter
    if (!id) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'User ID is required'
      });
    }

    // Fetch user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ 
        error: 'User not found',
        message: `No profile found for user ID: ${id}`
      });
    }

    console.log(`[GetUser] Successfully fetched profile for user ${id}`);
    res.status(200).json(profile);
  } catch (error) {
    console.error('[GetUser] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
    res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage
    });
  }
};
