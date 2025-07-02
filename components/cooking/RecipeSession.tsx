import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderWithProfile } from '../HeaderWithProfile';

const { width: screenWidth } = Dimensions.get('window');

export function RecipeSession() {
  const params = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Get recipe data from params or use sample recipe as fallback
  const recipe = params.recipeId ? {
    id: params.recipeId as string,
    name: params.recipeName as string || 'Recipe',
    description: params.recipeDescription as string || '',
    totalTime: params.recipeTotalTime as string || '30 minutes',
    servings: parseInt(params.recipeServings as string) || 2,
    instructions: params.recipeInstructions ? JSON.parse(params.recipeInstructions as string) : []
  } : null;

  const handleStartSession = () => {
    setSessionActive(true);
    setCurrentStep(1);
    setCompletedSteps([]);
  };

  const handleCompleteStep = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps(prev => [...prev, stepNumber]);
      
      // Auto-advance to next step
      const nextStep = stepNumber + 1;
      if (nextStep <= getTotalSteps()) {
        setCurrentStep(nextStep);
        // Scroll to next step
        flatListRef.current?.scrollToIndex({
          index: nextStep - 1,
          animated: true,
        });
      }
    }
  };

  const handleCompleteSession = () => {
    setSessionActive(false);
    setCurrentStep(1);
    setCompletedSteps([]);
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

  const renderStep = ({ item, index }: { item: string; index: number }) => {
    const stepNumber = index + 1;
    const isCompleted = completedSteps.includes(stepNumber);
    const isCurrent = stepNumber === currentStep;
    
    return (
      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCard,
          isCurrent && styles.currentStepCard,
          isCompleted && styles.completedStepCard
        ]}>
          <View style={styles.stepHeader}>
            {isCompleted ? (
              <Ionicons name="checkmark-circle" size={32} color="#27ae60" />
            ) : (
              <View style={styles.stepNumberContainer}>
                <Text style={[
                  styles.stepNumber,
                  isCurrent && styles.currentStepNumber
                ]}>
                  {stepNumber}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={[
            styles.stepTitle,
            isCurrent && styles.currentStepTitle,
            isCompleted && styles.completedStepTitle
          ]}>
            Step {stepNumber}
          </Text>
          
          <Text style={[
            styles.stepDescription,
            isCurrent && styles.currentStepDescription
          ]}>
            {item}
          </Text>
          
          {isCurrent && !isCompleted && (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => handleCompleteStep(stepNumber)}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.completeButtonText}>Complete Step</Text>
            </TouchableOpacity>
          )}
          
          {isCompleted && (
            <View style={styles.completedIndicator}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
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

      {/* Progress */}
      {hasInstructions() && (
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            Step {currentStep} of {getTotalSteps()} ({getProgress()}%)
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
          </View>
        </View>
      )}

      {/* Horizontal Steps FlatList */}
      {hasInstructions() && (
        <View style={styles.stepsContainer}>
          <FlatList
            ref={flatListRef}
            data={recipe.instructions}
            renderItem={renderStep}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={screenWidth - 40}
            decelerationRate="fast"
            contentContainerStyle={styles.flatListContent}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 40));
              setCurrentStep(index + 1);
            }}
          />
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
    color: '#facf45',
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
  progressSection: {
    padding: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fcf45a',
    borderRadius: 4,
  },
  stepsContainer: {
    flex: 1,
    marginTop: 20,
  },
  flatListContent: {
    paddingHorizontal: 20,
  },
  stepContainer: {
    width: screenWidth - 40,
    paddingHorizontal: 10,
  },
  stepCard: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 24,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  currentStepCard: {
    borderWidth: 3,
    borderColor: '#fcf45a',
  },
  completedStepCard: {
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumberContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentStepNumber: {
    color: '#fcf45a',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  currentStepTitle: {
    color: '#fcf45a',
  },
  completedStepTitle: {
    color: '#27ae60',
  },
  stepDescription: {
    fontSize: 24,
    color: '#fff',
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
    flex: 1,
  },
  currentStepDescription: {
    opacity: 1,
  },
  completeButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 'auto',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  completedIndicator: {
    backgroundColor: '#27ae60',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  completedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
}); 