import { Router } from "express";
import { 
  getRates, 
  // addOrder, 
  handleBiteshipWebhook,
  getTracking,
  searchAreas
} from "../controllers/delivery.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/areas", searchAreas); 

router.post("/rates", getRates);
// router.post("/orders", isAuthenticated, addOrder);
router.post("/callback", handleBiteshipWebhook);
router.get("/trackings/:id", getTracking);

export default router;