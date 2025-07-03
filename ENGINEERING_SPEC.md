# Mise Cooking App - Engineering Specification

## Executive Summary

This document outlines the technical implementation details for the Mise Cooking app, a React Native application with AI-powered recipe generation and cooking guidance. The app uses Expo for cross-platform development, a Bun-based Express.js backend, PostgreSQL database, and integrates multiple AI services for enhanced user experience.

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Express.js    │    │   PostgreSQL    │
│   (Expo)        │◄──►│   (Bun)         │◄──►│   Database      │
│   Frontend      │    │   Backend       │    │   (Drizzle ORM) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Expo Camera   │    │   OpenAI API    │    │   Google Cloud  │
│   TensorFlow    │    │   (GPT-4o-mini) │    │   Vision API    │
│   Lite          │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React Native 0.79.4 with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context API
- **Camera**: Expo Camera for real-time video processing
- **Icons**: Expo Vector Icons (Ionicons)
- **Language**: TypeScript 5.8.3

### Recipe Generation Frontend
- **UI Framework**: React Native with custom styling
- **Animation**: Animated API for progress bars and transitions
- **State Management**: Local state with conversation history
- **User Experience**: Real-time feedback with progress indicators
- **Responsive Design**: Adaptive layout for different screen sizes
- **Theme Integration**: Consistent with app color scheme (#fcf45a yellow accent)

#### Backend
- **Runtime**: Bun (JavaScript runtime)
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL with Drizzle ORM 0.44.2
- **Authentication**: Better Auth 1.2.12
- **AI Integration**: OpenAI GPT-4o-mini via AI SDK
- **Computer Vision**: Google Cloud Vision API / Azure Computer Vision
- **On-Device AI**: TensorFlow Lite / MediaPipe for basic detection
- **Real-time Processing**: WebSocket for live camera feed
- **Security**: Helmet, CORS, Rate limiting
- **Deployment**: Railway

### Recipe Generation Backend
- **AI Service**: OpenAI GPT-4o-mini with structured output via Zod schemas
- **Conversation Management**: Context-aware prompt building with history
- **Database Integration**: Automatic recipe saving with error handling
- **API Endpoint**: `/api/generate` with conversation history support
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### AI Chat Assistant Backend (IMPLEMENTED)
- **AI Service**: OpenAI GPT-4o-mini with context-aware cooking assistance
- **Context Management**: Recipe-aware prompt building with current step context
- **Conversation History**: Maintains chat history for continuity within sessions
- **API Endpoints**: 
  - `/api/cooking-chat` - Main chat with full context (IMPLEMENTED)
  - `/api/cooking-chat/suggestions` - Step-specific suggestions (IMPLEMENTED)
  - `/api/cooking-chat/substitutions` - Ingredient alternatives (IMPLEMENTED)
- **Response Formatting**: Structured responses optimized for mobile display
- **Performance**: 300 token limit with 0.3 temperature for consistent advice

### AI Chat Assistant Frontend (IMPLEMENTED)
- **Component**: `CookingChat` - Floating chat interface for recipe sessions
- **UI Design**: Expandable chat panel with bubble interface
- **Features**:
  - Floating chat bubble in bottom-right corner
  - Expandable chat panel (40% screen height when active)
  - Real-time message exchange with AI assistant
  - Context-aware responses based on current recipe step
  - Conversation history within session
  - Loading states and error handling
- **Integration**: Seamlessly integrated into RecipeSession component
- **Testing**: Dedicated test screen (`cooking-chat-test.tsx`) for development

#### Development Tools
- **Package Manager**: npm (frontend), Bun (backend)
- **Linting**: ESLint with Expo config
- **Database Migrations**: Drizzle Kit
- **Type Checking**: TypeScript

## Database Design

### Schema Overview

```sql
-- Core User Management
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recipe Management
CREATE TABLE recipes (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description VARCHAR NOT NULL,
  total_time VARCHAR NOT NULL,
  servings INTEGER NOT NULL,
  ingredients VARCHAR[] NOT NULL,
  instructions VARCHAR[] NOT NULL,
  storage VARCHAR NOT NULL,
  nutrition VARCHAR[] NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Cooking Sessions (New)
CREATE TABLE cooking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  recipe_id VARCHAR NOT NULL REFERENCES recipes(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed'
  start_time TIMESTAMP DEFAULT NOW(),
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cooking Steps (New)
CREATE TABLE cooking_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cooking_sessions(id),
  step_number INTEGER NOT NULL,
  stage VARCHAR(20) NOT NULL, -- 'prep', 'cooking', 'plating'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'completed'
  ai_confidence FLOAT,
  detected_at TIMESTAMP DEFAULT NOW()
);

-- Shopping Lists (IMPLEMENTED)
CREATE TABLE shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shopping List Items (IMPLEMENTED)
CREATE TABLE shopping_list_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES shopping_list(id),
  name VARCHAR NOT NULL,
  quantity VARCHAR NOT NULL,
  unit VARCHAR,
  category VARCHAR,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookmarks (IMPLEMENTED)
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  recipe_id VARCHAR NOT NULL REFERENCES recipes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Social Features (New)
CREATE TABLE cooking_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  recipe_id VARCHAR NOT NULL REFERENCES recipes(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  recipe_id VARCHAR NOT NULL REFERENCES recipes(id),
  rating INTEGER NOT NULL CHECK (rating IN (-1, 1)), -- -1 for downvote, 1 for upvote
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  recipe_id VARCHAR NOT NULL REFERENCES recipes(id),
  photo_id UUID REFERENCES cooking_photos(id),
  content TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance
```sql
-- Recipe search optimization
CREATE INDEX idx_recipes_name ON recipes USING gin(to_tsvector('english', name));
CREATE INDEX idx_recipes_ingredients ON recipes USING gin(ingredients);

-- Cooking session optimization
CREATE INDEX idx_cooking_sessions_user ON cooking_sessions(user_id);
CREATE INDEX idx_cooking_sessions_status ON cooking_sessions(status);

-- Shopping list optimization (IMPLEMENTED)
CREATE INDEX idx_shopping_list_user ON shopping_list(user_id);
CREATE INDEX idx_shopping_list_items_list ON shopping_list_item(list_id);
CREATE INDEX idx_shopping_list_items_completed ON shopping_list_item(is_completed);

-- Bookmark optimization (IMPLEMENTED)
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_recipe ON bookmarks(recipe_id);

-- Rating system optimization
CREATE INDEX idx_recipe_ratings_recipe ON recipe_ratings(recipe_id);
CREATE INDEX idx_recipe_ratings_created ON recipe_ratings(created_at);

-- Community features optimization
CREATE INDEX idx_community_posts_recipe ON community_posts(recipe_id);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
```

## API Design

### Authentication Endpoints
```typescript
// POST /api/auth/signup
interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

// POST /api/auth/signin
interface SigninRequest {
  email: string;
  password: string;
}

// POST /api/auth/signout
interface SignoutRequest {
  token: string;
}
```

### Recipe Management Endpoints
```typescript
// POST /api/generate - Enhanced with conversation context
interface GenerateRequest {
  prompt: string;
  conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>;
}

interface GenerateResponse {
  id: string;
  name: string;
  description: string;
  totalTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  storage: string;
  nutrition: string[];
  conversationContext?: string; // Tracks modification context
  isModification?: boolean; // Flags if this is a recipe modification
}

// GET /api/recipes
interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  limit: number;
}

