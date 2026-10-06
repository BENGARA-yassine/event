import { Router } from 'express';
import { login, me } from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';
const router = Router();
router.post('/login', asyncHandler(login));
router.get('/me', authenticate(), asyncHandler(me));
export default router;
