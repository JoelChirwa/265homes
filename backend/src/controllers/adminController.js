import { env } from "../config/env.js";
import {
  addHours,
  adminAuditLog,
  appSettings,
  getSubscriptionRecord,
  hasPaidStatus,
  listingsById,
  nowIso,
  pushAudit,
  sendNotification,
  transactionsByReference,
  updateUserSubscription,
  usersById,
} from "../models/state.js";

export function getDashboardSummary(_req, res) {
  const users = Array.from(usersById.values());
  const payments = Array.from(transactionsByReference.values()).sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)),
  );
  const tenants = users.filter((user) => user.role === "tenant").length;
  const landlords = users.filter((user) => user.role === "landlord").length;
  const paidSubscribers = users.filter(
    (user) => user.role === "tenant" && getSubscriptionRecord(user.id).status === "paid",
  ).length;
  const pendingPayments = payments.filter((payment) =>
    String(payment.status).toLowerCase().includes("pending"),
  ).length;
  const monthlyRevenue = payments
    .filter((payment) => hasPaidStatus(payment.status))
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return res.json({
    usersSummary: {
      totalUsers: users.length,
      tenants,
      landlords,
    },
    financeSummary: {
      monthlyRevenue,
      paidSubscribers,
      pendingPayments,
    },
    recentPayments: payments.slice(0, 10),
  });
}

export function getAdminUsers(_req, res) {
  const users = Array.from(usersById.values()).map((user) => {
    const subscription = getSubscriptionRecord(user.id);
    return {
      ...user,
      subscriptionStatus: user.role === "landlord" ? "free" : subscription.status,
    };
  });
  return res.json({ users });
}

export function getAdminPayments(_req, res) {
  const payments = Array.from(transactionsByReference.values()).sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)),
  );
  return res.json({ payments });
}

export function resolvePaymentIssue(req, res) {
  const { userId, reference, reason = "Manual admin resolution." } = req.body ?? {};
  if (!userId || !usersById.has(userId)) {
    return res.status(400).json({ message: "Valid userId is required." });
  }

  updateUserSubscription(userId, {
    reference: reference ?? null,
    resolvedByAdmin: true,
    reason,
  });

  if (reference && transactionsByReference.has(reference)) {
    const tx = transactionsByReference.get(reference);
    transactionsByReference.set(reference, {
      ...tx,
      status: "resolved_manually",
      resolvedAt: nowIso(),
    });
  }

  sendNotification({
    userId,
    title: "Subscription Activated by Support",
    message: "Your payment issue was resolved by admin. Subscription is now active.",
    type: "support",
  });

  pushAudit("payment_manual_resolve", { userId, reference, reason });
  return res.json({ message: "Payment issue resolved and subscription updated." });
}

export function getSubscriptionsOverview(_req, res) {
  const users = Array.from(usersById.values());
  const tenants = users.filter((user) => user.role === "tenant");
  const landlords = users.filter((user) => user.role === "landlord");
  const paidSubscribers = tenants.filter(
    (tenant) => getSubscriptionRecord(tenant.id).status === "paid",
  ).length;
  const unpaidTenants = tenants.length - paidSubscribers;

  const renewals = tenants.slice(0, 20).map((tenant, index) => {
    const nextDate = addHours(new Date(), 24 * (index + 1));
    const status = getSubscriptionRecord(tenant.id).status === "paid" ? "Upcoming" : "Expired";
    return {
      tenant: tenant.fullName,
      phone: tenant.phone,
      renewalDate: nextDate.toISOString().slice(0, 10),
      status,
    };
  });

  return res.json({
    plans: {
      paidSubscribers,
      unpaidTenants,
      landlordsFree: landlords.length,
    },
    fees: {
      weekly: appSettings.subscriptionFeeWeekly,
      monthly: appSettings.subscriptionFeeMonthly,
    },
    renewals,
  });
}

export function updateSubscriptionFees(req, res) {
  const { weekly, monthly } = req.body ?? {};
  if (typeof weekly === "number" && weekly > 0) {
    appSettings.subscriptionFeeWeekly = weekly;
  }
  if (typeof monthly === "number" && monthly > 0) {
    appSettings.subscriptionFeeMonthly = monthly;
  }
  pushAudit("subscription_fees_update", { weekly, monthly });
  return res.json({
    message: "Subscription fees updated.",
    fees: {
      weekly: appSettings.subscriptionFeeWeekly,
      monthly: appSettings.subscriptionFeeMonthly,
    },
  });
}

export function getAdminSettings(_req, res) {
  return res.json(appSettings);
}

export function updateAdminSettings(req, res) {
  const { subscriptionFeeWeekly, subscriptionFeeMonthly, freeBrowsingDayEnabled, freeBrowsingDate } =
    req.body ?? {};
  if (typeof subscriptionFeeWeekly === "number" && subscriptionFeeWeekly > 0) {
    appSettings.subscriptionFeeWeekly = subscriptionFeeWeekly;
  }
  if (typeof subscriptionFeeMonthly === "number" && subscriptionFeeMonthly > 0) {
    appSettings.subscriptionFeeMonthly = subscriptionFeeMonthly;
  }
  if (typeof freeBrowsingDayEnabled === "boolean") {
    appSettings.freeBrowsingDayEnabled = freeBrowsingDayEnabled;
  }
  if (typeof freeBrowsingDate === "string" || freeBrowsingDate === null) {
    appSettings.freeBrowsingDate = freeBrowsingDate;
  }
  pushAudit("settings_update", req.body ?? {});
  return res.json({ message: "Settings updated.", settings: appSettings });
}

