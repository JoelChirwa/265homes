// src/screens/Onboarding/WelcomeScreen.tsx
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/src/components/Button';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleGetStarted = () => {
    router.replace('/onboarding/location');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to 265Homes</Text>
      <Text style={styles.subtitle}>Find verified rentals, fast and secure.</Text>
      <Button onPress={handleGetStarted} title="Get Started" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    resizeMode: 'contain',
    width: 195,
    height: 95,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
});
