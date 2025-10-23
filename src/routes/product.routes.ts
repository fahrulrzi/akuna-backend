import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  addProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getProductsByCategory,
  updateProduct,
} from "../controllers/product.controller.js";
import upload from "../config/multer.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.post(
  "/",
  isAuthenticated,
  upload.array("images", 10),
  isAdmin,
  addProduct
);
router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);
router.put(
  "/:id",
  isAuthenticated,
  upload.array("images", 10),
  isAdmin,
  updateProduct
);
router.delete("/:id", isAuthenticated, isAdmin, deleteProduct);

export default router;
