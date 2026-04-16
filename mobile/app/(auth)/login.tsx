import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/src/context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Missing details", "Please enter phone number and password.");
      return;
    }

    try {
      setIsLoading(true);
      await login({ phone, password });
    } catch (error) {
      Alert.alert("Login failed", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="flex-1 bg-slate-950"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 items-center justify-center px-6 py-10">
        <Text className="text-5xl font-black tracking-[4px]">
          <Text className="text-blue-500">265</Text>
          <Text className="text-white">HOMES</Text>
        </Text>
        <View className="mt-3 h-1 w-20 rounded-full bg-blue-500" />
        <Text className="mt-6 text-4xl font-extrabold text-white">Welcome back</Text>
        <Text className="mt-3 text-center text-base text-slate-300">
          Sign in to continue exploring trusted, GPS-verified rentals.
        </Text>

        <View className="mt-8 w-full rounded-3xl bg-white px-6 pb-8 pt-8">
          <Text className="mb-6 text-center text-2xl font-bold text-slate-900">
            Login to your account
          </Text>

          <TextInput
            placeholder="Phone number (e.g. 0999123456)"
            placeholderTextColor="#94A3B8"
            value={phone}
            keyboardType="phone-pad"
            onChangeText={setPhone}
            className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900"
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="rounded-xl bg-blue-700 px-4 py-4"
          >
            <Text className="text-center text-base font-semibold text-white">
              {isLoading ? "Signing in..." : "Sign in"}
            </Text>
          </TouchableOpacity>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity className="mt-5">
              <Text className="text-center text-sm font-medium text-blue-700">
                No account? Create one
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
