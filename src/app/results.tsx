import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { VideoCompressorService } from '../services/videoCompressor';
import * as MediaLibrary from 'expo-media-library';

export default function ResultsScreen() {
  const router = useRouter();
  const { duplicateGroups, largeVideos, removeDuplicateGroup, removeVideo, addTotalSavedMB } = useAppStore();

  const handleKeepBest = async (groupId: string, assets: MediaLibrary.Asset[]) => {
    try {
      // Keep the first one (assume it's the best for MVP), delete the rest
      const toDelete = assets.slice(1);
      const deleted = await MediaLibrary.deleteAssetsAsync(toDelete);
      
      if (deleted) {
        removeDuplicateGroup(groupId);
        // Add some mock saved MB
        addTotalSavedMB(toDelete.length * 2.5); // Assume 2.5MB per photo
      }
    } catch (error) {
      console.error('Error deleting duplicates:', error);
    }
  };

  const handleCompressVideo = async (asset: MediaLibrary.Asset, sizeMB: number) => {
    const result = await VideoCompressorService.compressVideo({ asset, sizeMB });
    if (result.success) {
      // Optionally ask user to delete original here or just do it
      const deleted = await VideoCompressorService.deleteOriginal({ asset, sizeMB });
      if (deleted) {
        removeVideo(asset.id);
        addTotalSavedMB(result.savedMB);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Results</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {duplicateGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="images" size={20} color={theme.colors.secondary} /> Fuzzy Duplicates ({duplicateGroups.length} groups)
            </Text>
            
            {duplicateGroups.map((group) => (
              <View key={group.id} style={styles.card}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {group.assets.map((asset) => (
                    <Image 
                      key={asset.id} 
                      source={{ uri: asset.uri }} 
                      style={styles.imageThumbnail} 
                    />
                  ))}
                </ScrollView>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => handleKeepBest(group.id, group.assets)}
                >
                  <Text style={styles.buttonText}>Keep Best & Delete Rest</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {largeVideos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="videocam" size={20} color={theme.colors.accent} /> Large Videos ({largeVideos.length})
            </Text>
            
            {largeVideos.map((video) => (
              <View key={video.asset.id} style={styles.card}>
                <View style={styles.videoRow}>
                  <Ionicons name="film-outline" size={40} color={theme.colors.textSecondary} />
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoName} numberOfLines={1}>{video.asset.filename || 'Video'}</Text>
                    <Text style={styles.videoSize}>Est. Size: {video.sizeMB} MB</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
                  onPress={() => handleCompressVideo(video.asset, video.sizeMB)}
                >
                  <Text style={styles.buttonText}>Compress & Replace</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {duplicateGroups.length === 0 && largeVideos.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
            <Text style={styles.emptyStateText}>All caught up! No optimization needed.</Text>
            <TouchableOpacity 
              style={[styles.primaryButton, { marginTop: theme.spacing.xl }]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  imageScroll: {
    flexDirection: 'row',
    marginBottom: theme.spacing.m,
  },
  imageThumbnail: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.m,
    marginRight: theme.spacing.s,
    backgroundColor: theme.colors.background,
  },
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  videoInfo: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  videoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  videoSize: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  primaryButton: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.m,
  }
});
