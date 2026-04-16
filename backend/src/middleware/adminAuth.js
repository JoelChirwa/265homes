import { adminSessions } from "../models/state.js";

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ message: "Unauthorized admin request." });
  }

  req.admin = adminSessions.get(token);
  return next();
}
