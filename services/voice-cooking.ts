// Voice-first cooking assistant service

const API_BASE = __DEV__ 
  ? 'http://localhost:8080' 
  : 'https://mise-cooking-app-production.up.railway.app';

export interface VoiceCookingRequest {
  message: string;
  recipeId?: string;
  recipeName?: string;
  recipeDescription?: string;
  currentStep?: number;
  totalSteps?: number;
  currentStepDescription?: string;
  completedSteps?: number[];
  conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>;
  isVoiceCommand?: boolean;
  wakePhrase?: string;
}

export interface VoiceCookingResponse {
  response: string;
  suggestions?: string[];
  quickActions?: string[];
  context?: string;
  // Tool action responses
  timerAction?: {
    action: "create" | "start" | "stop";
    duration?: number;
    description?: string;
    stage?: string;
  };
  navigationAction?: {
    action: "next" | "previous" | "specific";
    stepNumber?: number;
    reason: string;
  };
  modificationAction?: {
    type: "ingredient" | "time" | "temperature" | "technique" | "quantity";
    target: string;
    newValue: string;
    reason: string;
  };
  prepWorkAction?: {
    type: "ingredients" | "equipment" | "timing" | "techniques";
    focus: string;
    suggestions: string[];
  };
  timingAction?: {
    type: "step" | "overall" | "parallel" | "resting";
    context: string;
    suggestions: string[];
  };
}

// Main voice cooking chat endpoint
export async function sendVoiceCookingMessage(request: VoiceCookingRequest): Promise<VoiceCookingResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/cooking-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to send voice cooking message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending voice cooking message:', error);
    throw error;
  }
}

// Voice command detection
export function detectVoiceCommand(message: string, wakePhrase: string = "hey mise"): boolean {
  const messageLower = message.toLowerCase();
  return messageLower.includes(wakePhrase.toLowerCase());
}

// Extract command from voice message
export function extractCommand(message: string, wakePhrase: string = "hey mise"): string {
  const messageLower = message.toLowerCase();
  const wakePhraseLower = wakePhrase.toLowerCase();
  
  if (messageLower.includes(wakePhraseLower)) {
    return message.replace(new RegExp(wakePhraseLower, 'gi'), '').trim();
  }
  
  return message.trim();
}

