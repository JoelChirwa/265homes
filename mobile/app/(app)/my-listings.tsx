import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { ListingCard } from "@/src/components/ListingCard";
import { useAuth } from "@/src/context/AuthContext";
import { useListings } from "@/src/context/ListingsContext";

export default function MyListingsScreen() {
  const { user } = useAuth();
  const { myListings, softDeleteListing } = useListings();

  if (!user || user.role !== "landlord") {
    return null;
  }

  const mine = myListings(user.id);

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-14">
      <Text className="text-3xl font-extrabold text-slate-900">My Listings</Text>
      <Text className="mb-4 mt-1 text-sm text-slate-500">Manage and monitor your posted properties</Text>
      <FlatList
        data={mine}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
            <Text className="text-center text-sm text-slate-500">
              You have not posted any listing yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <ListingCard listing={item} />
            <TouchableOpacity
              onPress={() => softDeleteListing(item.id, user.id)}
              className="mb-5 rounded-xl border border-red-500 bg-white px-3 py-3"
            >
              <Text className="text-center font-semibold text-red-500">Delete Listing</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
