import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { listTeam, inviteMember, updateMember, removeMember } from '../controllers/team.controller.js';

const router = Router();

router.get('/team', authenticate, requireStaff(), handle(listTeam));
router.post('/team', authenticate, requireStaff('Admin'), handle(inviteMember));
router.patch('/team/:id', authenticate, requireStaff('Admin'), handle(updateMember));
router.delete('/team/:id', authenticate, requireStaff('Admin'), handle(removeMember));

export default router;
