import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { listMessages, sendMessage, retryMessage, retryMessages, deleteMessage, purgeMessages } from '../controllers/messages.controller.js';

const router = Router();

router.get('/messages', authenticate, requirePermission('sms.view'), handle(listMessages));
router.post('/messages', authenticate, requirePermission('sms.send'), handle(sendMessage));
router.post('/messages/retry', authenticate, requirePermission('sms.send'), handle(retryMessages));
router.post('/messages/:id/retry', authenticate, requirePermission('sms.send'), handle(retryMessage));
// Removing history is permanent, so only an Admin can do it.
router.post('/messages/purge', authenticate, requirePermission('sms.delete'), handle(purgeMessages));
router.delete('/messages/:id', authenticate, requirePermission('sms.delete'), handle(deleteMessage));

export default router;
