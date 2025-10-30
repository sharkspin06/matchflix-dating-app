import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  getProfile,
  updateProfile,
  uploadPhoto,
  deletePhoto,
} from '../controllers/profile.controller';

const router = Router();

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);
router.post('/photo', authMiddleware, upload.single('photo'), uploadPhoto);
router.delete('/photo', authMiddleware, deletePhoto);

export default router;
