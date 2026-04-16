// app/(app)/edit-profile.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState((user as any)?.district || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        fullName,
        phone,
        district,
        email,
      });
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Edit Profile</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <Input
            label="District"
            value={district}
            onChangeText={setDistrict}
            placeholder="Enter your district"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isLoading}
          style={{ marginTop: spacing.xl, marginBottom: 100 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  form: {
    marginBottom: spacing.md,
  },
});
