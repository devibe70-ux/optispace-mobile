import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { AdsConsent } from 'react-native-google-mobile-ads';

export default function SettingsTab() {

  const handlePrivacySettings = async () => {
    try {
      // Re-show the CMP form for CCPA/GDPR compliance
      await AdsConsent.showPrivacyOptionsForm();
    } catch (error) {
      console.warn('Failed to show privacy form:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        
        <TouchableOpacity style={styles.row} onPress={handlePrivacySettings}>
          <View style={styles.rowContent}>
            <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.text} />
            <Text style={styles.rowText}>Do Not Sell or Share My Personal Information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.hint}>Manage your data sharing and ad consent preferences.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    paddingTop: theme.spacing.xxl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    color: theme.colors.text,
    fontSize: 16,
    marginLeft: theme.spacing.m,
  },
  hint: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: theme.spacing.s,
    paddingHorizontal: theme.spacing.s,
  }
});
