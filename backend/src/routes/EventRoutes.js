import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, validate } from '../middleware/validate.js';
import { createEvent, eventSchema, getAllEvents, getEventById, statusSchema, updateEvent, updateEventStatus } from '../controllers/EventController.js';
const router = Router();
router.route('/').get(authenticate(), asyncHandler(getAllEvents)).post(authenticate(), validate(eventSchema), asyncHandler(createEvent));
router.route('/:id').get(authenticate(), asyncHandler(getEventById)).put(authenticate(), validate(eventSchema), asyncHandler(updateEvent));
router.patch('/:id/status', authenticate(), validate(statusSchema), asyncHandler(updateEventStatus));
export default router;
