import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { MediaScannerService } from '../services/mediaScanner';

export default function ScanScreen() {
  const router = useRouter();
  const { isScanning, scanProgress, duplicateGroups, largeVideos } = useAppStore();

  useEffect(() => {
    // Start scanning when the screen mounts
    MediaScannerService.scanMedia();
  }, []);

  useEffect(() => {
    // Navigate to results when scan is complete
    if (!isScanning && scanProgress === 100) {
      if (duplicateGroups.length > 0 || largeVideos.length > 0) {
        router.push('/results');
      }
    }
  }, [isScanning, scanProgress, duplicateGroups, largeVideos, router]);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={isScanning}
      >
        <Ionicons name="arrow-back" size={24} color={isScanning ? theme.colors.textSecondary : theme.colors.text} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Ionicons 
          name="search" 
          size={80} 
          color={theme.colors.secondary} 
          style={{ marginBottom: theme.spacing.xl }} 
        />
        
        <Text style={styles.title}>Scanning Device</Text>
        <Text style={styles.subtitle}>Looking for duplicate images & large videos</Text>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${scanProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{scanProgress}%</Text>
        
        {!isScanning && scanProgress === 100 && duplicateGroups.length === 0 && largeVideos.length === 0 && (
          <Text style={[styles.subtitle, { color: theme.colors.success }]}>
            Your device is clean! No duplicates or large videos found.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
  },
  backButton: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.s,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden',
    marginBottom: theme.spacing.m,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.secondary,
  },
  progressText: {
    color: theme.colors.secondary,
    fontWeight: 'bold',
    fontSize: 18,
  }
});
