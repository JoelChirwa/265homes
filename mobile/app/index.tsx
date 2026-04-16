import { Redirect } from "expo-router";

import { useAuth } from "@/src/context/AuthContext";

export default function IndexPage() {
  const { user, isBootstrapping, isOnboardingCompleted } = useAuth();

  if (isBootstrapping) {
    return null;
  }

  if (!isOnboardingCompleted) {
    return <Redirect href="/onboarding/welcome" />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(app)/home" />;
}