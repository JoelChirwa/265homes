import { Router } from "express";

import {
  getMobileSettings,
  getSubscriptionStatus,
  getUserNotifications,
  registerDevice,
} from "../controllers/mobileController.js";

const router = Router();

router.get("/subscriptions/:userId/status", getSubscriptionStatus);
router.get("/mobile/settings", getMobileSettings);
router.get("/notifications/:userId", getUserNotifications);
router.post("/notifications/register-device", registerDevice);

export default router;
