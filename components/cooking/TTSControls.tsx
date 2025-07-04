import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FEATURE_FLAGS } from '../../constants/Config';
import { ttsService } from '../../services/text-to-speech';

interface TTSControlsProps {
  currentStep: number;
  stepDescription: string;
  totalSteps: number;
  onSpeakStep?: () => void;
}

export function TTSControls({ 
  currentStep, 
  stepDescription, 
  totalSteps,
  onSpeakStep 
}: TTSControlsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // If TTS is disabled, don't render the component
  if (!FEATURE_FLAGS.TTS_ENABLED) {
    return null;
  }

  const handleSpeakStep = async () => {
    try {
      setIsSpeaking(true);
      await ttsService.speakStep(currentStep, stepDescription, totalSteps);
      onSpeakStep?.();
    } catch (error) {
      console.error('Error speaking step:', error);
    } finally {
      // Add a small delay to ensure speech has started before updating UI
      setTimeout(() => {
        setIsSpeaking(false);
      }, 100);
    }
  };

  const handleStop = async () => {
    try {
      await ttsService.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Voice Guidance</Text>
      <View style={styles.buttonContainer}>
        {isSpeaking ? (
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
            <Ionicons name="stop" size={20} color="#fff" />
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.speakButton]} onPress={handleSpeakStep}>
            <Ionicons name="volume-high" size={20} color="#fff" />
            <Text style={styles.buttonText}>Speak Step</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d8d8b',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  speakButton: {
    backgroundColor: '#fcf45a',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#1d7b86',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
}); 