// app/(app)/notifications.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'payment' | 'listing' | 'subscription' | 'general';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Payment Successful',
    message: 'Your weekly subscription payment was successful.',
    time: '2 hours ago',
    read: false,
    type: 'payment',
  },
  {
    id: '2',
    title: 'New Listing Available',
    message: 'A new listing in Area 43 matches your preferences.',
    time: '5 hours ago',
    read: false,
    type: 'listing',
  },
  {
    id: '3',
    title: 'Subscription Expiring Soon',
    message: 'Your subscription will expire in 2 days. Renew to continue access.',
    time: '1 day ago',
    read: true,
    type: 'subscription',
  },
  {
    id: '4',
    title: 'Welcome to 265Homes',
    message: 'Thank you for joining. Start exploring homes now!',
    time: '3 days ago',
    read: true,
    type: 'general',
  },
];

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  if (!user) return null;

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

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => router.push(`/notification-detail?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.read ? colors.surface : colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: item.read ? colors.border : colors.primary,
            },
          ]}
        >
          <Ionicons
            name={getIconForType(item.type)}
            size={20}
            color={item.read ? colors.textSecondary : '#fff'}
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[
                styles.notificationTitle,
                {
                  color: colors.textPrimary,
                  fontWeight: item.read ? '600' : '700',
                },
              ]}
            >
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
            {item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
            {item.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
        <TouchableOpacity style={styles.markReadButton}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No notifications yet
            </Text>
          </View>
        }
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
  markReadButton: {
    padding: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D4ED8',
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: spacing.md,
  },
});
