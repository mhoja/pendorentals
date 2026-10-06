import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { MANAGERS } from '../services/auth.service.js';
import { handle } from '../utils/helpers.js';
import { listInvoices, createInvoice, updateInvoice, listPayments, recordPayment, refundPayment } from '../controllers/billing.controller.js';

const router = Router();

router.get('/invoices', authenticate, requireStaff(...MANAGERS), handle(listInvoices));
router.post('/invoices', authenticate, requireStaff(...MANAGERS), handle(createInvoice));
router.patch('/invoices/:id', authenticate, requireStaff(...MANAGERS), handle(updateInvoice));
router.get('/payments', authenticate, requireStaff(...MANAGERS), handle(listPayments));
router.post('/payments', authenticate, requireStaff(...MANAGERS), handle(recordPayment));
router.patch('/payments/:id', authenticate, requireStaff('Admin'), handle(refundPayment));

export default router;