// GET /api/recipes/:id
interface RecipeResponse {
  recipe: Recipe;
}

// POST /api/recipes
interface CreateRecipeRequest {
  recipe: Recipe;
}
```

### Shopping List Endpoints (IMPLEMENTED)
```typescript
// GET /api/shopping/lists
interface ShoppingListsResponse {
  lists: ShoppingList[];
}

// POST /api/shopping/lists
interface CreateShoppingListRequest {
  name: string;
}

// GET /api/shopping/lists/:id/items
interface ShoppingListItemsResponse {
  items: ShoppingListItem[];
}

// POST /api/shopping/lists/:id/items
interface AddShoppingListItemRequest {
  name: string;
  quantity: string;
  unit?: string;
  category?: string;
}

// PUT /api/shopping/lists/:id/items/:itemId
interface UpdateShoppingListItemRequest {
  name?: string;
  quantity?: string;
  unit?: string;
  category?: string;
  isCompleted?: boolean;
}

// GET /api/shopping/all-items
interface AllShoppingItemsResponse {
  items: ShoppingListItem[];
}

// POST /api/shopping/generate-from-recipe
interface GenerateShoppingListRequest {
  recipeId: string;
  listName?: string;
}
```

### Bookmark Endpoints (IMPLEMENTED)
```typescript
// GET /api/bookmarks/:userId
interface BookmarksResponse {
  bookmarks: BookmarkedRecipe[];
}

