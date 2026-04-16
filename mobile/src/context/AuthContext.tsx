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
  isOnboardingCompleted: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  setSubscriptionPaid: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateProfile: (data: { fullName: string; phone: string; district?: string; email?: string }) => Promise<void>;
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
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function bootstrapSession() {
      try {
        const storedToken = await sessionStorage.getToken();
        const storedUser = await sessionStorage.getUser();
        const onboardingStatus = await sessionStorage.getOnboardingStatus();
        
        if (isMounted) {
          setIsOnboardingCompleted(onboardingStatus);
          if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser) as User);
          }
        }
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

  const completeOnboarding = useCallback(async () => {
    setIsOnboardingCompleted(true);
    await sessionStorage.saveOnboardingStatus(true);
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
      const response = await apiRequest<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: payload,
      });

      await persistSession(response.token, response.user);
      router.replace("/(app)/home");
    },
    [persistSession],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await apiRequest<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: payload,
      });

      await persistSession(response.token, response.user);
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
      subscriptionPackage?: string;
      subscriptionStartAt?: string;
    }>(`/subscriptions/${user.id}/status`);

    if (response.subscriptionStatus === "paid") {
      let nextUserJson: string | null = null;
      setUser((current) => {
        if (!current) {
          return current;
        }

        const updated: User = {
          ...current,
          subscriptionStatus: response.subscriptionStatus as any,
          subscriptionPackage: response.subscriptionPackage as any,
          subscriptionStartAt: response.subscriptionStartAt,
        };
        nextUserJson = JSON.stringify(updated);
        return updated;
      });

      if (nextUserJson) {
        await sessionStorage.saveUser(nextUserJson);
      }
    }
  }, [user]);

  const updateProfile = useCallback(async (data: { fullName: string; phone: string; district?: string; email?: string }) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    let nextUserJson: string | null = null;
    setUser((current) => {
      if (!current) {
        return current;
      }

      const updated: User = {
        ...current,
        ...data,
      };
      nextUserJson = JSON.stringify(updated);
      return updated;
    });

    if (nextUserJson) {
      await sessionStorage.saveUser(nextUserJson);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      isBootstrapping,
      isOnboardingCompleted,
      login,
      register,
      logout,
      refreshSubscriptionStatus,
      setSubscriptionPaid,
      completeOnboarding,
      updateProfile,
    }),
    [
      completeOnboarding,
      isBootstrapping,
      isOnboardingCompleted,
      login,
      logout,
      refreshSubscriptionStatus,
      register,
      setSubscriptionPaid,
      token,
      user,
      updateProfile,
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
