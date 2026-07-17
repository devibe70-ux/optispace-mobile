import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';

export const initializeAdsConsent = async () => {
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

export const showPrivacyOptions = async () => {
  await AdsConsent.showPrivacyOptionsForm();
};
