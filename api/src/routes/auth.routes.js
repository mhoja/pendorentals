import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { handle, rateLimiter } from '../utils/helpers.js';
import { login, getCurrentUser, logout, changePassword, forgotPassword } from '../controllers/auth.controller.js';

const router = Router();

router.post('/auth/login', rateLimiter(10, 15 * 60 * 1000), handle(login));
router.post('/auth/forgot-password', rateLimiter(5, 15 * 60 * 1000), handle(forgotPassword));
router.get('/me', authenticate, handle(getCurrentUser));
router.post('/auth/logout', authenticate, handle(logout));
router.post('/me/password', authenticate, rateLimiter(10, 15 * 60 * 1000), handle(changePassword));

export default router;
