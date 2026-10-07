import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { listExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenses.controller.js';

const router = Router();

router.get('/expenses', authenticate, requirePermission('finance.view', 'expenses.manage', 'expenses.approve'), handle(listExpenses));
router.post('/expenses', authenticate, requirePermission('expenses.manage'), handle(createExpense));
router.patch('/expenses/:id', authenticate, requirePermission('expenses.manage', 'expenses.approve'), handle(updateExpense));
router.delete('/expenses/:id', authenticate, requirePermission('expenses.manage'), handle(deleteExpense));

export default router;
