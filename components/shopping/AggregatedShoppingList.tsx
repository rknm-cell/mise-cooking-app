import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import {
    aggregateShoppingItems,
    getAllShoppingListItems,
    updateShoppingListItem,
    type AggregatedItem
} from '../../services/shopping';
import { ThemedText } from '../ui';

interface AggregatedShoppingListProps {
  onRefresh?: () => void;
}

export default function AggregatedShoppingList({ onRefresh }: AggregatedShoppingListProps) {
  const { getToken } = useAuth();
  const [aggregatedItems, setAggregatedItems] = useState<AggregatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllItems = async () => {
    const token = await getToken();
    if (!token) return;
    
    try {
      const allItems = await getAllShoppingListItems(token);
      const aggregated = aggregateShoppingItems(allItems);
      setAggregatedItems(aggregated);
    } catch (error) {
      console.error('Error fetching all shopping items:', error);
      Alert.alert('Error', 'Failed to load shopping items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  const handleToggleItem = async (item: AggregatedItem) => {
    const token = await getToken();
    if (!token) return;

    try {
      // Update all items with the same name and unit
      const updatePromises = item.itemIds.map(itemId =>
        updateShoppingListItem(token, itemId, { isCompleted: !item.isCompleted })
      );
      
      await Promise.all(updatePromises);
      
      // Refresh the list
      await fetchAllItems();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating items:', error);
      Alert.alert('Error', 'Failed to update items');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllItems();
  };

  const completedItems = aggregatedItems.filter(item => item.isCompleted);
  const pendingItems = aggregatedItems.filter(item => !item.isCompleted);

  const renderItem = ({ item }: { item: AggregatedItem }) => (
    <View style={[styles.itemContainer, item.isCompleted && styles.completedItem]}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => handleToggleItem(item)}
      >
        <View style={styles.checkbox}>
          {item.isCompleted && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
        <View style={styles.itemInfo}>
          <ThemedText style={[
            styles.itemName,
            item.isCompleted && styles.completedText
          ]}>
            {item.name}
          </ThemedText>
          <ThemedText style={[
            styles.itemDetails,
            item.isCompleted && styles.completedText
          ]}>
            {item.totalQuantity}{item.unit ? ` ${item.unit}` : ''}
            {item.category ? ` • ${item.category}` : ''}
            {item.listIds.length > 1 ? ` • ${item.listIds.length} lists` : ''}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText style={styles.loadingText}>Loading shopping items...</ThemedText>
      </View>
    );
  }

  if (aggregatedItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color={Colors.light.tint} />
        <ThemedText style={styles.emptyTitle}>No shopping items yet</ThemedText>
        <ThemedText style={styles.emptyText}>
          Add items to your shopping lists to see them here!
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={[...pendingItems, ...completedItems]}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.name}_${item.unit || 'no-unit'}`}
      contentContainerStyle={styles.listContainer}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        aggregatedItems.length > 0 ? (
          <View style={styles.summary}>
            <ThemedText style={styles.summaryText}>
              {pendingItems.length} items remaining • {completedItems.length} completed
            </ThemedText>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  completedItem: {
    opacity: 0.6,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fcf45a',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1d7b86',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  summary: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
}); 