import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { connectSmsGateway, disconnectSmsGateway, getSmsGateway, getWorkspaceSettings, updateWorkspaceSettings } from '../controllers/settings.controller.js';

const router = Router();

router.get('/settings', authenticate, requirePermission(), handle(getWorkspaceSettings));
router.put('/settings', authenticate, requirePermission('settings.manage', 'sms.templates'), handle(updateWorkspaceSettings));
router.get('/integrations/sms', authenticate, requirePermission(), handle(getSmsGateway));
router.post('/integrations/sms/connect', authenticate, requirePermission('settings.manage'), handle(connectSmsGateway));
router.post('/integrations/sms/disconnect', authenticate, requirePermission('settings.manage'), handle(disconnectSmsGateway));

export default router;
