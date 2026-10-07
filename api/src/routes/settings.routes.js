import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { getSignature, uploadSignature, removeSignature, connectSmsGateway, disconnectSmsGateway, getSmsGateway, getWorkspaceSettings, updateWorkspaceSettings } from '../controllers/settings.controller.js';

const router = Router();

router.get('/settings', authenticate, requirePermission(), handle(getWorkspaceSettings));
router.put('/settings', authenticate, requirePermission('settings.manage', 'sms.templates'), handle(updateWorkspaceSettings));
router.get('/settings/signature', authenticate, requirePermission(), handle(getSignature));
router.put('/settings/signature', authenticate, requirePermission('settings.manage'), handle(uploadSignature));
router.delete('/settings/signature', authenticate, requirePermission('settings.manage'), handle(removeSignature));
router.get('/integrations/sms', authenticate, requirePermission(), handle(getSmsGateway));
router.post('/integrations/sms/connect', authenticate, requirePermission('settings.manage'), handle(connectSmsGateway));
router.post('/integrations/sms/disconnect', authenticate, requirePermission('settings.manage'), handle(disconnectSmsGateway));

export default router;
