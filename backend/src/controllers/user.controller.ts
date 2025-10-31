import { Response } from 'express';
import { PrismaClient, Profile } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { calculateDistance } from '../utils/distance.util';

const prisma = new PrismaClient();

/**
 * Interface for profile with match score and distance
 */
interface ProfileWithScore extends Profile {
  matchScore: number;
  distance?: number;
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
    // Get users that were liked
    const existingLikes = await prisma.like.findMany({
      where: { fromUserId: currentUserId },
      select: { toUserId: true },
    });
    
    // Get users that were passed
    const existingPasses = await prisma.pass.findMany({
      where: { fromUserId: currentUserId },
      select: { toUserId: true },
    });
    
    // Combine both lists and remove duplicates
    const likedUserIds = existingLikes.map((like) => like.toUserId);
    const passedUserIds = existingPasses.map((pass) => pass.toUserId);
    const allInteractedIds = [...new Set([...likedUserIds, ...passedUserIds])];
    
    return allInteractedIds;
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

    // Calculate match scores and distances for each profile
    const usersWithScores: ProfileWithScore[] = potentialMatches.map((profile) => {
      const matchScore = calculateMatchScore(currentProfile, profile);
      
      // Calculate distance if both users have coordinates
      let distance: number | undefined;
      if (
        currentProfile.latitude && currentProfile.longitude &&
        profile.latitude && profile.longitude
      ) {
        distance = calculateDistance(
          currentProfile.latitude,
          currentProfile.longitude,
          profile.latitude,
          profile.longitude
        );
      }
      
      return {
        ...profile,
        matchScore,
        distance,
      };
    });

    // Filter to only show profiles with at least 1 matching interest
    const matchedProfiles = usersWithScores.filter(profile => profile.matchScore > 0);

    // Sort by match score (higher scores first)
    matchedProfiles.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`[Discover] Found ${matchedProfiles.length} profiles with matching interests (out of ${usersWithScores.length} total) for user ${currentUserId}`);

    // If no matches found, return all profiles (fallback)
    // This prevents empty discover page if user has unique interests
    const profilesToReturn = matchedProfiles.length > 0 ? matchedProfiles : usersWithScores;
    
    if (matchedProfiles.length === 0 && usersWithScores.length > 0) {
      console.log(`[Discover] No matching interests found, returning all ${usersWithScores.length} profiles as fallback`);
    }

    res.status(200).json(profilesToReturn);
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

    // Get current user's profile to calculate distance
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    // Calculate distance if both users have coordinates
    let distance: number | undefined;
    if (
      currentProfile?.latitude && currentProfile?.longitude &&
      profile.latitude && profile.longitude
    ) {
      distance = calculateDistance(
        currentProfile.latitude,
        currentProfile.longitude,
        profile.latitude,
        profile.longitude
      );
    }

    console.log(`[GetUser] Successfully fetched profile for user ${id}`);
    res.status(200).json({ ...profile, distance });
  } catch (error) {
    console.error('[GetUser] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
    res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage
    });
  }
};
