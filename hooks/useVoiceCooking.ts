import { useCallback, useEffect, useRef, useState } from 'react';
import {
    VoiceCookingRequest,
    VoiceCookingResponse,
    VoiceSession,
    createVoiceSession,
    detectVoiceCommand,
    extractCommand,
    getActiveVoiceSession,
    parseVoiceCommand,
    saveVoiceSession,
    sendVoiceCookingMessage,
    updateVoiceSession
} from '../services/voice-cooking';

export interface UseVoiceCookingProps {
  recipeId?: string;
  recipeName?: string;
  recipeDescription?: string;
  currentStep?: number;
  totalSteps?: number;
  currentStepDescription?: string;
  completedSteps?: number[];
  wakePhrase?: string;
  onTimerCreate?: (timer: { duration: number; description: string; stage: string }) => void;
  onStepChange?: (step: number) => void;
  onRecipeModification?: (modification: { type: string; target: string; newValue: string }) => void;
}

export interface UseVoiceCookingReturn {
  // State
  isListening: boolean;
  isProcessing: boolean;
  currentSession: VoiceSession | null;
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}>;
  lastResponse: VoiceCookingResponse | null;
  error: string | null;
  
  // Actions
  startListening: () => Promise<void>;
  stopListening: () => void;
  sendVoiceMessage: (message: string) => Promise<void>;
  sendTextMessage: (message: string) => Promise<void>;
  processVoiceCommand: (voiceInput: string) => Promise<void>;
  
  // Session management
  startVoiceSession: () => Promise<void>;
  endVoiceSession: () => Promise<void>;
  resumeVoiceSession: () => Promise<void>;
  
  // Utilities
  isVoiceCommand: (message: string) => boolean;
  getCommandExamples: () => Record<string, string[]>;
  clearError: () => void;
}

