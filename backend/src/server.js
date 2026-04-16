import cors from "cors";
import express from "express";

import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { runPurgeSweep } from "./controllers/adminController.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import mobileRoutes from "./routes/mobileRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// PayChangu webhooks may arrive with varying Content-Type headers.
// Use a permissive raw parser so we always have the exact request body for signature verification.
app.use(
  "/api/payments/paychangu/webhook",
  express.raw({ type: () => true, limit: "2mb" }),
);
app.use(express.json());

app.use(healthRoutes);
app.use("/api", authRoutes);
app.use("/api", adminAuthRoutes);
app.use("/api", paymentRoutes);
app.use("/api", mobileRoutes);
app.use("/api", listingRoutes);
app.use("/api", adminRoutes);

setInterval(() => {
  runPurgeSweep();
}, 5 * 60 * 1000);

connectDb()
  .then(() => {
    app.listen(env.port, "0.0.0.0", () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on all interfaces at port ${env.port}`);
      console.log(`Local network access: http://10.135.150.222:${env.port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend:", error);
    process.exit(1);
  });
