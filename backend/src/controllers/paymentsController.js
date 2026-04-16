import crypto from "crypto";

import { env } from "../config/env.js";
import {
  buildReference,
  hasPaidStatus,
  normalizePhone,
  nowIso,
  sendNotification,
  transactionsByReference,
  updateUserSubscription,
  userIdByReference,
} from "../models/state.js";

function verifyWebhookSignature(rawBodyBuffer, signatureHeader) {
  if (!env.paychanguWebhookSecret) {
    return true;
  }
  if (!signatureHeader) {
    return false;
  }
  const expected = crypto
    .createHmac("sha256", env.paychanguWebhookSecret)
    .update(rawBodyBuffer)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(String(signatureHeader), "utf8"),
    );
  } catch {
    return false;
  }
}

export async function createMobileMoneyCharge(req, res) {
  try {
    const { userId, phone, amount, currency = "MWK", plan = "monthly" } = req.body ?? {};
    const chargeAmount = Number(amount);
    if (!userId || !phone || !chargeAmount) {
      return res.status(400).json({ message: "userId, phone and amount are required." });
    }

    const reference = buildReference(userId);
    userIdByReference.set(reference, userId);
    transactionsByReference.set(reference, {
      reference,
      userId,
      amount: chargeAmount,
      phone: normalizePhone(phone),
      status: "pending",
      createdAt: nowIso(),
      method: "Mobile Money",
      plan,
    });

    if (!env.paychanguSecretKey) {
      return res.status(201).json({
        message: "Test mode: charge queued without provider call.",
        reference,
      });
    }

    const payload = {
      amount: chargeAmount,
      currency,
      mobile: normalizePhone(phone),
      reference,
      callback_url: env.paychanguWebhookUrl,
      metadata: {
        userId,
        purpose: "tenant_subscription",
        plan,
      },
    };

    const response = await fetch(`${env.paychanguBaseUrl}${env.paychanguDirectChargePath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.paychanguSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Failed to initiate mobile money charge.",
        providerResponse: result,
      });
    }

    return res.status(201).json({
      message: "Charge initiated. Customer should authorize payment on mobile money prompt.",
      reference,
      providerResponse: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to initiate payment.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { reference } = req.params;

    if (!env.paychanguSecretKey) {
      const tx = transactionsByReference.get(reference);
      return res.json({ reference, status: tx?.status ?? "pending", providerResponse: null });
    }

    const url = new URL(`${env.paychanguBaseUrl}${env.paychanguVerifyPath}`);
    url.searchParams.set("reference", reference);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.paychanguSecretKey}`,
      },
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Unable to verify charge with provider.",
        providerResponse: result,
      });
    }

    const status = result?.status ?? result?.data?.status ?? result?.transaction?.status ?? "pending";
    if (hasPaidStatus(status)) {
      const userId =
        result?.metadata?.userId ??
        result?.data?.metadata?.userId ??
        userIdByReference.get(reference);
      if (userId) {
        updateUserSubscription(userId, { reference, verification: result });
        sendNotification({
          userId,
          title: "Subscription Activated",
          message: "Your payment was confirmed and your tenant subscription is now active.",
          type: "payment",
        });
      }
    }

    if (transactionsByReference.has(reference)) {
      const current = transactionsByReference.get(reference);
      transactionsByReference.set(reference, {
        ...current,
        status,
        verifiedAt: nowIso(),
      });
    }

    return res.json({ reference, status, providerResponse: result });
  } catch (error) {
    return res.status(500).json({
      message: "Verification failed.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export function handlePaychanguWebhook(req, res) {
  const signature = req.headers["x-paychangu-signature"] ?? req.headers["x-signature"] ?? undefined;
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ message: "Invalid webhook signature." });
  }

  const payload = JSON.parse(req.body.toString("utf8"));
  const reference = payload?.reference ?? payload?.data?.reference ?? payload?.transaction?.reference;
  const status = payload?.status ?? payload?.data?.status ?? payload?.event;
  const userId =
    payload?.metadata?.userId ??
    payload?.data?.metadata?.userId ??
    (reference ? userIdByReference.get(reference) : undefined);

  if (userId && hasPaidStatus(status)) {
    updateUserSubscription(userId, { reference, webhook: payload });
    sendNotification({
      userId,
      title: "Subscription Activated",
      message: "Your payment was confirmed and your tenant subscription is now active.",
      type: "payment",
    });
  }

  if (reference && transactionsByReference.has(reference)) {
    const current = transactionsByReference.get(reference);
    transactionsByReference.set(reference, {
      ...current,
      status,
      webhookAt: nowIso(),
    });
  }

  return res.json({ received: true });
}
