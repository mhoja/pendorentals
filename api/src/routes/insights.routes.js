import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { MANAGERS } from '../services/auth.service.js';
import { handle } from '../utils/helpers.js';
import { getDashboard, getFinanceSummary, getReport } from '../controllers/insights.controller.js';

const router = Router();

router.get('/dashboard', authenticate, requireStaff(), handle(getDashboard));
router.get('/finance/summary', authenticate, requireStaff(...MANAGERS), handle(getFinanceSummary));
router.get('/reports/:id', authenticate, requireStaff(...MANAGERS), handle(getReport));

export default router;
