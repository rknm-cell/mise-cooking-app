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
import { API_CONFIG } from '../../constants/Config';

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
  conversationContext?: string;
  isModification?: boolean;
}

// Use centralized API configuration
const API_BASE = API_CONFIG.BASE_URL;

export default function RecipeGenerator() {
  const [generation, setGeneration] = useState<RecipeSchema | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'none' | 'saved' | 'error'>('none');
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput(''); // Clear input immediately
    
    try {
      setGeneration(undefined);
      setIsLoading(true);
      setSaveStatus('none');
      
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
      
      // Update conversation history with modification context
      const assistantMessage = recipeData.isModification 
        ? `Modified recipe: ${recipeData.name} - ${recipeData.description}`
        : `Generated recipe: ${recipeData.name} - ${recipeData.description}`;
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
    setSaveStatus('none');
  };

  const saveRecipe = async (recipe: RecipeSchema) => {
    if (!recipe) return;
    
    setIsSaving(true);
    setSaveStatus('none');
    
    try {
      const response = await fetch(`${API_BASE}/api/recipes/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });

      const result = await response.json();
      
      if (result.success) {
        setSaveStatus('saved');
        Alert.alert('Success', 'Recipe saved successfully!');
      } else {
        setSaveStatus('error');
        Alert.alert('Error', result.error || 'Failed to save recipe');
      }
    } catch (error) {
      setSaveStatus('error');
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderRecipe = (recipe: RecipeSchema) => (
    <View style={styles.recipeContainer}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle}>
          {recipe.name}
          
        </Text>
        {conversationHistory.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearConversation}>
            <Ionicons name="refresh" size={20} color="#fcf45a" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.recipeDescription}>{recipe.description}</Text>
      
      
      
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeInfoText}> {recipe.totalTime}</Text>
        <Text style={styles.recipeInfoText}> {recipe.servings} servings</Text>
      </View>

      {/* Recipe Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.startSessionButton]}
          onPress={() => {
            // TODO: Implement start session logic
            Alert.alert(
              'Start Cooking',
              'Starting a new cooking session...',
              [{ text: 'OK', style: 'default' }]
            );
          }}
        >
          <Ionicons name="play-circle" size={16} color="#1d7b86" />
          <Text style={styles.startSessionButtonText}>Start Recipe Session</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.actionButtonsContainer, styles.secondaryButtonsContainer]}>
        {saveStatus === 'none' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={() => saveRecipe(recipe)}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="bookmark" size={16} color="#1d7b86" />
                  <Text style={styles.saveButtonText}>Save Recipe</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.keepButton]}
              onPress={() => {
                Alert.alert(
                  'Keep Recipe',
                  'This recipe will be kept in your current session but not saved to your collection. You can always save it later.',
                  [{ text: 'OK', style: 'default' }]
                );
              }}
            >
              <Ionicons name="checkmark-circle" size={16} color="#1d7b86" />
              <Text style={styles.keepButtonText}>Keep for Now</Text>
            </TouchableOpacity>
          </>
        )}
        
        {saveStatus === 'saved' && (
          <View style={styles.savedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.savedText}>Recipe Saved!</Text>
          </View>
        )}
        
        {saveStatus === 'error' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={() => saveRecipe(recipe)}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>Retry Save</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: '#1d7b86',
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
    backgroundColor: '#1d7b86',
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
    color: '#fcf45a',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    lineHeight: 24,
  },
  recipeInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  recipeInfoText: {
    fontSize: 14,
    color: '#fff',
    marginRight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  ingredient: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
    lineHeight: 22,
  },
  instruction: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    lineHeight: 22,
  },
  storage: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  nutrition: {
    fontSize: 16,
    color: '#fff',
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
  modificationBadge: {
    fontSize: 16,
    color: '#fcf45a',
    fontWeight: '600',
  },
  contextContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(252, 244, 90, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#fcf45a',
  },
  contextText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  // Action buttons styles
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  saveButtonText: {
    color: '#1d7b86',
    fontSize: 16,
    fontWeight: '600',
  },
  
  keepButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#1d7b86',
  },
  keepButtonText: {
    color: '#1d7b86',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    gap: 8,
  },
  savedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  startSessionButton: {
    backgroundColor: '#fcf45a',
    flex: 1,
  },
  startSessionButtonText: {
    color: '#1d7b86',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonsContainer: {
    marginBottom: 20,
  },
});