export function configureFreeBrowsingPromotion(req, res) {
  const { date, enabled = true } = req.body ?? {};
  if (!date) {
    return res.status(400).json({ message: "date is required in YYYY-MM-DD format." });
  }
  appSettings.freeBrowsingDate = date;
  appSettings.freeBrowsingDayEnabled = Boolean(enabled);
  pushAudit("promotion_free_browsing_day", { date, enabled });
  return res.status(201).json({
    message: "Free browsing day configured.",
    settings: appSettings,
  });
}

export function getAnalytics(_req, res) {
  const users = Array.from(usersById.values());
  const cityMap = new Map();

  for (const user of users) {
    if (!cityMap.has(user.city)) {
      cityMap.set(user.city, { city: user.city, activeUsers: 0, paidCount: 0, tenantCount: 0 });
    }
    const row = cityMap.get(user.city);
    row.activeUsers += user.status === "active" ? 1 : 0;
    if (user.role === "tenant") {
      row.tenantCount += 1;
      if (getSubscriptionRecord(user.id).status === "paid") {
        row.paidCount += 1;
      }
    }
  }

  const cityPerformance = Array.from(cityMap.values()).map((row) => ({
    city: row.city,
    activeUsers: row.activeUsers,
    conversions:
      row.tenantCount > 0 ? `${Math.round((row.paidCount / row.tenantCount) * 100)}%` : "0%",
  }));

  const monthlyActiveUsers = users.filter((user) => user.status === "active").length;
  const newSignups = users.filter(
    (user) => new Date(user.createdAt).getMonth() === new Date().getMonth(),
  ).length;
  const tenants = users.filter((user) => user.role === "tenant");
  const paidTenants = tenants.filter(
    (tenant) => getSubscriptionRecord(tenant.id).status === "paid",
  ).length;
  const landlords = users.filter((user) => user.role === "landlord");
  const activeLandlords = landlords.filter((landlord) => landlord.status === "active").length;

  return res.json({
    growthKpis: [
      {
        label: "Monthly Active Users",
        value: String(monthlyActiveUsers),
        note: "Live from backend",
      },
      { label: "New Signups", value: String(newSignups), note: "Live from backend" },
      {
        label: "Tenant to Paid Rate",
        value: `${tenants.length ? Math.round((paidTenants / tenants.length) * 100) : 0}%`,
        note: "Live from backend",
      },
      {
        label: "Landlord Retention",
        value: `${landlords.length ? Math.round((activeLandlords / landlords.length) * 100) : 0}%`,
        note: "Live from backend",
      },
    ],
    cityPerformance,
    insights: [
      "Track cities with strongest paid conversion.",
      "Monitor signups to optimize acquisition campaigns.",
      "Use free browsing promotions to increase tenant activation.",
    ],
  });
}

export function sendAdminNotification(req, res) {
  const { userId, userIds, title, message, type = "admin" } = req.body ?? {};
  if (!title || !message) {
    return res.status(400).json({ message: "title and message are required." });
  }
  const targets = userIds ?? (userId ? [userId] : []);
  if (!Array.isArray(targets) || targets.length === 0) {
    return res.status(400).json({ message: "At least one target userId is required." });
  }

  for (const targetUserId of targets) {
    if (!usersById.has(targetUserId)) {
      continue;
    }
    sendNotification({ userId: targetUserId, title, message, type });
  }
  pushAudit("admin_notification_send", { targets, title });
  return res.status(201).json({ message: "Notification sent.", targets: targets.length });
}

export function getListings(_req, res) {
  const listings = Array.from(listingsById.values()).sort((a, b) =>
    String(b.id).localeCompare(String(a.id)),
  );
  return res.json({ listings });
}

export function secureListing(req, res) {
  const { listingId } = req.params;
  const { action = "notify_delete" } = req.body ?? {};
  const listing = listingsById.get(listingId);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }

  listing.securedAt = nowIso();
  if (action === "delete_now") {
    listing.status = "deleted_pending_purge";
    listing.deletedAt = nowIso();
    listing.purgeAt = addHours(new Date(), env.listPurgeHours).toISOString();
    sendNotification({
      userId: listing.landlordId,
      title: "Listing Deleted by Admin",
      message: "A secured listing was deleted by admin. It can be restored within 48 hours.",
      type: "listing",
    });
    pushAudit("listing_delete_admin", { listingId, landlordId: listing.landlordId });
    return res.json({ message: "Listing deleted and queued for purge in 48 hours.", listing });
  }

  listing.status = "secured_notified_landlord";
  sendNotification({
    userId: listing.landlordId,
    title: "Action Required: Remove Secured Listing",
    message: "Your listing appears secured. Please delete it from your account.",
    type: "listing",
  });
  pushAudit("listing_notify_landlord_delete", { listingId, landlordId: listing.landlordId });
  return res.json({ message: "Landlord notified to delete secured listing.", listing });
}

export function repostListing(req, res) {
  const listing = listingsById.get(req.params.listingId);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }
  if (listing.status !== "deleted_pending_purge") {
    return res.status(400).json({ message: "Listing is not in restorable state." });
  }
  listing.status = "active";
  listing.deletedAt = null;
  listing.purgeAt = null;
  sendNotification({
    userId: listing.landlordId,
    title: "Listing Restored",
    message: "Your listing has been restored and is now active again.",
    type: "listing",
  });
  pushAudit("listing_repost", { listingId: listing.id, landlordId: listing.landlordId });
  return res.json({ message: "Listing restored.", listing });
}

export function getAuditLog(_req, res) {
  return res.json({ audit: adminAuditLog });
}

export function runPurgeSweep() {
  const now = Date.now();
  for (const [listingId, listing] of listingsById.entries()) {
    if (listing.purgeAt && new Date(listing.purgeAt).getTime() <= now) {
      listingsById.delete(listingId);
      pushAudit("listing_auto_purge_48h", { listingId });
    }
  }
}

