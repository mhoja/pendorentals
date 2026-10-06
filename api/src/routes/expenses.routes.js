import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { MANAGERS } from '../services/auth.service.js';
import { handle } from '../utils/helpers.js';
import { listExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenses.controller.js';

const router = Router();

router.get('/expenses', authenticate, requireStaff(...MANAGERS), handle(listExpenses));
router.post('/expenses', authenticate, requireStaff(...MANAGERS), handle(createExpense));
router.patch('/expenses/:id', authenticate, requireStaff(...MANAGERS), handle(updateExpense));
router.delete('/expenses/:id', authenticate, requireStaff(...MANAGERS), handle(deleteExpense));

export default router;
