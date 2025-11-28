import { Router } from 'express';
import { 
  getUserOrders,
  getUserOrderDetail
} from '../controllers/order.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', isAuthenticated, getUserOrders);
router.get('/:orderId', isAuthenticated, getUserOrderDetail);

export default router;