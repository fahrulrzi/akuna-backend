import { Router } from "express";
import {
  getRates,
  // addOrder,
  handleBiteshipWebhook,
  getTracking,
  searchAreas,
} from "../controllers/delivery.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import express from "express";

const router = Router();

router.get("/areas", isAuthenticated, searchAreas);

router.post("/rates", isAuthenticated, getRates);
// router.post("/orders", isAuthenticated, addOrder);
router.post(
  "/callback",
  express.raw({ type: "application/json", limit: "1mb" }),
  handleBiteshipWebhook
);
router.get("/trackings/:id", isAuthenticated, getTracking);

export default router;
