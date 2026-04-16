import {
  appSettings,
  getSubscriptionRecord,
  isFreeBrowsingActive,
  notificationsByUserId,
  registeredDevicesByUserId,
  usersById,
} from "../models/state.js";

export function getSubscriptionStatus(req, res) {
  const user = usersById.get(req.params.userId);
  const subscriptionRecord = getSubscriptionRecord(req.params.userId);
  const freeBrowsingDayActive = isFreeBrowsingActive();
  const subscriptionStatus = user?.role === "landlord" ? "paid" : subscriptionRecord.status;
  const accessGranted = subscriptionStatus === "paid" || freeBrowsingDayActive;

  return res.json({
    userId: req.params.userId,
    subscriptionStatus,
    accessGranted,
    freeBrowsingDayActive,
    metadata: subscriptionRecord,
  });
}

export function getMobileSettings(_req, res) {
  return res.json({
    subscriptionFeeWeekly: appSettings.subscriptionFeeWeekly,
    subscriptionFeeMonthly: appSettings.subscriptionFeeMonthly,
    freeBrowsingDayEnabled: appSettings.freeBrowsingDayEnabled,
    freeBrowsingDate: appSettings.freeBrowsingDate,
  });
}

export function getUserNotifications(req, res) {
  const notifications = notificationsByUserId.get(req.params.userId) ?? [];
  return res.json({ userId: req.params.userId, notifications });
}

export function registerDevice(req, res) {
  const { userId, deviceToken } = req.body ?? {};
  if (!userId || !deviceToken) {
    return res.status(400).json({ message: "userId and deviceToken are required." });
  }

  const bucket = registeredDevicesByUserId.get(userId) ?? [];
  if (!bucket.includes(deviceToken)) {
    bucket.push(deviceToken);
  }
  registeredDevicesByUserId.set(userId, bucket);
  return res.status(201).json({ message: "Device registered.", devices: bucket.length });
}
