import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  deleteProfile, 
  changePassword
} from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { applyForAffiliate } from '../controllers/affiliate.controller.js';

const router = Router();

// Rute ini dilindungi, hanya user yang sudah login bisa mengakses
router.post('/request-affiliate', isAuthenticated, applyForAffiliate);
router.get('/me', isAuthenticated, getProfile);
router.put('/me', isAuthenticated, updateProfile); 
router.delete('/me', isAuthenticated, deleteProfile);
router.post('/me/password', isAuthenticated, changePassword);

export default router;