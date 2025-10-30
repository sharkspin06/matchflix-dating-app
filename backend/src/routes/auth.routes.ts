import { Router } from 'express';
import { register, login, checkEmail } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check-email', checkEmail);

export default router;
