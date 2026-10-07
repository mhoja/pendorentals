import { Router } from 'express';
import { authenticate, requireCustomer } from '../middleware/auth.middleware.js';
import { handle, rateLimiter } from '../utils/helpers.js';
import { createMyRentalRequest } from '../controllers/public.controller.js';
import { listMyOrders, listMyPayments, listMyInvoices, getMyInvoice } from '../controllers/portal.controller.js';

const router = Router();

router.get('/my/orders', authenticate, requireCustomer, handle(listMyOrders));
router.get('/my/payments', authenticate, requireCustomer, handle(listMyPayments));
router.get('/my/invoices', authenticate, requireCustomer, handle(listMyInvoices));
router.post('/my/rental-requests', authenticate, requireCustomer, rateLimiter(20, 15 * 60 * 1000), handle(createMyRentalRequest));
router.get('/my/invoices/:id', authenticate, requireCustomer, handle(getMyInvoice));

export default router;
