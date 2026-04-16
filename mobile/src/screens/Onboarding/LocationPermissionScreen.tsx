// src/screens/Onboarding/LocationPermissionScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Button } from '@/src/components/Button';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';

import { Ionicons } from '@expo/vector-icons';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        router.replace('/onboarding/notifications');
      } else {
        Alert.alert(
          'Permission Required',
          '265Homes needs your location to verify property listings. You can enable this later in settings.',
          [{ text: 'OK', onPress: () => router.replace('/onboarding/notifications') }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      router.replace('/onboarding/notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="location" size={50} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Enable Location</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We use your location to show listings near you and verify property locations for landlords.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Button
          title="Allow Location Access"
          onPress={requestPermission}
          loading={loading}
          style={{ width: '100%' }}
        />
        <TouchableOpacity
          onPress={() => router.replace('/onboarding/notifications')}
          style={[styles.maybeLaterButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.maybeLaterText, { color: colors.textSecondary }]}>Maybe Later</Text>
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
  maybeLaterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  maybeLaterText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