// POST /api/bookmarks
interface CreateBookmarkRequest {
  recipeId: string;
}

// DELETE /api/bookmarks
interface DeleteBookmarkRequest {
  recipeId: string;
}
```

### Cooking Guide & AI Chat Endpoints
```typescript
// POST /api/cooking-sessions
interface CreateSessionRequest {
  recipeId: string;
  multiRecipe?: boolean;
  recipeIds?: string[]; // For multi-recipe sessions
}

// PUT /api/cooking-sessions/:id/progress
interface UpdateProgressRequest {
  currentStep: number;
  stage: 'prep' | 'cooking' | 'plating';
  aiAnalysis?: {
    confidence: number;
    detectedStage: string;
    suggestions: string[];
  };
}

// POST /api/cooking-sessions/:id/analyze
interface AnalyzeRequest {
  imageData: string; // base64 encoded
  currentStep: number;
  timestamp: number;
}

// POST /api/cooking-sessions/:id/timer
interface TimerRequest {
  duration: number;
  stage: string;
  description: string;
}

// PUT /api/cooking-sessions/:id/optimize
interface OptimizeRequest {
  recipeIds: string[];
  constraints?: {
    maxTime?: number;
    sharedIngredients?: string[];
    equipment?: string[];
  };
}

// AI Chat Assistant Endpoints (IMPLEMENTED)
// POST /api/cooking-chat
interface CookingChatRequest {
  message: string;
  recipeId?: string;
  recipeName?: string;
  recipeDescription?: string;
  currentStep?: number;
  totalSteps?: number;
  currentStepDescription?: string;
  completedSteps?: number[];
  conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>;
}

interface CookingChatResponse {
  response: string;
  suggestions?: string[];
  quickActions?: string[];
  context?: string;
}

// POST /api/cooking-chat/suggestions
interface SuggestionsRequest {
  currentStepDescription: string;
}

interface SuggestionsResponse {
  suggestions: string[];
}

// POST /api/cooking-chat/substitutions
interface SubstitutionsRequest {
  ingredient: string;
  recipeContext?: string;
}

interface SubstitutionsResponse {
  substitutions: string[];
}
```

### Community Endpoints (New)
```typescript
// GET /api/recipes/:id/photos
interface PhotosResponse {
  photos: CookingPhoto[];
  total: number;
}

// POST /api/recipes/:id/photos
interface SharePhotoRequest {
  imageData: string; // base64 encoded
  caption?: string;
}

// POST /api/recipes/:id/rate
interface RateRequest {
  rating: -1 | 1; // downvote or upvote
}

// GET /api/community/feed
interface FeedResponse {
  posts: CommunityPost[];
  total: number;
  page: number;
}

