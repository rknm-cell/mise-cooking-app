import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CookingSession } from '../../contexts/CookingSessionContext';

interface CookingProgressProps {
  session: CookingSession | null;
  onStepComplete: (stepNumber: number) => void;
  onStageChange: (stage: string) => void;
}

export function CookingProgress({
  session,
  onStepComplete,
  onStageChange,
}: CookingProgressProps) {
  if (!session) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="restaurant" size={48} color="#fcf45a" />
          <Text style={styles.emptyTitle}>No Active Session</Text>
          <Text style={styles.emptySubtitle}>
            Start cooking a recipe to see progress here
          </Text>
        </View>
      </View>
    );
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'prep':
        return 'cut';
      case 'cooking':
        return 'flame';
      case 'plating':
        return 'restaurant';
      default:
        return 'help-circle';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prep':
        return '#3498db';
      case 'cooking':
        return '#e74c3c';
      case 'plating':
        return '#27ae60';
      default:
        return '#fcf45a';
    }
  };

  const getSessionProgress = () => {
    // This would be calculated based on total steps vs completed steps
    // For now, using current step as a simple progress indicator
    return Math.min((session.currentStep / 10) * 100, 100); // Assuming 10 steps total
  };

  return (
    <View style={styles.container}>
      {/* Session Header */}
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>Cooking Session</Text>
          <Text style={styles.sessionStatus}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Text>
        </View>
        <View style={styles.sessionTime}>
          <Ionicons name="time" size={16} color="#fcf45a" />
          <Text style={styles.timeText}>
            {Math.floor((Date.now() - new Date(session.startTime).getTime()) / 60000)}m
          </Text>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <Text style={styles.progressPercentage}>
            {Math.round(getSessionProgress())}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${getSessionProgress()}%` },
            ]}
          />
        </View>
        <Text style={styles.stepInfo}>
          Step {session.currentStep} of ~10
        </Text>
      </View>

      {/* Current Stage */}
      <View style={styles.stageSection}>
        <Text style={styles.sectionTitle}>Current Stage</Text>
        <View style={styles.stageCard}>
          <View style={styles.stageIcon}>
            <Ionicons
              name={getStageIcon('prep')}
              size={24}
              color={getStageColor('prep')}
            />
          </View>
          <View style={styles.stageInfo}>
            <Text style={styles.stageName}>Preparation</Text>
            <Text style={styles.stageDescription}>
              Getting ingredients and tools ready
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onStepComplete(session.currentStep)}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fcf45a" />
            <Text style={styles.actionText}>Complete Step</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onStageChange('cooking')}
          >
            <Ionicons name="flame" size={20} color="#e74c3c" />
            <Text style={styles.actionText}>Start Cooking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onStageChange('plating')}
          >
            <Ionicons name="restaurant" size={20} color="#27ae60" />
            <Text style={styles.actionText}>Start Plating</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fcf45a',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'NanumPenScript-Regular',
  },
  sessionStatus: {
    fontSize: 14,
    color: '#fcf45a',
    marginTop: 4,
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#fcf45a',
    marginLeft: 4,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'NanumPenScript-Regular',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fcf45a',
    textAlign: 'center',
    fontFamily: 'NanumPenScript-Regular',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fcf45a',
    borderRadius: 4,
  },
  stepInfo: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  stageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'NanumPenScript-Regular',
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  stageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'NanumPenScript-Regular',
  },
  stageDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  actionsSection: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'NanumPenScript-Regular',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    lineHeight: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NanumPenScript-Regular',
  },
  stageTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  stageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NanumPenScript-Regular',
  },
  stageSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
}); 