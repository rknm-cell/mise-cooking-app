import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { TimerSuggestion } from '../../contexts/CookingSessionContext';

interface SmartTimerProps {
  timer: TimerSuggestion | null;
  onTimerComplete: () => void;
  onDismiss: () => void;
}

export function SmartTimer({ timer, onTimerComplete, onDismiss }: SmartTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (timer) {
      setTimeLeft(timer.duration);
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [timer]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            onTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isPaused, timeLeft, onTimerComplete]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    if (timer) {
      setTimeLeft(timer.duration);
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(0);
    onDismiss();
  };

  if (!timer) {
    return null;
  }

  const progress = timer.duration > 0 ? (timer.duration - timeLeft) / timer.duration : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.timerInfo}>
          <Ionicons name="time" size={20} color="#fcf45a" />
          <Text style={styles.stage}>{timer.stage}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#fcf45a" />
        </TouchableOpacity>
      </View>

      <View style={styles.timerDisplay}>
        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.description}>{timer.description}</Text>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progress * 100}%` }
          ]} 
        />
      </View>

      <View style={styles.controls}>
        {isRunning && (
          <TouchableOpacity 
            onPress={handlePauseResume} 
            style={[styles.controlButton, styles.primaryButton]}
          >
            <Ionicons 
              name={isPaused ? 'play' : 'pause'} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.buttonText}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          onPress={handleReset} 
          style={[styles.controlButton, styles.secondaryButton]}
        >
          <Ionicons name="refresh" size={20} color="#fcf45a" />
          <Text style={[styles.buttonText, styles.secondaryText]}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleStop} 
          style={[styles.controlButton, styles.dangerButton]}
        >
          <Ionicons name="stop" size={20} color="#fff" />
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fcf45a',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'NanumPenScript-Regular',
  },
  description: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fcf45a',
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#fcf45a',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fcf45a',
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#1d7b86',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'NanumPenScript-Regular',
  },
  secondaryText: {
    color: '#fcf45a',
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'NanumPenScript-Regular',
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fcf45a',
    textAlign: 'center',
    fontFamily: 'NanumPenScript-Regular',
  },
  timeLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 4,
  },
}); 