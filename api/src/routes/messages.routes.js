import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { MANAGERS } from '../services/auth.service.js';
import { handle } from '../utils/helpers.js';
import { listMessages, sendMessage, retryMessage, retryMessages, deleteMessage, purgeMessages } from '../controllers/messages.controller.js';

const router = Router();

router.get('/messages', authenticate, requireStaff(...MANAGERS), handle(listMessages));
router.post('/messages', authenticate, requireStaff(...MANAGERS), handle(sendMessage));
router.post('/messages/retry', authenticate, requireStaff(...MANAGERS), handle(retryMessages));
router.post('/messages/:id/retry', authenticate, requireStaff(...MANAGERS), handle(retryMessage));
// Removing history is permanent, so only an Admin can do it.
router.post('/messages/purge', authenticate, requireStaff('Admin'), handle(purgeMessages));
router.delete('/messages/:id', authenticate, requireStaff('Admin'), handle(deleteMessage));

export default router;
