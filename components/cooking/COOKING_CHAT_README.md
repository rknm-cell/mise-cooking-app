# Cooking Chat Assistant

## Overview

The Cooking Chat Assistant is an AI-powered feature that provides real-time cooking guidance during recipe sessions. It integrates seamlessly with the RecipeSession component and offers context-aware assistance based on the current cooking step.

## Features

### Core Functionality
- **Context-Aware Responses**: AI understands current recipe step and provides relevant advice
- **Real-Time Chat**: Instant messaging with the AI assistant during cooking
- **Conversation History**: Maintains chat context within the cooking session
- **Floating UI**: Non-intrusive chat bubble that expands when needed

### UI Components
- **Chat Bubble**: Floating button in bottom-right corner (collapsed state)
- **Expandable Panel**: Slides up from bottom, takes 40% screen height when active
- **Message Types**: 
  - User messages (right-aligned, yellow background)
  - AI responses (left-aligned, semi-transparent background)
- **Loading States**: Visual feedback during AI processing

## Implementation

### Backend API
- **Endpoint**: `POST /api/cooking-chat`
- **Context**: Recipe info, current step, completed steps, conversation history
- **AI Model**: OpenAI GPT-4o-mini with 300 token limit
- **Response Format**: Structured JSON with response text and metadata

### Frontend Component
- **File**: `components/cooking/CookingChat.tsx`
- **Props**: Recipe context, current step, conversation state
- **State Management**: Local state for messages and UI state
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## Usage

### Basic Integration
```tsx
import { CookingChat } from '../components/cooking/CookingChat';

<CookingChat
  recipeId={recipe.id}
  recipeName={recipe.name}
  recipeDescription={recipe.description}
  currentStep={currentStep}
  totalSteps={totalSteps}
  currentStepDescription={currentStepDescription}
  completedSteps={completedSteps}
/>
```

### Testing
- **Test Screen**: `app/(tabs)/cooking-chat-test.tsx`
- **Sample Recipe**: Uses `data/sampleRecipe.ts` for testing
- **Navigation**: Available as "Chat Test" tab in development

## API Request Format

```typescript
interface CookingChatRequest {
  message: string;
  recipeId?: string;
  recipeName?: string;
  recipeDescription?: string;
  currentStep?: number;
  totalSteps?: number;
  currentStepDescription?: string;
  completedSteps?: number[];
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

## API Response Format

```typescript
interface CookingChatResponse {
  response: string;
  suggestions?: string[];
  quickActions?: string[];
  context?: string;
}
```

## Example Conversations

### Ingredient Substitution
**User**: "I don't have fresh basil"
**AI**: "You can substitute with 1 teaspoon dried basil, or try fresh spinach or parsley. Dried herbs are more concentrated, so use about 1/3 the amount of fresh."

### Technique Guidance
**User**: "How do I know when the pasta is ready?"
**AI**: "Look for 'al dente' - firm to the bite but not hard. Start checking 2 minutes before package time. Taste a piece; it should be tender with slight chew. Drain immediately when done."

### Problem Solving
**User**: "My sauce is separating"
**AI**: "This usually happens when the sauce gets too hot. Remove from heat, add a splash of cold water or broth, and whisk gently. If it's a cream sauce, add more cream slowly while stirring."

## Development Notes

### Current Implementation
- ✅ Basic chat interface with expandable panel
- ✅ Context-aware AI responses
- ✅ Conversation history within session
- ✅ Error handling and loading states
- ✅ Integration with RecipeSession component
- ✅ Test screen for development

### Future Enhancements
- [ ] Voice input/output for hands-free operation
- [ ] Quick action buttons for common questions
- [ ] Proactive suggestions based on cooking progress
- [ ] Image analysis integration for visual guidance
- [ ] Multi-language support
- [ ] Offline mode with cached responses

### Performance Considerations
- **Token Limit**: 300 tokens per response for fast replies
- **Temperature**: 0.3 for consistent, factual advice
- **Context Window**: Last 10 messages for conversation history
- **Response Time**: Target <2 seconds for user experience

## Troubleshooting

### Common Issues
1. **Chat not appearing**: Ensure `sessionActive` is true and recipe has instructions
2. **API errors**: Check backend server is running on port 8080
3. **No response**: Verify OpenAI API key is configured in backend
4. **UI glitches**: Check for proper z-index and positioning in parent components

### Debug Mode
Enable detailed error messages by setting `NODE_ENV=development` in backend environment. 