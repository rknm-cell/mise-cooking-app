import { useCallback, useEffect, useState } from 'react';
import { useCookingSession } from '../contexts/CookingSessionContext';

export function useCookingSessionManager() {
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

  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  // Track session duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (activeSession && activeSession.status === 'active') {
      setIsSessionActive(true);
      interval = setInterval(() => {
        const startTime = new Date(activeSession.startTime).getTime();
        const duration = Math.floor((Date.now() - startTime) / 1000);
        setSessionDuration(duration);
      }, 1000);
    } else {
      setIsSessionActive(false);
      setSessionDuration(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeSession]);

  // Format duration for display
  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }, []);

  // Get session progress score
  const getProgressScore = useCallback(() => {
    if (!activeSession) return null;

    // Calculate progress based on current step
    const progressScore = (activeSession.currentStep / 10) * 100; // Assuming 10 steps
    return Math.round(progressScore);
  }, [activeSession]);

  // Get session statistics
  const getSessionStats = useCallback(() => {
    if (!activeSession) return null;

    return {
      duration: formatDuration(sessionDuration),
      progressScore: getProgressScore(),
      currentStep: activeSession.currentStep,
      status: activeSession.status,
      hasActiveTimer: !!currentTimer,
    };
  }, [activeSession, sessionDuration, formatDuration, getProgressScore, currentTimer]);

  // Auto-pause session if no activity detected
  const enableAutoPause = useCallback((timeoutMinutes: number = 5) => {
    if (!activeSession || activeSession.status !== 'active') return;

    const timeout = setTimeout(() => {
      pauseSession();
    }, timeoutMinutes * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [activeSession, pauseSession]);

  // Enhanced session controls with validation
  const enhancedStartSession = useCallback(async (recipeId: string) => {
    if (!recipeId) {
      throw new Error('Recipe ID is required');
    }

    if (activeSession) {
      throw new Error('A session is already active');
    }

    await startSession(recipeId);
  }, [activeSession, startSession]);

  const enhancedCompleteSession = useCallback(() => {
    if (!activeSession) {
      throw new Error('No active session to complete');
    }

    completeSession();
  }, [activeSession, completeSession]);

  return {
    // State
    activeSession,
    currentTimer,
    sessionDuration,
    isSessionActive,
    
    // Formatted values
    formattedDuration: formatDuration(sessionDuration),
    progressScore: getProgressScore(),
    sessionStats: getSessionStats(),
    
    // Actions
    startSession: enhancedStartSession,
    pauseSession,
    resumeSession,
    completeSession: enhancedCompleteSession,
    updateProgress,
    completeStep,
    setTimer,
    
    // Utilities
    enableAutoPause,
    formatDuration,
  };
} 