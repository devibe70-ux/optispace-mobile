import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';

export default function RootLayout() {
  useEffect(() => {
    const requestConsent = async () => {
      try {
        const consentInfo = await AdsConsent.requestInfoUpdate();
        
        if (
          consentInfo.isConsentFormAvailable &&
          consentInfo.status === AdsConsentStatus.REQUIRED
        ) {
          await AdsConsent.showForm();
        }
      } catch (error) {
        console.warn('Failed to initialize Ads Consent:', error);
      }
    };
    
    requestConsent();
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
