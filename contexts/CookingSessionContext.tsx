import React, { createContext, ReactNode, useContext, useReducer } from 'react';
import { API_CONFIG } from '../constants/Config';

// Simplified types without AI integration
export interface CookingSession {
  id: string;
  userId: string;
  recipeId: string;
  status: 'active' | 'paused' | 'completed';
  startTime: Date;
  currentStep: number;
  createdAt: Date;
}

export interface CookingStep {
  id: string;
  sessionId: string;
  stepNumber: number;
  stage: 'prep' | 'cooking' | 'plating';
  status: 'pending' | 'active' | 'completed';
}

export interface TimerSuggestion {
  duration: number;
  stage: string;
  description: string;
  trigger: 'manual';
}

// Simplified state interface
interface CookingSessionState {
  activeSession: CookingSession | null;
  currentSteps: CookingStep[];
  currentTimer: TimerSuggestion | null;
  sessionHistory: CookingSession[];
}

// Simplified action types
type CookingSessionAction =
  | { type: 'START_SESSION'; payload: CookingSession }
  | { type: 'PAUSE_SESSION' }
  | { type: 'RESUME_SESSION' }
  | { type: 'COMPLETE_SESSION' }
  | { type: 'UPDATE_PROGRESS'; payload: { currentStep: number; stage: string } }
  | { type: 'SET_TIMER'; payload: TimerSuggestion | null }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'LOAD_SESSION_HISTORY'; payload: CookingSession[] };

// Initial state
const initialState: CookingSessionState = {
  activeSession: null,
  currentSteps: [],
  currentTimer: null,
  sessionHistory: [],
};

// Simplified reducer
function cookingSessionReducer(
  state: CookingSessionState,
  action: CookingSessionAction
): CookingSessionState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        activeSession: action.payload,
        currentSteps: [],
        currentTimer: null,
      };

    case 'PAUSE_SESSION':
      return {
        ...state,
        activeSession: state.activeSession
          ? { ...state.activeSession, status: 'paused' as const }
          : null,
      };

    case 'RESUME_SESSION':
      return {
        ...state,
        activeSession: state.activeSession
          ? { ...state.activeSession, status: 'active' as const }
          : null,
      };

    case 'COMPLETE_SESSION':
      return {
        ...state,
        activeSession: state.activeSession
          ? { ...state.activeSession, status: 'completed' as const }
          : null,
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        activeSession: state.activeSession
          ? {
              ...state.activeSession,
              currentStep: action.payload.currentStep,
            }
          : null,
      };

    case 'SET_TIMER':
      return {
        ...state,
        currentTimer: action.payload,
      };

    case 'COMPLETE_STEP':
      return {
        ...state,
        currentSteps: state.currentSteps.map((step) =>
          step.stepNumber === action.payload
            ? { ...step, status: 'completed' as const }
            : step
        ),
      };

    case 'LOAD_SESSION_HISTORY':
      return {
        ...state,
        sessionHistory: action.payload,
      };

    default:
      return state;
  }
}

// Simplified context
interface CookingSessionContextType {
  state: CookingSessionState;
  dispatch: React.Dispatch<CookingSessionAction>;
  startSession: (recipeId: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  updateProgress: (currentStep: number, stage: string) => void;
  completeStep: (stepNumber: number) => void;
  setTimer: (timer: TimerSuggestion | null) => void;
}

const CookingSessionContext = createContext<CookingSessionContextType | undefined>(
  undefined
);

// Provider component
interface CookingSessionProviderProps {
  children: ReactNode;
}

export function CookingSessionProvider({ children }: CookingSessionProviderProps) {
  const [state, dispatch] = useReducer(cookingSessionReducer, initialState);

  // API base URL
  const API_BASE = API_CONFIG.BASE_URL;

  const startSession = async (recipeId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/cooking-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId,
          multiRecipe: false,
        }),
      });

      if (response.ok) {
        const session: CookingSession = await response.json();
        dispatch({ type: 'START_SESSION', payload: session });
      } else {
        console.error('Failed to start cooking session');
      }
    } catch (error) {
      console.error('Error starting cooking session:', error);
    }
  };

  const pauseSession = () => {
    dispatch({ type: 'PAUSE_SESSION' });
  };

  const resumeSession = () => {
    dispatch({ type: 'RESUME_SESSION' });
  };

  const completeSession = () => {
    dispatch({ type: 'COMPLETE_SESSION' });
  };

  const updateProgress = (currentStep: number, stage: string) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: { currentStep, stage } });
  };

  const completeStep = (stepNumber: number) => {
    dispatch({ type: 'COMPLETE_STEP', payload: stepNumber });
  };

  const setTimer = (timer: TimerSuggestion | null) => {
    dispatch({ type: 'SET_TIMER', payload: timer });
  };

  const value: CookingSessionContextType = {
    state,
    dispatch,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    updateProgress,
    completeStep,
    setTimer,
  };

  return (
    <CookingSessionContext.Provider value={value}>
      {children}
    </CookingSessionContext.Provider>
  );
}

// Hook
export function useCookingSession() {
  const context = useContext(CookingSessionContext);
  if (context === undefined) {
    throw new Error('useCookingSession must be used within a CookingSessionProvider');
  }
  return context;
} 