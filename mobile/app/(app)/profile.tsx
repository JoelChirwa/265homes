import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { Alert, useState } from "react";

import { apiRequest } from "@/src/lib/api";
import { useAuth } from "@/src/context/AuthContext";

export default function ProfileScreen() {
  const { user, logout, refreshSubscriptionStatus } = useAuth();
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);

  if (!user) {
    return null;
  }

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = user.role === "landlord" ? "Landlord" : "Tenant";
  const subscriptionLabel =
    user.role === "landlord" ? "FREE" : user.subscriptionStatus.toUpperCase();
  const emailLabel = user.email ?? "No email provided";
  const isTenantPaid = user.subscriptionStatus === "paid";

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handlePaySubscription = async () => {
    try {
      setIsInitiatingPayment(true);
      const response = await apiRequest<{
        message: string;
        reference: string;
      }>("/payments/mobile-money/charge", {
        method: "POST",
        body: {
          userId: user.id,
          phone: user.phone,
          amount: 5000,
          currency: "MWK",
        },
      });

      Alert.alert(
        "Payment Started",
        `${response.message}\nReference: ${response.reference}`,
      );

      for (let attempt = 0; attempt < 6; attempt += 1) {
        await sleep(5000);
        await refreshSubscriptionStatus();
      }
    } catch (error) {
      Alert.alert("Payment failed", (error as Error).message);
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 px-4 pt-14" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-3xl font-extrabold text-slate-900">Profile</Text>
      <Text className="mt-1 text-sm text-slate-500">Manage your account and subscription details</Text>

      <View className="mt-5 rounded-2xl bg-slate-900 p-5">
        <View className="flex-row items-center">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-blue-700">
            <Text className="text-lg font-bold text-white">{initials}</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-2xl font-extrabold text-white">{user.fullName}</Text>
            <Text className="mt-1 text-sm text-slate-300">{emailLabel}</Text>
          </View>
        </View>
        <Text className="mt-4 text-sm text-slate-300">{user.phone}</Text>
      </View>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</Text>
          <Text className="mt-2 text-lg font-bold text-slate-900">{roleLabel}</Text>
        </View>
        <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</Text>
          <Text className="mt-2 text-lg font-bold text-blue-700">{subscriptionLabel}</Text>
        </View>
      </View>

      {user.role === "tenant" ? (
        <View className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Subscription
          </Text>
          <Text className="mt-2 text-base font-semibold text-slate-900">
            Tenants must pay subscription fee to view listings.
          </Text>
          <TouchableOpacity
            onPress={handlePaySubscription}
            disabled={isInitiatingPayment || isTenantPaid}
            className={`mt-4 rounded-xl px-4 py-4 ${isTenantPaid ? "bg-slate-300" : "bg-emerald-600"}`}
          >
            <Text className="text-center text-base font-semibold text-white">
              {isTenantPaid
                ? "Subscription Active"
                : isInitiatingPayment
                  ? "Initiating Payment..."
                  : "Pay Subscription Fee"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Landlord Plan
          </Text>
          <Text className="mt-2 text-base font-semibold text-emerald-900">
            Landlords post and manage listings for free.
          </Text>
          <Link href="/(app)/my-listings" asChild>
            <TouchableOpacity className="mt-4 rounded-xl border border-emerald-300 bg-white px-4 py-4">
              <Text className="text-center text-base font-semibold text-emerald-700">
                Manage My Listings
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}

      <TouchableOpacity onPress={logout} className="mt-4 rounded-xl bg-red-600 px-4 py-4">
        <Text className="text-center text-base font-semibold text-white">Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
