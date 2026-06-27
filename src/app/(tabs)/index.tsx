import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';

export default function HomeTab() {
  const router = useRouter();
  const { totalSavedMB } = useAppStore();

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Ionicons name="phone-portrait" size={48} color={theme.colors.secondary} />
        <Text style={styles.title}>OptiSpace AI</Text>
        <Text style={styles.subtitle}>Smart Storage Optimizer</Text>
        {totalSavedMB > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsNumber}>{totalSavedMB.toFixed(1)} MB</Text>
            <Text style={styles.statsLabel}>Total Space Recovered</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/scan')}
        >
          <Ionicons name="scan-outline" size={24} color={theme.colors.background} />
          <Text style={styles.buttonText}>Smart Scan Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.m,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.m,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    marginTop: theme.spacing.l,
    padding: theme.spacing.m,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    alignItems: 'center',
    width: '100%',
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  statsLabel: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginTop: theme.spacing.xs,
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: theme.spacing.s,
  }
});
