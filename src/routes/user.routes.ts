import { Router } from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  changePassword,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  requestAffiliate,
  updateForAffiliate,
} from "../controllers/affiliate.controller.js";
import { isAffiliate } from "../middlewares/affiliate.middleware.js";

const router = Router();

// Rute ini dilindungi, hanya user yang sudah login bisa mengakses
// Affiliate routes
router.post("/affiliate", isAuthenticated, requestAffiliate);
router.put("/affiliate", isAuthenticated, isAffiliate, updateForAffiliate);

// User profile routes
router.get("/me", isAuthenticated, getProfile);
router.put("/me", isAuthenticated, updateProfile);
router.delete("/me", isAuthenticated, deleteProfile);
router.post("/me/password", isAuthenticated, changePassword);

export default router;