// POST /api/community/posts
interface CreatePostRequest {
  recipeId: string;
  photoId?: string;
  content?: string;
}
```

## Frontend Architecture

### Component Structure
```
components/
├── cooking/
│   ├── CameraTest.tsx             # Basic camera test component
│   ├── CookingCameraView.tsx      # Main camera component (future)
│   ├── RecipeOverlay.tsx          # Recipe instructions panel (future)
│   ├── SmartTimer.tsx             # AI-powered timer (future)
│   ├── CameraControls.tsx         # Camera control buttons (future)
│   ├── CookingProgress.tsx        # Progress tracking (future)
│   ├── RecipeSession.tsx          # Full cooking session component (IMPLEMENTED)
│   ├── SimpleRecipeSession.tsx    # Simplified cooking session
│   ├── StartCookingButton.tsx     # Button to start cooking session (IMPLEMENTED)
│   └── CookingChat.tsx            # AI chat assistant (IMPLEMENTED)
├── shopping/
│   └── AggregatedShoppingList.tsx # Unified shopping list view (IMPLEMENTED)
├── recipes/
│   ├── RecipeDetailCard.tsx       # Recipe card with cooking button (IMPLEMENTED)
│   └── BookmarkButton.tsx         # Recipe bookmarking (IMPLEMENTED)
├── community/
│   ├── CommunityFeed.tsx          # Social feed (future)
│   ├── PhotoGallery.tsx           # Recipe photos (future)
│   ├── RatingSystem.tsx           # Upvote/downvote (future)
│   └── PostCard.tsx               # Individual post (future)
├── ui/
│   ├── IconSymbol.tsx             # Icon wrapper
│   ├── TabBarBackground.tsx       # Tab bar styling
│   └── ...
├── AuthGuard.tsx                  # Authentication wrapper
├── HeaderWithProfile.tsx          # Header with profile icon navigation (IMPLEMENTED)
├── HapticTab.tsx                  # Haptic feedback tab button
├── ParallaxScrollView.tsx         # Enhanced scrolling
├── StyledTitle.tsx                # Custom titles
├── ThemedText.tsx                 # Theme-aware text
└── ThemedView.tsx                 # Theme-aware view
```

### Recipe Generation Components
```
app/(tabs)/generate.tsx            # Main recipe generation screen (IMPLEMENTED)
├── Conversation Management        # Maintains chat history (IMPLEMENTED)
├── Progress Animation             # Animated progress bar during generation (IMPLEMENTED)
├── Modification Detection         # Flags and displays recipe modifications (IMPLEMENTED)
├── Context Display                # Shows conversation context (IMPLEMENTED)
├── Recipe Rendering               # Displays generated recipes with styling (IMPLEMENTED)
└── Clear Conversation             # Reset conversation history (IMPLEMENTED)
```

### Shopping List Components (IMPLEMENTED)
```
app/(tabs)/shopping.tsx            # Shopping list screen
├── AggregatedShoppingList         # Unified view of all shopping items
├── View Mode Toggle               # Switch between aggregated and list views
├── Item Management                # Add, remove, toggle items
└── Recipe Integration             # Generate lists from recipes

components/shopping/AggregatedShoppingList.tsx
├── Item Aggregation               # Combines duplicate items across lists
├── Category Sorting               # Organizes items by category
├── Completion Tracking            # Tracks purchased/unpurchased status
└── Real-time Updates              # Syncs changes across all lists
```

### State Management
```typescript
// Context Providers
contexts/
├── AuthContext.tsx                # User authentication (IMPLEMENTED)
├── CookingSessionContext.tsx      # Active cooking session (IMPLEMENTED)
├── CameraContext.tsx              # Camera state
├── CommunityContext.tsx           # Social features
└── RecipeGenerationContext.tsx    # Recipe generation state (future)

// Custom Hooks
hooks/
├── useColorScheme.ts              # Theme management
├── useFonts.ts                    # Font loading
├── useThemeColor.ts               # Color theming
├── useCookingSession.ts           # Cooking session management (IMPLEMENTED)
├── useCamera.ts                   # Camera functionality
├── useAI.ts                       # AI integration
└── useRecipeGeneration.ts         # Recipe generation with conversation (future)
```

### Recipe Generation State
```typescript
interface RecipeGenerationState {
  // Current generation state
  generation: RecipeSchema | undefined;
  isLoading: boolean;
  input: string;
  
