import { Router } from 'express';
import { getDashboard } from '../controllers/DashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';
const router = Router();
router.get('/', authenticate(), asyncHandler(getDashboard));
export default router;
