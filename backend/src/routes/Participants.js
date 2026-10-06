import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, validate } from '../middleware/validate.js';
import { createParticipant, deleteParticipant, getParticipants, participantSchema, updateParticipant } from '../controllers/ParticipantController.js';
const router = Router();
router.route('/').get(authenticate(), asyncHandler(getParticipants)).post(authenticate(), validate(participantSchema), asyncHandler(createParticipant));
router.route('/:id').put(authenticate(), validate(participantSchema), asyncHandler(updateParticipant)).delete(authenticate(['admin']), asyncHandler(deleteParticipant));
export default router;
