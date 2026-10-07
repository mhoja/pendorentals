import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { getWorkspaceSettings, updateWorkspaceSettings } from '../controllers/settings.controller.js';

const router = Router();

router.get('/settings', authenticate, requirePermission(), handle(getWorkspaceSettings));
router.put('/settings', authenticate, requirePermission('settings.manage', 'sms.templates'), handle(updateWorkspaceSettings));

export default router;
