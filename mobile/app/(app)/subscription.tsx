// app/(app)/subscription.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Button } from '@/src/components/Button';
import { apiRequest } from '@/src/lib/api';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function SubscriptionScreen() {
  const { user, refreshSubscriptionStatus } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | null>(null);

  if (!user) return null;

  const isPaid = user.subscriptionStatus === 'paid';

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handlePaySubscription = async (plan: 'weekly' | 'monthly') => {
    try {
      setIsInitiatingPayment(true);
      const amount = plan === 'weekly' ? 5000 : 18000;
      
      const response = await apiRequest<{
        message: string;
        reference: string;
      }>('/payments/mobile-money/charge', {
        method: 'POST',
        body: {
          userId: user.id,
          phone: user.phone,
          amount: amount,
          currency: 'MWK',
        },
      });

      Alert.alert(
        'Payment Initiated', 
        `Please check your phone for a mobile money prompt. \n\nReference: ${response.reference}`,
        [{ text: 'OK' }]
      );

      // Robust Polling for status
      const reference = response.reference;
      const isPaidLike = (value: unknown) => {
        const normalized = String(value ?? "").toLowerCase();
        return ["success", "successful", "paid", "completed", "resolved_manually"].includes(normalized);
      };

      let success = false;
      for (let attempt = 0; attempt < 12; attempt += 1) { 
        await sleep(5000);
        try {
          const verifyResponse = await apiRequest<{ status: string }>(
            `/payments/verify/${reference}`,
          );
          if (isPaidLike(verifyResponse.status)) {
            success = true;
            await refreshSubscriptionStatus();
            break;
          }
        } catch {
          // Verification may temporarily fail while the payment is still processing.
        }
      }

      if (success) {
        Alert.alert('Success', 'Your subscription is now active! Enjoy full access.', [
            { text: 'Back to Home', onPress: () => router.replace('/(app)/home') }
        ]);
      } else {
        Alert.alert('Still Pending', 'We haven\'t confirmed your payment yet. It might take a few minutes. You can refresh your status on the Profile page.');
      }
    } catch (error) {
      Alert.alert('Payment Request Failed', (error as Error).message);
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <FontAwesome name="chevron-left" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Upgrade to Pro</Text>
            <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.heroSection}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '10' }]}>
                    <FontAwesome name="rocket" size={40} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Choose Your Plan</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Get unlimited access to GPS-verified property details, contact landlords directly, and receive instant alerts.
                </Text>
            </View>

            <TouchableOpacity 
                style={[
                    styles.planCard, 
                    { 
                        backgroundColor: colors.surface, 
                        borderColor: selectedPlan === 'weekly' ? colors.primary : colors.border,
                        borderWidth: selectedPlan === 'weekly' ? 2 : 1
                    }
                ]} 
                onPress={() => setSelectedPlan('weekly')}
            >
                <View style={styles.planInfo}>
                    <Text style={[styles.planTitle, { color: colors.textPrimary }]}>Weekly Access</Text>
                    <Text style={[styles.planPrice, { color: colors.primary }]}>MWK 5,000</Text>
                </View>
                {selectedPlan === 'weekly' && (
                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                        <FontAwesome name="check" size={14} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={[
                    styles.planCard, 
                    { 
                        backgroundColor: colors.surface, 
                        borderColor: selectedPlan === 'monthly' ? colors.primary : colors.border,
                        borderWidth: selectedPlan === 'monthly' ? 2 : 1,
                        marginTop: spacing.md
                    }
                ]} 
                onPress={() => setSelectedPlan('monthly')}
            >
                <View style={styles.planInfo}>
                    <View style={styles.row}>
                        <Text style={[styles.planTitle, { color: colors.textPrimary }]}>Monthly Premium</Text>
                        <View style={[styles.badge, { backgroundColor: '#4CAF5020' }]}>
                            <Text style={{ color: '#4CAF50', fontSize: 10, fontWeight: '700' }}>BEST VALUE</Text>
                        </View>
                    </View>
                    <Text style={[styles.planPrice, { color: colors.primary }]}>MWK 18,000</Text>
                </View>
                {selectedPlan === 'monthly' && (
                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                        <FontAwesome name="check" size={14} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.featuresList}>
                <Text style={[styles.featuresTitle, { color: colors.textSecondary }]}>WHAT'S INCLUDED</Text>
                <View style={styles.featureItem}>
                    <FontAwesome name="check-circle" size={16} color={colors.primary} />
                    <Text style={[styles.featureText, { color: colors.textPrimary }]}>Unlimited property contact details</Text>
                </View>
                <View style={styles.featureItem}>
                    <FontAwesome name="check-circle" size={16} color={colors.primary} />
                    <Text style={[styles.featureText, { color: colors.textPrimary }]}>Full GPS locations of all listings</Text>
                </View>
                <View style={styles.featureItem}>
                    <FontAwesome name="check-circle" size={16} color={colors.primary} />
                    <Text style={[styles.featureText, { color: colors.textPrimary }]}>Priority support and verification</Text>
                </View>
            </View>

            <Button 
                title={isInitiatingPayment ? "Communicating with Bank..." : "Unlock Access Now"} 
                disabled={!selectedPlan || isInitiatingPayment || isPaid}
                loading={isInitiatingPayment}
                onPress={() => selectedPlan && handlePaySubscription(selectedPlan)}
                style={{ marginTop: spacing.xl }}
            />
            {isPaid && (
                <Text style={{ textAlign: 'center', marginTop: spacing.md, color: '#4CAF50', fontWeight: '600' }}>
                    You already have an active subscription!
                </Text>
            )}
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuresList: {
    marginTop: spacing.xxl,
  },
  featuresTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
  }
});
