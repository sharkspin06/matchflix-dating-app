import { Router } from 'express';
import { passUser } from '../controllers/pass.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Pass on a user (swipe left)
router.post('/', authMiddleware, passUser);

export default router;
