import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/src/components/Button';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import Constants, { AppOwnership } from 'expo-constants';

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { completeOnboarding } = useAuth();
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    // SDK 53+ Check for Expo Go
    // expo-notifications functionality was removed from Expo Go in SDK 53.
    if (Constants.appOwnership === AppOwnership.Expo) {
      Alert.alert(
        'Onboarding Info',
        'Push notifications are optimized for production. For now, we will skip this step and proceed to login.',
        [{ text: 'Continue', onPress: finishOnboarding }]
      );
      return;
    }

    setLoading(true);
    try {
      // Use dynamic require to prevent import-time crash in Expo Go
      const Notifications = require('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        finishOnboarding();
      } else {
        Alert.alert(
          'Notifications',
          'Get alerts for new properties matching your search. You can enable this later in settings.',
          [{ text: 'OK', onPress: finishOnboarding }]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      finishOnboarding();
    } finally {
      setLoading(false);
    }
  };

  const finishOnboarding = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="notifications" size={50} color={colors.secondary} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Stay Updated</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Receive instant alerts when new properties that match your criteria are listed in your preferred areas.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Button
          title="Enable Notifications"
          onPress={requestPermission}
          loading={loading}
          style={{ width: '100%', backgroundColor: colors.secondary }}
        />
        <TouchableOpacity
          onPress={finishOnboarding}
          style={[styles.skipButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  footer: {
    width: '100%',
    paddingBottom: spacing.xl,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
