// app/(app)/explore.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Animated } from 'react-native';
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

import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';

function BlinkingDot() {
  const opacity = new Animated.Value(1);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.blinkingDot, { opacity }]}>
      <Ionicons name="water" size={10} color="#1D4ED8" />
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const { visibleListings, setFilters, isLoading, selectedFilters } = useListings();
  const { canViewListingDetails } = useAccessControl(user);
  const { colors } = useTheme();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [area, setArea] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRooms, setMinRooms] = useState('');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  const initialRegion = useMemo(() => {
      return {
          latitude: -13.9626,
          longitude: 33.7741,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
      };
  }, []);

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
      area: area || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRooms: minRooms ? Number(minRooms) : undefined,
    });
  };

  const reset = () => {
      setArea('');
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
        <TouchableOpacity onPress={() => setIsFilterCollapsed(!isFilterCollapsed)} style={styles.filterHeader}>
          <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>Filters</Text>
          <Ionicons 
            name={isFilterCollapsed ? "chevron-down" : "chevron-up"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>

        {!isFilterCollapsed && (
          <>
            <Input
              placeholder="Search by area"
              value={area}
              onChangeText={setArea}
              style={styles.areaInput}
            />

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
          </>
        )}
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
                          <View style={styles.markerContainer}>
                              <Text style={styles.markerText}>
                                  {listing.price >= 1000000 ? `${(listing.price / 1000000).toFixed(1)}M` : `${Math.round(listing.price / 1000)}k`}
                              </Text>
                              <BlinkingDot />
                          </View>
                          <Callout onPress={() => router.push(`/listing/${listing.id}`)}>
                              <View style={styles.callout}>
                                  <Text style={styles.calloutTitle}>{listing.title}</Text>
                                  <View style={styles.calloutRow}>
                                      <Ionicons name="location" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                                      <Text style={styles.calloutDetail}>{listing.area || listing.city}</Text>
                                  </View>
                                  <View style={styles.calloutRow}>
                                      <Ionicons name="bed" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                                      <Text style={styles.calloutDetail}>{listing.rooms} {listing.rooms === 1 ? 'Room' : 'Rooms'}</Text>
                                  </View>
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
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  areaInput: {
    marginBottom: spacing.md,
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
  markerContainer: {
    alignItems: 'center',
  },
  markerText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '800',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  blinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D4ED8',
    marginTop: 2,
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
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  calloutDetail: {
    fontSize: 12,
    color: '#666',
  },
  calloutLink: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
});
