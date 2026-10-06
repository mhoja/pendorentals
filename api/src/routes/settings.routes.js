import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { getWorkspaceSettings, updateWorkspaceSettings } from '../controllers/settings.controller.js';

const router = Router();

router.get('/settings', authenticate, requireStaff(), handle(getWorkspaceSettings));
router.put('/settings', authenticate, requireStaff('Admin'), handle(updateWorkspaceSettings));

export default router;
