import { Router } from "express";
import { isAdmin } from "../middlewares/admin.middleware";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { isOwner } from "../middlewares/owner.middleware";
import {
  addAdmin,
  getAllAdmin,
  getAllBuyer,
  getAllOrder,
  getOrder,
  updateOrder,
} from "../controllers/admin.controller";

const router = Router();

router.get("/customers", isAuthenticated, isAdmin, getAllBuyer);
router.get("/admins", isAuthenticated, isOwner, getAllAdmin);
router.post("/admins", isAuthenticated, isOwner, addAdmin);

router.get("/orders", isAuthenticated, isAdmin, getAllOrder);
router.get("/orders/:id", isAuthenticated, isAdmin, getOrder);
router.put("/orders/:id", isAuthenticated, isAdmin, updateOrder);

export default router;
