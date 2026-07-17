import { LargeVideo } from '../store/appStore';

export class VideoCompressorService {
  static async compressVideo(video: LargeVideo): Promise<{ success: boolean; savedMB: number; newUri?: string }> {
    console.log("Mock video compression on web:", video);
    return {
      success: true,
      savedMB: video.sizeMB * 0.5,
      newUri: video.asset.uri
    };
  }

  static async deleteOriginal(video: LargeVideo): Promise<boolean> {
    console.log("Mock delete original video on web:", video);
    return true;
  }
}
