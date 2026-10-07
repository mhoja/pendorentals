import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
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

router.get('/customers', authenticate, requirePermission('customers.view'), handle(listCustomers));
router.get('/customers/:id', authenticate, requirePermission('customers.view'), handle(getCustomer));
router.post('/customers', authenticate, requirePermission('customers.manage'), handle(createCustomer));
router.patch('/customers/:id', authenticate, requirePermission('customers.manage'), handle(updateCustomer));
router.delete('/customers/:id', authenticate, requirePermission('customers.delete'), handle(deleteCustomer));
router.post('/customers/:id/login', authenticate, requirePermission('customers.login'), handle(resetCustomerLogin));
router.delete('/customers/:id/login', authenticate, requirePermission('customers.login'), handle(removeCustomerLogin));

export default router;
