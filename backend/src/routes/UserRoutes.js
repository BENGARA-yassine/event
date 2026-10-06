import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, validate } from '../middleware/validate.js';
import { createUser, getUsers, updateUser, updateUserSchema, userSchema } from '../controllers/UserController.js';
const router = Router();
router.get('/', authenticate(['admin']), asyncHandler(getUsers));
router.post('/', authenticate(['admin']), validate(userSchema), asyncHandler(createUser));
router.put('/:id', authenticate(['admin']), validate(updateUserSchema), asyncHandler(updateUser));
export default router;
