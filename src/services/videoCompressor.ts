import { Video } from 'react-native-compressor';
import * as MediaLibrary from 'expo-media-library';
import { LargeVideo } from '../store/appStore';

export class VideoCompressorService {
  static async compressVideo(video: LargeVideo): Promise<{ success: boolean; savedMB: number; newUri?: string }> {
    try {
      // 1. Get the local URI for the video asset
      const assetInfo = await MediaLibrary.getAssetInfoAsync(video.asset);
      const localUri = assetInfo.localUri || assetInfo.uri;

      if (!localUri) {
        throw new Error("Could not find local URI for video");
      }

      // 2. Compress the video
      // The default compress options use a balanced quality suitable for our "Social/Archive" use case
      const compressedUri = await Video.compress(
        localUri,
        {
          compressionMethod: 'auto',
        },
        (progress) => {
          console.log('Compression Progress: ', progress);
        }
      );

      // 3. Save the compressed video to the gallery
      const newAsset = await MediaLibrary.createAssetAsync(compressedUri);
      
      // Calculate savings (mock calculation since we don't always have exact bytes)
      // On average, H.264/H.265 compression reduces mobile video by 40-60%
      const savedMB = video.sizeMB * 0.5;

      return {
        success: true,
        savedMB,
        newUri: newAsset.uri
      };

    } catch (error) {
      console.error('Failed to compress video:', error);
      return {
        success: false,
        savedMB: 0
      };
    }
  }

  static async deleteOriginal(video: LargeVideo): Promise<boolean> {
    try {
      // This will prompt the user with a system dialog to confirm deletion
      const deleted = await MediaLibrary.deleteAssetsAsync([video.asset]);
      return deleted;
    } catch (error) {
      console.error('Failed to delete original video:', error);
      return false;
    }
  }
}
