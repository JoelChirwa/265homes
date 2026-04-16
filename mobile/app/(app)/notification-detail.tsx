// app/(app)/notification-detail.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/src/components/Button';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'payment' | 'listing' | 'subscription' | 'general';
  fullMessage?: string;
}

const mockNotifications: Record<string, Notification> = {
  '1': {
    id: '1',
    title: 'Payment Successful',
    message: 'Your weekly subscription payment was successful.',
    fullMessage: 'Your weekly subscription payment of MWK 10,000 was successfully processed. Your subscription is now active for the next 7 days. Thank you for your continued support!',
    time: '2 hours ago',
    read: false,
    type: 'payment',
  },
  '2': {
    id: '2',
    title: 'New Listing Available',
    message: 'A new listing in Area 43 matches your preferences.',
    fullMessage: 'A new 3-bedroom house in Area 43 has been listed at MWK 150,000/month. This property matches your search preferences for area and price range. Tap to view more details and contact the landlord.',
    time: '5 hours ago',
    read: false,
    type: 'listing',
  },
  '3': {
    id: '3',
    title: 'Subscription Expiring Soon',
    message: 'Your subscription will expire in 2 days. Renew to continue access.',
    fullMessage: 'Your subscription will expire in 2 days on April 18, 2026. To continue enjoying unlimited access to all listings and contact landlords, please renew your subscription before it expires.',
    time: '1 day ago',
    read: true,
    type: 'subscription',
  },
  '4': {
    id: '4',
    title: 'Welcome to 265Homes',
    message: 'Thank you for joining. Start exploring homes now!',
    fullMessage: 'Welcome to 265Homes! We are excited to have you on board. Our platform connects you with verified rental properties across Malawi. Start exploring homes, set your preferences, and find your perfect rental today.',
    time: '3 days ago',
    read: true,
    type: 'general',
  },
};

export default function NotificationDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const notification = id ? mockNotifications[id] : null;

  if (!notification) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notification Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={60} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Notification not found
          </Text>
        </View>
      </View>
    );
  }

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
      case 'payment':
        return 'card';
      case 'listing':
        return 'home';
      case 'subscription':
        return 'ribbon';
      default:
        return 'notifications';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notification Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Ionicons name={getIconForType(notification.type)} size={40} color="#fff" />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {notification.title}
        </Text>

        <Text style={[styles.time, { color: colors.textSecondary }]}>
          {notification.time}
        </Text>

        <View style={[styles.messageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>Message</Text>
          <Text style={[styles.message, { color: colors.textPrimary }]}>
            {notification.fullMessage || notification.message}
          </Text>
        </View>

        {notification.type === 'subscription' && (
          <Button
            title="Renew Subscription"
            onPress={() => router.push('/(app)/subscription')}
            style={{ marginTop: spacing.lg }}
          />
        )}

        {notification.type === 'listing' && (
          <Button
            title="View Listing"
            onPress={() => router.push('/(app)/explore')}
            style={{ marginTop: spacing.lg }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  deleteButton: {
    padding: spacing.sm,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  time: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  messageCard: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: spacing.md,
  },
});
