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
  const hslToHsla = (hsl: string, alpha: number) => {
    // Theme colors are provided as `hsl(...)`. RN supports `hsla(...)` for alpha.
    if (!hsl || typeof hsl !== "string" || !hsl.startsWith("hsl(")) return hsl;
    return hsl.replace(/^hsl\(/, "hsla(").replace(/\)$/, `, ${alpha})`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
        <View style={styles.headerTop}>
            <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>Hello,</Text>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{firstName} 👋</Text>
            </View>
            <Link href="/(app)/profile" asChild>
                <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <FontAwesome name="user-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
            </Link>
        </View>

        <TouchableOpacity 
            style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(app)/explore')}
        >
            <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <Text style={{ color: colors.textSecondary }}>Search by area, price, rooms...</Text>
        </TouchableOpacity>
    </View>
  );

  if (user.role === 'landlord') {
    const landlordListings = myListings(user.id);
    return (
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
            {renderHeader()}
            
            <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
                <Text style={styles.heroTitle}>Grow your business</Text>
                <Text style={styles.heroSubtitle}>Each listing you post is verified by GPS for maximum trust.</Text>
                <Link href="/(app)/post-listing" asChild>
                    <TouchableOpacity style={styles.heroButton}>
                        <Text style={{ color: colors.primary, fontWeight: '700' }}>Post a Listing</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Overview</Text>
                <View style={styles.statsRow}>
                    <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{landlordListings.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Listings</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.statValue, { color: colors.textPrimary }]}>0</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Inquiries</Text>
                    </View>
                </View>
            </View>

            <Button title="Manage My Listings" onPress={() => router.push('/(app)/my-listings')} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }} textStyle={{ color: colors.primary }} />
        </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: 0 }]}>
      <FlatList
        data={visibleListings}
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
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
});
