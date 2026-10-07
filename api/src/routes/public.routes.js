import { Router } from 'express';
import { handle, rateLimiter } from '../utils/helpers.js';
import { healthCheck, getBusinessInfo, getRentalCatalog, createRentalRequest } from '../controllers/public.controller.js';

const router = Router();

router.get('/health', handle(healthCheck));
router.get('/business', handle(getBusinessInfo));
router.get('/rental-catalog', handle(getRentalCatalog));
router.post('/rental-requests', rateLimiter(8, 15 * 60 * 1000), handle(createRentalRequest));

export default router;
