import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { GPS_MAX_ACCURACY_METERS, GPS_MAX_CAPTURE_AGE_MINUTES } from "@/src/config";
import { useAuth } from "@/src/context/AuthContext";
import { useListings } from "@/src/context/ListingsContext";
import type { GPSCapture } from "@/src/types";

export default function PostListingScreen() {
  const { user } = useAuth();
  const { createListing } = useListings();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [amenitiesRaw, setAmenitiesRaw] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [gps, setGps] = useState<GPSCapture | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.role !== "landlord") {
    return null;
  }

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow image library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (result.canceled) {
      return;
    }

    setImages(result.assets.map((asset) => asset.uri));
  };

  const captureLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Location permission is required.");
      return;
    }

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const payload: GPSCapture = {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      accuracy: current.coords.accuracy ?? 9999,
      capturedAt: new Date().toISOString(),
    };

    if (payload.accuracy > GPS_MAX_ACCURACY_METERS) {
      Alert.alert(
        "GPS signal weak",
        `Accuracy is ${Math.round(payload.accuracy)}m. Move closer and try again.`,
      );
      return;
    }

    setGps(payload);
  };

  const submit = async () => {
    if (!title || !description || !city || !area || !price || !rooms || !gps) {
      Alert.alert("Missing details", "Please complete all fields and capture GPS location.");
      return;
    }

    const captureAgeMinutes =
      (Date.now() - new Date(gps.capturedAt).getTime()) / (1000 * 60);
    if (captureAgeMinutes > GPS_MAX_CAPTURE_AGE_MINUTES) {
      Alert.alert("GPS expired", "Please capture location again before posting.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createListing(
        {
          title,
          description,
          city,
          area,
          price: Number(price),
          rooms: Number(rooms),
          amenities: amenitiesRaw
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          images: images.length ? images : ["https://picsum.photos/900/600?random=9"],
          landlordPhone: user.phone,
          gps,
        },
        user.id,
      );
      Alert.alert("Success", "Listing posted successfully.");
      router.replace("/(app)/my-listings");
    } catch (error) {
      Alert.alert("Unable to post listing", (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 px-4 pt-14" keyboardShouldPersistTaps="handled">
      <Text className="text-3xl font-extrabold text-slate-900">Post Listing</Text>
      <Text className="mb-4 mt-1 text-sm text-slate-500">Create a GPS-verified property listing</Text>

      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <TextInput
          placeholder="Title"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
          className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        />
        <TextInput
          placeholder="Description"
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
          className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        />
        <TextInput
          placeholder="City (Lilongwe, Blantyre, Mzuzu)"
          placeholderTextColor="#94A3B8"
          value={city}
          onChangeText={setCity}
          className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        />
        <TextInput
          placeholder="Area"
          placeholderTextColor="#94A3B8"
          value={area}
          onChangeText={setArea}
          className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        />
        <View className="mb-3 flex-row gap-2">
          <TextInput
            placeholder="Price (MWK)"
            placeholderTextColor="#94A3B8"
            value={price}
            keyboardType="numeric"
            onChangeText={setPrice}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
          <TextInput
            placeholder="Rooms"
            placeholderTextColor="#94A3B8"
            value={rooms}
            keyboardType="numeric"
            onChangeText={setRooms}
            className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
        </View>
        <TextInput
          placeholder="Amenities comma-separated"
          placeholderTextColor="#94A3B8"
          value={amenitiesRaw}
          onChangeText={setAmenitiesRaw}
          className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        />

        <TouchableOpacity
          onPress={pickImages}
          className="mb-3 rounded-xl border border-slate-300 bg-white px-4 py-3"
        >
          <Text className="font-medium text-slate-700">
            {images.length ? `${images.length} image(s) selected` : "Select Images"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={captureLocation}
          className="mb-3 rounded-xl border border-blue-700 bg-blue-50 px-4 py-3"
        >
          <Text className="font-semibold text-blue-700">
            {gps ? "Location Captured" : "Use Current Location"}
          </Text>
        </TouchableOpacity>

        {gps ? (
          <View className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <Text className="text-xs text-emerald-700">
              GPS: {gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)} | Accuracy:{" "}
              {Math.round(gps.accuracy)}m
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={submit}
          disabled={isSubmitting}
          className="rounded-xl bg-blue-700 px-4 py-4"
        >
          <Text className="text-center text-base font-semibold text-white">
            {isSubmitting ? "Posting..." : "Submit Listing"}
          </Text>
        </TouchableOpacity>
      </View>
      <View className="h-8" />
    </ScrollView>
  );
}
