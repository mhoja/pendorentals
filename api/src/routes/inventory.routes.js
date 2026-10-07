import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { listInventory, createInventoryItems, updateInventoryItem, deleteInventoryItem } from '../controllers/inventory.controller.js';

const router = Router();

router.get('/inventory', authenticate, requirePermission(), handle(listInventory));
router.post('/inventory', authenticate, requirePermission('inventory.manage'), handle(createInventoryItems));
router.patch('/inventory/:id', authenticate, requirePermission('inventory.manage'), handle(updateInventoryItem));
router.delete('/inventory/:id', authenticate, requirePermission('inventory.manage'), handle(deleteInventoryItem));

export default router;
