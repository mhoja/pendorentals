import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { getNotifications, readAllNotifications, readNotification } from '../controllers/notifications.controller.js';

const router = Router();

router.get('/notifications', authenticate, requirePermission(), handle(getNotifications));
router.post('/notifications/read-all', authenticate, requirePermission(), handle(readAllNotifications));
router.post('/notifications/:id/read', authenticate, requirePermission(), handle(readNotification));

export default router;
