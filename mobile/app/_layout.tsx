import "../global.css";

import { Stack } from "expo-router";

import { AuthProvider } from "@/src/context/AuthContext";
import { ListingsProvider } from "@/src/context/ListingsContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ListingsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ListingsProvider>
    </AuthProvider>
  );
}
