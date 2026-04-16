// app/(app)/home.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useListings } from '@/src/context/ListingsContext';
import { useAccessControl } from '@/src/hooks/useAccessControl';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { ListingCard } from '@/src/components/ListingCard';
import { Button } from '@/src/components/Button';
import { Link, useRouter } from 'expo-router';

import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user } = useAuth();
  const { visibleListings, myListings } = useListings();
  const { canViewListingDetails } = useAccessControl(user);
  const { colors } = useTheme();
  const router = useRouter();

  if (!user) return null;

  const firstName = user.fullName?.split(' ')[0];
  const limitedListings = user.role === 'tenant' ? visibleListings.slice(0, 20) : visibleListings;
  const hslToHsla = (hsl: string, alpha: number) => {
    // Theme colors are provided as `hsl(...)`. RN supports `hsla(...)` for alpha.
    if (!hsl || typeof hsl !== "string" || !hsl.startsWith("hsl(")) return hsl;
    return hsl.replace(/^hsl\(/, "hsla(").replace(/\)$/, `, ${alpha})`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderHeader = () => (
    <View style={styles.header}>
        <View style={styles.headerTop}>
            <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()},</Text>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{firstName} 👋</Text>
            </View>
            <Link href="/(app)/notifications" asChild>
                <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="notifications" size={24} color={colors.primary} />
                </TouchableOpacity>
            </Link>
        </View>
    </View>
  );

  if (user.role === 'landlord') {
    const landlordListings = myListings(user.id);
    const sortedListings = [...landlordListings].sort((a, b) => (b.views || 0) - (a.views || 0));
    return (
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
            {renderHeader()}

            <View style={[styles.statsContainer]}>
            <View style={styles.statsRow}>
                <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="home" size={24} color={colors.primary} />
                    </View>
                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>{landlordListings.length}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Listings</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="chatbubble" size={24} color={colors.primary} />
                    </View>
                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>0</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Inquiries</Text>
                </View>
            </View>
        </View>

            {sortedListings.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>My Listings</Text>
                        <TouchableOpacity onPress={() => router.push('/(app)/my-listings')}>
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {sortedListings.slice(0, 3).map((listing) => (
                        <View key={listing.id} style={[styles.listingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.listingTitle, { color: colors.textPrimary }]}>{listing.title}</Text>
                            <View style={styles.listingMeta}>
                                <Ionicons name="eye" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                                <Text style={[styles.listingViews, { color: colors.textSecondary }]}>{listing.views || 0} views</Text>
                                <Text style={[styles.listingPrice, { color: colors.primary }]}>MWK {listing.price.toLocaleString()}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: 0 }]}>
      <FlatList
        data={limitedListings}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
            <>
                {renderHeader()}
                {!canViewListingDetails && (
                    <View
                      style={[
                        styles.upgradeCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: hslToHsla(colors.secondary, 0.35),
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.upgradeIcon,
                          { backgroundColor: hslToHsla(colors.secondary, 0.12), borderColor: hslToHsla(colors.secondary, 0.35) },
                        ]}
                      >
                        <Ionicons name="lock-closed-outline" size={18} color={colors.secondary} />
                      </View>

                      <View style={styles.upgradeBody}>
                        <View style={styles.upgradeTopRow}>
                          <Text style={[styles.upgradeTitle, { color: colors.textPrimary }]}>Unlock Pro Access</Text>

                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor:
                                  user.subscriptionStatus === "pending"
                                    ? hslToHsla(colors.secondary, 0.14)
                                    : hslToHsla(colors.secondary, 0.10),
                                borderColor: hslToHsla(colors.secondary, 0.28),
                              },
                            ]}
                          >
                            <Text style={[styles.statusPillText, { color: colors.secondary }]}>
                              {user.subscriptionStatus === "pending" ? "Payment Pending" : "Unpaid"}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.upgradeText, { color: colors.textSecondary }]}>
                          Subscribe to view all verified rentals and contact landlords.
                        </Text>

                        <View style={styles.benefitsRow}>
                          <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                            <Text style={[styles.benefitText, { color: colors.textPrimary }]}>Full listing details</Text>
                          </View>
                          <View style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                            <Text style={[styles.benefitText, { color: colors.textPrimary }]}>GPS-verified locations</Text>
                          </View>
                        </View>

                        <Link href="/(app)/subscription" asChild>
                          <TouchableOpacity
                            style={[styles.upgradeButton, { backgroundColor: colors.secondary }]}
                          >
                            <Text style={styles.upgradeButtonText}>
                              {user.subscriptionStatus === "pending" ? "Continue" : "Upgrade"}
                            </Text>
                            <Ionicons name="chevron-forward" size={18} color="#fff" />
                          </TouchableOpacity>
                        </Link>
                      </View>
                    </View>
                )}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Recent verified rentals</Text>
                    <TouchableOpacity onPress={() => router.push('/(app)/explore')}>
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>See all</Text>
                    </TouchableOpacity>
                </View>
            </>
        }
        renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
                <ListingCard listing={item} />
            </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  heroCard: {
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: 24,
    marginBottom: spacing.xl,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  heroButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsContainer: {
    paddingHorizontal: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: -spacing.xl,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.xl,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  upgradeText: {
    fontSize: 12,
  },
  upgradeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginRight: spacing.sm,
  },
  upgradeBody: {
    flex: 1,
  },
  upgradeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  benefitsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
  },
  benefitText: {
    fontSize: 12,
    fontWeight: "600",
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listingItem: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  listingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingViews: {
    fontSize: 13,
    marginRight: 'auto',
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
});
