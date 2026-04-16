import crypto from "crypto";

import { env } from "../config/env.js";

export const usersById = new Map([
  [
    "usr-tenant-1",
    {
      id: "usr-tenant-1",
      fullName: "Chikondi Banda",
      phone: "0999123456",
      role: "tenant",
      status: "active",
      city: "Lilongwe",
      createdAt: "2026-03-10T09:30:00.000Z",
    },
  ],
  [
    "usr-tenant-2",
    {
      id: "usr-tenant-2",
      fullName: "Grace Phiri",
      phone: "0888234567",
      role: "tenant",
      status: "active",
      city: "Blantyre",
      createdAt: "2026-03-15T12:00:00.000Z",
    },
  ],
  [
    "usr-tenant-3",
    {
      id: "usr-tenant-3",
      fullName: "John Chirwa",
      phone: "0997345678",
      role: "tenant",
      status: "suspended",
      city: "Mzuzu",
      createdAt: "2026-03-18T14:45:00.000Z",
    },
  ],
  [
    "landlord-1",
    {
      id: "landlord-1",
      fullName: "Tapiwa Mbewe",
      phone: "0998456789",
      role: "landlord",
      status: "active",
      city: "Lilongwe",
      createdAt: "2026-02-20T08:00:00.000Z",
    },
  ],
  [
    "landlord-2",
    {
      id: "landlord-2",
      fullName: "Martha Zulu",
      phone: "0888345678",
      role: "landlord",
      status: "active",
      city: "Blantyre",
      createdAt: "2026-02-24T11:15:00.000Z",
    },
  ],
]);

export const subscriptionsByUserId = new Map([
  ["usr-tenant-1", { status: "paid", paidAt: "2026-04-01T09:00:00.000Z" }],
  ["usr-tenant-2", { status: "unpaid", paidAt: null }],
  ["usr-tenant-3", { status: "unpaid", paidAt: null }],
]);

export const userIdByReference = new Map();
export const transactionsByReference = new Map([
  [
    "PAY-1201",
    {
      reference: "PAY-1201",
      userId: "usr-tenant-1",
      amount: 5000,
      phone: "0999123456",
      status: "success",
      createdAt: "2026-04-14T10:10:00.000Z",
      method: "Airtel Money",
    },
  ],
  [
    "PAY-1200",
    {
      reference: "PAY-1200",
      userId: "usr-tenant-2",
      amount: 5000,
      phone: "0888234567",
      status: "pending",
      createdAt: "2026-04-14T09:45:00.000Z",
      method: "TNM Mpamba",
    },
  ],
  [
    "PAY-1199",
    {
      reference: "PAY-1199",
      userId: "usr-tenant-3",
      amount: 5000,
      phone: "0997345678",
      status: "failed",
      createdAt: "2026-04-14T08:20:00.000Z",
      method: "Airtel Money",
    },
  ],
]);

export const notificationsByUserId = new Map();
export const registeredDevicesByUserId = new Map();
export const adminSessions = new Map();
export const listingsById = new Map([
  [
    "lst-1",
    {
      id: "lst-1",
      title: "2 Bedroom Apartment - Area 47",
      landlordId: "landlord-1",
      status: "active",
      securedAt: null,
      deletedAt: null,
      purgeAt: null,
    },
  ],
  [
    "lst-2",
    {
      id: "lst-2",
      title: "Bedsitter - Blantyre",
      landlordId: "landlord-2",
      status: "active",
      securedAt: null,
      deletedAt: null,
      purgeAt: null,
    },
  ],
]);

export const appSettings = {
  subscriptionFeeWeekly: env.defaultSubscriptionFee,
  subscriptionFeeMonthly: env.defaultSubscriptionFee * 4,
  freeBrowsingDayEnabled: false,
  freeBrowsingDate: null,
};

export const adminAuditLog = [];

export function nowIso() {
  return new Date().toISOString();
}

export function normalizePhone(phone = "") {
  return String(phone).replace(/\s+/g, "");
}

export function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function buildReference(userId) {
  return `sub_${userId}_${Date.now()}`;
}

export function hasPaidStatus(status = "") {
  const normalized = String(status).toLowerCase();
  return ["success", "successful", "paid", "completed", "resolved_manually"].includes(normalized);
}

export function isFreeBrowsingActive() {
  if (!appSettings.freeBrowsingDayEnabled || !appSettings.freeBrowsingDate) {
    return false;
  }
  const today = new Date().toISOString().slice(0, 10);
  return appSettings.freeBrowsingDate === today;
}

export function getSubscriptionRecord(userId) {
  return subscriptionsByUserId.get(userId) ?? { status: "unpaid", paidAt: null };
}

export function pushAudit(action, payload) {
  adminAuditLog.unshift({
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    payload,
    createdAt: nowIso(),
  });
  if (adminAuditLog.length > 500) {
    adminAuditLog.pop();
  }
}

export function sendNotification({ userId, title, message, type = "system" }) {
  if (!userId) {
    return;
  }
  const bucket = notificationsByUserId.get(userId) ?? [];
  bucket.unshift({
    id: `ntf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    type,
    createdAt: nowIso(),
    read: false,
  });
  notificationsByUserId.set(userId, bucket.slice(0, 100));
}

export function updateUserSubscription(userId, metadata = {}) {
  subscriptionsByUserId.set(userId, {
    status: "paid",
    paidAt: nowIso(),
    provider: "paychangu",
    metadata,
  });
}

export function createAdminSession() {
  const token = crypto.randomBytes(24).toString("hex");
  const session = { email: env.adminEmail, createdAt: nowIso() };
  adminSessions.set(token, session);
  return { token, session };
}
