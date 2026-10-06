import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, validate } from '../middleware/validate.js';
import { createRegistration, getRegistrations, registrationSchema, registrationStatusSchema, updateRegistrationStatus } from '../controllers/RegistrationController.js';
const router = Router();
router.route('/').get(authenticate(), asyncHandler(getRegistrations)).post(authenticate(), validate(registrationSchema), asyncHandler(createRegistration));
router.patch('/:id/status', authenticate(), validate(registrationStatusSchema), asyncHandler(updateRegistrationStatus));
export default router;
