import { Router } from "express";
import { 
  getRates, 
  addOrder, 
  getTracking 
} from "../controllers/delivery.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/rates", getRates);
router.post("/orders", isAuthenticated, addOrder);
router.get("/trackings/:id", getTracking);

export default router;


