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

    return {
      canViewListingDetails: false,
      reason: "Tenant subscription required to view listings.",
    };
  }, [user]);
}
