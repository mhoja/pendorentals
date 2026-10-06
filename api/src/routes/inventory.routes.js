import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import { listInventory, createInventoryItems, updateInventoryItem, deleteInventoryItem } from '../controllers/inventory.controller.js';

const router = Router();
const EDITORS = ['Admin', 'Store manager', 'Inventory staff'];

router.get('/inventory', authenticate, requireStaff(), handle(listInventory));
router.post('/inventory', authenticate, requireStaff(...EDITORS), handle(createInventoryItems));
router.patch('/inventory/:id', authenticate, requireStaff(...EDITORS), handle(updateInventoryItem));
router.delete('/inventory/:id', authenticate, requireStaff(...EDITORS), handle(deleteInventoryItem));

export default router;
