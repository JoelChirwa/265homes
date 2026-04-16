// app/(auth)/register.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { useAuth } from '@/src/context/AuthContext';
import { UserRole } from '@/src/types';

const RegisterSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Name too short')
    .required('Full name is required'),
  phone: Yup.string()
    .matches(/^[0-9+]{10,15}$/, 'Invalid phone number format')
    .required('Phone number is required'),
  email: Yup.string().email('Invalid email format'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: Yup.string().oneOf(['tenant', 'landlord']).required(),
});

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register } = useAuth();
  
  const handleRegister = async (values: any, { setSubmitting }: any) => {
    try {
      await register({
        fullName: values.fullName,
        email: values.email.trim() || undefined,
        phone: values.phone,
        password: values.password,
        role: values.role as UserRole,
      });
    } catch (error) {
      Alert.alert('Registration failed', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        style={{ backgroundColor: colors.background }}
        keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Join Malawi's most trusted property platform.
            </Text>
        </View>

        <Formik
            initialValues={{
                fullName: '',
                phone: '',
                email: '',
                password: '',
                role: 'tenant',
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
        >
            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
                <View style={styles.form}>
                    <Input 
                        label="Full Name"
                        placeholder="John Phiri"
                        value={values.fullName}
                        onChangeText={handleChange('fullName')}
                        onBlur={handleBlur('fullName')}
                        error={touched.fullName && errors.fullName ? errors.fullName : undefined}
                    />
                    <Input 
                        label="Phone Number"
                        placeholder="0999 123 456"
                        value={values.phone}
                        onChangeText={handleChange('phone')}
                        onBlur={handleBlur('phone')}
                        error={touched.phone && errors.phone ? errors.phone : undefined}
                        keyboardType="phone-pad"
                    />
                    <Input 
                        label="Email (Optional)"
                        placeholder="john@example.com"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={touched.email && errors.email ? errors.email : undefined}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Input 
                        label="Password"
                        placeholder="********"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={touched.password && errors.password ? errors.password : undefined}
                        secureTextEntry
                    />

                    <View style={styles.roleContainer}>
                        <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>I am a:</Text>
                        <View style={styles.roleButtons}>
                            <TouchableOpacity 
                                onPress={() => setFieldValue('role', 'tenant')}
                                style={[
                                    styles.roleButton, 
                                    { 
                                        backgroundColor: values.role === 'tenant' ? colors.primary : colors.surface,
                                        borderColor: colors.border
                                    }
                                ]}
                            >
                                <Text style={[styles.roleText, { color: values.role === 'tenant' ? '#fff' : colors.textPrimary }]}>Tenant</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setFieldValue('role', 'landlord')}
                                style={[
                                    styles.roleButton, 
                                    { 
                                        backgroundColor: values.role === 'landlord' ? colors.primary : colors.surface,
                                        borderColor: colors.border
                                    }
                                ]}
                            >
                                <Text style={[styles.roleText, { color: values.role === 'landlord' ? '#fff' : colors.textPrimary }]}>Landlord</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Button 
                        title="Create Account" 
                        onPress={() => handleSubmit()} 
                        loading={isSubmitting}
                        style={{ width: '100%', marginTop: spacing.md }}
                    />
                </View>
            )}
        </Formik>

        <View style={styles.footer}>
            <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>Login</Text>
                </TouchableOpacity>
            </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: 60,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  roleContainer: {
    marginBottom: spacing.lg,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  roleText: {
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
});
