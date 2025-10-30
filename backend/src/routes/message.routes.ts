import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  getMessages, 
  sendMessage, 
  getConversations,
  getMessagesByUserId,
  getUnreadCount 
} from '../controllers/message.controller';

const router = Router();

// Get unread count
router.get('/unread/count', authMiddleware, getUnreadCount);

// Get all conversations
router.get('/conversations', authMiddleware, getConversations);

// Get messages by user ID
router.get('/:userId', authMiddleware, getMessagesByUserId);

// Get messages by match ID (keep for backwards compatibility)
router.get('/match/:matchId', authMiddleware, getMessages);

// Send message
router.post('/', authMiddleware, sendMessage);

export default router;
