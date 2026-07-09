import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { calculateSubscriptionTax, initiateRazorpayCheckout } from '../services/billingService';

const PLAN_PRICE = 999; // Base price in INR

export default function SubscriptionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState({ countryCode: 'IN', stateCode: '24' }); // Default to India/Gujarat for demo
  
  const taxBreakdown = calculateSubscriptionTax(userLocation, PLAN_PRICE);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const result = await initiateRazorpayCheckout(taxBreakdown.finalAmount, 'De Vibe Pro Subscription');
      // Handle success
      alert('Subscription successful! Payment ID: ' + result.razorpay_payment_id);
      router.back();
    } catch (error: any) {
      // Handle error or cancellation
      console.log('Payment failed or cancelled:', error);
      alert('Payment failed: ' + error.description);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pro Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>Monthly Pro</Text>
          <Text style={styles.planPrice}>₹{PLAN_PRICE}</Text>
        </View>
        <Text style={styles.planDescription}>
          Unlock advanced revenue forecasting tools, brand campaign insights, and marketplace data analytics.
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Unlimited revenue forecasting</Text>
          <Text style={styles.featureItem}>• Influencer marketplace access</Text>
          <Text style={styles.featureItem}>• Priority support</Text>
        </View>
      </View>

      <View style={styles.taxCard}>
        <Text style={styles.taxTitle}>Order Summary</Text>
        <View style={styles.taxRow}>
          <Text style={styles.taxLabel}>Base Plan</Text>
          <Text style={styles.taxValue}>₹{PLAN_PRICE.toFixed(2)}</Text>
        </View>
        
        {taxBreakdown.cgst > 0 && (
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>CGST (9%)</Text>
            <Text style={styles.taxValue}>₹{taxBreakdown.cgst.toFixed(2)}</Text>
          </View>
        )}
        
        {taxBreakdown.sgst > 0 && (
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>SGST (9%)</Text>
            <Text style={styles.taxValue}>₹{taxBreakdown.sgst.toFixed(2)}</Text>
          </View>
        )}

        {taxBreakdown.igst > 0 && (
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>IGST (18%)</Text>
            <Text style={styles.taxValue}>₹{taxBreakdown.igst.toFixed(2)}</Text>
          </View>
        )}

        <View style={[styles.taxRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalValue}>₹{taxBreakdown.finalAmount.toFixed(2)}</Text>
        </View>
        
        <Text style={styles.sacCode}>SAC Code: {taxBreakdown.sacCode}</Text>
        {taxBreakdown.invoiceNote ? (
          <Text style={styles.invoiceNote}>{taxBreakdown.invoiceNote}</Text>
        ) : null}
      </View>

      <TouchableOpacity 
        style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]} 
        onPress={handleSubscribe}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.background} />
        ) : (
          <Text style={styles.subscribeButtonText}>Pay ₹{taxBreakdown.finalAmount.toFixed(2)}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
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
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  planCard: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  planDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 24,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    fontSize: 16,
    color: theme.colors.text,
  },
  taxCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  taxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taxLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  taxValue: {
    fontSize: 16,
    color: theme.colors.text,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  sacCode: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  invoiceNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: theme.colors.primary,
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: theme.colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
