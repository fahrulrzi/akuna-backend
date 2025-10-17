import { Router } from 'express';
import { 
  applyForAffiliate, 
  getProfile, 
  updateProfile, 
  deleteProfile, 
  changePassword 
} from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();

// Rute ini dilindungi, hanya user yang sudah login bisa mengakses
router.post('/apply-affiliate', isAuthenticated, applyForAffiliate);
router.get('/me', isAuthenticated, getProfile);
router.put('/me', isAuthenticated, updateProfile); 
router.delete('/me', isAuthenticated, deleteProfile);
router.post('/me/password', isAuthenticated, changePassword);

export default router;