  // Conversation management
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}>;
  
  // UI state
  progressAnim: Animated.Value; // Progress bar animation
  modificationBadge: boolean;   // Shows modification indicator
  
  // Actions
  handleSubmit: () => Promise<void>;
  clearConversation: () => void;
  updateInput: (text: string) => void;
}
```

### Navigation Structure
```
app/
├── (auth)/
│   ├── login.tsx                  # User login
│   └── signup.tsx                 # User registration
├── (modal)/
│   ├── recipe/
│   │   └── [id].tsx              # Recipe detail modal (IMPLEMENTED)
│   ├── shopping/
│   │   └── [id].tsx              # Shopping list modal
│   └── profile.tsx               # User profile modal (IMPLEMENTED)
├── (tabs)/
│   ├── generate.tsx              # Recipe AI generation (IMPLEMENTED)
│   ├── recipes.tsx               # Recipe browsing (IMPLEMENTED)
│   ├── cooking-chat-test.tsx     # AI chat test screen (IMPLEMENTED)
│   ├── recipe-session.tsx        # Cooking session (IMPLEMENTED)
│   ├── bookmarks.tsx             # Saved recipes (IMPLEMENTED)
│   └── shopping.tsx              # Shopping lists (IMPLEMENTED)
└── index.tsx                     # Landing page (IMPLEMENTED)
```

### Profile Navigation System (IMPLEMENTED)

The profile navigation has been redesigned to improve user experience and screen real estate:

#### HeaderWithProfile Component
```typescript
// components/HeaderWithProfile.tsx
interface HeaderWithProfileProps {
  title: string;
  subtitle?: string;
}

// Features:
- Consistent header across all tab screens
- Profile icon in top-right corner
- Navigation to profile modal
- Responsive design with app theme colors
- Haptic feedback on profile icon press
```

#### Profile Modal Implementation
```typescript
// app/(modal)/profile.tsx
// Features:
- Modal presentation for better UX
- Close button for easy dismissal
- User information display
- Logout functionality
- Consistent styling with app theme
```

#### Tab Layout Updates
```typescript
// app/(tabs)/_layout.tsx
// Changes:
- Removed profile tab from bottom navigation
- Reduced tab count from 5 to 4 tabs
- Cleaner tab bar with better spacing
- Fixed HapticTab component TypeScript issues
```

#### Benefits of New Navigation
1. **Improved UX**: Profile accessible from any screen without tab switching
2. **Screen Real Estate**: More space for main content with fewer tabs
3. **Consistency**: Uniform header design across all screens
4. **Accessibility**: Profile icon is always visible and easily accessible
5. **Modal Experience**: Profile opens as overlay, maintaining context

## Camera Implementation (MVP)

### Basic Camera Test Component
```typescript
// CameraTest.tsx - Basic camera functionality
interface CameraTestProps {
  // Simple camera test with basic controls
}

