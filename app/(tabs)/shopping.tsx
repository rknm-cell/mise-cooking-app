import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText, ThemedView } from '../../components';
import { HeaderWithProfile } from '../../components/navigation/HeaderWithProfile';
import AggregatedShoppingList from '../../components/shopping/AggregatedShoppingList';
import { Colors } from '../../constants/Colors';

export default function ShoppingScreen() {
  const [viewMode, setViewMode] = useState<'aggregated' | 'lists'>('aggregated');

  const handleRefresh = () => {
    // This will be called when the aggregated list refreshes
    // You can add any additional refresh logic here
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <View style={styles.header}>
        <HeaderWithProfile title="Shopping" />
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.modeButton, viewMode === 'aggregated' && styles.activeModeButton]}
            onPress={() => setViewMode('aggregated')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={viewMode === 'aggregated' ? '#1d7b86' : '#fff'} 
            />
            <ThemedText style={[
              styles.modeButtonText,
              viewMode === 'aggregated' && styles.activeModeButtonText
            ]}>
              All Items
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, viewMode === 'lists' && styles.activeModeButton]}
            onPress={() => setViewMode('lists')}
          >
            <Ionicons 
              name="folder" 
              size={20} 
              color={viewMode === 'lists' ? '#1d7b86' : '#fff'} 
            />
            <ThemedText style={[
              styles.modeButtonText,
              viewMode === 'lists' && styles.activeModeButtonText
            ]}>
              Lists
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'aggregated' ? (
        <AggregatedShoppingList onRefresh={handleRefresh} />
      ) : (
        <View style={styles.listsPlaceholder}>
          <Ionicons name="folder-outline" size={64} color={Colors.light.tint} />
          <ThemedText style={styles.placeholderTitle}>Shopping Lists</ThemedText>
          <ThemedText style={styles.placeholderText}>
            Switch to "All Items" view to see your aggregated shopping list
          </ThemedText>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setViewMode('aggregated')}
          >
            <ThemedText style={styles.switchButtonText}>View All Items</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d7b86',
    padding: 20,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#426b70',
  },
  header: {
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeModeButton: {
    backgroundColor: '#fcf45a',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  activeModeButtonText: {
    color: '#1d7b86',
  },
  listsPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#fff',
  },
  placeholderText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  switchButton: {
    backgroundColor: '#fcf45a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  switchButtonText: {
    color: '#1d7b86',
    fontSize: 16,
    fontWeight: '600',
  },
}); 