import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  addProduct,
  deleteProduct,
  getProductById,
  getProductsByCategory,
  updateProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.post("/", isAuthenticated, /* isAdmin, */ addProduct);
router.get("/", addProduct);
router.get("/category/:id", getProductsByCategory);
router.get("/:id", getProductById);
router.put("/id", isAuthenticated, /* isAdmin, */ updateProduct);
router.delete("/:id", isAuthenticated, /* isAdmin, */ deleteProduct);

export default router;
