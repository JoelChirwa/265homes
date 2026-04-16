// app/listing/edit/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useListings } from '@/src/context/ListingsContext';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { getListingById, updateListing } = useListings();
  const { colors } = useTheme();
  const router = useRouter();

  const listing = getListingById(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [rooms, setRooms] = useState('');
  const [amenitiesRaw, setAmenitiesRaw] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description);
      setCity(listing.city);
      setArea(listing.area);
      setPrice(listing.price.toString());
      setRooms(listing.rooms.toString());
      setAmenitiesRaw(listing.amenities.join(', '));
      setImages(listing.images);
    }
  }, [listing]);

  if (!user || user.role !== 'landlord' || !listing) return null;

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = (uri: string) => {
    setImages(images.filter(i => i !== uri));
  };

  const handleUpdate = async () => {
    if (!title || !description || !city || !area || !price || !rooms) {
      Alert.alert('Incomplete Form', 'Please fill all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateListing(listing.id, {
        title,
        description,
        city,
        area,
        price: Number(price),
        rooms: Number(rooms),
        amenities: amenitiesRaw.split(',').map(a => a.trim()).filter(Boolean),
        images,
      });
      Alert.alert('Success', 'Listing updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView 
        style={{ backgroundColor: colors.background }} 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Edit Listing</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Modify your property details.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Property Images</Text>
        <View style={styles.imagePickerRow}>
          <TouchableOpacity 
            style={[styles.imageAddButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={pickImages}
          >
            <Text style={{ fontSize: 24, color: colors.primary }}>+</Text>
            <Text style={{ fontSize: 10, color: colors.textSecondary }}>Add</Text>
          </TouchableOpacity>
          <FlatList
            horizontal
            data={images}
            keyExtractor={(uri, index) => `${uri}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeIcon} onPress={() => removeImage(item)}>
                    <Text style={{ color: '#fff', fontSize: 10 }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Basic Details</Text>
        <Input label="Title" value={title} onChangeText={setTitle} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline style={{ height: 100 }} />
        <View style={styles.row}>
            <View style={{ flex: 1 }}><Input label="Price (MWK)" keyboardType="numeric" value={price} onChangeText={setPrice} /></View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 1 }}><Input label="Rooms" keyboardType="numeric" value={rooms} onChangeText={setRooms} /></View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Location</Text>
        <Input label="City" value={city} onChangeText={setCity} />
        <Input label="Area" value={area} onChangeText={setArea} />
        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Note: GPS coordinates cannot be changed after posting to maintain verification integrity.
            </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Amenities</Text>
        <Input label="Amenities (Optional)" value={amenitiesRaw} onChangeText={setAmenitiesRaw} />
      </View>

      <Button title="Save Changes" onPress={handleUpdate} loading={isSubmitting} style={{ marginVertical: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingTop: 60,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  imagePickerRow: {
    flexDirection: 'row',
  },
  imageAddButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    marginRight: spacing.sm,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F44336',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  infoBox: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
});
