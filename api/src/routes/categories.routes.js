import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { MANAGERS } from '../services/auth.service.js';
import { handle } from '../utils/helpers.js';
import {
    listInventoryCategories,
    createInventoryCategory,
    updateInventoryCategory,
    deleteInventoryCategory,
} from '../controllers/categories.controller.js';

const router = Router();

router.get('/inventory-categories', authenticate, requireStaff(), handle(listInventoryCategories));
router.post('/inventory-categories', authenticate, requireStaff(...MANAGERS), handle(createInventoryCategory));
router.patch('/inventory-categories/:id', authenticate, requireStaff(...MANAGERS), handle(updateInventoryCategory));
router.delete('/inventory-categories/:id', authenticate, requireStaff(...MANAGERS), handle(deleteInventoryCategory));

export default router;
