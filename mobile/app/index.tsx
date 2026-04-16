import { Redirect } from "expo-router";

import { useAuth } from "@/src/context/AuthContext";

export default function IndexPage() {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(app)/home" />;
}