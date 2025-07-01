import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

// Flexible API configuration
const API_BASE = __DEV__ 
  ? 'http://localhost:8080'  // Local development
  : 'https://mise-cooking-app-production.up.railway.app'; // Production

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#428a93" />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
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
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recipe Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.recipeContainer}>
            <Text style={styles.recipeTitle}>{recipe.name}</Text>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
            
            <View style={styles.recipeInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color="#428a93" />
                <Text style={styles.infoText}>{recipe.totalTime}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={20} color="#428a93" />
                <Text style={styles.infoText}>{recipe.servings} servings</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Storage</Text>
              <Text style={styles.storageText}>{recipe.storage}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition</Text>
              {recipe.nutrition.map((item, index) => (
                <View key={index} style={styles.nutritionItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.nutritionText}>{item}</Text>
                </View>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
    color: '#666',
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
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#428a93',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  recipeContainer: {
    padding: 20,
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  recipeInfo: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#428a93',
    marginTop: 8,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#428a93',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  storageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nutritionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  animatedContainer: {
    flex: 1,
  },
});
