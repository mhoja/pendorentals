import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { MANAGERS } from '../services/auth.service.js';
import { handle } from '../utils/helpers.js';
import {
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    resetCustomerLogin,
    removeCustomerLogin,
} from '../controllers/customers.controller.js';

const router = Router();

router.get('/customers', authenticate, requireStaff(...MANAGERS), handle(listCustomers));
router.get('/customers/:id', authenticate, requireStaff(...MANAGERS), handle(getCustomer));
router.post('/customers', authenticate, requireStaff(...MANAGERS), handle(createCustomer));
router.patch('/customers/:id', authenticate, requireStaff(...MANAGERS), handle(updateCustomer));
router.delete('/customers/:id', authenticate, requireStaff('Admin'), handle(deleteCustomer));
router.post('/customers/:id/login', authenticate, requireStaff(...MANAGERS), handle(resetCustomerLogin));
router.delete('/customers/:id/login', authenticate, requireStaff(...MANAGERS), handle(removeCustomerLogin));

export default router;
