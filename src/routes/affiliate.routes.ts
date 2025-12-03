import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { isAffiliate } from "../middlewares/affiliate.middleware.js";
import { shareProductAffiliate } from "../controllers/product.controller.js";
import { upload } from "../config/multer.js";
import { 
    verifyAffiliateUser,
    getAllWithdrawRequests,
    approveWithdraw,
    rejectWithdraw,
    getAffiliates,
    getMyAffiliateData,
    getCommissionHistory,
    requestWithdraw,
} from "../controllers/affiliate.controller.js";

const router = Router();

router.get("/", isAuthenticated, isAdmin, getAffiliates);
router.post("/admin/:id/verify", isAuthenticated, isAdmin, verifyAffiliateUser);
router.get("/admin/withdrawals", isAuthenticated, isAdmin, getAllWithdrawRequests);
router.post(
    "/admin/withdrawals/:id/approve", 
    isAuthenticated, 
    isAdmin, 
    upload.single("proofImage"),
    approveWithdraw
);
router.post(
    "/admin/withdrawals/:id/reject", 
    isAuthenticated, 
    isAdmin, 
    rejectWithdraw
);

router.get("/share/:id", isAuthenticated, isAffiliate, shareProductAffiliate);
router.get("/me", isAuthenticated, isAffiliate, getMyAffiliateData);
router.post("/withdraw", isAuthenticated, isAffiliate, requestWithdraw);
router.get("/history", isAuthenticated, isAffiliate, getCommissionHistory);
export default router;
