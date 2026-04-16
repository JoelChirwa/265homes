import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import type { Listing } from "@/src/types";

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  return (
    <Link href={`/listing/${listing.id}`} asChild>
      <TouchableOpacity className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Image
          source={{ uri: listing.images[0] }}
          className="h-52 w-full"
          resizeMode="cover"
        />
        <View className="gap-2 p-4">
          <Text className="text-lg font-bold text-slate-900">{listing.title}</Text>
          <Text className="text-sm text-slate-500">
            {listing.city}, {listing.area}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {listing.rooms} room(s)
            </Text>
            <Text className="text-lg font-extrabold text-blue-700">
              MWK {listing.price.toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
