import { useState } from "react";
import { Link } from "expo-router";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/src/context/AuthContext";
import { ListingCard } from "@/src/components/ListingCard";
import { useListings } from "@/src/context/ListingsContext";
import { useAccessControl } from "@/src/hooks/useAccessControl";

const CITIES = ["Lilongwe", "Blantyre", "Mzuzu"];

export default function ExploreScreen() {
  const { user } = useAuth();
  const { visibleListings, setFilters } = useListings();
  const { canViewListingDetails } = useAccessControl(user);
  const [city, setCity] = useState<string | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState("");
  const [minRooms, setMinRooms] = useState("");

  if (!user) {
    return null;
  }

  if (user.role === "landlord") {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-center text-xl font-bold text-slate-900">Explore is for Tenants</Text>
        <Text className="mt-2 text-center text-sm text-slate-500">
          As a landlord, use Home and Post Listings to manage your properties.
        </Text>
      </View>
    );
  }

  if (!canViewListingDetails) {
    return (
      <View className="flex-1 justify-center bg-slate-50 px-6">
        <View className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <Text className="text-lg font-bold text-blue-900">Subscription Required</Text>
          <Text className="mt-2 text-sm text-blue-700">
            Tenants must pay subscription fee to access Explore listings.
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

  const apply = () => {
    setFilters({
      city,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRooms: minRooms ? Number(minRooms) : undefined,
    });
  };

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-14">
      <Text className="text-3xl font-extrabold text-slate-900">Explore Homes</Text>
      <Text className="mb-4 mt-1 text-sm text-slate-500">Filter by city, budget and room size</Text>

      <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          City
        </Text>
        <View className="mb-4 flex-row gap-2">
          {CITIES.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setCity((prev) => (prev === item ? undefined : item))}
              className={`rounded-full border px-3 py-2 ${city === item ? "border-blue-700 bg-blue-700" : "border-slate-200 bg-white"}`}
            >
              <Text className={city === item ? "font-semibold text-white" : "text-slate-600"}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-3 flex-row gap-2">
          <TextInput
            placeholder="Max Price (MWK)"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
          <TextInput
            placeholder="Min Rooms"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={minRooms}
            onChangeText={setMinRooms}
            className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
        </View>

        <TouchableOpacity onPress={apply} className="rounded-xl bg-blue-700 px-4 py-3">
          <Text className="text-center font-semibold text-white">Apply Filters</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
