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

### Cooking Guide Endpoints (New)
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
│   └── CookingProgress.tsx        # Progress tracking (future)
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
├── BookmarkButton.tsx             # Recipe bookmarking
├── HapticTab.tsx                  # Haptic feedback
├── ParallaxScrollView.tsx         # Enhanced scrolling
├── StyledTitle.tsx                # Custom titles
├── ThemedText.tsx                 # Theme-aware text
└── ThemedView.tsx                 # Theme-aware view
```

### Recipe Generation Components
```
app/(tabs)/generate.tsx            # Main recipe generation screen
├── Conversation Management        # Maintains chat history
├── Progress Animation             # Animated progress bar during generation
├── Modification Detection         # Flags and displays recipe modifications
├── Context Display                # Shows conversation context
├── Recipe Rendering               # Displays generated recipes with styling
└── Clear Conversation             # Reset conversation history
```

### State Management
```typescript
// Context Providers
contexts/
├── AuthContext.tsx                # User authentication
├── CookingSessionContext.tsx      # Active cooking session
├── CameraContext.tsx              # Camera state
├── CommunityContext.tsx           # Social features
└── RecipeGenerationContext.tsx    # Recipe generation state (future)

// Custom Hooks
hooks/
├── useColorScheme.ts              # Theme management
├── useFonts.ts                    # Font loading
├── useThemeColor.ts               # Color theming
├── useCookingSession.ts           # Cooking session management
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
│   │   └── [id].tsx              # Recipe detail modal
│   └── shopping/
│       └── [id].tsx              # Shopping list modal
├── (tabs)/
│   ├── generate.tsx              # Recipe AI generation
│   ├── recipes.tsx               # Recipe browsing
│   ├── camera-test.tsx           # Camera test (MVP)
│   ├── bookmarks.tsx             # Saved recipes
│   ├── shopping.tsx              # Shopping lists
│   └── profile.tsx               # User profile
└── index.tsx                     # Landing page
```

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
- **API Endpoints**: < 500ms for standard operations
- **Image Upload**: < 5 seconds for high-quality photos
- **App Launch**: < 3 seconds cold start
- **Navigation**: < 200ms between screens

### Recipe Generation Performance
- **Conversation Context**: Maintains last 4 messages to avoid token limits
- **Progress Feedback**: 10-second animated progress bar during generation
- **Modification Detection**: Real-time flagging of recipe modifications
- **Database Integration**: Automatic recipe saving with error handling

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
  'api/community/posts': { windowMs: 15 * 60 * 1000, max: 10 }, // 10 posts per 15 min
};

### Recipe Generation Security
- **Conversation Validation**: Sanitizes conversation history to prevent injection
- **Token Limit Enforcement**: Limits conversation context to 4 messages
- **Input Validation**: Validates recipe prompts and conversation data
- **Error Handling**: Graceful degradation when AI service is unavailable
```

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

### Business KPIs
- **User Engagement**: 60% of users complete cooking sessions
- **Feature Adoption**: 40% of users try AI cooking guide
- **Community Growth**: 25% of users share cooking photos
- **Retention**: 70% of users return within 7 days

This engineering specification provides a comprehensive technical foundation for implementing the Mise Cooking app with all planned features, ensuring scalability, security, and performance requirements are met. 