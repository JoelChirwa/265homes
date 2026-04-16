// app/(app)/settings.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/spacing';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { colors, scheme, toggleScheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const openSystemSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your app preferences</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.row}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="moon-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                    <View>
                        <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Dark Mode</Text>
                        <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Current: {scheme?.toUpperCase()}</Text>
                    </View>
                </View>
                <Switch 
                    value={scheme === 'dark'} 
                    onValueChange={toggleScheme}
                    trackColor={{ false: colors.border, true: colors.primary }}
                />
            </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.row}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="notifications-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                    <View>
                        <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Push Notifications</Text>
                        <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Get alerts for new properties</Text>
                    </View>
                </View>
                <Switch 
                    value={notificationsEnabled} 
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="mail-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                    <View>
                        <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Email Alerts</Text>
                        <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Daily summary of new listings</Text>
                    </View>
                </View>
                <Switch 
                    value={emailAlerts} 
                    onValueChange={setEmailAlerts}
                    trackColor={{ false: colors.border, true: colors.primary }}
                />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.row} onPress={openSystemSettings}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="settings-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                    <Text style={[styles.rowTitle, { color: colors.primary }]}>System Notification Settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Legal</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.row}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="document-text-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.row}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Terms of Service</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0 (Production Build)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingTop: 60,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: spacing.xl,
    marginBottom: 40,
  },
});
