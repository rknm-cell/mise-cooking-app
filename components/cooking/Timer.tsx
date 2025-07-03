import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface TimerProps {
  duration: number; // in seconds
  description: string;
  stage: string;
  onComplete?: () => void;
  onStop?: () => void;
}

export function Timer({ duration, description, stage, onComplete, onStop }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            Alert.alert('Timer Complete!', `${description} is ready!`);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isPaused, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration);
    onStop?.();
  };

  const handleReset = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsPaused(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="timer-outline" size={20} color="#fcf45a" />
        <Text style={styles.stage}>{stage}</Text>
      </View>
      
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.timerDisplay}>
        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
      </View>
      
      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Ionicons name="play" size={16} color="#fff" />
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
            <Ionicons name={isPaused ? "play" : "pause"} size={16} color="#fff" />
            <Text style={styles.buttonText}>{isPaused ? "Resume" : "Pause"}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
          <Ionicons name="stop" size={16} color="#fff" />
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stage: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#fcf45a',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    lineHeight: 20,
  },
  timerDisplay: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fcf45a',
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f39c12',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#95a5a6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 