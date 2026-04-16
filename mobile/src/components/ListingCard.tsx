// src/components/ListingCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Listing } from '@/src/types';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';

type Props = {
  listing: Listing;
};

export const ListingCard = ({ listing }: Props) => {
  const { colors } = useTheme();

  if (!listing) return null;

  const price = listing.price ? listing.price.toLocaleString() : 'N/A';
  const imageUrl = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : 'https://via.placeholder.com/400x200?text=No+Image';

  return (
    <Link href={`/listing/${listing.id}`} asChild>
      <TouchableOpacity 
        style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            {listing.isVerified && (
                <View style={styles.badge}>
                    <FontAwesome name="check-circle" size={10} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.badgeText}>GPS Verified</Text>
                </View>
            )}
            <View style={styles.priceTag}>
                <Text style={styles.priceText}>MWK {price}</Text>
            </View>
        </View>
        
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {listing.title || 'Untitled Property'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Ionicons name="location-sharp" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.location, { color: colors.textSecondary, marginBottom: 0 }]}>
              {listing.city || 'Unknown'}, {listing.area || 'Unknown'}
            </Text>
          </View>
          <View style={styles.details}>
              <View style={[styles.spec, { backgroundColor: colors.background }]}>
                <Ionicons name="bed-outline" size={14} color={colors.textPrimary} />
                <Text style={[styles.specText, { color: colors.textPrimary }]}>{listing.rooms || 0} Rooms</Text>
              </View>
              <View style={[styles.spec, { backgroundColor: colors.background }]}>
                <Ionicons name="checkmark-done-circle-outline" size={14} color={colors.textPrimary} />
                <Text style={[styles.specText, { color: colors.textPrimary }]}>Verified</Text>
              </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  info: {
    padding: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  specText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
