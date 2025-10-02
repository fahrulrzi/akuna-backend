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

const router = Router();

router.post("/categories", isAuthenticated, /* isAdmin, */ addCategory);

router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.get("/categories/:name", getCategoryByName);

router.put("/categories/:name", isAuthenticated, /* isAdmin, */ updateCategory);

router.delete(
  "/categories/:name",
  isAuthenticated,
  /* isAdmin, */ deleteCategory
);

// get products by category id
router.get("/categories/:id/products", getProductsByCategoryId);
