import "../global.css";

import { Stack } from "expo-router";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, asyncStoragePersister } from "@/src/lib/queryClient";

import { AuthProvider } from "@/src/context/AuthContext";
import { ListingsProvider } from "@/src/context/ListingsContext";
import { ThemeProvider } from "@/src/theme/ThemeProvider";

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <ThemeProvider>
        <AuthProvider>
          <ListingsProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </ListingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
