import { Link } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { ListingCard } from "@/src/components/ListingCard";
import { useAuth } from "@/src/context/AuthContext";
import { useListings } from "@/src/context/ListingsContext";
import { useAccessControl } from "@/src/hooks/useAccessControl";

export default function HomeScreen() {
  const { user } = useAuth();
  const { visibleListings, myListings } = useListings();
  const { canViewListingDetails } = useAccessControl(user);

  if (!user) {
    return null;
  }

  if (user.role === "landlord") {
    const landlordListings = myListings(user.id);

    return (
      <View className="flex-1 bg-slate-50 px-4 pt-14">
        <View className="mb-5 rounded-2xl bg-slate-900 p-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-blue-300">Landlord</Text>
          <Text className="mt-2 text-3xl font-extrabold text-white">
            Hello, {user.fullName?.split(" ")[0]}
          </Text>
          <Text className="mt-2 text-sm text-slate-300">
            Manage your properties and post new listings for free.
          </Text>
        </View>

        <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Your Listings
          </Text>
          <Text className="mt-2 text-3xl font-extrabold text-blue-700">{landlordListings.length}</Text>
          <Text className="mt-1 text-sm text-slate-500">Active listings currently visible on the app.</Text>
        </View>

        <Link href="/(app)/post-listing" asChild>
          <TouchableOpacity className="mb-3 rounded-xl bg-blue-700 px-4 py-4">
            <Text className="text-center text-base font-semibold text-white">Post New Listing</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(app)/my-listings" asChild>
          <TouchableOpacity className="rounded-xl border border-slate-300 bg-white px-4 py-4">
            <Text className="text-center text-base font-semibold text-slate-700">Manage My Listings</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  if (!canViewListingDetails) {
    return (
      <View className="flex-1 bg-slate-50 px-4 pt-14">
        <View className="mb-5 rounded-2xl bg-slate-900 p-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-blue-300">Tenant</Text>
          <Text className="mt-2 text-3xl font-extrabold text-white">
            Hello, {user.fullName?.split(" ")[0]}
          </Text>
          <Text className="mt-2 text-sm text-slate-300">Access listings by activating your subscription.</Text>
        </View>

        <View className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <Text className="text-lg font-bold text-blue-900">Subscription Required</Text>
          <Text className="mt-2 text-sm text-blue-700">
            Tenants must pay subscription fee to view property listings.
          </Text>
          <Link href="/(app)/profile" asChild>
            <TouchableOpacity className="mt-4 rounded-xl bg-blue-700 px-4 py-3">
              <Text className="text-center font-semibold text-white">Go to Profile</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-14">
      <View className="mb-5 rounded-2xl bg-slate-900 p-5">
        <Text className="text-sm font-semibold uppercase tracking-wide text-blue-300">Tenant</Text>
        <Text className="mt-2 text-3xl font-extrabold text-white">
          Hello, {user.fullName?.split(" ")[0]}
        </Text>
        <Text className="mt-2 text-sm text-slate-300">Latest verified rentals in Malawi</Text>
      </View>

      <FlatList
        data={visibleListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
