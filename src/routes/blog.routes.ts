import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import upload from "../config/multer.js";
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";

const router = Router();

router.post(
  "/",
  isAuthenticated,
  isAdmin,
  upload.single("thumbnail"),
  createBlog
);

router.get("/", getBlogs);
router.get("/:id", getBlogById);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  upload.single("thumbnail"),
  updateBlog
);

router.delete(
  "/:id", 
  isAuthenticated, 
  isAdmin, 
  deleteBlog
);

export default router;


