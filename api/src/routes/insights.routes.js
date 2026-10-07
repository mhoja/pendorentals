import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { getDashboard, getFinanceSummary, getReport } from '../controllers/insights.controller.js';

const router = Router();

router.get('/dashboard', authenticate, requirePermission('overview.view'), handle(getDashboard));
router.get('/finance/summary', authenticate, requirePermission('finance.view'), handle(getFinanceSummary));
router.get('/reports/:id', authenticate, requirePermission('reports.view'), handle(getReport));

export default router;
