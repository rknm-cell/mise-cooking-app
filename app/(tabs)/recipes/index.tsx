import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockRecipes = [
  {
    id: '1',
    title: 'Chicken Stir Fry',
    cuisine: 'Asian',
    time: '25 min',
    difficulty: 'Easy',
  },
  {
    id: '2',
    title: 'Pasta Carbonara',
    cuisine: 'Italian',
    time: '20 min',
    difficulty: 'Medium',
  },
  {
    id: '3',
    title: 'Vegetable Curry',
    cuisine: 'Indian',
    time: '35 min',
    difficulty: 'Easy',
  },
];

export default function RecipesScreen() {
  const renderRecipe = ({ item }: { item: typeof mockRecipes[0] }) => (
    <TouchableOpacity style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Ionicons name="heart" size={20} color="#ff6b6b" />
      </View>
      <View style={styles.recipeDetails}>
        <Text style={styles.cuisine}>{item.cuisine}</Text>
        <Text style={styles.time}>{item.time}</Text>
        <Text style={styles.difficulty}>{item.difficulty}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={mockRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  recipeDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  cuisine: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  difficulty: {
    fontSize: 14,
    color: '#666',
  },
});
