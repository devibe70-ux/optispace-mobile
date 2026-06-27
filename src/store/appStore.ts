import { create } from 'zustand';
import * as MediaLibrary from 'expo-media-library';

export interface DuplicateGroup {
  id: string;
  assets: MediaLibrary.Asset[];
}

export interface LargeVideo {
  asset: MediaLibrary.Asset;
  sizeMB: number;
}

interface AppState {
  isScanning: boolean;
  scanProgress: number;
  duplicateGroups: DuplicateGroup[];
  largeVideos: LargeVideo[];
  totalSavedMB: number;
  
  setScanning: (isScanning: boolean) => void;
  setScanProgress: (progress: number) => void;
  setDuplicateGroups: (groups: DuplicateGroup[]) => void;
  setLargeVideos: (videos: LargeVideo[]) => void;
  addTotalSavedMB: (saved: number) => void;
  removeDuplicateGroup: (groupId: string) => void;
  removeVideo: (assetId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isScanning: false,
  scanProgress: 0,
  duplicateGroups: [],
  largeVideos: [],
  totalSavedMB: 0,
  
  setScanning: (isScanning) => set({ isScanning }),
  setScanProgress: (progress) => set({ scanProgress: progress }),
  setDuplicateGroups: (groups) => set({ duplicateGroups: groups }),
  setLargeVideos: (videos) => set({ largeVideos: videos }),
  addTotalSavedMB: (saved) => set((state) => ({ totalSavedMB: state.totalSavedMB + saved })),
  removeDuplicateGroup: (groupId) => set((state) => ({
    duplicateGroups: state.duplicateGroups.filter(g => g.id !== groupId)
  })),
  removeVideo: (assetId) => set((state) => ({
    largeVideos: state.largeVideos.filter(v => v.asset.id !== assetId)
  }))
}));
