import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import StyledTitle from '../../../components/StyledTitle';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import {
    addShoppingListItem,
    deleteShoppingListItem,
    getShoppingListItems,
    updateShoppingListItem,
    type ShoppingListItem
} from '../../../services/shopping';

export default function ShoppingListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken } = useAuth();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: '',
  });
  const [adding, setAdding] = useState(false);

  const fetchItems = async () => {
    if (!id) return;
    
    const token = await getToken();
    if (!token) return;
    
    try {
      const shoppingItems = await getShoppingListItems(token, id);
      setItems(shoppingItems);
    } catch (error) {
      console.error('Error fetching shopping list items:', error);
      Alert.alert('Error', 'Failed to load shopping list items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [id]);

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.quantity.trim() || !id) return;
    
    const token = await getToken();
    if (!token) return;

    setAdding(true);
    try {
      const addedItem = await addShoppingListItem(
        token, 
        id, 
        newItem.name.trim(), 
        newItem.quantity.trim(), 
        newItem.unit.trim() || undefined, 
        newItem.category.trim() || undefined
      );
      setItems(prev => [addedItem, ...prev]);
      setNewItem({ name: '', quantity: '', unit: '', category: '' });
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleItem = async (item: ShoppingListItem) => {
    const token = await getToken();
    if (!token) return;

    try {
      await updateShoppingListItem(token, item.id, { isCompleted: !item.isCompleted });
      setItems(prev => 
        prev.map(i => 
          i.id === item.id ? { ...i, isCompleted: !i.isCompleted } : i
        )
      );
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = (item: ShoppingListItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const token = await getToken();
            if (!token) return;
            
            try {
              await deleteShoppingListItem(token, item.id);
              setItems(prev => prev.filter(i => i.id !== item.id));
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const completedItems = items.filter(item => item.isCompleted);
  const pendingItems = items.filter(item => !item.isCompleted);

  const renderItem = ({ item }: { item: ShoppingListItem }) => (
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
            {item.quantity}{item.unit ? ` ${item.unit}` : ''}
            {item.category ? ` • ${item.category}` : ''}
          </ThemedText>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText style={styles.loadingText}>Loading shopping list...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color={Colors.light.tint} />
        </TouchableOpacity>
        <StyledTitle title="Shopping List" />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={Colors.light.tint} />
          <ThemedText style={styles.emptyTitle}>No items yet</ThemedText>
          <ThemedText style={styles.emptyText}>
            Add your first item to get started!
          </ThemedText>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => setModalVisible(true)}
          >
            <ThemedText style={styles.addFirstButtonText}>Add Item</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[...pendingItems, ...completedItems]}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            items.length > 0 ? (
              <View style={styles.summary}>
                <ThemedText style={styles.summaryText}>
                  {pendingItems.length} items remaining • {completedItems.length} completed
                </ThemedText>
              </View>
            ) : null
          }
        />
      )}

      {/* Add Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add Item</ThemedText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.light.tint} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Item name..."
              placeholderTextColor="#666"
              value={newItem.name}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, name: text }))}
              autoFocus
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.quantityInput]}
                placeholder="Quantity..."
                placeholderTextColor="#666"
                value={newItem.quantity}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, quantity: text }))}
              />
              <TextInput
                style={[styles.input, styles.unitInput]}
                placeholder="Unit (optional)..."
                placeholderTextColor="#666"
                value={newItem.unit}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, unit: text }))}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Category (optional)..."
              placeholderTextColor="#666"
              value={newItem.category}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, category: text }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addItemButton,
                  (!newItem.name.trim() || !newItem.quantity.trim() || adding) && styles.addButtonDisabled
                ]}
                onPress={handleAddItem}
                disabled={!newItem.name.trim() || !newItem.quantity.trim() || adding}
              >
                {adding ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <ThemedText style={styles.addButtonText}>Add</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    marginBottom: 0,
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  summary: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedItem: {
    opacity: 0.6,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    padding: 16,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInput: {
    flex: 1,
  },
  unitInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  addItemButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 