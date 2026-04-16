// app/(app)/post-listing.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, FlatList, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/src/context/AuthContext';
import { useListings } from '@/src/context/ListingsContext';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { GPS_MAX_ACCURACY_METERS, GPS_MAX_CAPTURE_AGE_MINUTES } from '@/src/config';
import { GPSCapture } from '@/src/types';

const ListingSchema = Yup.object().shape({
  title: Yup.string().min(5, 'Title too short').required('Title is required'),
  description: Yup.string().min(20, 'Provide more details').required('Description is required'),
  city: Yup.string().required('City is required'),
  area: Yup.string().required('Area is required'),
  price: Yup.number().positive('Price must be positive').required('Price is required'),
  rooms: Yup.number().integer().min(1, 'At least 1 room').required('Room count is required'),
  amenitiesRaw: Yup.string(),
  images: Yup.array().min(1, 'Add at least one photo'),
  gps: Yup.object().required('GPS verification is required'),
});

export default function PostListingScreen() {
  const { user } = useAuth();
  const { createListing } = useListings();
  const { colors } = useTheme();
  const router = useRouter();

  const [isCapturingGPS, setIsCapturingGPS] = useState(false);

  if (!user || user.role !== 'landlord') return null;

  const pickImages = async (currentImages: string[], setFieldValue: (field: string, value: any) => void) => {
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
      setFieldValue('images', [...currentImages, ...result.assets.map(a => a.uri)]);
    }
  };

  const captureLocation = async (setFieldValue: (field: string, value: any) => void) => {
    setIsCapturingGPS(true);
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) {
          const req = await Location.requestForegroundPermissionsAsync();
          if (!req.granted) {
            Alert.alert(
                'GPS Required', 
                '265Homes requires your physical location to verify the property.',
                [{ text: 'Help', onPress: () => Linking.openURL('app-settings:') }, { text: 'OK' }]
            );
            return;
          }
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const payload: GPSCapture = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy ?? 9999,
        capturedAt: new Date().toISOString(),
      };

      if (payload.accuracy > GPS_MAX_ACCURACY_METERS) {
        Alert.alert('Weak Signal', `Accuracy is ${Math.round(payload.accuracy)}m. Target: <${GPS_MAX_ACCURACY_METERS}m.`);
        return;
      }

      setFieldValue('gps', payload);
    } catch (e) {
      Alert.alert('Error', 'Failed to retrieve GPS. Ensure you are outdoors.');
    } finally {
      setIsCapturingGPS(false);
    }
  };

  const handlePost = async (values: any, { setSubmitting }: any) => {
    const captureAgeMinutes = (Date.now() - new Date(values.gps.capturedAt).getTime()) / (1000 * 60);
    if (captureAgeMinutes > GPS_MAX_CAPTURE_AGE_MINUTES) {
      Alert.alert('GPS Expired', 'Location data is too old. Please re-capture.');
      setSubmitting(false);
      return;
    }

    try {
      await createListing({
        title: values.title,
        description: values.description,
        city: values.city,
        area: values.area,
        price: Number(values.price),
        rooms: Number(values.rooms),
        amenities: values.amenitiesRaw.split(',').map((a: string) => a.trim()).filter(Boolean),
        images: values.images.length ? values.images : ['https://picsum.photos/900/600?random=9'],
        landlordPhone: user.phone,
        gps: values.gps,
      }, user.id);
      Alert.alert('Success', 'Listing posted!', [{ text: 'OK', onPress: () => router.replace('/(app)/my-listings') }]);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
        initialValues={{
            title: '',
            description: '',
            city: '',
            area: '',
            price: '',
            rooms: '',
            amenitiesRaw: '',
            images: [] as string[],
            gps: null as GPSCapture | null,
        }}
        validationSchema={ListingSchema}
        onSubmit={handlePost}
    >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
            <ScrollView 
                style={{ backgroundColor: colors.background }} 
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Post a Listing</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Complete the form to reach thousands of renters.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Property Images</Text>
                    <View style={styles.imagePickerRow}>
                    <TouchableOpacity 
                        style={[styles.imageAddButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                        onPress={() => pickImages(values.images, setFieldValue)}
                    >
                        <Text style={{ fontSize: 24, color: colors.primary }}>+</Text>
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>Add</Text>
                    </TouchableOpacity>
                    <FlatList
                        horizontal
                        data={values.images}
                        keyExtractor={uri => uri}
                        renderItem={({ item }) => (
                        <View style={styles.imageWrapper}>
                            <Image source={{ uri: item }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeIcon} onPress={() => setFieldValue('images', values.images.filter(i => i !== item))}>
                                <Text style={{ color: '#fff', fontSize: 10 }}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        )}
                        showsHorizontalScrollIndicator={false}
                    />
                    </View>
                    {touched.images && errors.images && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{String(errors.images)}</Text>}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Basic Details</Text>
                    <Input label="Title" value={values.title} onChangeText={handleChange('title')} onBlur={handleBlur('title')} error={touched.title && errors.title ? errors.title : undefined} />
                    <Input label="Description" value={values.description} onChangeText={handleChange('description')} onBlur={handleBlur('description')} multiline style={{ height: 100 }} error={touched.description && errors.description ? errors.description : undefined} />
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}><Input label="Price (MWK)" keyboardType="numeric" value={values.price} onChangeText={handleChange('price')} onBlur={handleBlur('price')} error={touched.price && errors.price ? errors.price : undefined} /></View>
                        <View style={{ width: spacing.md }} />
                        <View style={{ flex: 1 }}><Input label="Rooms" keyboardType="numeric" value={values.rooms} onChangeText={handleChange('rooms')} onBlur={handleBlur('rooms')} error={touched.rooms && errors.rooms ? errors.rooms : undefined} /></View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Location</Text>
                    <Input label="City" value={values.city} onChangeText={handleChange('city')} onBlur={handleBlur('city')} error={touched.city && errors.city ? errors.city : undefined} />
                    <Input label="Area" value={values.area} onChangeText={handleChange('area')} onBlur={handleBlur('area')} error={touched.area && errors.area ? errors.area : undefined} />
                    
                    <View style={[styles.gpsCard, { backgroundColor: colors.surface, borderColor: values.gps ? '#4CAF50' : colors.border }]}>
                        <View style={styles.gpsHeader}>
                            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>GPS Verification</Text>
                            {values.gps && <Text style={{ color: '#4CAF50', fontSize: 12 }}>✓ Verified</Text>}
                        </View>
                        {values.gps ? (
                            <View style={styles.gpsData}>
                                <Text style={{ color: colors.textPrimary, fontSize: 13 }}>Lat: {values.gps.latitude.toFixed(6)} | Long: {values.gps.longitude.toFixed(6)}</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Accuracy: {Math.round(values.gps.accuracy)}m</Text>
                            </View>
                        ) : (
                            <Text style={[styles.gpsInstruction, { color: colors.textSecondary }]}>
                                You must be physically at the property to verify its location.
                            </Text>
                        )}
                        <Button 
                            title={isCapturingGPS ? "Capturing..." : values.gps ? "Recapture Location" : "Verify Current Location"} 
                            onPress={() => captureLocation(setFieldValue)} 
                            loading={isCapturingGPS}
                            style={{ backgroundColor: values.gps ? 'transparent' : colors.primary, borderWidth: values.gps ? 1 : 0, borderColor: colors.primary }}
                            textStyle={{ color: values.gps ? colors.primary : '#fff' }}
                        />
                    </View>
                    {touched.gps && errors.gps && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{String(errors.gps)}</Text>}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Amenities</Text>
                    <Input label="Amenities (Optional)" placeholder="Water, Electricity, WiFi" value={values.amenitiesRaw} onChangeText={handleChange('amenitiesRaw')} />
                </View>

                <Button title="Post Listing" onPress={() => handleSubmit()} loading={isSubmitting} style={{ marginVertical: spacing.xl }} />
            </ScrollView>
        )}
    </Formik>
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
  gpsCard: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  gpsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gpsInstruction: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  gpsData: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 8,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
});
