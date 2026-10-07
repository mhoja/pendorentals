import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { handle } from '../utils/helpers.js';
import {
    listServiceAreas,
    createServiceArea,
    updateServiceArea,
    deleteServiceArea,
} from '../controllers/areas.controller.js';

const router = Router();

router.get('/areas', handle(listServiceAreas));
router.post('/areas', authenticate, requirePermission('areas.manage'), handle(createServiceArea));
router.patch('/areas/:id', authenticate, requirePermission('areas.manage'), handle(updateServiceArea));
router.delete('/areas/:id', authenticate, requirePermission('areas.manage'), handle(deleteServiceArea));

export default router;
