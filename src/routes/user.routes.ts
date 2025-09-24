import { Router } from 'express';
import { applyForAffiliate } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();

// Rute ini dilindungi, hanya user yang sudah login bisa mengakses
router.post('/apply-affiliate', isAuthenticated, applyForAffiliate);

export default router;