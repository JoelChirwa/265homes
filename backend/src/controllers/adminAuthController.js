import { env } from "../config/env.js";
import { createAdminSession } from "../models/state.js";

export function loginAdmin(req, res) {
  const { email, password } = req.body ?? {};
  if (email !== env.adminEmail || password !== env.adminPassword) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  const { token } = createAdminSession();
  return res.json({
    token,
    admin: {
      email: env.adminEmail,
      name: "Platform Admin",
    },
  });
}

export function getAdminProfile(req, res) {
  return res.json({
    admin: {
      email: req.admin.email,
      name: "Platform Admin",
    },
  });
}
