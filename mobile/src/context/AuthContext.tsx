import { router } from "expo-router";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiRequest } from "@/src/lib/api";
import { sessionStorage } from "@/src/lib/storage";
import type { LoginPayload, RegisterPayload, User } from "@/src/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  incrementListingView: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  setSubscriptionPaid: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizePhoneNumber(phone: string) {
  return phone.replace(/\s+/g, "");
}

function createMockUser(payload: RegisterPayload): User {
  return {
    id: `usr-${Date.now()}`,
    fullName: payload.fullName,
    email: payload.email?.trim() || undefined,
    phone: payload.phone,
    role: payload.role,
    subscriptionStatus: payload.role === "tenant" ? "unpaid" : "paid",
    trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    listingViewsUsed: 0,
    listingViewsLimit: 10,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function bootstrapSession() {
      try {
        const storedToken = await sessionStorage.getToken();
        const storedUser = await sessionStorage.getUser();
        if (!isMounted || !storedToken || !storedUser) {
          return;
        }

        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = useCallback(async (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    await Promise.all([
      sessionStorage.saveToken(nextToken),
      sessionStorage.saveUser(JSON.stringify(nextUser)),
    ]);
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const mockToken = `token-${Date.now()}`;
      const mockUser = createMockUser(payload);
      await persistSession(mockToken, mockUser);
      router.replace("/(app)/home");
    },
    [persistSession],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const stored = await sessionStorage.getUser();
      if (!stored) {
        throw new Error("Account not found. Please register first.");
      }

      const parsed = JSON.parse(stored) as User;
      const storedPhone = normalizePhoneNumber(parsed.phone);
      const incomingPhone = normalizePhoneNumber(payload.phone);
      if (storedPhone !== incomingPhone) {
        throw new Error("Invalid credentials.");
      }

      const mockToken = `token-${Date.now()}`;
      await persistSession(mockToken, parsed);
      router.replace("/(app)/home");
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await sessionStorage.clear();
    router.replace("/(auth)/login");
  }, []);

  const incrementListingView = useCallback(async () => {
    let nextUserJson: string | null = null;

    setUser((current) => {
      if (!current) {
        return current;
      }

      const updated: User = {
        ...current,
        listingViewsUsed: current.listingViewsUsed + 1,
      };
      nextUserJson = JSON.stringify(updated);
      return updated;
    });

    if (nextUserJson) {
      await sessionStorage.saveUser(nextUserJson);
    }
  }, []);

  const setSubscriptionPaid = useCallback(async () => {
    let nextUserJson: string | null = null;
    setUser((current) => {
      if (!current) {
        return current;
      }

      const updated: User = {
        ...current,
        subscriptionStatus: "paid",
      };
      nextUserJson = JSON.stringify(updated);
      return updated;
    });

    if (nextUserJson) {
      await sessionStorage.saveUser(nextUserJson);
    }
  }, []);

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user || user.role !== "tenant") {
      return;
    }

    const response = await apiRequest<{
      subscriptionStatus: "paid" | "unpaid" | "pending";
    }>(`/subscriptions/${user.id}/status`);

    if (response.subscriptionStatus !== "paid") {
      return;
    }

    await setSubscriptionPaid();
  }, [setSubscriptionPaid, user]);

  const value = useMemo(
    () => ({
      user,
      token,
      isBootstrapping,
      login,
      register,
      logout,
      incrementListingView,
      refreshSubscriptionStatus,
      setSubscriptionPaid,
    }),
    [
      incrementListingView,
      isBootstrapping,
      login,
      logout,
      refreshSubscriptionStatus,
      register,
      setSubscriptionPaid,
      token,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
