import { Router } from 'express';
import { authenticate, requireCustomer } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { listMyOrders } from '../controllers/portal.controller.js';

const router = Router();

router.get('/my/orders', authenticate, requireCustomer, handle(listMyOrders));

export default router;
