# Mock Cooking Session Data

This directory contains mock data for the cooking session system that can be easily replaced with dynamic recipe data later.

## Files

- `mockCookingSession.ts` - Main mock data file with realistic cooking session data

## Data Structure

### MockRecipe
Complete recipe information including:
- Basic info (name, description, time, servings)
- Ingredients list
- Step-by-step instructions
- Nutrition and storage info
- Difficulty and cuisine tags

### MockCookingStep
Detailed cooking step data:
- Step number and stage (prep/cooking/plating)
- Title and description
- Estimated time
- Required ingredients and equipment
- Cooking tips
- Completion status

### MockCookingSessionData
Complete session data combining:
- Active cooking session
- Recipe information
- Cooking steps
- Timer suggestions
- Progress tracking

## Usage

```typescript
import { 
  mockCookingSessionData, 
  mockRecipe, 
  mockCookingSteps,
  createSessionFromRecipe 
} from '../data/mockCookingSession';

// Use existing mock data
const session = mockCookingSessionData;

// Create new session from recipe
const newSession = createSessionFromRecipe(mockRecipe);
```

## Helper Functions

- `getStepByNumber(stepNumber)` - Find step by number
- `getStepsByStage(stage)` - Get all steps for a stage
- `calculateProgress(completedSteps)` - Calculate percentage progress
- `getEstimatedTotalTime()` - Get total estimated cooking time

## Integration with Dynamic Data

To replace with dynamic data:

1. Replace `MockRecipe` interface with your recipe data structure
2. Update `MockCookingStep` to match your step format
3. Modify helper functions to work with your data
4. Update components to use your data source instead of mock data

## Current Mock Recipe

The system includes a complete mock recipe for **Spaghetti Carbonara** with:
- 9 detailed cooking steps
- Realistic timing and ingredients
- Stage progression (prep → cooking → plating)
- Timer suggestions for key steps

This provides a realistic foundation for testing and development before integrating with actual recipe data. 