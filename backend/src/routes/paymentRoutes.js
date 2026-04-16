import { Router } from "express";

import {
  createMobileMoneyCharge,
  handlePaychanguWebhook,
  verifyPayment,
} from "../controllers/paymentsController.js";

const router = Router();

router.post("/payments/mobile-money/charge", createMobileMoneyCharge);
router.get("/payments/verify/:reference", verifyPayment);
router.post("/payments/paychangu/webhook", handlePaychanguWebhook);

export default router;
