import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { listRoles, updateRole } from '../controllers/roles.controller.js';

const router = Router();

router.get('/roles', authenticate, requirePermission('team.view', 'roles.manage'), handle(listRoles));
router.put('/roles/:role', authenticate, requirePermission('roles.manage'), handle(updateRole));

export default router;
