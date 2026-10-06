import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { MANAGERS } from '../services/auth.service.js';
import { handle } from '../utils/helpers.js';
import { listMessages, sendMessage } from '../controllers/messages.controller.js';

const router = Router();

router.get('/messages', authenticate, requireStaff(...MANAGERS), handle(listMessages));
router.post('/messages', authenticate, requireStaff(...MANAGERS), handle(sendMessage));

export default router;
