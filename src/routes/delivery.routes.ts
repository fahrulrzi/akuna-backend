import { Router } from "express";
import {
  getRates,
  // addOrder,
  handleBiteshipWebhook,
  getTracking,
  searchAreas,
  createDeliveryOrder,
} from "../controllers/delivery.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/areas", isAuthenticated, searchAreas);

router.post("/rates", isAuthenticated, getRates);
// router.post("/orders", isAuthenticated, addOrder);
router.post("/callback", handleBiteshipWebhook);
router.get("/trackings/:id", isAuthenticated, getTracking);
router.post("/create-shipping", isAuthenticated, isAdmin, createDeliveryOrder);

export default router;
