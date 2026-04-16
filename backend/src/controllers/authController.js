import { usersById, nowIso, normalizePhone, getSubscriptionRecord } from "../models/state.js";

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
    subscriptionPackage: null,
    subscriptionStartAt: null,
    trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    listingViewsUsed: 0,
    listingViewsLimit: role === "tenant" ? 10 : 1000,
  };

  usersById.set(id, newUser);

  return res.status(201).json({
    message: "Registration successful",
    token: `tok-${id}-${Date.now()}`,
    user: newUser
  });
}

export function loginUser(req, res) {
  try {
    console.log('Login request body:', req.body);
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

    // Get subscription info and merge with user
    const subscription = getSubscriptionRecord(foundUser.id);
    const userWithSubscription = {
      ...foundUser,
      subscriptionStatus: subscription.status,
      subscriptionPackage: subscription.subscriptionPackage,
      subscriptionStartAt: subscription.subscriptionStartAt,
      trialEndsAt: foundUser.trialEndsAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      listingViewsUsed: foundUser.listingViewsUsed || 0,
      listingViewsLimit: foundUser.listingViewsLimit || (foundUser.role === "tenant" ? 10 : 1000),
    };

    return res.json({
      message: "Login successful",
      token: `tok-${foundUser.id}-${Date.now()}`,
      user: userWithSubscription
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: "Login failed", error: error instanceof Error ? error.message : String(error) });
  }
}
