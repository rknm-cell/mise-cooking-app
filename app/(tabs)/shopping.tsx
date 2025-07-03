import { HeaderWithProfile } from '@/components';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText, ThemedView } from '../../components';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import {
  createShoppingList,
  deleteShoppingList,
  getShoppingLists,
  type ShoppingList
} from '../../services/shopping';

export default function ShoppingScreen() {
  const { getToken } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchLists = async () => {
    const token = await getToken();
    if (!token) return;
    
    try {
      const shoppingLists = await getShoppingLists(token);
      setLists(shoppingLists);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      Alert.alert('Error', 'Failed to load shopping lists');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    const token = await getToken();
    if (!token) return;

    setCreating(true);
    try {
      const newList = await createShoppingList(token, newListName.trim());
      setLists(prev => [newList, ...prev]);
      setNewListName('');
      setModalVisible(false);
      Alert.alert('Success', 'Shopping list created!');
    } catch (error) {
      console.error('Error creating shopping list:', error);
      Alert.alert('Error', 'Failed to create shopping list');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = (list: ShoppingList) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const token = await getToken();
            if (!token) return;
            
            try {
              await deleteShoppingList(token, list.id);
              setLists(prev => prev.filter(l => l.id !== list.id));
              Alert.alert('Success', 'Shopping list deleted!');
            } catch (error) {
              console.error('Error deleting shopping list:', error);
              Alert.alert('Error', 'Failed to delete shopping list');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLists();
  };

  const renderList = ({ item }: { item: ShoppingList }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        // Navigate to list detail screen
        router.push(`/shopping/${item.id}`);
      }}
    >
      <View style={styles.listContent}>
        <View style={styles.listInfo}>
          <ThemedText style={styles.listName}>{item.name}</ThemedText>
          <ThemedText style={styles.listDate}>
            Created {new Date(item.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={styles.listActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteList(item)}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.light.tint} />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color={Colors.light.tint} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText style={styles.loadingText}>Loading shopping lists...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <View style={styles.header}>
        <HeaderWithProfile title="Shopping Lists" />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={Colors.light.tint} />
          <ThemedText style={styles.emptyTitle}>No shopping lists yet</ThemedText>
          <ThemedText style={styles.emptyText}>
            Create your first shopping list to get started!
          </ThemedText>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => setModalVisible(true)}
          >
            <ThemedText style={styles.createFirstButtonText}>Create List</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lists}
          renderItem={renderList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Create New List</ThemedText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.light.tint} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter list name..."
              placeholderTextColor="#666"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
              maxLength={50}
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
                  styles.createButton,
                  (!newListName.trim() || creating) && styles.createButtonDisabled
                ]}
                onPress={handleCreateList}
                disabled={!newListName.trim() || creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <ThemedText style={styles.createButtonText}>Create</ThemedText>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 0,
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#fcf45a',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
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
  createFirstButton: {
    backgroundColor: '#fcf45a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: '#1d7b86',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  listContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1d7b86',
  },
  listDate: {
    fontSize: 14,
    color: '#666',
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    width: '85%',
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
    color: '#1d7b86',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#1d7b86',
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
  createButton: {
    backgroundColor: '#fcf45a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(252, 244, 90, 0.5)',
  },
  createButtonText: {
    color: '#1d7b86',
    fontSize: 16,
    fontWeight: '600',
  },
}); 