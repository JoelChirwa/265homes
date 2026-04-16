import { Router } from "express";

import { getAdminProfile, loginAdmin } from "../controllers/adminAuthController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

router.post("/admin/auth/login", loginAdmin);
router.get("/admin/auth/me", requireAdmin, getAdminProfile);

export default router;
