import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { MANAGERS } from '../services/auth.service.js';
import { handle } from '../utils/helpers.js';
import { listOrders, getOrder, createOrder, updateOrder } from '../controllers/orders.controller.js';

const router = Router();

router.get('/orders', authenticate, requireStaff(), handle(listOrders));
router.get('/orders/:code', authenticate, requireStaff(), handle(getOrder));
router.post('/orders', authenticate, requireStaff(...MANAGERS), handle(createOrder));
router.patch('/orders/:code', authenticate, requireStaff(), handle(updateOrder));

export default router;
