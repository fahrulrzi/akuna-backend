import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createXenditInvoice,
  getInvoiceStatus,
  getXenditBalance,
  handleXenditCallback,
} from "../controllers/xendit.controller.js";
import { isOwner } from "../middlewares/owner.middleware.js";

const router = Router();

// Protected routes
router.post("/create-invoice", isAuthenticated, createXenditInvoice);
router.get("/balance", isAuthenticated, isOwner, getXenditBalance);
router.get("/invoice/:externalId", isAuthenticated, getInvoiceStatus);

// Webhook from Xendit (no auth, uses callback token)
router.post("/callback", handleXenditCallback);

export default router;
