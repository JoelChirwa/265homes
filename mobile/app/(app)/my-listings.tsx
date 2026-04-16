// app/(app)/my-listings.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useListings } from '@/src/context/ListingsContext';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { ListingCard } from '@/src/components/ListingCard';
import { Button } from '@/src/components/Button';
import { Link, useRouter } from 'expo-router';

export default function MyListingsScreen() {
  const { user } = useAuth();
  const { myListings, softDeleteListing } = useListings();
  const { colors } = useTheme();
  const router = useRouter();

  if (!user || user.role !== 'landlord') return null;

  const mine = myListings(user.id);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to remove this property? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => softDeleteListing(id, user.id)
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Listings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your posted properties</Text>
      </View>

      <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{mine.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{mine.filter(l => l.isVerified).length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Verified</Text>
          </View>
      </View>

      <FlatList
        data={mine}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🏠</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Listings Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Start earning by listing your verified property now.
            </Text>
            <Link href="/(app)/post-listing" asChild>
                <Button title="Post a Listing" onPress={() => {}} style={{ marginTop: spacing.md }} />
            </Link>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ListingCard listing={item} />
            <View style={[styles.actions, { backgroundColor: colors.surface, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: colors.border }]}>
                <Button 
                    title="Edit" 
                    onPress={() => router.push(`/listing/edit/${item.id}`)}
                    variant="ghost"
                    style={styles.actionButton}
                />
                <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
                <Button
                    title="Delete"
                    onPress={() => handleDelete(item.id)}
                    variant="outline"
                    style={styles.actionButton}
                />
            </View>
          </View>
        )}
      />
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  cardContainer: {
    marginBottom: spacing.lg,
  },
  emptyCard: {
    padding: spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    marginTop: -8, // slight overlap for connected look
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  actionDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
  },
});
