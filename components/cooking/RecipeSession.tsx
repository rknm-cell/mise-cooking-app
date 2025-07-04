import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ttsService } from '../../services/text-to-speech';
import { HeaderWithProfile } from '../navigation/HeaderWithProfile';
import { CookingChat } from './CookingChat';
import { Timer } from './Timer';
import { TTSControls } from './TTSControls';



interface ActiveTimer {
  id: string;
  duration: number;
  description: string;
  stage: string;
}

export function RecipeSession() {
  const params = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);

  // Get recipe data from params or use sample recipe as fallback
  const recipe = params.recipeId ? {
    id: params.recipeId as string,
    name: params.recipeName as string || 'Recipe',
    description: params.recipeDescription as string || '',
    totalTime: params.recipeTotalTime as string || '30 minutes',
    servings: parseInt(params.recipeServings as string) || 2,
    instructions: params.recipeInstructions ? JSON.parse(params.recipeInstructions as string) : []
  } : null;

  const handleStartSession = async () => {
    setSessionActive(true);
    setCurrentStep(1);
    setCompletedSteps([]);
    
    // Speak session start announcement
    if (recipe) {
      try {
        await ttsService.speakSessionStart(recipe.name);
      } catch (error) {
        console.error('Error speaking session start:', error);
      }
    }
  };

  const handleCompleteStep = async (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps(prev => [...prev, stepNumber]);
      
      // Speak step completion
      try {
        await ttsService.speakStepComplete(stepNumber);
      } catch (error) {
        console.error('Error speaking step completion:', error);
      }
      
      // Auto-advance to next step
      const nextStep = stepNumber + 1;
      if (nextStep <= getTotalSteps()) {
        setCurrentStep(nextStep);
      }
    }
  };

  const handleCompleteSession = async () => {
    // Speak session completion
    try {
      await ttsService.speakSessionComplete();
    } catch (error) {
      console.error('Error speaking session completion:', error);
    }
    
    setSessionActive(false);
    setCurrentStep(1);
    setCompletedSteps([]);
    setActiveTimers([]);
  };

  const handleCreateTimer = (timer: { duration: number; description: string; stage: string }) => {
    const newTimer: ActiveTimer = {
      id: Date.now().toString(),
      duration: timer.duration,
      description: timer.description,
      stage: timer.stage,
    };
    setActiveTimers(prev => [...prev, newTimer]);
  };

  const handleTimerComplete = async (timerId: string) => {
    // Find the timer to get its description
    const timer = activeTimers.find(t => t.id === timerId);
    if (timer) {
      try {
        await ttsService.speakTimerNotification(timer.description);
      } catch (error) {
        console.error('Error speaking timer notification:', error);
      }
    }
    
    setActiveTimers(prev => prev.filter(timer => timer.id !== timerId));
  };

  const handleTimerStop = (timerId: string) => {
    setActiveTimers(prev => prev.filter(timer => timer.id !== timerId));
  };

  const handleNavigateToRecipes = () => {
    router.push('/(tabs)/recipes');
  };

  const getProgress = () => {
    if (!recipe) return 0;
    return Math.round((completedSteps.length / recipe.instructions.length) * 100);
  };

  const getCurrentStepData = () => {
    if (!recipe) return '';
    return recipe.instructions[currentStep - 1];
  };

  const getTotalSteps = () => {
    if (!recipe) return 0;
    return recipe.instructions.length;
  };

  const hasInstructions = () => {
    return recipe && recipe.instructions && recipe.instructions.length > 0;
  };

  // Handle case when no recipe is selected
  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithProfile title="Recipe Session" subtitle="Choose a recipe" />
        
        <View style={styles.noRecipeSection}>
          <View style={styles.noRecipeCard}>
            <Ionicons name="restaurant-outline" size={64} color="#fcf45a" />
            <Text style={styles.noRecipeTitle}>Pick a Recipe</Text>
            <Text style={styles.noRecipeSubtitle}>
              Choose a recipe and let's get started cooking!
            </Text>
            <TouchableOpacity style={styles.browseRecipesButton} onPress={handleNavigateToRecipes}>
              <Ionicons name="list" size={20} color="#fff" />
              <Text style={styles.browseRecipesText}>Browse Recipes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderCurrentStep = () => {
    if (!recipe || !hasInstructions()) return null;
    
    const currentStepData = recipe.instructions[currentStep - 1];
    const canGoBack = currentStep > 1;
    const canGoForward = currentStep < getTotalSteps();
    
    return (
      <View style={styles.currentStepContainer}>
        <View style={styles.currentStepCard}>
          {/* Back Navigation Overlay */}
          <TouchableOpacity 
            style={[styles.navOverlay, styles.navOverlayLeft]}
            onPress={() => canGoBack && setCurrentStep(currentStep - 1)}
            disabled={!canGoBack}
          >
            {canGoBack && (
              <View style={styles.navButton}>
                <Ionicons name="chevron-back" size={24} color="#fcf45a" />
              </View>
            )}
          </TouchableOpacity>
          
          {/* Step Content */}
          <View style={styles.stepContent}>
            <Text style={styles.stepNumber}>Step {currentStep}</Text>
            <Text style={styles.stepDescription}>
              {currentStepData}
            </Text>
          </View>
          
          {/* Forward Navigation Overlay */}
          <TouchableOpacity 
            style={[styles.navOverlay, styles.navOverlayRight]}
            onPress={() => canGoForward && setCurrentStep(currentStep + 1)}
            disabled={!canGoForward}
          >
            {canGoForward && (
              <View style={styles.navButton}>
                <Ionicons name="chevron-forward" size={24} color="#fcf45a" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!sessionActive) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithProfile title="Recipe Session" subtitle={recipe.name} />
        
        <View style={styles.startSection}>
          <View style={styles.startCard}>
            <Ionicons name="restaurant" size={48} color="#fcf45a" />
            <Text style={styles.startTitle}>Ready to Cook?</Text>
            <Text style={styles.startSubtitle}>
              Start a cooking session for {recipe.name}
            </Text>
            <Text style={styles.recipeInfo}>
              {recipe.totalTime} • {recipe.servings} servings
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.startButtonText}>Start Cooking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithProfile title="Cooking Session" subtitle={recipe.name} />



      {/* TTS Controls */}
      {hasInstructions() && sessionActive && (
        <TTSControls
          currentStep={currentStep}
          stepDescription={getCurrentStepData()}
          totalSteps={getTotalSteps()}
        />
      )}

      {/* Current Step Display */}
      {hasInstructions() && renderCurrentStep()}

      {/* Active Timers */}
      {activeTimers.length > 0 && (
        <View style={styles.timersSection}>
          <Text style={styles.timersTitle}>Active Timers</Text>
          {activeTimers.map((timer) => (
            <Timer
              key={timer.id}
              duration={timer.duration}
              description={timer.description}
              stage={timer.stage}
              onComplete={() => handleTimerComplete(timer.id)}
              onStop={() => handleTimerStop(timer.id)}
            />
          ))}
        </View>
      )}

      {/* Complete Session */}
      {hasInstructions() && completedSteps.length === getTotalSteps() && (
        <View style={styles.completeSection}>
          <TouchableOpacity style={styles.completeSessionButton} onPress={handleCompleteSession}>
            <Ionicons name="trophy" size={20} color="#fff" />
            <Text style={styles.completeSessionText}>Complete Session</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* No Instructions State */}
      {!hasInstructions() && (
        <View style={styles.noInstructionsSection}>
          <Text style={styles.noInstructionsText}>
            No cooking instructions available for this recipe.
          </Text>
        </View>
      )}

      {/* Cooking Chat Assistant */}
      {sessionActive && hasInstructions() && (
        <CookingChat
          recipeId={recipe.id}
          recipeName={recipe.name}
          recipeDescription={recipe.description}
          currentStep={currentStep}
          totalSteps={getTotalSteps()}
          currentStepDescription={getCurrentStepData()}
          completedSteps={completedSteps}
          onTimerCreate={handleCreateTimer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d7b86',
  },
  startSection: {
    padding: 20,
  },
  startCard: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  startSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  recipeInfo: {
    fontSize: 14,
    color: '#fcf45a',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#fcf45a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#1d7b86',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },

  currentStepContainer: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  currentStepCard: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 24,
    flex: 1,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  navOverlayLeft: {
    left: 0,
  },
  navOverlayRight: {
    right: 0,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(252, 244, 90, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fcf45a',
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fcf45a',
    marginBottom: 16,
    textAlign: 'center',
  },



  stepDescription: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 'auto',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  completeSection: {
    padding: 20,
    paddingBottom: 40,
  },
  completeSessionButton: {
    backgroundColor: '#fcf45a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  completeSessionText: {
    color: '#1d7b86',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  noInstructionsSection: {
    padding: 20,
    alignItems: 'center',
  },
  noInstructionsText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  noRecipeSection: {
    padding: 20,
    alignItems: 'center',
  },
  noRecipeCard: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  noRecipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  noRecipeSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  browseRecipesButton: {
    backgroundColor: '#fcf45a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  browseRecipesText: {
    color: '#1d7b86',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  timersSection: {
    padding: 20,
    paddingBottom: 10,
  },
  timersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
}); 