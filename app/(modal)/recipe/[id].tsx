import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookmarkButton, StartCookingButton } from '../../../components';
import { API_CONFIG } from '../../../constants/Config';
import { useAuth } from '../../../contexts/AuthContext';

interface Recipe {
  id: string;
  name: string;
  description: string;
  totalTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  storage: string;
  nutrition: string[];
  createdAt: string;
}

// Use centralized API configuration
const API_BASE = API_CONFIG.BASE_URL;

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [generatingList, setGeneratingList] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchRecipe = async () => {
    if (!id) {
      setError('Recipe ID is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/recipes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data);
        
        // Check bookmark status if user is logged in
        if (user) {
          const bookmarkResponse = await fetch(`${API_BASE}/api/bookmarks/${user.id}/${id}`);
          if (bookmarkResponse.ok) {
            const isBookmarked = await bookmarkResponse.json();
            setIsBookmarked(isBookmarked);
          }
        }
      } else if (response.status === 404) {
        setError('Recipe not found');
      } else {
        setError('Failed to load recipe');
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setError('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
    
    // Animate in with scale effect
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [id]);

  const handleBackPress = () => {
    // Animate out before closing
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const handleGenerateShoppingList = async () => {
    if (!recipe) return;
    
    if (!showCheckboxes) {
      // First press: show checkboxes with all ingredients pre-selected
      setShowCheckboxes(true);
      setSelectedIngredients(new Set(recipe.ingredients.map((_, index) => index)));
      return;
    }
    
    // Second press: generate shopping list with selected ingredients
    if (!user) {
      Alert.alert('Error', 'Please log in to create shopping lists');
      return;
    }

    setGeneratingList(true);
    try {
      const listName = `Shopping for ${recipe.name}`;
      
      // Create shopping list manually with selected ingredients
      const { createShoppingList, addShoppingListItem } = await import('../../../services/shopping');
      console.log('Creating shopping list:', listName);
      const newList = await createShoppingList(user.id, listName);
      console.log('Created shopping list:', newList);
      
      // Add selected ingredients to the list
      const selectedIngredientList = Array.from(selectedIngredients).map(index => recipe.ingredients[index]);
      console.log('Selected ingredients:', selectedIngredientList);
      for (const ingredient of selectedIngredientList) {
        console.log('Adding ingredient:', ingredient);
        await addShoppingListItem(newList.id, ingredient, '1', undefined, 'Ingredients');
      }
      
      Alert.alert(
        'Success!', 
        `Shopping list "${listName}" created with ${selectedIngredients.size} items!`,
        [
          { text: 'OK' },
          { 
            text: 'View List', 
            onPress: () => router.push(`/shopping`)
          }
        ]
      );
      // Reset to initial state
      setShowCheckboxes(false);
      setSelectedIngredients(new Set());
    } catch (error) {
      console.error('Error generating shopping list:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to generate shopping list: ${errorMessage}`);
    } finally {
      setGeneratingList(false);
    }
  };

  const handleIngredientToggle = (index: number) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIngredients(newSelected);
  };

  const handleCancelSelection = () => {
    setShowCheckboxes(false);
    setSelectedIngredients(new Set());
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fcf45a" />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#fcf45a" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error || 'Recipe not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#fcf45a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recipe Details</Text>
          {/*bookmark icon solid yellow when bookmarked, otherwise outline yellow*/} 
          <BookmarkButton recipeId={id} size={24} initialIsBookmarked={isBookmarked} color="#fcf45a" activeColor="#fcf45a" />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.recipeContainer}>
            {/* Recipe Header Card */}
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>{recipe.name}</Text>
              </View>
                <Text style={styles.description}>{recipe.description}</Text>

              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={16} color="#fcf45a" />
                  <Text style={styles.metaText}>{recipe.totalTime}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="people" size={16} color="#fcf45a" />
                  <Text style={styles.metaText}>{recipe.servings} servings</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="list" size={16} color="#fcf45a" />
                  <Text style={styles.metaText}>{recipe.instructions.length} steps</Text>
                </View>
              </View>

              {/* Start Cooking Button */}
              <View style={styles.actions}>
                <StartCookingButton recipe={recipe} size="large" />
              </View>
            </View>

            {/* Ingredients Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {recipe.ingredients.map((ingredient, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.ingredientItemContainer}
                  onPress={() => showCheckboxes && handleIngredientToggle(index)}
                  disabled={!showCheckboxes}
                >
                  {showCheckboxes && (
                    <View style={styles.checkbox}>
                      <Ionicons
                        name={selectedIngredients.has(index) ? "checkbox" : "square-outline"}
                        size={20}
                        color={selectedIngredients.has(index) ? "#fcf45a" : "#1d7b86"}
                      />
                    </View>
                  )}
                  <Text style={[
                    styles.ingredientItem,
                    showCheckboxes && styles.ingredientItemWithCheckbox
                  ]}>
                    {!showCheckboxes && '• '}{ingredient}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <View style={styles.buttonContainer}>
                {showCheckboxes && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelSelection}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                {/*horizontally align the buttons*/}
                <TouchableOpacity
                  style={[
                    styles.generateListButton,
                    showCheckboxes && styles.generateListButtonSelected
                  ]}
                  onPress={handleGenerateShoppingList}
                  disabled={generatingList}
                >
                  {generatingList ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="cart-outline" size={20} color="#1d7b86" />
                      <Text style={styles.generateListButtonText}>
                        {showCheckboxes ? `Add ${selectedIngredients.size} Items` : 'Add to Shopping List'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Instructions Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>

            {/* Storage Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Storage</Text>
              <Text style={styles.storageText}>{recipe.storage}</Text>
            </View>

            {/* Nutrition Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Nutrition</Text>
              {recipe.nutrition.map((item, index) => (
                <Text key={index} style={styles.nutritionItem}>• {item}</Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d7b86',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1d7b86',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1d7b86',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fcf45a',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  recipeContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1d7b86',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 6,
    opacity: 0.8,
  },
  actions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  ingredientItem: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fcf45a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1d7b86',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  storageText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  nutritionItem: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 8,
  },
  animatedContainer: {
    flex: 1,
  },
  generateListButton: {
    backgroundColor: '#fcf45a',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  generateListButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d7b86',
    marginLeft: 8,
  },
  ingredientItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 12,
    padding: 4,
  },
  ingredientItemWithCheckbox: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fcf45a',
  },
  generateListButtonSelected: {
    flex: 1,
  },
});