// Voice command patterns for different actions
export const VoiceCommandPatterns = {
  // Timer commands
  TIMER: /(timer|set timer|cook for|boil for|simmer for|bake for|roast for)/i,
  TIME_EXPRESSION: /(\d+)\s*(minute|hour|second|min|hr|sec)/i,
  
  // Navigation commands
  NEXT_STEP: /(next step|move to next|go to next|advance)/i,
  PREVIOUS_STEP: /(previous step|go back|move back|step back)/i,
  SPECIFIC_STEP: /(step|go to step|move to step)\s*(\d+)/i,
  
  // Recipe modification commands
  SUBSTITUTE: /(substitute|replace|instead of|alternative|swap)/i,
  MODIFY: /(change|modify|adjust|alter)/i,
  
  // Prep work commands
  PREP: /(prep|prepare|setup|get ready|what do i need)/i,
  
  // Timing commands
  TIMING: /(how long|timing|when|schedule|time management)/i,
  
  // General cooking commands
  HELP: /(help|what should i do|what's next|guidance)/i,
  TECHNIQUE: /(technique|how do i|method|procedure)/i,
};

// Parse voice command and determine action type
export function parseVoiceCommand(command: string): {
  actionType: 'timer' | 'navigation' | 'modification' | 'prep' | 'timing' | 'help' | 'technique' | 'general';
  confidence: number;
  extractedData?: any;
} {
  const commandLower = command.toLowerCase();
  let confidence = 0;
  let actionType: 'timer' | 'navigation' | 'modification' | 'prep' | 'timing' | 'help' | 'technique' | 'general' = 'general';
  let extractedData: any = {};

  // Timer detection
  if (VoiceCommandPatterns.TIMER.test(commandLower) || VoiceCommandPatterns.TIME_EXPRESSION.test(commandLower)) {
    actionType = 'timer';
    confidence = 0.9;
    
    // Extract time information
    const timeMatch = commandLower.match(VoiceCommandPatterns.TIME_EXPRESSION);
    if (timeMatch) {
      extractedData.duration = parseInt(timeMatch[1]);
      extractedData.unit = timeMatch[2];
    }
  }
  
  // Navigation detection
  else if (VoiceCommandPatterns.NEXT_STEP.test(commandLower)) {
    actionType = 'navigation';
    confidence = 0.95;
    extractedData.direction = 'next';
  }
  else if (VoiceCommandPatterns.PREVIOUS_STEP.test(commandLower)) {
    actionType = 'navigation';
    confidence = 0.95;
    extractedData.direction = 'previous';
  }
  else if (VoiceCommandPatterns.SPECIFIC_STEP.test(commandLower)) {
    actionType = 'navigation';
    confidence = 0.9;
    const stepMatch = commandLower.match(VoiceCommandPatterns.SPECIFIC_STEP);
    if (stepMatch) {
      extractedData.stepNumber = parseInt(stepMatch[2]);
    }
  }
  
  // Modification detection
  else if (VoiceCommandPatterns.SUBSTITUTE.test(commandLower) || VoiceCommandPatterns.MODIFY.test(commandLower)) {
    actionType = 'modification';
    confidence = 0.85;
  }
  
  // Prep work detection
  else if (VoiceCommandPatterns.PREP.test(commandLower)) {
    actionType = 'prep';
    confidence = 0.8;
  }
  
  // Timing detection
  else if (VoiceCommandPatterns.TIMING.test(commandLower)) {
    actionType = 'timing';
    confidence = 0.8;
  }
  
  // Help detection
  else if (VoiceCommandPatterns.HELP.test(commandLower)) {
    actionType = 'help';
    confidence = 0.7;
  }
  
  // Technique detection
  else if (VoiceCommandPatterns.TECHNIQUE.test(commandLower)) {
    actionType = 'technique';
    confidence = 0.7;
  }

  return { actionType, confidence, extractedData };
}

// Convert time expressions to seconds
export function parseTimeExpression(timeStr: string): number {
  const timeLower = timeStr.toLowerCase();
  
  // Minutes
  if (timeLower.includes('minute') || timeLower.includes('min')) {
    const match = timeLower.match(/(\d+)\s*(minute|min)/);
    if (match) return parseInt(match[1]) * 60;
  }
  
  // Hours
  if (timeLower.includes('hour') || timeLower.includes('hr')) {
    const match = timeLower.match(/(\d+)\s*(hour|hr)/);
    if (match) return parseInt(match[1]) * 3600;
  }
  
  // Seconds
  if (timeLower.includes('second') || timeLower.includes('sec')) {
    const match = timeLower.match(/(\d+)\s*(second|sec)/);
    if (match) return parseInt(match[1]);
  }
  
  // Default to minutes if just a number
  const numberMatch = timeLower.match(/(\d+)/);
  if (numberMatch) return parseInt(numberMatch[1]) * 60;
  
  return 300; // Default 5 minutes
}

// Generate voice acknowledgment
export function generateVoiceAcknowledgment(actionType: string, isVoiceCommand: boolean = true): string {
  if (!isVoiceCommand) return '';
  
  const acknowledgments = {
    timer: "Yes, chef. Timer set.",
    navigation: "Yes, chef. Moving to step.",
    modification: "Yes, chef. Recipe modified.",
    prep: "Yes, chef. Prep work ready.",
    timing: "Yes, chef. Timing guidance.",
    help: "Yes, chef. Here's help.",
    technique: "Yes, chef. Technique guidance.",
    general: "Yes, chef."
  };
  
  return acknowledgments[actionType as keyof typeof acknowledgments] || "Yes, chef.";
}

// Voice command examples for testing
export const VoiceCommandExamples = {
  timer: [
    "Set timer for 5 minutes",
    "Cook for 10 minutes",
    "Boil for 2 minutes",
    "Timer 15 minutes",
    "Set a timer for half an hour"
  ],
  navigation: [
    "Next step",
    "Go to next step",
    "Previous step",
    "Go back",
    "Move to step 3",
    "Step 5"
  ],
  modification: [
    "Substitute basil with parsley",
    "Replace olive oil with butter",
    "Change cooking time to 20 minutes",
    "Modify temperature to 350 degrees"
  ],
  prep: [
    "What do I need to prepare?",
    "Prep work for this step",
    "Get ready for cooking",
    "Setup instructions"
  ],
  timing: [
    "How long should this take?",
    "Timing for this recipe",
    "When should I start?",
    "Time management tips"
  ]
};

// Voice session management
export interface VoiceSession {
  id: string;
  recipeId: string;
  currentStep: number;
  completedSteps: number[];
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}>;
  wakePhrase: string;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

// Create a new voice session
export function createVoiceSession(recipeId: string, wakePhrase: string = "hey mise"): VoiceSession {
  return {
    id: `voice_${Date.now()}`,
    recipeId,
    currentStep: 1,
    completedSteps: [],
    conversationHistory: [],
    wakePhrase,
    isActive: true,
    createdAt: new Date(),
    lastActivity: new Date(),
  };
}

// Update voice session
export function updateVoiceSession(
  session: VoiceSession,
  updates: Partial<Pick<VoiceSession, 'currentStep' | 'completedSteps' | 'conversationHistory' | 'isActive'>>
): VoiceSession {
  return {
    ...session,
    ...updates,
    lastActivity: new Date(),
  };
}

// Save voice session to local storage
export async function saveVoiceSession(session: VoiceSession): Promise<void> {
  try {
    const sessions = await getVoiceSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    // Keep only last 10 sessions
    const recentSessions = sessions.slice(-10);
    
    await AsyncStorage.setItem('voice_sessions', JSON.stringify(recentSessions));
  } catch (error) {
    console.error('Error saving voice session:', error);
  }
}

// Get voice sessions from local storage
export async function getVoiceSessions(): Promise<VoiceSession[]> {
  try {
    const sessionsJson = await AsyncStorage.getItem('voice_sessions');
    if (sessionsJson) {
      const sessions = JSON.parse(sessionsJson);
      return sessions.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        lastActivity: new Date(s.lastActivity),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting voice sessions:', error);
    return [];
  }
}

// Get active voice session for a recipe
export async function getActiveVoiceSession(recipeId: string): Promise<VoiceSession | null> {
  try {
    const sessions = await getVoiceSessions();
    return sessions.find(s => s.recipeId === recipeId && s.isActive) || null;
  } catch (error) {
    console.error('Error getting active voice session:', error);
    return null;
  }
}

// Import AsyncStorage for local storage
import AsyncStorage from '@react-native-async-storage/async-storage';
