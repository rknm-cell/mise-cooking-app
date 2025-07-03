import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CookingChat } from '../../components/cooking/CookingChat';
import { HeaderWithProfile } from '../../components/navigation/HeaderWithProfile';
import { sampleRecipe } from '../../data/sampleRecipe';

export default function CookingChatTestScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sessionActive, setSessionActive] = useState(false);

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
      if (nextStep <= sampleRecipe.instructions.length) {
        setCurrentStep(nextStep);
      }
    }
  };

  const getCurrentStepDescription = () => {
    return sampleRecipe.instructions[currentStep - 1] || '';
  };

  const getProgress = () => {
    return Math.round((completedSteps.length / sampleRecipe.instructions.length) * 100);
  };

  if (!sessionActive) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithProfile title="Cooking Chat Test" subtitle="Test AI Assistant" />
        
        <View style={styles.startSection}>
          <View style={styles.startCard}>
            <Text style={styles.startTitle}>Test Cooking Chat</Text>
            <Text style={styles.startSubtitle}>
              Start a test session with {sampleRecipe.name}
            </Text>
            <Text style={styles.recipeInfo}>
              {sampleRecipe.totalTime} • {sampleRecipe.servings} servings
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
              <Text style={styles.startButtonText}>Start Test Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithProfile title="Cooking Chat Test" subtitle={sampleRecipe.name} />

      {/* Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          Step {currentStep} of {sampleRecipe.instructions.length} ({getProgress()}%)
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
        </View>
      </View>

      {/* Current Step Display */}
      <View style={styles.stepSection}>
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Current Step: {currentStep}</Text>
          <Text style={styles.stepDescription}>{getCurrentStepDescription()}</Text>
          
          {!completedSteps.includes(currentStep) && (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => handleCompleteStep(currentStep)}
            >
              <Text style={styles.completeButtonText}>Complete Step</Text>
            </TouchableOpacity>
          )}
          
          {completedSteps.includes(currentStep) && (
            <View style={styles.completedIndicator}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
      </View>

      {/* Cooking Chat Assistant */}
      <CookingChat
        recipeId={sampleRecipe.id}
        recipeName={sampleRecipe.name}
        recipeDescription={sampleRecipe.description}
        currentStep={currentStep}
        totalSteps={sampleRecipe.instructions.length}
        currentStepDescription={getCurrentStepDescription()}
        completedSteps={completedSteps}
      />
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
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#1d7b86',
    fontSize: 18,
    fontWeight: '600',
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
  stepSection: {
    padding: 20,
    flex: 1,
  },
  stepCard: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 16,
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
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fcf45a',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completedIndicator: {
    backgroundColor: '#27ae60',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 