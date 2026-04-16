import { useMemo } from "react";

import type { User } from "@/src/types";

export function useAccessControl(user: User | null) {
  return useMemo(() => {
    if (!user) {
      return {
        canViewListingDetails: false,
        reason: "Please log in first.",
      };
    }

    if (user.role === "landlord") {
      return { canViewListingDetails: true, reason: "" };
    }

    if (user.subscriptionStatus === "paid") {
      return { canViewListingDetails: true, reason: "" };
    }

    // Check if user is within 24-hour trial period
    if (user.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(user.trialEndsAt);
      if (now < trialEnd) {
        return { canViewListingDetails: true, reason: "" };
      }
    }

    return {
      canViewListingDetails: false,
      reason: "Your 24-hour free trial has ended. Subscribe to continue viewing listings.",
    };
  }, [user]);
}
