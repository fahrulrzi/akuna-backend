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

router.post("/add-product", isAuthenticated, /* isAdmin, */ addProduct);
router.get("/products", addProduct);
router.get("/products-category/:id", getProductsByCategory);
router.get("/products/:id", getProductById);
router.put("/products/:id", isAuthenticated, /* isAdmin, */ updateProduct);
router.delete("/products/:id", isAuthenticated, /* isAdmin, */ deleteProduct);

export default router;
