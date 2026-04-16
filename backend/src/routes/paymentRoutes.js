import { Router } from "express";

import {
  createMobileMoneyCharge,
  handlePaychanguWebhook,
  verifyPayment,
} from "../controllers/paymentsController.js";
import { transactionsByReference, hasPaidStatus, userIdByReference, updateUserSubscription, sendNotification } from "../models/state.js";

const router = Router();

router.post("/payments/mobile-money/charge", createMobileMoneyCharge);
router.get("/payments/verify/:reference", verifyPayment);
router.post("/payments/paychangu/webhook", handlePaychanguWebhook);

// TEST ENDPOINT: Manually succeed a payment
router.get("/payments/test-success/:reference", (req, res) => {
    const { reference } = req.params;
    const tx = transactionsByReference.get(reference);
    
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    
    tx.status = "success";
    const userId = tx.userId || userIdByReference.get(reference);
    
    if (userId) {
        updateUserSubscription(userId, { reference, manual: true });
        sendNotification({
            userId,
            title: "Plan Upgraded (Test)",
            message: "Your subscription has been manually activated for testing purposes.",
            type: "payment"
        });
    }
    
    res.json({ message: "Transaction marked as success", reference });
});

export default router;
