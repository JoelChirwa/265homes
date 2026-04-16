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
import type { UserRole } from "@/src/types";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("tenant");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !phone || !password) {
      Alert.alert("Missing details", "Please complete full name, phone and password.");
      return;
    }

    try {
      setIsLoading(true);
      await register({
        fullName,
        email: email.trim() || undefined,
        phone,
        password,
        role,
      });
    } catch (error) {
      Alert.alert("Registration failed", (error as Error).message);
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
      <View className="px-6 pb-8 pt-20">
        <Text className="text-4xl font-extrabold text-white">Create account</Text>
        <Text className="mt-3 text-base text-slate-300">Join Malawi&apos;s trusted rental platform.</Text>
      </View>

      <View className="rounded-t-3xl bg-white px-6 pb-10 pt-8">
        <Text className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
          265Homes
        </Text>
        <Text className="mb-6 text-2xl font-bold text-slate-900">Set up your profile</Text>

        <TextInput
          placeholder="Full name"
          placeholderTextColor="#94A3B8"
          value={fullName}
          onChangeText={setFullName}
          className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900"
        />
        <TextInput
          placeholder="Phone"
          placeholderTextColor="#94A3B8"
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
          className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900"
        />
        <TextInput
          placeholder="Email (optional)"
          placeholderTextColor="#94A3B8"
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
          className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
          className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900"
        />

        <View className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-2">
          <Text className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            I am joining as
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setRole("tenant")}
              className={`flex-1 rounded-xl px-4 py-3 ${role === "tenant" ? "bg-blue-700" : "bg-white"}`}
            >
              <Text
                className={`text-center font-semibold ${role === "tenant" ? "text-white" : "text-slate-700"}`}
              >
                Tenant
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRole("landlord")}
              className={`flex-1 rounded-xl px-4 py-3 ${role === "landlord" ? "bg-blue-700" : "bg-white"}`}
            >
              <Text
                className={`text-center font-semibold ${role === "landlord" ? "text-white" : "text-slate-700"}`}
              >
                Landlord
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          className="rounded-xl bg-blue-700 px-4 py-4"
        >
          <Text className="text-center text-base font-semibold text-white">
            {isLoading ? "Creating account..." : "Create account"}
          </Text>
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="mt-5">
            <Text className="text-center text-sm font-medium text-blue-700">
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}
