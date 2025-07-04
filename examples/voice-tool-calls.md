# Voice-First Cooking Assistant - Tool Calls Documentation

## Overview

The Mise Cooking app includes a comprehensive voice-first cooking assistant with AI-powered tool calling capabilities. This system allows users to interact with the cooking session using natural voice commands that are interpreted and executed through various tools.

## Core Tool Calls

### 1. Timer Management (`startTimer`)

**Purpose**: Set, start, and manage cooking timers through voice commands.

**Voice Commands**:
- "Hey Mise, set timer for 5 minutes"
- "Hey Mise, cook for 10 minutes"
- "Hey Mise, boil for 2 minutes"
- "Hey Mise, timer 15 minutes"
- "Hey Mise, set a timer for half an hour"

**Tool Schema**:
```typescript
const setTimerSchema = z.object({
  duration: z.number().describe("Duration of the timer in seconds"),
  description: z.string().describe("What the timer is for"),
});
```

**Response Format**:
```typescript
{
  response: "I've started a timer for boiling pasta (5:00).",
  timerAction: {
    action: "create",
    duration: 300,
    description: "boiling pasta",
    stage: "Step 1",
  }
}
```

**Integration**: Automatically creates timers in the cooking session and displays them in the floating timer interface.

### 2. Step Navigation (`moveToStep`)

**Purpose**: Navigate between recipe steps using voice commands.

**Voice Commands**:
- "Hey Mise, next step"
- "Hey Mise, go to next step"
- "Hey Mise, previous step"
- "Hey Mise, go back"
- "Hey Mise, move to step 3"
- "Hey Mise, step 5"

**Tool Schema**:
```typescript
const moveToStepSchema = z.object({
  action: z.enum(["next", "previous", "specific"]).describe("Navigation action"),
  stepNumber: z.number().optional().describe("Specific step number (only for 'specific' action)"),
  reason: z.string().describe("Why this navigation is happening"),
});
```

**Response Format**:
```typescript
{
  response: "Moving to the next step.",
  navigationAction: {
    action: "next",
    stepNumber: 3,
    reason: "Moving to the next step in the recipe sequence",
  }
}
```

**Integration**: Automatically updates the current step in the recipe session and scrolls to the appropriate step.

### 3. Recipe Modification (`modifyRecipe`)

**Purpose**: Modify recipe ingredients, times, temperatures, or techniques through voice commands.

**Voice Commands**:
- "Hey Mise, substitute basil with parsley"
- "Hey Mise, replace olive oil with butter"
- "Hey Mise, change cooking time to 20 minutes"
- "Hey Mise, modify temperature to 350 degrees"
- "Hey Mise, instead of garlic, use shallots"

**Tool Schema**:
```typescript
const modifyRecipeSchema = z.object({
  modificationType: z.enum(["ingredient", "time", "temperature", "technique", "quantity"]).describe("Type of modification"),
  target: z.string().describe("What is being modified (ingredient name, step number, etc.)"),
  newValue: z.string().describe("The new value or instruction"),
  reason: z.string().describe("Why this modification is needed"),
});
```

**Response Format**:
```typescript
{
  response: "Substituting basil with parsley.",
  modificationAction: {
    type: "ingredient",
    target: "basil",
    newValue: "parsley",
    reason: "User requested ingredient substitution",
  }
}
```

**Integration**: Updates the recipe in real-time and saves modifications to local storage for session persistence.

### 4. Prep Work Guidance (`getPrepWork`)

**Purpose**: Get guidance on preparation work for the current cooking step.

**Voice Commands**:
- "Hey Mise, what do I need to prepare?"
- "Hey Mise, prep work for this step"
- "Hey Mise, get ready for cooking"
- "Hey Mise, setup instructions"
- "Hey Mise, what equipment do I need?"

**Tool Schema**:
```typescript
const getPrepWorkSchema = z.object({
  prepType: z.enum(["ingredients", "equipment", "timing", "techniques"]).describe("Type of prep work needed"),
  focus: z.string().describe("Specific focus area for prep work"),
});
```

