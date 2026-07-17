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

      // Defensive checking for creationTime presence
      if (prev.creationTime === undefined || curr.creationTime === undefined || prev.creationTime === 0 || curr.creationTime === 0) {
        if (currentGroup.length > 1) {
          groups.push({
            id: currentGroup[0].id,
            assets: [...currentGroup]
          });
        }
        currentGroup = [curr];
        continue;
      }

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
    
    // Filter first by duration > 10 seconds to avoid calling getAssetInfoAsync on non-candidate videos
    const candidateVideos = assets.filter(asset => asset.duration && asset.duration > 10);
    
    for (const asset of candidateVideos) {
      try {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        // assetInfo.size is in bytes (available on iOS and Android)
        const sizeBytes = (assetInfo as any).size;
        const sizeMB = sizeBytes ? Math.round(sizeBytes / (1024 * 1024)) : Math.round(asset.duration * 1.5);
        largeVideos.push({
          asset,
          sizeMB: sizeMB > 0 ? sizeMB : 1
        });
      } catch (error) {
        console.warn('Could not get asset info for', asset.id, error);
        // Fallback to heuristic
        const sizeMB = Math.round(asset.duration * 1.5);
        largeVideos.push({
          asset,
          sizeMB: sizeMB > 0 ? sizeMB : 1
        });
      }
    }
    
    // Sort by largest first
    return largeVideos.sort((a, b) => b.sizeMB - a.sizeMB);
  }
}
