import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/", isAuthenticated, getCart);
router.post("/", isAuthenticated, addToCart);
router.put("/items/:itemId", isAuthenticated, updateCartItem);
router.delete("/items/:itemId", isAuthenticated, removeCartItem);
router.delete("/", isAuthenticated, clearCart);

export default router;

