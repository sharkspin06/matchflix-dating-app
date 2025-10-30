import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { discoverUsers, getUserById } from '../controllers/user.controller';

const router = Router();

router.get('/discover', authMiddleware, discoverUsers);
router.get('/:id', authMiddleware, getUserById);

export default router;
