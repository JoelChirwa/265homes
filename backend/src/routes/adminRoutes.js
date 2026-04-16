import { Router } from "express";

import {
  configureFreeBrowsingPromotion,
  getAdminPayments,
  getAdminSettings,
  getAdminUsers,
  getAnalytics,
  getAuditLog,
  getDashboardSummary,
  getListings,
  getSubscriptionsOverview,
  repostListing,
  resolvePaymentIssue,
  runPurgeSweep,
  secureListing,
  sendAdminNotification,
  updateAdminSettings,
  updateSubscriptionFees,
} from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

router.use("/admin", requireAdmin);

router.get("/admin/dashboard/summary", getDashboardSummary);
router.get("/admin/users", getAdminUsers);
router.get("/admin/payments", getAdminPayments);
router.post("/admin/payments/resolve", resolvePaymentIssue);
router.get("/admin/subscriptions/overview", getSubscriptionsOverview);
router.put("/admin/subscriptions/fees", updateSubscriptionFees);
router.get("/admin/settings", getAdminSettings);
router.put("/admin/settings", updateAdminSettings);
router.post("/admin/promotions/free-browsing-day", configureFreeBrowsingPromotion);
router.get("/admin/analytics", getAnalytics);
router.post("/admin/notifications/send", sendAdminNotification);
router.get("/admin/listings", getListings);
router.post("/admin/listings/:listingId/secure", secureListing);
router.post("/admin/listings/:listingId/repost", repostListing);
router.get("/admin/audit-log", getAuditLog);

// Keep a small manual trigger endpoint for purge checks if needed.
router.post("/admin/listings/purge-sweep", (_req, res) => {
  runPurgeSweep();
  res.json({ message: "Purge sweep completed." });
});

export default router;
