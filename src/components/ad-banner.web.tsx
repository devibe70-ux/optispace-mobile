import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function AdBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>[Google Mobile Ad Placeholder for Web]</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#122338',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F3C5F',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 60,
  },
  text: {
    color: '#A0B0C0',
    fontSize: 12,
  },
});
