import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Pass on a user (swipe left)
 * @route POST /api/passes
 * @access Private
 */
export const passUser = async (req: AuthRequest, res: Response) => {
  try {
    const { passedUserId } = req.body;
    const currentUserId = req.userId;

    if (!passedUserId) {
      return res.status(400).json({ error: 'Passed user ID is required' });
    }

    // Check if pass already exists
    const existingPass = await prisma.pass.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: currentUserId!,
          toUserId: passedUserId,
        },
      },
    });

    if (existingPass) {
      return res.status(200).json({ message: 'Already passed on this user' });
    }

    // Create new pass
    const pass = await prisma.pass.create({
      data: {
        fromUserId: currentUserId!,
        toUserId: passedUserId,
      },
    });

    console.log(`[Pass] User ${currentUserId} passed on ${passedUserId}`);
    res.status(201).json({ message: 'Pass recorded', pass });
  } catch (error) {
    console.error('[Pass] Error:', error);
    res.status(500).json({ error: 'Failed to record pass' });
  }
};
