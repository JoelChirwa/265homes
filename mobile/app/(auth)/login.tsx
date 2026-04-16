// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Missing details', 'Please enter your phone number and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login({ phone, password });
    } catch (error) {
      Alert.alert('Login failed', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          style={{ backgroundColor: colors.background }}
          keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Login to access verified property listings or manage your properties in Malawi.
              </Text>
          </View>

          <View style={styles.form}>
              <Input 
                  label="Phone Number"
                  placeholder="0999 123 456"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
              />
              <View style={styles.passwordContainer}>
                  <Input 
                      label="Password"
                      placeholder="********"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      style={{ flex: 1 }}
                  />
                  <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                  >
                      <Ionicons 
                          name={showPassword ? "eye-off" : "eye"} 
                          size={24} 
                          color={colors.textSecondary} 
                      />
                  </TouchableOpacity>
              </View>

              <Link href="/(auth)/password-reset" asChild>
                  <TouchableOpacity style={styles.forgotPassword}>
                      <Text style={{ color: colors.primary, fontWeight: '600' }}>Forgot Password?</Text>
                  </TouchableOpacity>
              </Link>

              <Button 
                  title="Login" 
                  onPress={handleLogin} 
                  loading={isLoading}
                  style={{ width: '100%', marginTop: spacing.md }}
              />
          </View>

          <View style={styles.footer}>
              <Text style={{ color: colors.textSecondary }}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                      <Text style={{ color: colors.primary, fontWeight: '700' }}>Register Now</Text>
                  </TouchableOpacity>
              </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brand: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    top: 28,
    padding: spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