// Implemented Features:
- Camera permission request and handling
- Camera preview display
- Switch between front/back cameras
- Take picture functionality
- Basic error handling and user feedback
- App theme integration (#fcf45a yellow accent)

// Technical Implementation:
- Expo Camera integration
- React Native state management
- TypeScript interfaces
- Responsive design with app colors
- Console logging for debugging
```

### Camera Test Screen
```typescript
// camera-test.tsx - Simple test screen
- Minimal wrapper for CameraTest component
- Accessible via tab navigation
- No complex state management
- Focus on basic camera functionality testing
```

### Next Steps for Camera Enhancement
1. **Image Processing**: Add base64 encoding for AI analysis
2. **Continuous Capture**: Implement 5-second interval capture
3. **UI Layout**: Add 40/60 split with recipe panel
4. **AI Integration**: Connect to vision API for stage detection
5. **Timer Integration**: Add smart timer functionality

## AI Integration Architecture

### Recipe Generation with Conversation Context
```typescript
interface RecipeGenerationService {
  generateRecipe(
    prompt: string, 
    conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<{
    id: string;
    name: string;
    description: string;
    totalTime: string;
    servings: number;
    ingredients: string[];
    instructions: string[];
    storage: string;
    nutrition: string[];
    conversationContext?: string;
    isModification?: boolean;
  }>;
}

interface ConversationContext {
  // Maintains conversation history for context-aware recipe generation
  messages: Array<{role: 'user' | 'assistant', content: string}>;
  maxHistoryLength: number; // Default: 4 messages to avoid token limits
  modificationDetection: boolean; // Flags recipe modifications
}
```

### AI Chat Assistant with Cooking Context (IMPLEMENTED)
```typescript
interface CookingChatService {
  // Main chat endpoint with full recipe context
  sendMessage(request: CookingChatRequest): Promise<CookingChatResponse>;
  
  // Contextual suggestions for current step
  getSuggestions(stepDescription: string): Promise<string[]>;
  
  // Ingredient substitution recommendations
  getSubstitutions(ingredient: string, context?: string): Promise<string[]>;
}

interface CookingContext {
  // Recipe information for context-aware responses
  recipeName?: string;
  recipeDescription?: string;
  currentStep?: number;
  totalSteps?: number;
  currentStepDescription?: string;
  completedSteps: number[];
  
  // Conversation management
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}>;
  maxHistoryLength: number; // Default: 10 messages for chat continuity
}

interface SystemPromptBuilder {
  // Builds context-aware system prompts for AI
  buildCookingPrompt(context: CookingContext): string;
  buildSuggestionsPrompt(stepDescription: string): string;
  buildSubstitutionsPrompt(ingredient: string, context?: string): string;
}
```

### Tiered AI System
```typescript
interface AIService {
  // Free Tier: On-device processing
  analyzeBasic(imageData: string): Promise<{
    stage: 'prep' | 'cooking' | 'plating';
    confidence: number;
  }>;

  // Premium Tier: Cloud processing
  analyzeDetailed(imageData: string): Promise<{
    stage: 'prep' | 'cooking' | 'plating';
    confidence: number;
    suggestions: string[];
    warnings: string[];
    timerSuggestions: TimerSuggestion[];
  }>;
}

interface TimerSuggestion {
  duration: number;
  stage: string;
  description: string;
  trigger: 'automatic' | 'manual';
}
```

### Multi-Recipe Optimization Engine
```typescript
interface RecipeOptimizer {
  optimizeSequence(recipes: Recipe[]): Promise<{
    sequence: CookingStep[];
    estimatedTime: number;
    parallelSteps: ParallelStep[];
    resourceConflicts: ResourceConflict[];
  }>;
}

interface ParallelStep {
  recipes: string[];
  steps: CookingStep[];
  sharedResources: string[];
}
```

## Performance Requirements

### Response Time Targets
- **Recipe Generation**: 10 seconds (with progress animation)
- **AI Analysis**: 2 seconds (max 10 seconds acceptable)
- **AI Chat Responses**: 3 seconds (max 8 seconds acceptable)
- **API Endpoints**: < 500ms for standard operations
- **Image Upload**: < 5 seconds for high-quality photos
- **App Launch**: < 3 seconds cold start
- **Navigation**: < 200ms between screens

### Recipe Generation Performance
- **Conversation Context**: Maintains last 4 messages to avoid token limits
- **Progress Feedback**: 10-second animated progress bar during generation
- **Modification Detection**: Real-time flagging of recipe modifications
- **Database Integration**: Automatic recipe saving with error handling

### AI Chat Performance (IMPLEMENTED)
- **Context Management**: Maintains last 10 messages for conversation continuity
- **Response Optimization**: 300 token limit with 0.3 temperature for consistent advice
- **Prompt Engineering**: Dynamic system prompts based on recipe and step context
- **Quick Actions**: Pre-defined action buttons for common cooking questions

### Scalability Targets
- **Concurrent Users**: 10,000+ simultaneous cooking sessions
- **Image Processing**: 100+ images per minute
- **Database Queries**: < 100ms average response time
- **Real-time Updates**: < 1 second latency for WebSocket events

### Resource Constraints
- **Mobile Storage**: < 100MB app size
- **Memory Usage**: < 200MB RAM during cooking sessions
- **Battery Impact**: < 10% additional drain per hour of cooking
- **Data Usage**: < 50MB per cooking session

## Security Implementation

### Authentication & Authorization
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  sessionId: string;
}

// Rate Limiting
const rateLimits = {
  'api/generate': { windowMs: 15 * 60 * 1000, max: 50 }, // 50 requests per 15 min
  'api/cooking-sessions/analyze': { windowMs: 60 * 1000, max: 12 }, // 12 per minute
  'api/cooking-chat': { windowMs: 60 * 1000, max: 20 }, // 20 chat messages per minute
  'api/cooking-chat/suggestions': { windowMs: 60 * 1000, max: 10 }, // 10 suggestions per minute
  'api/cooking-chat/substitutions': { windowMs: 60 * 1000, max: 15 }, // 15 substitutions per minute
  'api/community/posts': { windowMs: 15 * 60 * 1000, max: 10 }, // 10 posts per 15 min
};
```

### Recipe Generation Security
- **Conversation Validation**: Sanitizes conversation history to prevent injection
- **Token Limit Enforcement**: Limits conversation context to 4 messages
- **Input Validation**: Validates recipe prompts and conversation data
- **Error Handling**: Graceful degradation when AI service is unavailable

### AI Chat Security (IMPLEMENTED)
- **Context Validation**: Sanitizes recipe and step context data
- **Token Limit Enforcement**: Limits chat responses to 300 tokens
- **Input Validation**: Validates chat messages and conversation history
- **Rate Limiting**: Prevents abuse with per-endpoint rate limits
- **Error Handling**: Graceful fallbacks for AI service unavailability

### Data Protection
- **Image Storage**: Encrypted at rest, secure URLs with expiration
- **User Data**: GDPR compliant, right to deletion
- **API Security**: CORS protection, input validation, SQL injection prevention
- **Content Moderation**: AI-powered filtering for community posts

## Testing Strategy

### Unit Testing
```typescript
// Test Coverage Targets
- Components: 80% coverage
- Services: 90% coverage
- Utilities: 95% coverage
- API Endpoints: 85% coverage

// Testing Framework
- Frontend: Jest + React Native Testing Library
- Backend: Jest + Supertest
- E2E: Detox for mobile testing
```

### Integration Testing
- **API Integration**: Test all endpoints with real database
- **AI Integration**: Mock AI services for consistent testing
- **Camera Integration**: Test with device camera APIs
- **Real-time Features**: WebSocket connection testing

### Performance Testing
- **Load Testing**: Simulate 1000+ concurrent users
- **AI Performance**: Measure response times under load
- **Memory Leaks**: Monitor memory usage during extended sessions
- **Battery Testing**: Measure impact on device battery

## Deployment Strategy

### Environment Configuration
```typescript
// Environment Variables
interface Environment {
  NODE_ENV: 'development' | 'staging' | 'production';
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
  GOOGLE_CLOUD_VISION_KEY: string;
  JWT_SECRET: string;
  RAILWAY_TOKEN: string;
  CORS_ORIGINS: string[];
}
```

### CI/CD Pipeline
```yaml
# GitHub Actions Workflow
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint
  
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
  
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
```

### Monitoring & Observability
- **Application Monitoring**: Sentry for error tracking
- **Performance Monitoring**: New Relic for backend, Flipper for mobile
- **Database Monitoring**: PostgreSQL query performance tracking
- **AI Service Monitoring**: Response times and accuracy metrics
- **User Analytics**: Mixpanel for user behavior tracking

## Risk Assessment & Mitigation

### Technical Risks
1. **AI Service Downtime**
   - Mitigation: Fallback to on-device processing
   - Impact: Reduced functionality, not complete failure

2. **Camera Permission Issues**
   - Mitigation: Graceful degradation to manual mode
   - Impact: Loss of AI features, core functionality preserved

3. **Performance Degradation**
   - Mitigation: Progressive enhancement, feature flags
   - Impact: Reduced user experience, not app failure

### Business Risks
1. **API Cost Escalation**
   - Mitigation: Tiered pricing, usage monitoring
   - Impact: Potential revenue pressure

2. **User Adoption**
   - Mitigation: Guided tutorials, progressive feature rollout
   - Impact: Slower growth, not technical failure

## Success Metrics

### Technical KPIs
- **Uptime**: 99.9% availability
- **Performance**: 95% of requests under 2 seconds
- **Error Rate**: < 1% of requests result in errors
- **AI Accuracy**: > 85% correct stage detection
- **AI Chat Response Time**: 95% of responses under 3 seconds
- **AI Chat Accuracy**: > 90% helpful cooking advice

### Business KPIs
- **User Engagement**: 60% of users complete cooking sessions
- **Feature Adoption**: 40% of users try AI cooking guide
- **Community Growth**: 25% of users share cooking photos
- **Retention**: 70% of users return within 7 days

## Implementation Status

### Completed Features ✅
1. **Recipe Generation**: Full AI-powered recipe generation with conversation context
2. **Recipe Management**: Browse, search, and view recipes with detailed information
3. **Bookmarking System**: Save and manage favorite recipes
4. **Shopping List Management**: Unified shopping list with aggregation across multiple lists
5. **AI Chat Assistant**: Context-aware cooking guidance during recipe sessions
6. **User Authentication**: Complete auth system with JWT tokens
7. **Profile Navigation**: Header-based profile access with modal presentation
8. **Recipe Detail Pages**: Comprehensive recipe viewing with cooking integration
9. **Landing Page**: Welcome screen with app introduction
10. **Camera Integration**: Basic camera functionality for future AI features

### In Progress 🚧
1. **Recipe Collections**: Landing page with featured collections
2. **Community Features**: Social sharing and ratings
3. **Advanced Camera AI**: Real-time cooking stage detection

### Planned Features 📋
1. **Multi-Recipe Coordination**: AI-optimized cooking sequences
2. **Voice Integration**: Hands-free cooking assistance
3. **Offline Mode**: Cached recipes and offline functionality
4. **Advanced Analytics**: Cooking patterns and preferences tracking

This engineering specification provides a comprehensive technical foundation for implementing the Mise Cooking app with all planned features, ensuring scalability, security, and performance requirements are met.

### Recipe Detail Page Styling System

The recipe detail page (`app/(modal)/recipe/[id].tsx`) has been updated to use a consistent card-based design system that matches the RecipeDetailCard component:

#### Design Principles
```typescript
// Color Scheme
const colors = {
  primary: '#1d7b86',      // Dark teal - main background
  secondary: '#2d8d8b',    // Medium teal - card backgrounds
  accent: '#fcf45a',       // Yellow - highlights and icons
  text: '#1d7b86',         // Dark teal - main text
  textLight: '#ffffff',    // White - text on dark backgrounds
  overlay: 'rgba(255, 255, 255, 0.95)' // Card backgrounds
};

// Card Styling
const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 5
};
```

#### Layout Structure
```typescript
// Recipe Detail Page Layout
interface RecipeDetailLayout {
  header: {
    title: string;           // Recipe name
    description: string;     // Recipe description
    metaInfo: {
      time: string;          // Cooking time
      servings: number;      // Number of servings
      steps: number;         // Number of instructions
    };
    actions: {
      startCooking: StartCookingButton; // Primary CTA
    };
  };
  sections: {
    ingredients: IngredientList;
    instructions: InstructionList;
    storage: StorageInfo;
    nutrition: NutritionInfo;
  };
}
```

#### StartCookingButton Integration
```typescript
// StartCookingButton Component
interface StartCookingButtonProps {
  recipe: Recipe;
  size: 'small' | 'medium' | 'large';
}

// Features:
- Reusable button component with multiple sizes
- Navigation to SimpleRecipeSession with recipe data
- Consistent styling with app theme
- Recipe data passed via URL parameters
- Fallback to sample recipe if no data provided

// Navigation Flow:
Recipe Detail → StartCookingButton → SimpleRecipeSession
```

#### Styling Updates Applied
1. **Card-Based Layout**: Each section wrapped in individual cards
2. **Consistent Typography**: Unified font sizes and weights
3. **Color Harmony**: Consistent use of app color palette
4. **Visual Hierarchy**: Clear separation between content types
5. **Interactive Elements**: Prominent placement of action buttons
6. **Responsive Design**: Adapts to different screen sizes

#### Benefits of New Design
1. **Consistency**: Matches RecipeDetailCard component styling
2. **Readability**: Better contrast and spacing
3. **Usability**: Clear call-to-action placement
4. **Maintainability**: Reusable styling patterns
5. **Accessibility**: Improved text contrast and touch targets