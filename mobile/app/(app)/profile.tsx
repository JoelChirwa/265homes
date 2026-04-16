import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Button } from '@/src/components/Button';
import { Link } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout, refreshSubscriptionStatus } = useAuth();
  const { colors } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!user) return null;

  const isTenant = user.role === 'tenant';
  const isPaid = user.subscriptionStatus === 'paid';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
        await refreshSubscriptionStatus();
    } finally {
        setIsRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
        <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary }]}>
                <FontAwesome name="user-circle" size={80} color={colors.primary} />
            </View>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{user.fullName}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email || 'No email set'}</Text>
            <View style={[styles.badge, { backgroundColor: isPaid ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)', flexDirection: 'row', alignItems: 'center' }]}>
                <Ionicons name={isPaid ? "diamond" : "star-outline"} size={12} color={isPaid ? "#4CAF50" : "#FF9800"} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: isPaid ? '#4CAF50' : '#FF9800' }]}>
                    {user.subscriptionStatus.toUpperCase()}
                </Text>
            </View>
        </View>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account Info</Text>
                <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="refresh" size={16} color={colors.primary} />}
                </TouchableOpacity>
            </View>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.row}>
                    <Text style={{ color: colors.textSecondary }}>Phone</Text>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{user.phone}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.row}>
                    <Text style={{ color: colors.textSecondary }}>Role</Text>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{user.role === 'landlord' ? 'Landlord' : 'Tenant'}</Text>
                </View>
            </View>
        </View>

        {isTenant && (
            <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Usage Stats</Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.usageHeader}>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Listing Views</Text>
                    <Text style={{ color: colors.textPrimary }}>{user.listingViewsUsed} / {user.listingViewsLimit}</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                    <View 
                        style={[
                            styles.progressBarFill, 
                            { 
                                backgroundColor: colors.primary, 
                                width: `${Math.min((user.listingViewsUsed / user.listingViewsLimit) * 100, 100)}%` 
                            }
                        ]} 
                    />
                </View>
                {Platform.OS !== "web" && (
                    <Link href="/(app)/subscription" asChild>
                        <Button 
                            title="Manage Subscription" 
                            variant="primary"
                            style={{ marginTop: spacing.md }}
                        />
                    </Link>
                )}
            </View>
            </View>
        )}

        {user.role === 'landlord' && (
            <View style={styles.section}>
                <Link href="/(app)/my-listings" asChild>
                    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="list-circle-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
                            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Manage My Listings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </Link>
            </View>
        )}

        <Button 
            title="Logout" 
            onPress={logout} 
            variant="danger"
            style={{ marginTop: spacing.xl, marginBottom: 100 }}
        />
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
