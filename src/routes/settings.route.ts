import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  getSettings,
  updateSetting,
} from "../controllers/settings.controller.js";

const router = Router();

router.get("/", isAuthenticated, isAdmin, getSettings);
router.put("/", isAuthenticated, isAdmin, updateSetting);

export default router;
