import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimerSuggestion, useCookingSession } from '../../contexts/CookingSessionContext';
import { HeaderWithProfile } from '../HeaderWithProfile';
import { CookingProgress } from './CookingProgress';
import { SmartTimer } from './SmartTimer';

interface RecipeSessionProps {
  recipeId?: string;
  recipeName?: string;
}

export function RecipeSession({ recipeId, recipeName }: RecipeSessionProps) {
  const {
    state: { activeSession, currentTimer },
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    updateProgress,
    completeStep,
    setTimer,
  } = useCookingSession();

  const [sessionStarted, setSessionStarted] = useState(false);

  // Simple timer suggestions for demo
  const demoTimers: TimerSuggestion[] = [
    {
      duration: 300, // 5 minutes
      stage: 'prep',
      description: 'Preheat oven',
      trigger: 'manual',
    },
    {
      duration: 600, // 10 minutes
      stage: 'cooking',
      description: 'Cook until golden brown',
      trigger: 'manual',
    },
  ];

  const handleStartSession = async () => {
    if (!recipeId) {
      Alert.alert('Error', 'Recipe ID is required to start a session');
      return;
    }

    try {
      await startSession(recipeId);
      setSessionStarted(true);
      Alert.alert('Success', 'Cooking session started!');
    } catch (error) {
      Alert.alert('Error', 'Failed to start cooking session');
    }
  };

  const handlePauseSession = () => {
    pauseSession();
    Alert.alert('Session Paused', 'Your cooking session has been paused');
  };

  const handleResumeSession = () => {
    resumeSession();
    Alert.alert('Session Resumed', 'Your cooking session has been resumed');
  };

  const handleCompleteSession = () => {
    Alert.alert(
      'Complete Session',
      'Are you sure you want to complete this cooking session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'destructive',
          onPress: () => {
            completeSession();
            setSessionStarted(false);
            Alert.alert('Session Completed', 'Great job! Your cooking session is complete.');
          },
        },
      ]
    );
  };

  const handleStepComplete = (stepNumber: number) => {
    completeStep(stepNumber);
    updateProgress(stepNumber + 1, 'prep');
    Alert.alert('Step Completed', `Step ${stepNumber} completed!`);
  };

  const handleStageChange = (stage: string) => {
    if (activeSession) {
      updateProgress(activeSession.currentStep, stage);
      Alert.alert('Stage Changed', `Switched to ${stage} stage`);
    }
  };

  const handleTimerComplete = () => {
    Alert.alert('Timer Complete', 'Timer has finished!');
    setTimer(null);
  };

  const handleTimerDismiss = () => {
    setTimer(null);
  };

  const handleStartTimer = (timer: TimerSuggestion) => {
    setTimer(timer);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HeaderWithProfile 
          title="Cooking Session" 
          subtitle={recipeName || "Let's get cooking!"} 
        />

        {/* Session Controls */}
        {!activeSession ? (
          <View style={styles.startSection}>
            <View style={styles.startCard}>
              <Ionicons name="restaurant" size={48} color="#fcf45a" />
              <Text style={styles.startTitle}>Ready to Cook?</Text>
              <Text style={styles.startSubtitle}>
                Start a cooking session to track your progress and manage timers
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartSession}
              >
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.startButtonText}>Start Cooking Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Session Status */}
            <View style={styles.statusSection}>
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Text style={styles.statusTitle}>Session Status</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {activeSession.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.statusActions}>
                  {activeSession.status === 'active' ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.pauseButton]}
                      onPress={handlePauseSession}
                    >
                      <Ionicons name="pause" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Pause</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.resumeButton]}
                      onPress={handleResumeSession}
                    >
                      <Ionicons name="play" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Resume</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={handleCompleteSession}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Cooking Progress */}
            <CookingProgress
              session={activeSession}
              onStepComplete={handleStepComplete}
              onStageChange={handleStageChange}
            />

            {/* Timer Suggestions */}
            <View style={styles.timersSection}>
              <Text style={styles.sectionTitle}>Suggested Timers</Text>
              {demoTimers.map((timer, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.timerSuggestion}
                  onPress={() => handleStartTimer(timer)}
                >
                  <View style={styles.timerInfo}>
                    <Ionicons name="time" size={20} color="#fcf45a" />
                    <Text style={styles.timerDescription}>{timer.description}</Text>
                  </View>
                  <Text style={styles.timerDuration}>
                    {Math.floor(timer.duration / 60)}m {timer.duration % 60}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Smart Timer */}
            {currentTimer && (
              <SmartTimer
                timer={currentTimer}
                onTimerComplete={handleTimerComplete}
                onDismiss={handleTimerDismiss}
              />
            )}

            {/* Simple Demo Info */}
            <View style={styles.demoSection}>
              <Text style={styles.sectionTitle}>Cooking Session Features</Text>
              <View style={styles.demoCard}>
                <Text style={styles.demoText}>
                  This is a simple cooking session manager that helps you track your progress
                  and manage timers while cooking. No AI integration - just clean, simple functionality.
                </Text>
                <View style={styles.demoFeatures}>
                  <Text style={styles.demoFeature}>• Session progress tracking</Text>
                  <Text style={styles.demoFeature}>• Manual timer management</Text>
                  <Text style={styles.demoFeature}>• Step completion tracking</Text>
                  <Text style={styles.demoFeature}>• Stage transitions</Text>
                  <Text style={styles.demoFeature}>• Session pause/resume</Text>
                </View>
              </View>
            </View>
          </>
        )}
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
  statusSection: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    backgroundColor: '#fcf45a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d7b86',
  },
  statusActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: '#e67e22',
  },
  resumeButton: {
    backgroundColor: '#27ae60',
  },
  completeButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  timersSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  timerSuggestion: {
    backgroundColor: '#2d8d8b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timerDescription: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  timerDuration: {
    fontSize: 14,
    color: '#fcf45a',
    fontWeight: '600',
  },
  demoSection: {
    padding: 20,
    paddingBottom: 40,
  },
  demoCard: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  demoText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 16,
  },
  demoFeatures: {
    marginTop: 12,
  },
  demoFeature: {
    fontSize: 14,
    color: '#fcf45a',
    marginBottom: 4,
  },
}); 