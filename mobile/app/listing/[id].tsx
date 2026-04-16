// app/listing/[id].tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuth } from '@/src/context/AuthContext';
import { useListings } from '@/src/context/ListingsContext';
import { useAccessControl } from '@/src/hooks/useAccessControl';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Button } from '@/src/components/Button';

const { width } = Dimensions.get('window');

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, incrementListingView } = useAuth();
  const { getListingById } = useListings();
  const { canViewListingDetails, reason } = useAccessControl(user);
  const { colors } = useTheme();

  const listing = getListingById(id);

  useEffect(() => {
    if (listing && canViewListingDetails) {
      incrementListingView();
    }
  }, [canViewListingDetails, id, listing]);

  if (!listing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.centerText, { color: colors.textSecondary }]}>Listing not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
      </View>
    );
  }

  if (!canViewListingDetails) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🔒</Text>
        <Text style={[styles.centerTitle, { color: colors.textPrimary }]}>Access Locked</Text>
        <Text style={[styles.centerText, { color: colors.textSecondary }]}>{reason}</Text>
        <Button title="Upgrade to View Details" onPress={() => router.replace('/(app)/profile')} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const handleCall = () => Linking.openURL(`tel:${listing.landlordPhone}`);
  const handleNavigate = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${listing.gps.latitude},${listing.gps.longitude}`;
    Linking.openURL(mapsUrl);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={listing.images}
            keyExtractor={uri => uri}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.heroImage} />
            )}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={{ fontSize: 20 }}>⬅️</Text>
          </TouchableOpacity>
          {listing.isVerified && (
              <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ GPS Verified</Text>
              </View>
          )}
        </View>

        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{listing.title}</Text>
                <Text style={[styles.location, { color: colors.textSecondary }]}>📍 {listing.city}, {listing.area}</Text>
              </View>
              <Text style={[styles.price, { color: colors.primary }]}>MWK {listing.price.toLocaleString()}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.specsRow}>
              <View style={styles.specItem}>
                <Text style={styles.specIcon}>🛏️</Text>
                <Text style={[styles.specText, { color: colors.textPrimary }]}>{listing.rooms} Rooms</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specIcon}>🚿</Text>
                <Text style={[styles.specText, { color: colors.textPrimary }]}>Verified Bath</Text>
              </View>
          </View>

          <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Description</Text>
              <Text style={[styles.description, { color: colors.textPrimary }]}>{listing.description}</Text>
          </View>

          <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Amenities</Text>
              <View style={styles.amenities}>
                  {listing.amenities.map(item => (
                      <View key={item} style={[styles.amenityPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          <Text style={[styles.amenityText, { color: colors.textPrimary }]}>{item}</Text>
                      </View>
                  ))}
              </View>
          </View>

          <View style={styles.footer}>
              <Button title="Call Landlord" onPress={handleCall} variant="secondary" style={{ flex: 1 }} />
              <View style={{ width: spacing.md }} />
              <Button title="Directions" onPress={handleNavigate} variant="outline" style={{ flex: 1 }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  centerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  centerText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  imageContainer: {
    position: 'relative',
    height: 350,
  },
  heroImage: {
    width: width,
    height: 350,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: spacing.xl,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    backgroundColor: '#fff', // need to handle this with theme or just use surface
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.md,
  },
  specsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specIcon: {
    fontSize: 20,
  },
  specText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
});