**Response Format**:
```typescript
{
  response: "Here's what you need to prepare: Gather all ingredients, Prepare cutting board and knife, Preheat oven to 350°F",
  prepWorkAction: {
    type: "ingredients",
    focus: "current step preparation",
    suggestions: [
      "Gather all ingredients",
      "Prepare cutting board and knife", 
      "Preheat oven to 350°F"
    ],
  }
}
```

**Integration**: Displays prep work suggestions in the chat interface and can highlight specific items in the recipe.

### 5. Timing Suggestions (`getTimingSuggestions`)

**Purpose**: Get timing guidance for cooking steps and overall recipe management.

**Voice Commands**:
- "Hey Mise, how long should this take?"
- "Hey Mise, timing for this recipe"
- "Hey Mise, when should I start?"
- "Hey Mise, time management tips"
- "Hey Mise, how do I coordinate multiple steps?"

**Tool Schema**:
```typescript
const getTimingSuggestionsSchema = z.object({
  timingType: z.enum(["step", "overall", "parallel", "resting"]).describe("Type of timing guidance needed"),
  context: z.string().describe("Current cooking context"),
});
```

**Response Format**:
```typescript
{
  response: "Here's the timing: Start prep work early, Monitor cooking times closely, Allow for resting periods",
  timingAction: {
    type: "overall",
    context: "recipe timing coordination",
    suggestions: [
      "Start prep work early",
      "Monitor cooking times closely",
      "Allow for resting periods"
    ],
  }
}
```

**Integration**: Provides timing guidance that can be used to set multiple timers or coordinate parallel cooking tasks.

## Voice Command Patterns

### Wake Phrase Detection
```typescript
// Default wake phrase: "Hey Mise"
const isCommand = detectVoiceCommand(message, "hey mise");
```

### Command Extraction
```typescript
// Extract command from voice input
const command = extractCommand("Hey Mise, set timer for 5 minutes", "hey mise");
// Result: "set timer for 5 minutes"
```

### Pattern Recognition
```typescript
const VoiceCommandPatterns = {
  TIMER: /(timer|set timer|cook for|boil for|simmer for|bake for|roast for)/i,
  TIME_EXPRESSION: /(\d+)\s*(minute|hour|second|min|hr|sec)/i,
  NEXT_STEP: /(next step|move to next|go to next|advance)/i,
  PREVIOUS_STEP: /(previous step|go back|move back|step back)/i,
  SPECIFIC_STEP: /(step|go to step|move to step)\s*(\d+)/i,
  SUBSTITUTE: /(substitute|replace|instead of|alternative|swap)/i,
  MODIFY: /(change|modify|adjust|alter)/i,
  PREP: /(prep|prepare|setup|get ready|what do i need)/i,
  TIMING: /(how long|timing|when|schedule|time management)/i,
  HELP: /(help|what should i do|what's next|guidance)/i,
  TECHNIQUE: /(technique|how do i|method|procedure)/i,
};
```

## Integration with Recipe Session

### Hook Usage
```typescript
import { useVoiceCooking } from '../hooks/useVoiceCooking';

const {
  isListening,
  isProcessing,
  startListening,
  stopListening,
  sendVoiceMessage,
  processVoiceCommand,
  startVoiceSession,
  endVoiceSession,
  conversationHistory,
  lastResponse,
  error
} = useVoiceCooking({
  recipeId: "recipe-123",
  recipeName: "Spaghetti Carbonara",
  currentStep: 2,
  totalSteps: 5,
  currentStepDescription: "Boil pasta in salted water",
  completedSteps: [1],
  wakePhrase: "hey mise",
  onTimerCreate: (timer) => {
    // Handle timer creation
    console.log('Timer created:', timer);
  },
  onStepChange: (step) => {
    // Handle step navigation
    setCurrentStep(step);
  },
  onRecipeModification: (modification) => {
    // Handle recipe modifications
    console.log('Recipe modified:', modification);
  }
});
```

