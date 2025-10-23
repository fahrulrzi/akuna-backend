import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  getCategoryByName,
  getProductsByCategoryId,
  updateCategory,
} from "../controllers/category.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// menambah kategori baru, hanya admin yang bisa
router.post("/", isAuthenticated, isAdmin, addCategory);

// get all categories
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.get("/name/:name", getCategoryByName);

// update category by id, hanya admin yang bisa
router.put("/:id", isAuthenticated, isAdmin, updateCategory);

// delete category by id, hanya admin yang bisa
router.delete("/:id", isAuthenticated, isAdmin, deleteCategory);

// get products by category id
router.get("/:id/products", getProductsByCategoryId);

export default router;
