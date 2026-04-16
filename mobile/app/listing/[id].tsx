import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/src/context/AuthContext";
import { useListings } from "@/src/context/ListingsContext";
import { useAccessControl } from "@/src/hooks/useAccessControl";

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, incrementListingView } = useAuth();
  const { getListingById } = useListings();
  const { canViewListingDetails, reason } = useAccessControl(user);

  const listing = getListingById(id);

  useEffect(() => {
    if (!listing || !canViewListingDetails) {
      return;
    }
    void incrementListingView();
  }, [canViewListingDetails, id, incrementListingView, listing]);

  if (!listing) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-4">
        <Text className="mb-4 text-slate-600">Listing not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="rounded-xl bg-blue-700 px-5 py-3">
          <Text className="text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!canViewListingDetails) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-4">
        <Text className="mb-2 text-center text-lg font-semibold text-slate-900">
          Subscription Required
        </Text>
        <Text className="mb-4 text-center text-slate-600">{reason}</Text>
        <TouchableOpacity onPress={() => router.replace("/(app)/profile")} className="rounded-xl bg-blue-700 px-5 py-3">
          <Text className="text-white">Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    void Linking.openURL(`tel:${listing.landlordPhone}`);
  };

  const handleNavigate = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${listing.gps.latitude},${listing.gps.longitude}`;
    void Linking.openURL(mapsUrl);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <Image source={{ uri: listing.images[0] }} className="h-72 w-full" resizeMode="cover" />
      <View className="p-4">
        <Text className="text-3xl font-extrabold text-slate-900">{listing.title}</Text>
        <Text className="mt-1 text-sm text-slate-500">
          {listing.city}, {listing.area}
        </Text>
        <Text className="mt-3 text-2xl font-extrabold text-blue-700">
          MWK {listing.price.toLocaleString()}
        </Text>
        <Text className="mt-4 leading-6 text-slate-700">{listing.description}</Text>

        <Text className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Amenities
        </Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {listing.amenities.map((item) => (
            <View key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1">
              <Text className="text-xs font-medium text-slate-700">{item}</Text>
            </View>
          ))}
        </View>

        <View className="mb-5 mt-8 flex-row gap-3">
          <TouchableOpacity
            onPress={handleCall}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-4"
          >
            <FontAwesome name="phone" color="white" />
            <Text className="font-semibold text-white">Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNavigate}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-4"
          >
            <FontAwesome name="map-marker" color="white" />
            <Text className="font-semibold text-white">Navigate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
