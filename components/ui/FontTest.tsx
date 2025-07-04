import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { FONT_CONFIG } from '../../constants/Config';

export function FontTest() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nanum Pen Script Test</Text>
      <Text style={styles.subtitle}>This should use the custom font</Text>
      <Text style={styles.info}>Platform: {Platform.OS}</Text>
      <Text style={styles.info}>Font Family: {FONT_CONFIG.PRIMARY}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1d7b86',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fcf45a',
    fontFamily: Platform.OS === 'android' ? FONT_CONFIG.PRIMARY_WITH_FALLBACK : FONT_CONFIG.PRIMARY,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: Platform.OS === 'android' ? FONT_CONFIG.PRIMARY_WITH_FALLBACK : FONT_CONFIG.PRIMARY,
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
}); 