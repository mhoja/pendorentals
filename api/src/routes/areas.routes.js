import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.middleware.js';
import { MANAGERS } from '../services/auth.service.js';
import { handle } from '../utils/helpers.js';
import {
    listServiceAreas,
    createServiceArea,
    updateServiceArea,
    deleteServiceArea,
} from '../controllers/areas.controller.js';

const router = Router();

router.get('/areas', handle(listServiceAreas));
router.post('/areas', authenticate, requireStaff(...MANAGERS), handle(createServiceArea));
router.patch('/areas/:id', authenticate, requireStaff(...MANAGERS), handle(updateServiceArea));
router.delete('/areas/:id', authenticate, requireStaff(...MANAGERS), handle(deleteServiceArea));

export default router;