export function useVoiceCooking({
  recipeId,
  recipeName,
  recipeDescription,
  currentStep = 1,
  totalSteps = 1,
  currentStepDescription = '',
  completedSteps = [],
  wakePhrase = "hey mise",
  onTimerCreate,
  onStepChange,
  onRecipeModification
}: UseVoiceCookingProps): UseVoiceCookingReturn {
  // State
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [lastResponse, setLastResponse] = useState<VoiceCookingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const sessionRef = useRef<VoiceSession | null>(null);
  const processingRef = useRef(false);

  // Initialize session on mount
  useEffect(() => {
    if (recipeId) {
      initializeSession();
    }
  }, [recipeId]);

  // Update session when props change
  useEffect(() => {
    if (currentSession && recipeId) {
      const updatedSession = updateVoiceSession(currentSession, {
        currentStep,
        completedSteps,
      });
      setCurrentSession(updatedSession);
      sessionRef.current = updatedSession;
      saveVoiceSession(updatedSession);
    }
  }, [currentStep, completedSteps, recipeId]);

  // Initialize voice session
  const initializeSession = useCallback(async () => {
    if (!recipeId) return;

    try {
      // Try to resume existing session
      let session = await getActiveVoiceSession(recipeId);
      
      if (!session) {
        // Create new session
        session = createVoiceSession(recipeId, wakePhrase);
        await saveVoiceSession(session);
      }
      
      setCurrentSession(session);
      sessionRef.current = session;
      setConversationHistory(session.conversationHistory);
    } catch (err) {
      console.error('Error initializing voice session:', err);
      setError('Failed to initialize voice session');
    }
  }, [recipeId, wakePhrase]);

  // Start listening for voice input
  const startListening = useCallback(async () => {
    if (isListening || isProcessing) return;
    
    try {
      setIsListening(true);
      setError(null);
      
      // Here you would integrate with Expo Speech-to-Text
      // For now, we'll simulate the listening state
      console.log('Voice listening started...');
      
    } catch (err) {
      console.error('Error starting voice listening:', err);
      setError('Failed to start voice listening');
      setIsListening(false);
    }
  }, [isListening, isProcessing]);

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    console.log('Voice listening stopped');
  }, []);

  // Process voice command
  const processVoiceCommand = useCallback(async (voiceInput: string) => {
    if (processingRef.current) return;
    
    processingRef.current = true;
    setIsProcessing(true);
    setError(null);
    
    try {
      // Check if it's a voice command
      const isCommand = detectVoiceCommand(voiceInput, wakePhrase);
      
      if (isCommand) {
        // Extract the command
        const command = extractCommand(voiceInput, wakePhrase);
        console.log('Processing voice command:', command);
        
        // Parse the command to determine action type
        const { actionType, confidence, extractedData } = parseVoiceCommand(command);
        
        if (confidence > 0.7) {
          // Send to AI for processing
          await sendVoiceMessage(command, true);
        } else {
          setError('Voice command not recognized. Please try again.');
        }
      } else {
        // Regular message
        await sendVoiceMessage(voiceInput, false);
      }
    } catch (err) {
      console.error('Error processing voice command:', err);
      setError('Failed to process voice command');
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [wakePhrase]);

  // Send voice message
  const sendVoiceMessage = useCallback(async (message: string, isVoiceCommand: boolean = false) => {
    if (!currentSession || !recipeId) {
      setError('No active voice session');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Prepare request
      const request: VoiceCookingRequest = {
        message,
        recipeId,
        recipeName,
        recipeDescription,
        currentStep,
        totalSteps,
        currentStepDescription,
        completedSteps,
        conversationHistory,
        isVoiceCommand,
        wakePhrase,
      };

      // Send to backend
      const response = await sendVoiceCookingMessage(request);
      setLastResponse(response);

      // Update conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: response.response }
      ];

      setConversationHistory(newHistory);

      // Update session
      const updatedSession = updateVoiceSession(currentSession, {
        conversationHistory: newHistory,
      });
      setCurrentSession(updatedSession);
      sessionRef.current = updatedSession;
      await saveVoiceSession(updatedSession);

      // Handle tool actions
      await handleToolActions(response);

    } catch (err) {
      console.error('Error sending voice message:', err);
      setError('Failed to send message');
    } finally {
      setIsProcessing(false);
    }
  }, [
    currentSession,
    recipeId,
    recipeName,
    recipeDescription,
    currentStep,
    totalSteps,
    currentStepDescription,
    completedSteps,
    conversationHistory,
    wakePhrase,
  ]);

  // Send text message (for testing)
  const sendTextMessage = useCallback(async (message: string) => {
    await sendVoiceMessage(message, false);
  }, [sendVoiceMessage]);

  // Handle tool actions from AI response
  const handleToolActions = useCallback(async (response: VoiceCookingResponse) => {
    try {
      // Timer action
      if (response.timerAction && onTimerCreate) {
        const { duration, description, stage } = response.timerAction;
        if (duration && description && stage) {
          onTimerCreate({ duration, description, stage });
        }
      }

      // Navigation action
      if (response.navigationAction && onStepChange) {
        const { action, stepNumber } = response.navigationAction;
        if (action === 'next' && currentStep < totalSteps) {
          onStepChange(currentStep + 1);
        } else if (action === 'previous' && currentStep > 1) {
          onStepChange(currentStep - 1);
        } else if (action === 'specific' && stepNumber && stepNumber >= 1 && stepNumber <= totalSteps) {
          onStepChange(stepNumber);
        }
      }

      // Recipe modification action
      if (response.modificationAction && onRecipeModification) {
        const { type, target, newValue } = response.modificationAction;
        onRecipeModification({ type, target, newValue });
      }

    } catch (err) {
      console.error('Error handling tool actions:', err);
    }
  }, [currentStep, totalSteps, onTimerCreate, onStepChange, onRecipeModification]);

  // Start voice session
  const startVoiceSession = useCallback(async () => {
    if (!recipeId) return;
    
    try {
      const session = createVoiceSession(recipeId, wakePhrase);
      setCurrentSession(session);
      sessionRef.current = session;
      setConversationHistory([]);
      setLastResponse(null);
      setError(null);
      await saveVoiceSession(session);
    } catch (err) {
      console.error('Error starting voice session:', err);
      setError('Failed to start voice session');
    }
  }, [recipeId, wakePhrase]);

  // End voice session
  const endVoiceSession = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      const updatedSession = updateVoiceSession(currentSession, { isActive: false });
      setCurrentSession(updatedSession);
      sessionRef.current = updatedSession;
      await saveVoiceSession(updatedSession);
      setIsListening(false);
      setIsProcessing(false);
    } catch (err) {
      console.error('Error ending voice session:', err);
    }
  }, [currentSession]);

  // Resume voice session
  const resumeVoiceSession = useCallback(async () => {
    await initializeSession();
  }, [initializeSession]);

  // Check if message is a voice command
  const isVoiceCommand = useCallback((message: string): boolean => {
    return detectVoiceCommand(message, wakePhrase);
  }, [wakePhrase]);

  // Get command examples
  const getCommandExamples = useCallback(() => {
    return {
      timer: [
        "Set timer for 5 minutes",
        "Cook for 10 minutes",
        "Boil for 2 minutes"
      ],
      navigation: [
        "Next step",
        "Previous step",
        "Go to step 3"
      ],
      modification: [
        "Substitute basil with parsley",
        "Change cooking time to 20 minutes"
      ],
      prep: [
        "What do I need to prepare?",
        "Prep work for this step"
      ],
      timing: [
        "How long should this take?",
        "Timing for this recipe"
      ]
    };
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isListening,
    isProcessing,
    currentSession,
    conversationHistory,
    lastResponse,
    error,
    
    // Actions
    startListening,
    stopListening,
    sendVoiceMessage,
    sendTextMessage,
    processVoiceCommand,
    
    // Session management
    startVoiceSession,
    endVoiceSession,
    resumeVoiceSession,
    
    // Utilities
    isVoiceCommand,
    getCommandExamples,
    clearError,
  };
} 