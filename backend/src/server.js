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

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use("/api/payments/paychangu/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.use(healthRoutes);
app.use("/api", adminAuthRoutes);
app.use("/api", paymentRoutes);
app.use("/api", mobileRoutes);
app.use("/api", adminRoutes);

setInterval(() => {
  runPurgeSweep();
}, 5 * 60 * 1000);

connectDb()
  .then(() => {
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend:", error);
    process.exit(1);
  });
