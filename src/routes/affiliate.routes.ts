import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { getAffiliates } from "../controllers/affiliate.controller.js";
import { isAffiliate } from "../middlewares/affiliate.middleware.js";
import { shareProductAffiliate } from "../controllers/product.controller.js";

const router = Router();

router.get("/", isAuthenticated, isAdmin, getAffiliates);

// request share affiliate link
router.get("/share/:id", isAuthenticated, isAffiliate, shareProductAffiliate);

export default router;