### Voice Session Management
```typescript
// Start a new voice session
await startVoiceSession();

// Process voice input
await processVoiceCommand("Hey Mise, set timer for 5 minutes");

// End the session
await endVoiceSession();
```

## Error Handling

### Common Error Scenarios
1. **Unrecognized Commands**: "Voice command not recognized. Please try again."
2. **Network Issues**: "Failed to send message"
3. **Session Issues**: "No active voice session"
4. **Processing Errors**: "Failed to process voice command"

### Error Recovery
```typescript
// Clear errors
clearError();

// Retry failed commands
if (error) {
  // Show error to user and allow retry
  console.log('Error occurred:', error);
}
```

## Testing Voice Commands

### Command Examples by Category
```typescript
const VoiceCommandExamples = {
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
```

### Testing in Development
```typescript
// Test voice commands without actual voice input
await sendTextMessage("Hey Mise, set timer for 5 minutes");

// Test different wake phrases
const customWakePhrase = "hello chef";
await processVoiceCommand(`${customWakePhrase} next step`);
```

## Performance Considerations

### Response Time Targets
- **Voice Command Processing**: < 2 seconds
- **AI Response Generation**: < 3 seconds
- **Tool Action Execution**: < 1 second
- **Total End-to-End**: < 5 seconds

### Optimization Strategies
1. **Pattern Matching**: Use regex patterns for quick command detection
2. **Caching**: Cache common responses and suggestions
3. **Parallel Processing**: Handle multiple tool actions simultaneously
4. **Fallback Responses**: Provide immediate feedback while processing

## Security and Privacy

### Voice Data Handling
- Voice commands are processed locally when possible
- Only necessary data is sent to the AI service
- No voice recordings are stored permanently
- Session data is encrypted in local storage

### Command Validation
- All commands are validated before execution
- Malicious commands are filtered out
- Rate limiting prevents abuse
- Input sanitization prevents injection attacks

## Future Enhancements

### Planned Features
1. **Multi-language Support**: Voice commands in different languages
2. **Custom Wake Phrases**: User-configurable wake phrases
3. **Voice Profiles**: Personalized voice recognition
4. **Offline Mode**: Basic commands without internet connection
5. **Advanced Tool Calls**: More sophisticated recipe modifications
6. **Voice Feedback**: Text-to-speech responses
7. **Gesture Integration**: Combine voice with hand gestures
8. **Context Awareness**: Better understanding of cooking environment

### Advanced Tool Calls
```typescript
// Future tool calls
const advancedToolCalls = {
  // Multi-recipe coordination
  coordinateRecipes: "Hey Mise, coordinate these three recipes",
  
  // Ingredient recognition
  identifyIngredient: "Hey Mise, what ingredient is this?",
  
  // Technique guidance
  demonstrateTechnique: "Hey Mise, show me how to julienne carrots",
  
  // Recipe scaling
  scaleRecipe: "Hey Mise, double this recipe",
  
  // Dietary modifications
  dietaryModification: "Hey Mise, make this gluten-free",
  
  // Equipment suggestions
  suggestEquipment: "Hey Mise, what equipment do I need?",
  
  // Temperature monitoring
  monitorTemperature: "Hey Mise, what temperature should this be?",
  
  // Timing coordination
  coordinateTiming: "Hey Mise, help me time these steps together"
};
```

## Troubleshooting

### Common Issues
1. **Wake Phrase Not Detected**: Check microphone permissions and wake phrase pronunciation
2. **Commands Not Recognized**: Ensure clear speech and proper command format
3. **Slow Response**: Check network connection and server status
4. **Session Lost**: Voice sessions are automatically saved and can be resumed

### Debug Information
```typescript
// Enable debug logging
console.log('Voice session:', currentSession);
console.log('Conversation history:', conversationHistory);
console.log('Last response:', lastResponse);
console.log('Processing state:', isProcessing);
```

This comprehensive tool calling system provides a powerful voice-first interface for the Mise Cooking app, enabling hands-free cooking guidance and recipe management. 