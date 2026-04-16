import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  paychanguBaseUrl: process.env.PAYCHANGU_BASE_URL ?? "https://api.paychangu.com",
  paychanguSecretKey: process.env.PAYCHANGU_SECRET_KEY,
  paychanguWebhookSecret: process.env.PAYCHANGU_WEBHOOK_SECRET,
  paychanguDirectChargePath:
    process.env.PAYCHANGU_DIRECT_CHARGE_PATH ?? "/direct-charge/mobile-money",
  paychanguVerifyPath: process.env.PAYCHANGU_VERIFY_PATH ?? "/charges/verify",
  paychanguWebhookUrl:
    process.env.PAYCHANGU_WEBHOOK_URL ?? "http://localhost:5000/api/payments/paychangu/webhook",
  defaultSubscriptionFee: Number(process.env.DEFAULT_SUBSCRIPTION_FEE ?? 5000),
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@265homes.mw",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin12345",
  listPurgeHours: 48,
};
