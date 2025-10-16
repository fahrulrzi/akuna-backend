import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  cancelTransaction,
  createTransaction,
  getTransactionStatus,
  getUserTransactions,
  handleNotification,
} from "../controllers/payment.controller.js";

const router = Router();

// Protected routes (require authentication)
router.post("/create", isAuthenticated, createTransaction);
router.get("/status/:orderId", isAuthenticated, getTransactionStatus);
router.get("/history", isAuthenticated, getUserTransactions);
router.post("/cancel/:orderId", isAuthenticated, cancelTransaction);

// Webhook from Midtrans (no auth required)
router.post("/notification", handleNotification);

export default router;
