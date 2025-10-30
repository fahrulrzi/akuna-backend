import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  approveAffiliate,
  getAffiliates,
} from "../controllers/affiliate.controller.js";

const router = Router();

router.get("/", isAuthenticated, getAffiliates);
router.put("/", isAuthenticated, approveAffiliate);

export default router;
