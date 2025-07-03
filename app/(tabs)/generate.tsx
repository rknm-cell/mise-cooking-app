"use client";

import { HeaderWithProfile } from '@/components';
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

// Flexible API configuration
const API_BASE = __DEV__ 
  ? 'http://localhost:8080'  // Local development
  : 'https://mise-cooking-app-production.up.railway.app'; // Production

export default function RecipeGenerator() {
  const [generation, setGeneration] = useState<RecipeSchema | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput(''); // Clear input immediately
    
    try {
      setGeneration(undefined);
      setIsLoading(true);
      
      // Start the progress bar animation
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 10000, // 10 seconds
        useNativeDriver: false,
      }).start();
      
      // Build the conversation context
      const messages = [
        ...conversationHistory,
        { role: 'user' as const, content: userMessage }
      ];
      
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage,
          conversationHistory: messages,
        }),
      });

      const recipeData: RecipeSchema = await response.json();
      setGeneration(recipeData);
      
      // Update conversation history
      const assistantMessage = `Generated recipe: ${recipeData.name} - ${recipeData.description}`;
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      ]);
      
      console.log('recipedata: ', recipeData);
      setIsLoading(false);
    } catch (error) {
      const e = error as Error;
      Alert.alert('Error', e.message || 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setGeneration(undefined);
  };

  const renderRecipe = (recipe: RecipeSchema) => (
    <View style={styles.recipeContainer}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle}>{recipe.name}</Text>
        {conversationHistory.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearConversation}>
            <Ionicons name="refresh" size={20} color="#fcf45a" />
          </TouchableOpacity>
        )}
      </View>
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
      
      {conversationHistory.length > 0 && (
        <View style={styles.conversationIndicator}>
          <Text style={styles.conversationText}>
            💬 Conversation context active ({conversationHistory.length / 2} exchanges)
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HeaderWithProfile 
          title="Recipe Generator" 
          subtitle="What do you want to make?" 
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={conversationHistory.length > 0 
              ? "Ask a follow-up question or request modifications..." 
              : "Enter your ingredients or recipe idea..."
            }
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
            <ActivityIndicator size="large" color="#fcf45a" />
            <Text style={styles.loadingText}>Generating your recipe...</Text>
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
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
    backgroundColor: '#1d7b86',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#426b70',
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
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginRight: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#1d7b86',
  },
  submitButton: {
    backgroundColor: '#fcf45a',
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
    color: '#fff',
    opacity: 0.9,
  },
  recipeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d7b86',
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
    color: '#1d7b86',
    marginTop: 20,
    marginBottom: 10,
  },
  ingredient: {
    fontSize: 16,
    color: '#1d7b86',
    marginBottom: 4,
    lineHeight: 22,
  },
  instruction: {
    fontSize: 16,
    color: '#1d7b86',
    marginBottom: 8,
    lineHeight: 22,
  },
  storage: {
    fontSize: 16,
    color: '#1d7b86',
    lineHeight: 22,
  },
  nutrition: {
    fontSize: 16,
    color: '#1d7b86',
    marginBottom: 4,
    lineHeight: 22,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fcf45a',
    borderRadius: 2,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clearButton: {
    padding: 8,
    marginTop: 4,
  },
  conversationIndicator: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(252, 244, 90, 0.2)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#fcf45a',
  },
  conversationText: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
  },
});
