import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import {
    listInventoryCategories,
    createInventoryCategory,
    updateInventoryCategory,
    deleteInventoryCategory,
} from '../controllers/categories.controller.js';

const router = Router();

router.get('/inventory-categories', authenticate, requirePermission(), handle(listInventoryCategories));
router.post('/inventory-categories', authenticate, requirePermission('inventory.categories'), handle(createInventoryCategory));
router.patch('/inventory-categories/:id', authenticate, requirePermission('inventory.categories'), handle(updateInventoryCategory));
router.delete('/inventory-categories/:id', authenticate, requirePermission('inventory.categories'), handle(deleteInventoryCategory));

export default router;
