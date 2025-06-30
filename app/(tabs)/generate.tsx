"use client";

import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RecipeSchema {
  id: string;
  name: string;
  description: string;
  totalTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  storage: string;
  nutrition: string[];
}

export default function RecipeGenerator() {
  const [generation, setGeneration] = useState<RecipeSchema | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    try {
      setGeneration(undefined);
      setIsLoading(true);
      
      const response = await fetch('https://mise-cooking-app-production.up.railway.app/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
        }),
      });

      const recipeData: RecipeSchema = await response.json();
      setGeneration(recipeData);
      console.log('recipedata: ', recipeData);
      setIsLoading(false);
    } catch (error) {
      const e = error as Error;
      Alert.alert('Error', e.message || 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  const renderRecipe = (recipe: RecipeSchema) => (
    <View style={styles.recipeContainer}>
      <Text style={styles.recipeTitle}>{recipe.name}</Text>
      <Text style={styles.recipeDescription}>{recipe.description}</Text>
      
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeInfoText}>⏱️ {recipe.totalTime}</Text>
        <Text style={styles.recipeInfoText}>👥 {recipe.servings} servings</Text>
      </View>

      <Text style={styles.sectionTitle}>Ingredients:</Text>
      {recipe.ingredients.map((ingredient, index) => (
        <Text key={index} style={styles.ingredient}>• {ingredient}</Text>
      ))}

      <Text style={styles.sectionTitle}>Instructions:</Text>
      {recipe.instructions.map((instruction, index) => (
        <Text key={index} style={styles.instruction}>{index + 1}. {instruction}</Text>
      ))}

      <Text style={styles.sectionTitle}>Storage:</Text>
      <Text style={styles.storage}>{recipe.storage}</Text>

      <Text style={styles.sectionTitle}>Nutrition:</Text>
      {recipe.nutrition.map((item, index) => (
        <Text key={index} style={styles.nutrition}>• {item}</Text>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Recipe Generator</Text>
          <Text style={styles.subtitle}>What do you want to make?</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Enter your ingredients or recipe idea..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.submitButton, (!input.trim() || isLoading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="restaurant" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#428a93" />
            <Text style={styles.loadingText}>Generating your recipe...</Text>
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  {
                    width: useRef(new Animated.Value(0)).current.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          </View>
        )}

        {generation && renderRecipe(generation)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#428a93',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  recipeContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  recipeInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  recipeInfoText: {
    fontSize: 14,
    color: '#666',
    marginRight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  ingredient: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    lineHeight: 22,
  },
  instruction: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  storage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  nutrition: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    lineHeight: 22,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#428a93',
    borderRadius: 2,
  },
});
