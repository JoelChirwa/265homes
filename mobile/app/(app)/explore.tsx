// app/(app)/explore.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useAuth } from '@/src/context/AuthContext';
import { useListings } from '@/src/context/ListingsContext';
import { useAccessControl } from '@/src/hooks/useAccessControl';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { ListingCard } from '@/src/components/ListingCard';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { Link, useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const CITIES = ['Lilongwe', 'Blantyre', 'Mzuzu'];

const CITY_COORDS = {
    Lilongwe: { latitude: -13.9626, longitude: 33.7741 },
    Blantyre: { latitude: -15.7861, longitude: 35.0058 },
    Mzuzu: { latitude: -11.4584, longitude: 34.0150 }
};

import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function ExploreScreen() {
  const { user } = useAuth();
  const { visibleListings, setFilters, isLoading, selectedFilters } = useListings();
  const { canViewListingDetails } = useAccessControl(user);
  const { colors } = useTheme();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [city, setCity] = useState<string | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState('');
  const [minRooms, setMinRooms] = useState('');

  const initialRegion = useMemo(() => {
      const coords = city ? CITY_COORDS[city as keyof typeof CITY_COORDS] : CITY_COORDS.Lilongwe;
      return {
          ...coords,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
      };
  }, [city]);

  if (!user) return null;

  if (user.role === 'landlord') {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <View style={styles.iconWrapper}>
            <Ionicons name="eye-off" size={60} color={colors.primary} />
        </View>
        <Text style={[styles.centerTitle, { color: colors.textPrimary }]}>Explore is for Tenants</Text>
        <Text style={[styles.centerSubtitle, { color: colors.textSecondary }]}>
          Switch to searching if you're looking for a home, or manage your properties from the Home tab.
        </Text>
      </View>
    );
  }

  if (!canViewListingDetails) {
    return (
        <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.upgradeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.iconWrapper, { backgroundColor: '#FFD70020' }]}>
                    <Ionicons name="lock-closed" size={50} color="#FFD700" />
                </View>
                <Text style={[styles.centerTitle, { color: colors.textPrimary }]}>Subscription Required</Text>
                <Text style={[styles.centerSubtitle, { color: colors.textSecondary }]}>
                    Tenants must have an active subscription to access the explore database and map view.
                </Text>
                <Link href="/(app)/subscription" asChild>
                    <Button title="Unlock All Listings" onPress={() => {}} style={{ width: '100%', marginTop: spacing.md }} />
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

  const reset = () => {
      setCity(undefined);
      setMaxPrice('');
      setMinRooms('');
      setFilters({});
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Explore Homes</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Find the perfect home in Malawi</Text>
        </View>
        <View style={[styles.viewToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity 
                onPress={() => setViewMode('list')}
                style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: colors.primary }]}
            >
                <Text style={[styles.toggleText, { color: viewMode === 'list' ? '#fff' : colors.textSecondary }]}>List</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setViewMode('map')}
                style={[styles.toggleBtn, viewMode === 'map' && { backgroundColor: colors.primary }]}
            >
                <Text style={[styles.toggleText, { color: viewMode === 'map' ? '#fff' : colors.textSecondary }]}>Map</Text>
            </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.filterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Select City</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
          {CITIES.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setCity(prev => (prev === item ? undefined : item))}
              style={[
                styles.cityPill,
                { 
                    backgroundColor: city === item ? colors.primary : 'transparent',
                    borderColor: city === item ? colors.primary : colors.border
                }
              ]}
            >
              <Text style={[styles.cityText, { color: city === item ? '#fff' : colors.textPrimary }]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.row}>
            <View style={{ flex: 1 }}>
                <Input placeholder="Max Price (MWK)" value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" style={styles.compactInput} />
            </View>
            <View style={{ width: spacing.sm }} />
            <View style={{ width: 100 }}>
                <Input placeholder="Min Rooms" value={minRooms} onChangeText={setMinRooms} keyboardType="numeric" style={styles.compactInput} />
            </View>
        </View>

        <View style={styles.filterActions}>
            <TouchableOpacity onPress={reset} style={styles.resetButton}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Reset</Text>
            </TouchableOpacity>
            <Button title="Apply Filters" onPress={apply} style={styles.applyButton} />
        </View>
      </View>

      {isLoading ? (
          <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      ) : viewMode === 'map' ? (
          <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={initialRegion}
              >
                  {visibleListings.map(listing => (
                      <Marker
                        key={listing.id}
                        coordinate={{ latitude: listing.gps.latitude, longitude: listing.gps.longitude }}
                      >
                          <View style={[styles.customMarker, { backgroundColor: colors.primary, borderColor: '#fff' }]}>
                              <Text style={styles.markerPrice}>
                                  {listing.price >= 1000000 ? `${(listing.price / 1000000).toFixed(1)}M` : `${Math.round(listing.price / 1000)}k`}
                              </Text>
                              <View style={[styles.markerArrow, { borderTopColor: colors.primary }]} />
                          </View>
                          <Callout onPress={() => router.push(`/listing/${listing.id}`)}>
                              <View style={styles.callout}>
                                  <Text style={styles.calloutTitle}>{listing.title}</Text>
                                  <Text style={styles.calloutPrice}>MWK {listing.price.toLocaleString()}</Text>
                                  <Text style={styles.calloutLink}>Tap to view details</Text>
                              </View>
                          </Callout>
                      </Marker>
                  ))}
              </MapView>
          </View>
      ) : (
          <FlatList
            data={visibleListings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
                    <ListingCard listing={item} />
                </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 2,
    height: 40,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  centerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  centerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  upgradeCard: {
    padding: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
  },
  filterCard: {
    marginHorizontal: spacing.xl,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  cityScroll: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  cityPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  cityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  compactInput: {
    height: 48,
    borderRadius: 10,
    fontSize: 14,
  },
  filterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resetButton: {
    paddingHorizontal: spacing.md,
  },
  applyButton: {
    flex: 1,
    height: 48,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: width,
    height: '100%',
  },
  customMarker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPrice: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    bottom: -8,
  },
  callout: {
    padding: 10,
    width: 200,
  },
  calloutTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutPrice: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutLink: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
});
