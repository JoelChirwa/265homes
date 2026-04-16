// app/(auth)/password-reset.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/src/components/Button';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { TextInput } from 'react-native';

export default function PasswordResetScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!emailOrPhone) {
      Alert.alert('Error', 'Please enter your email or phone number.');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        'If an account exists, you will receive a reset link shortly.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your registered email or phone number to receive a reset link.
        </Text>

        <TextInput
          placeholder="Email or Phone Number"
          placeholderTextColor={colors.textSecondary}
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }]}
        />

        <Button 
          title="Send Reset Link" 
          onPress={handleReset} 
          loading={loading}
          style={{ width: '100%', marginTop: spacing.md }}
        />

        <Button 
          title="Back to Login" 
          onPress={() => router.back()} 
          style={{ width: '100%', backgroundColor: 'transparent', marginTop: spacing.sm }}
          textStyle={{ color: colors.primary }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
  },
});
