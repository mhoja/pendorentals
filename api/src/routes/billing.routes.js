import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { listInvoices, getInvoice, createInvoice, sendInvoice, signInvoice, updateInvoice, listPayments, recordPayment, refundPayment } from '../controllers/billing.controller.js';

const router = Router();

router.get('/invoices', authenticate, requirePermission('invoices.view'), handle(listInvoices));
router.post('/invoices', authenticate, requirePermission('invoices.manage'), handle(createInvoice));
router.get('/invoices/:id', authenticate, requirePermission('invoices.view'), handle(getInvoice));
router.post('/invoices/:id/sign', authenticate, requirePermission('invoices.manage'), handle(signInvoice));
router.post('/invoices/:id/send', authenticate, requirePermission('invoices.manage'), handle(sendInvoice));
router.patch('/invoices/:id', authenticate, requirePermission('invoices.manage'), handle(updateInvoice));
router.get('/payments', authenticate, requirePermission('payments.view'), handle(listPayments));
router.post('/payments', authenticate, requirePermission('payments.record'), handle(recordPayment));
router.patch('/payments/:id', authenticate, requirePermission('payments.refund'), handle(refundPayment));

export default router;
