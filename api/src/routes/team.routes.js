import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { listTeam, inviteMember, updateMember, removeMember } from '../controllers/team.controller.js';

const router = Router();

router.get('/team', authenticate, requirePermission('team.view', 'roles.manage'), handle(listTeam));
router.post('/team', authenticate, requirePermission('team.manage'), handle(inviteMember));
router.patch('/team/:id', authenticate, requirePermission('team.manage'), handle(updateMember));
router.delete('/team/:id', authenticate, requirePermission('team.manage'), handle(removeMember));

export default router;
