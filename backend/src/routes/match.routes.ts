import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { likeUser, passUser, getMatches, sendLike, getReceivedLikes } from '../controllers/match.controller';

const router = Router();

router.post('/like/:userId', authMiddleware, likeUser);
router.post('/pass/:userId', authMiddleware, passUser);
router.get('/', authMiddleware, getMatches);

// New routes for likes (when mounted at /api/likes)
router.post('/', authMiddleware, sendLike);
router.get('/received', authMiddleware, getReceivedLikes);

export default router;
