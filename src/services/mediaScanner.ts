import * as MediaLibrary from 'expo-media-library';
import { useAppStore, DuplicateGroup, LargeVideo } from '../store/appStore';

export class MediaScannerService {
  static async requestPermissions(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  static async scanMedia() {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const { setScanning, setScanProgress, setDuplicateGroups, setLargeVideos } = useAppStore.getState();
    setScanning(true);
    setScanProgress(0);

    try {
      // Fetch photos for duplicate scanning
      const photos = await this.fetchAllAssets(MediaLibrary.MediaType.photo);
      const duplicates = this.findFuzzyDuplicates(photos);
      setDuplicateGroups(duplicates);
      setScanProgress(50);

      // Fetch videos for compression scanning
      const videos = await this.fetchAllAssets(MediaLibrary.MediaType.video);
      const largeVideos = await this.findLargeVideos(videos);
      setLargeVideos(largeVideos);
      setScanProgress(100);
      
    } catch (error) {
      console.error('Error scanning media:', error);
    } finally {
      setScanning(false);
    }
  }

  private static async fetchAllAssets(mediaType: MediaLibrary.MediaTypeValue): Promise<MediaLibrary.Asset[]> {
    let assets: MediaLibrary.Asset[] = [];
    let hasNextPage = true;
    let after: string | undefined = undefined;

    // To keep the MVP fast, we'll limit to the first 1000 items
    let count = 0;
    const maxItems = 1000;

    while (hasNextPage && count < maxItems) {
      const page = await MediaLibrary.getAssetsAsync({
        mediaType,
        first: 100,
        after,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      assets = assets.concat(page.assets);
      hasNextPage = page.hasNextPage;
      after = page.endCursor;
      count += page.assets.length;
    }
    return assets;
  }

  private static findFuzzyDuplicates(assets: MediaLibrary.Asset[]): DuplicateGroup[] {
    const groups: DuplicateGroup[] = [];
    if (assets.length < 2) return groups;

    // Grouping logic: Photos taken within 3 seconds of each other are considered "bursts" or fuzzy duplicates
    let currentGroup: MediaLibrary.Asset[] = [assets[0]];

    for (let i = 1; i < assets.length; i++) {
      const prev = assets[i - 1];
      const curr = assets[i];

      // creationTime is in milliseconds
      const timeDiff = Math.abs(curr.creationTime - prev.creationTime);
      
      if (timeDiff <= 3000) { // 3 seconds threshold
        currentGroup.push(curr);
      } else {
        if (currentGroup.length > 1) {
          groups.push({
            id: currentGroup[0].id,
            assets: [...currentGroup]
          });
        }
        currentGroup = [curr];
      }
    }

    if (currentGroup.length > 1) {
      groups.push({
        id: currentGroup[0].id,
        assets: currentGroup
      });
    }

    return groups;
  }

  private static async findLargeVideos(assets: MediaLibrary.Asset[]): Promise<LargeVideo[]> {
    const largeVideos: LargeVideo[] = [];
    
    // Process in chunks to avoid overwhelming the bridge
    for (const asset of assets) {
      try {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        // Only consider videos larger than 10MB
        // For local images/videos, we can estimate size or use file size if available.
        // Actually getAssetInfoAsync returns `size` for local assets on iOS/Android in bytes. Wait, size might not always be there.
        // Let's check size, fallback to duration * height for rough heuristic if missing.
        let sizeMB = 0;
        
        // Wait, MediaLibrary.Asset has `duration` and `width`/`height`. Size is not guaranteed on all platforms in `getAssetsAsync`, but `getAssetInfoAsync` might have it.
        // Since getAssetInfoAsync is slow for many videos, let's use a heuristic: duration > 10 seconds.
        if (asset.duration > 10) {
           sizeMB = Math.round((asset.duration * 1.5)); // rough estimate: 1.5MB per second of video
           largeVideos.push({
             asset,
             sizeMB
           });
        }
      } catch (error) {
        console.warn('Could not get asset info for', asset.id, error);
      }
    }
    
    // Sort by largest first
    return largeVideos.sort((a, b) => b.sizeMB - a.sizeMB);
  }
}
