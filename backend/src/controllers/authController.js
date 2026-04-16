import { usersById, nowIso, normalizePhone } from "../models/state.js";

export function registerUser(req, res) {
  const { fullName, phone, role, email, city } = req.body ?? {};

  if (!fullName || !phone || !role) {
    return res.status(400).json({ message: "Full name, phone, and role are required." });
  }

  const normalizedPhone = normalizePhone(phone);
  
  // Check if user already exists
  for (const user of usersById.values()) {
    if (normalizePhone(user.phone) === normalizedPhone) {
      return res.status(409).json({ message: "User with this phone number already exists." });
    }
  }

  const id = `usr-${Date.now()}`;
  const newUser = {
    id,
    fullName,
    phone: normalizedPhone,
    role,
    email: email || "",
    city: city || "",
    status: "active",
    createdAt: nowIso(),
    subscriptionStatus: role === "tenant" ? "unpaid" : "paid",
  };

  usersById.set(id, newUser);

  return res.status(201).json({
    message: "Registration successful",
    token: `tok-${id}-${Date.now()}`,
    user: newUser
  });
}

export function loginUser(req, res) {
  const { phone } = req.body ?? {};
  
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  const normalizedPhone = normalizePhone(phone);
  let foundUser = null;

  for (const user of usersById.values()) {
    if (normalizePhone(user.phone) === normalizedPhone) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    return res.status(404).json({ message: "Account not found. Please register first." });
  }

  return res.json({
    message: "Login successful",
    token: `tok-${foundUser.id}-${Date.now()}`,
    user: foundUser
  });
}
