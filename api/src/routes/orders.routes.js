import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { listOrders, getOrder, createOrder, updateOrder } from '../controllers/orders.controller.js';

const router = Router();

router.get('/orders', authenticate, requirePermission('orders.view', 'orders.deliveries', 'orders.requests'), handle(listOrders));
router.get('/orders/:code', authenticate, requirePermission('orders.view', 'orders.deliveries', 'orders.requests'), handle(getOrder));
router.post('/orders', authenticate, requirePermission('orders.create'), handle(createOrder));
router.patch('/orders/:code', authenticate, requirePermission('orders.edit', 'orders.status', 'orders.delivery', 'orders.cancel', 'orders.requests'), handle(updateOrder));

export default router;
