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
  if (!env.paychanguWebhookSecret) return true;
  if (!signatureHeader) return false;

  const sig = String(signatureHeader).trim().replace(/^sha256=/i, "");
  const expectedHex = crypto
    .createHmac("sha256", env.paychanguWebhookSecret)
    .update(rawBodyBuffer)
    .digest("hex");
  const expectedBase64 = crypto
    .createHmac("sha256", env.paychanguWebhookSecret)
    .update(rawBodyBuffer)
    .digest("base64");

  const timingSafeStringEqual = (a, b) => {
    const bufA = Buffer.from(String(a), "utf8");
    const bufB = Buffer.from(String(b), "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  };

  const sigLower = sig.toLowerCase();
  const expectedHexLower = expectedHex.toLowerCase();

  try {
    return (
      timingSafeStringEqual(sigLower, expectedHexLower) ||
      timingSafeStringEqual(sig, expectedBase64)
    );
  } catch {
    return false;
  }
}

let cachedSupportedOperators = {
  fetchedAtMs: 0,
  data: /** @type {Array<any>} */ ([]),
};

async function getSupportedMobileMoneyOperators() {
  const ttlMs = 5 * 60 * 1000;
  if (cachedSupportedOperators.data.length > 0) {
    const age = Date.now() - cachedSupportedOperators.fetchedAtMs;
    if (age < ttlMs) return cachedSupportedOperators.data;
  }

  const response = await fetch(`${env.paychanguBaseUrl}/mobile-money`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.paychanguSecretKey}`,
      Accept: "application/json",
    },
  });

  const result = await response.json().catch(() => ({}));
  const data = Array.isArray(result?.data) ? result.data : [];
  cachedSupportedOperators = { fetchedAtMs: Date.now(), data };
  return data;
}

async function resolveOperatorRefId(phone) {
  const cleanPhone = normalizePhone(phone);

  // Malawi: Airtel (09...), TNM Mpamba (08...)
  const target =
    cleanPhone.startsWith("+2659") || cleanPhone.startsWith("09")
      ? { name: "Airtel Money", shortCode: "airtel" }
      : { name: "TNM Mpamba", shortCode: "tnm" };

  // Fallback to last-known docs IDs while operators are being resolved.
  const fallbackRefId =
    target.shortCode === "airtel"
      ? "20be6c20-adeb-4b5b-a7ba-0769820df4fb"
      : "27494cb5-ba9e-437f-a114-4e7a7686bcca";

  try {
    const operators = await getSupportedMobileMoneyOperators();
    const match =
      operators.find((o) => o?.name === target.name) ||
      operators.find((o) => o?.short_code === target.shortCode);
    return match?.ref_id ?? fallbackRefId;
  } catch {
    // If operator lookup fails, at least try a sensible fallback.
    return fallbackRefId;
  }
}

export async function createMobileMoneyCharge(req, res) {
  try {
    const { userId, phone, amount, currency = "MWK", plan = "monthly", email, first_name, last_name } = req.body ?? {};
    const chargeAmount = Number(amount);
    if (!userId || !phone || !chargeAmount) {
      return res.status(400).json({ message: "userId, phone and amount are required." });
    }

    const reference = buildReference(userId);
    userIdByReference.set(reference, userId);
    
    // If we don't have PayChangu credentials, we won't call PayChangu anyway.
    const operatorRefId = env.paychanguSecretKey
      ? await resolveOperatorRefId(phone)
      : undefined;

    transactionsByReference.set(reference, {
      reference,
      userId,
      amount: chargeAmount,
      phone: normalizePhone(phone),
      status: "pending",
      // We use our `reference` as PayChangu's `charge_id` so webhook mapping works.
      chargeId: reference,
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
      // PayChangu requires `charge_id`. We use our internally generated `reference`
      // as the charge_id so we can reconcile/poll consistently.
      charge_id: reference,
      mobile_money_operator_ref_id: operatorRefId,
      // Required by many providers so they can call back your server.
      webhook_url: env.paychanguWebhookUrl,
      email: email || "customer@265homes.mw",
      first_name: first_name || "Guest",
      last_name: last_name || "User",
    };

    console.log(`[Paychangu] Initiating Direct Charge:`, JSON.stringify(payload));

    const response = await fetch(`${env.paychanguBaseUrl}${env.paychanguDirectChargePath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.paychanguSecretKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json().catch(() => ({}));
    console.log(`[Paychangu] Initiation Response (Status ${response.status}):`, JSON.stringify(result));

    if (!response.ok) {
        return res.status(response.status).json({
          message: "Paychangu initiation failed.",
          providerResponse: result,
        });
    }

    const chargeId =
      result?.data?.charge_id ??
      result?.data?.chargeId ??
      result?.charge_id ??
      result?.chargeId ??
      result?.data?.id ??
      result?.id;
    if (chargeId) {
        const tx = transactionsByReference.get(reference);
        if (tx) tx.chargeId = chargeId;
    }

    return res.status(201).json({
      message: "Charge initiated.",
      reference,
      chargeId,
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
    const tx = transactionsByReference.get(reference);
    
    if (!env.paychanguSecretKey) {
      return res.json({ reference, status: tx?.status ?? "pending", providerResponse: null });
    }

    const chargeId = tx?.chargeId;

    if (!chargeId) {
      console.warn(`[Paychangu] No chargeId found for reference: ${reference}. Using reference as fallback.`);
    }

    const idToUse = chargeId || reference;
    let verifyUrl = `${env.paychanguBaseUrl}${env.paychanguVerifyPath}`.replace("{{chargeId}}", idToUse);
    
    // Add charge_id as query param just in case Paychangu expects it there too
    if (verifyUrl.includes("?")) {
        verifyUrl += `&charge_id=${idToUse}`;
    } else {
        verifyUrl += `?charge_id=${idToUse}`;
    }

    console.log(`[Paychangu] Verifying at: ${verifyUrl}`);

    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.paychanguSecretKey}`,
        Accept: "application/json",
      },
    });
    
    const result = await response.json().catch(() => ({}));
    console.log(`[Paychangu] Verify Response:`, JSON.stringify(result));

    const status = result?.status || result?.data?.status || (result?.message === "success" ? "success" : "pending");
    if (hasPaidStatus(status)) {
      const userId = tx?.userId || userIdByReference.get(reference);
      if (userId) {
        updateUserSubscription(userId, { reference, provider: "paychangu" });
      }
    }

    return res.json({ reference, status, data: result.data || result });
  } catch (error) {
    console.error(`[Paychangu] Verification logic error:`, error);
    return res.status(500).json({ message: "Verification failed", error: error instanceof Error ? error.message : String(error) });
  }
}

export function handlePaychanguWebhook(req, res) {
  const signature = req.headers["x-paychangu-signature"] ?? req.headers["x-signature"] ?? undefined;
  const rawBody = req.body;
  const rawBodyBuffer = Buffer.isBuffer(rawBody)
    ? rawBody
    : Buffer.from(typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody ?? {}), "utf8");

  if (!verifyWebhookSignature(rawBodyBuffer, signature)) {
    return res.status(401).json({ message: "Invalid webhook signature." });
  }

  let payload;
  try {
    payload = Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString("utf8")) : rawBody;
    // If express.json already ran for some reason, we may still get a string.
    if (typeof payload === "string") payload = JSON.parse(payload);
  } catch {
    return res.status(400).json({ message: "Invalid webhook payload." });
  }

  const referenceFromPayload =
    payload?.reference ??
    payload?.ref_id ??
    payload?.data?.reference ??
    payload?.data?.ref_id ??
    payload?.transaction?.reference ??
    payload?.transaction?.ref_id;

  const chargeId =
    payload?.charge_id ??
    payload?.chargeId ??
    payload?.data?.charge_id ??
    payload?.data?.chargeId;

  // If the provider doesn't echo our `reference`, try to map by `charge_id`.
  let reference = referenceFromPayload || (chargeId ? String(chargeId) : undefined);
  if (!reference && chargeId) {
    for (const [ref, tx] of transactionsByReference.entries()) {
      if (tx?.chargeId && String(tx.chargeId) === String(chargeId)) {
        reference = ref;
        break;
      }
    }
  }

  const status =
    payload?.status ??
    payload?.data?.status ??
    payload?.event ??
    payload?.data?.event ??
    payload?.data?.payment?.status;

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
