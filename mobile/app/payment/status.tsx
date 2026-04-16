// app/payment/status.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Button } from '@/src/components/Button';

export default function PaymentStatusScreen() {
  const { status, reference } = useLocalSearchParams<{ status: 'success' | 'failure', reference: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const isSuccess = status === 'success';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: isSuccess ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }]}>
            <Text style={{ fontSize: 60 }}>{isSuccess ? '✅' : '❌'}</Text>
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isSuccess 
                ? 'Your subscription is now active. You can now access all verified listings.' 
                : 'Something went wrong with your transaction. Please try again or contact support.'}
        </Text>
        
        {reference && (
            <View style={[styles.referenceBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Reference ID</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{reference}</Text>
            </View>
        )}
      </View>

      <View style={styles.footer}>
          <Button 
            title={isSuccess ? "Go to Home" : "Try Again"} 
            onPress={() => router.replace(isSuccess ? "/(app)/home" : "/(app)/profile")} 
            style={{ width: '100%' }}
          />
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
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  referenceBox: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
  },
  footer: {
      paddingBottom: spacing.xl,
  }
});
