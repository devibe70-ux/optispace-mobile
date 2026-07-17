import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initializeAdsConsent } from '../services/adService';

export default function RootLayout() {
  useEffect(() => {
    initializeAdsConsent();
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
