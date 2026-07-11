import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { calculateSubscriptionTax, initiateRazorpayCheckout } from '../services/billingService';

const PRICING_PLANS = [
  { id: '3m', name: '3 Months', price: 299 },
  { id: '6m', name: '6 Months', price: 549 },
  { id: '1y', name: '1 Year', price: 899 },
  { id: '3y', name: '3 Years', price: 2599 },
  { id: 'life', name: 'Lifetime', price: 4499 },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(PRICING_PLANS[0].id);
  const [userLocation, setUserLocation] = useState({ countryCode: 'IN', stateCode: '24' }); // Default to India/Gujarat for demo
  
  const selectedPlan = PRICING_PLANS.find(p => p.id === selectedPlanId) || PRICING_PLANS[0];
  const taxBreakdown = calculateSubscriptionTax(userLocation, selectedPlan.price);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const result = await initiateRazorpayCheckout(taxBreakdown.finalAmount, `De Vibe Pro - ${selectedPlan.name}`);
      alert('Subscription successful! Payment ID: ' + result.razorpay_payment_id);
      router.back();
    } catch (error: any) {
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

      <Text style={styles.description}>
        Unlock advanced revenue forecasting tools, brand campaign insights, and marketplace data analytics.
      </Text>

      <View style={styles.plansContainer}>
        {PRICING_PLANS.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
              onPress={() => setSelectedPlanId(plan.id)}
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planName, isSelected && styles.planNameSelected]}>{plan.name}</Text>
                <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>₹{plan.price}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.taxCard}>
        <Text style={styles.taxTitle}>Order Summary</Text>
        <View style={styles.taxRow}>
          <Text style={styles.taxLabel}>{selectedPlan.name} Plan</Text>
          <Text style={styles.taxValue}>₹{selectedPlan.price.toFixed(2)}</Text>
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
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 24,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  planCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  planCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10', // Light primary background
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  planNameSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  planPriceSelected: {
    color: theme.colors.primary,
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
    marginBottom: 40,
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

