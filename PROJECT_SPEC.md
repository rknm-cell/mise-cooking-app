# Mise Cooking App - Project Specification

## Project Overview

**Mise Cooking** is a React Native mobile application that helps users discover and create recipes using AI-powered recipe generation. The app allows users to generate personalized recipes based on available ingredients, save favorites, manage shopping lists, and explore culinary creations.

### Project Name
- **Name**: Mise Cooking
- **Pronunciation**: "Mise" (meez) - French culinary term meaning "everything in place"
- **Tagline**: "Discover the Joy of Cooking"

## Technology Stack

### Frontend (Mobile App)
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Icons**: Expo Vector Icons (Ionicons)
- **Camera**: Expo Camera for real-time video processing
- **State Management**: React Context API
- **Authentication**: Custom auth system with JWT tokens
- **Storage**: AsyncStorage for local data persistence

### Backend (API Server)
- **Runtime**: Bun (JavaScript runtime)
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth library
- **AI Integration**: OpenAI GPT-4o-mini via AI SDK
- **Computer Vision**: Google Cloud Vision API / Azure Computer Vision
- **On-Device AI**: TensorFlow Lite / MediaPipe for basic detection
- **Real-time Processing**: WebSocket for live camera feed
- **Deployment**: Railway
- **Security**: Helmet, CORS, Rate limiting

### Development Tools
- **Language**: TypeScript
- **Linting**: ESLint with Expo config
- **Package Manager**: npm (frontend), Bun (backend)
- **Database Migrations**: Drizzle Kit

## Core Features

### 1. AI-Powered Recipe Generation
- **Input**: Natural language prompts describing ingredients, dietary preferences, or recipe ideas
- **AI Model**: OpenAI GPT-4o-mini
- **Output**: Structured recipe data including:
  - Recipe name and description
  - Total cooking time and servings
  - Detailed ingredients list with measurements
  - Step-by-step instructions
  - Storage recommendations
  - Nutritional information
- **Conversation Context**: Maintains conversation history for follow-up requests and modifications

### 2. Recipe Management
- **Recipe Discovery**: Browse all generated recipes
- **Search & Filter**: Search recipes by name, description, or ingredients
- **Recipe Details**: Full recipe view with all information
- **Recipe Storage**: All recipes saved to PostgreSQL database

### 2.1 Recipe Collections & Landing Page
- **Featured Collections**
  - Popular Recipes
    - Sorted by community ratings and cooking frequency
    - Updated daily based on user engagement
  
  - Seasonal Recipes
    - Dynamically updated based on current season/month
    - Local seasonal ingredients highlighted
    - Holiday-specific collections
    - Special occasion recipes
  
  - Personalized Collections
    - Based on user's cooking history and preferences
    - Dietary preferences consideration
    - Cuisine type preferences
    - Cooking skill level adaptation
    - Recently viewed recipes
    - "Because you cooked X" recommendations
  
  - Past Favorites
    - User's successfully completed recipes
    - Personal ratings and notes displayed
    - Cooking frequency indicator
    - Last cooked date
    - Personal modifications saved
  
- **Collection Features**
  - Horizontal scrolling card layout
  - Visual preview with recipe photos
  - Quick action buttons (bookmark, cook now)
  - Key information display:
    - Cooking time
    - Difficulty level
    - Rating score
    - Number of ingredients
  
- **Collection Management**
  - Dynamic updates based on user activity
  - Cache for offline viewing
  - Pull-to-refresh functionality
  - "See All" expansion option
  - Collection sharing capability
  
- **Personalization**
  - Machine learning-based recipe suggestions
  - Preference learning from user interactions
  - Time-of-day appropriate suggestions
  - Special dietary considerations
  - Skill level adaptations

### 3. Bookmarking System
- **Save Favorites**: Bookmark recipes for later access
- **User-Specific**: Bookmarks tied to authenticated users
- **Quick Access**: Dedicated bookmarks tab
- **Persistent Storage**: Bookmarks stored in database

### 4. Shopping List Management
- **Unified Shopping List**
  - Single consolidated list of ingredients for each user
  - Simple add/remove functionality
  - Check-off system for purchased items
  - Clear all/clear completed options

- **Adding from Recipes**
  - Ingredient selection interface when adding from recipes
  - Checkbox system to select specific ingredients
  - Option to select/deselect all
  - Duplicate ingredient detection and merging
  - Quantity adjustment for existing items

- **List Features**
  - Mark items as purchased/unpurchased
  - Sort by:
    - Recently added
    - Purchased status
    - Alphabetical order
  - Search/filter within list
  - Quick delete functionality

- **Storage**
  - Real-time sync across devices
  - Offline access to list
  - Persistent storage in database

### 5. User Authentication
- **Sign Up/Sign In**: Email-based authentication
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Persistent login sessions
- **User Profiles**: Basic user information storage

### 6. AI-Powered Cooking Guide
- **Real-time Camera Analysis**: Live video processing during cooking with 5-second intervals
- **Cooking Stage Detection**: AI recognition of ingredient prep, food cooking, and plating stages
- **Smart Timer Integration**: Recipe-based timer triggers with AI confirmation of cooking conditions
- **Hands-free Guidance**: Voice announcements for critical steps, visual overlays for details
- **Cooking Session Management**: User-initiated sessions tracking progress across recipes
- **Multi-recipe Support**: AI-optimized cooking sequences for efficient parallel preparation
- **Tiered AI System**: On-device basic detection (free) + Cloud AI detailed analysis (premium)
- **Fallback System**: Manual step progression when AI analysis fails
- **Performance Target**: 2-second response time (max 10 seconds acceptable)

#### 6.1 AI Chat Assistant for Recipe Sessions
- **Context-Aware Guidance**: AI understands current recipe step and offers relevant tips
- **Real-Time Problem Solving**: Immediate assistance for cooking issues and questions
- **Ingredient Substitutions**: Smart suggestions for missing ingredients with quantity adjustments
- **Cooking Technique Explanations**: Step-by-step guidance for unfamiliar techniques
- **Voice-First Interaction**: Hands-free operation with voice commands and responses
- **Progressive Skill Adaptation**: Adjusts explanations based on user's cooking experience level

##### AI Assistant Features
- **Floating Chat Interface**: Non-intrusive chat bubble in bottom-right corner
- **Quick Action Buttons**: Common questions like "What's next?", "How long?", "Substitute?"
- **Contextual Suggestions**: Proactive tips based on current step and cooking progress
- **Troubleshooting Mode**: Step-by-step solutions for common cooking problems
- **Session Setup Guidance**: Pre-cooking tips, prep work suggestions, and timing advice
- **Step Transition Support**: Confirmation of completion and next step preparation
- **Multitasking Suggestions**: AI-optimized cooking sequences and timing coordination

##### AI Assistant UI/UX Design
- **Chat Bubble States**: Idle, active, listening, and suggestion modes with visual feedback
- **Expandable Chat Panel**: Slides up from bottom, takes 40% screen height when active
- **Message Types**: AI suggestions (left-aligned), user questions (right-aligned), system messages
- **Voice Integration**: Prominent microphone button, animated listening states, voice playback
- **Responsive Layout**: Adapts to portrait/landscape modes and different screen sizes
- **Accessibility**: Voice-first design, haptic feedback, high contrast message bubbles
- **Non-Disruptive**: Maintains focus on cooking steps, easy to ignore when not needed

##### AI Assistant Conversation Examples
- **Ingredient Help**: "I don't have fresh basil" → AI suggests dried basil, spinach, or alternatives
- **Technique Guidance**: "How do I properly dice an onion?" → Step-by-step explanation
- **Problem Solving**: "My sauce is separating" → Immediate troubleshooting steps
- **Timing Questions**: "How do I know when the pasta is al dente?" → Visual and tactile cues
- **Substitution Requests**: "What can I use instead of white wine?" → Multiple options with ratios

### 7. Social Recipe Community
- **Recipe Ratings & Reviews**
  - Upvote/downvote system for recipes
  - Rating statistics visible on recipe cards
  - Automatic recipe moderation based on rating threshold
  - Comments section for each recipe
  - Ability to reply to comments
  - Comment moderation system

- **Recipe Photos & Sharing**
  - Users can share photos of their completed dishes
  - Multiple photos per recipe allowed
  - Photo captions and descriptions
  - Photo gallery view for each recipe
  - Option to share photos on social media
  - Photo moderation system

- **User Cooking History**
  - Track all recipes a user has cooked
  - Personal rating system (liked/disliked)
  - Cooking date tracking
  - Personal notes and modifications
  - Private vs public cooking history
  - Cooking statistics and achievements

- **Community Feed**
  - Chronological feed of community cooking activity
  - Filter feed by following, trending, or recent
  - Activity types include:
    - New recipe photos
    - Recipe ratings
    - Recipe comments
    - Cooking completions
    - Achievement unlocks

- **Moderation & Quality Control**
  - Automatic recipe removal if rating drops below threshold
  - Photo content moderation using AI
  - Comment moderation system
  - User reporting functionality
  - Community guidelines enforcement

- **User Profiles**
  - Public cooking history
  - Recipe contribution stats
  - Favorite recipes
  - Achievement badges
  - Following/follower system
  - Activity feed

## Database Schema

### Core Tables
1. **Users** - User account information
2. **Recipes** - Generated recipe data
3. **Bookmarks** - User-recipe relationships
4. **Shopping Lists** - User shopping lists
5. **Shopping List Items** - Individual items in lists
6. **Sessions** - Authentication sessions
7. **Accounts** - OAuth account connections
8. **Verifications** - Email verification tokens
9. **Cooking Sessions** - User-initiated cooking sessions with status tracking
10. **Cooking Steps** - Individual cooking steps with AI analysis and stage detection
11. **Cooking Photos** - User-shared cooking result photos
12. **Recipe Ratings** - User ratings and votes for recipes
13. **Community Posts** - Social media posts and interactions
14. **Recipe Comments** - User comments on recipes
15. **User Cooking History** - Track user's cooking experiences
16. **User Followers** - Social following relationships

### Key Relationships
- Users can have multiple bookmarks, shopping lists, and cooking sessions
- Recipes can be bookmarked by multiple users and have multiple ratings
- Shopping lists contain multiple items
- Cooking sessions track progress through recipe steps
- Users can share multiple photos for each recipe
- Community posts are linked to recipes and users
- Users can comment on recipes and reply to other comments
- Users maintain a history of cooked recipes with personal ratings
- Users can follow other users and view their public activity

## API Endpoints

### Recipe Management
- `POST /api/generate` - Generate new recipe with AI
- `GET /api/recipes` - Fetch all recipes
- `GET /api/recipes/:id` - Get specific recipe
- `POST /api/recipes` - Save recipe to database

### Recipe Collections
- `GET /api/collections/popular` - Get trending and highly-rated recipes
- `GET /api/collections/seasonal` - Get season-appropriate recipes
- `GET /api/collections/personalized` - Get user-tailored recipe suggestions
- `GET /api/collections/favorites` - Get user's past favorite recipes
- `GET /api/collections/recent` - Get recently viewed recipes
- `GET /api/collections/recommendations` - Get ML-based recommendations

### Bookmark Management
- `GET /api/bookmarks/:userId` - Get user's bookmarks
- `POST /api/bookmarks` - Save bookmark
- `DELETE /api/bookmarks` - Remove bookmark

### Shopping List Management
- `GET /api/shopping-list` - Get user's shopping list
- `POST /api/shopping-list/items` - Add items to shopping list
- `DELETE /api/shopping-list/items/:itemId` - Remove item from list
- `PUT /api/shopping-list/items/:itemId` - Update item status (purchased/unpurchased)
- `POST /api/shopping-list/recipe/:recipeId` - Add selected ingredients from recipe

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Cooking Guide
- `POST /api/cooking-sessions` - Start new cooking session (user-initiated)
- `PUT /api/cooking-sessions/:id/progress` - Update cooking progress and current step
- `GET /api/cooking-sessions/:id` - Get session details and step history
- `POST /api/cooking-sessions/:id/analyze` - AI image analysis (5-second intervals)
- `POST /api/cooking-sessions/:id/timer` - Set smart timer with AI confirmation
- `PUT /api/cooking-sessions/:id/optimize` - AI-optimize multi-recipe sequence
- `DELETE /api/cooking-sessions/:id` - End cooking session

### Community & Social
- `GET /api/recipes/:id/photos` - Get recipe community photos
- `POST /api/recipes/:id/photos` - Share cooking photo
- `POST /api/recipes/:id/rate` - Rate recipe (upvote/downvote)
- `GET /api/community/feed` - Get social feed
- `POST /api/community/posts` - Create community post
- `PUT /api/community/posts/:id/like` - Like/unlike post

## User Interface Design

### Design System
- **Primary Color**: Teal (#1d7b86)
- **Secondary Color**: Light teal (#426b70)
- **Accent Color**: Yellow (#fcf45a)
- **Text Colors**: White, dark gray
- **Background**: Gradient overlays with transparency

### Navigation Structure
- **Tab Navigation**: 5 main tabs
  - Generate (Recipe AI)
  - Recipes (Browse)
  - Cooking Guide (AI Camera)
  - Bookmarks (Saved)
  - Community (Social Feed)

### Key UI Components
- **StyledTitle**: Custom title component with subtitle
- **ThemedView/ThemedText**: Theme-aware components
- **RecipeCard**: Consistent recipe display
- **BookmarkButton**: Interactive bookmark toggle
- **HapticTab**: Haptic feedback tab bar
- **ParallaxScrollView**: Enhanced scrolling experience
- **CookingCameraView**: Small camera overlay (40% width) with recipe panel (60% width)
- **RecipeOverlay**: Recipe instructions panel with step-by-step guidance
- **SmartTimer**: Visual timer display with cooking stage context
- **CameraControls**: Floating camera controls (start/stop, switch camera)
- **CommunityFeed**: Social media-style recipe sharing
- **CookingProgress**: Visual progress tracking for cooking sessions
- **CollectionCarousel**: Horizontal scrolling recipe collection
- **CollectionCard**: Visual collection preview with metadata
- **SeasonalBanner**: Season-specific collection header
- **PersonalizedSection**: User-specific collection layout
- **ProfileGearIcon**: Top-right gear icon for accessing user profile settings and details

## Security Features

### Backend Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Drizzle ORM
- **JWT Token Security**: Secure token handling
- **Image Upload Security**: Secure file upload with validation
- **Content Moderation**: AI-powered content filtering for community posts

### Frontend Security
- **Token Storage**: Secure AsyncStorage usage
- **Input Sanitization**: Client-side validation
- **Error Handling**: Graceful error management

## Performance Considerations

### Frontend Optimization
- **Lazy Loading**: Images and heavy components
- **FlatList**: Efficient list rendering
- **Memoization**: React.memo for expensive components
- **Image Optimization**: Expo Image component

### Backend Optimization
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Recipe data caching
- **Response Compression**: Reduced payload sizes

## Development Workflow

### Environment Setup
1. **Frontend**: `npm install` then `npx expo start`
2. **Backend**: `bun install` then `bun run dev`
3. **Database**: PostgreSQL with Drizzle migrations

### Development Scripts
- **Frontend**: `npm start`, `npm run android`, `npm run ios`
- **Backend**: `bun run dev`, `bun run db:migrate`, `bun run db:studio`

### Deployment
- **Frontend**: Expo EAS Build
- **Backend**: Railway deployment
- **Database**: PostgreSQL on Railway

## Implementation Strategy

### Phase 1: Camera Integration (MVP)
1. **Expo Camera Setup**: Basic camera integration with permissions
2. **Camera Overlay UI**: Small camera view (40%) with recipe panel (60%)
3. **Camera Controls**: Start/stop, switch camera functionality
4. **Basic Recipe Integration**: Simple 3-step recipe for testing

### Phase 2: Basic AI Detection (Proof of Concept)
1. **On-Device AI**: TensorFlow Lite for basic stage detection
2. **Three-Stage Detection**: Prep, cooking, plating recognition
3. **Manual Fallback**: Button/voice progression when AI fails
4. **Simple Recipe Test**: "Boil water" recipe for validation

### Phase 3: Hybrid AI System (Production)
1. **Cloud AI Integration**: Google Cloud Vision API for detailed analysis
2. **Tiered System**: Free (on-device) + Premium (cloud AI)
3. **Smart Timer Integration**: Recipe-based timers with AI confirmation
4. **Performance Optimization**: 2-second response time target

### Phase 4: Multi-Recipe Coordination (Advanced)
1. **Recipe Optimization Engine**: AI-generated optimal cooking sequences
2. **Parallel Cooking Support**: Multiple recipes with staggered timing
3. **Resource Coordination**: Shared ingredients and equipment management
4. **Advanced UI**: Multi-recipe interface with progress tracking

## Future Enhancements

### Planned Features
1. **Recipe Sharing**: Social sharing capabilities
2. **Meal Planning**: Weekly meal planning tools
3. **Nutrition Tracking**: Detailed nutritional analysis
4. **Recipe Ratings**: User rating and review system
5. **Dietary Filters**: Vegan, gluten-free, etc.
6. **Recipe Scaling**: Adjust servings automatically
7. **Offline Mode**: Cached recipes for offline access
8. **Push Notifications**: Recipe reminders and updates
9. **Voice Commands**: Hands-free recipe navigation
10. **Ingredient Recognition**: AI-powered ingredient identification
11. **Cooking Analytics**: Track cooking patterns and preferences
12. **Recipe Collaboration**: Multi-user recipe creation and editing

### Technical Improvements
1. **Real-time Updates**: WebSocket integration
2. **Image Generation**: AI-generated recipe images
3. **Voice Input**: Voice-to-text recipe generation
4. **Barcode Scanning**: Scan ingredients for recipes
5. **Recipe Import**: Import from external sources
6. **Advanced Search**: Semantic search capabilities
7. **Edge Computing**: On-device AI processing for privacy
8. **Federated Learning**: Improve AI models from user data
9. **AR Integration**: Augmented reality cooking guidance
10. **IoT Integration**: Smart kitchen device connectivity

## Project Structure

```
mise-cooking/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (modal)/           # Modal screens
│   ├── (tabs)/            # Main tab navigation
│   └── index.tsx          # Landing page
├── backend/               # Express.js API server
│   ├── db/               # Database schema and queries
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   ├── ai/               # AI and computer vision services
│   │   ├── vision/       # Google Cloud Vision integration
│   │   ├── tensorflow/   # On-device AI models
│   │   └── optimization/ # Multi-recipe optimization engine
│   └── utils/            # Utility functions
├── components/           # Reusable React components
│   ├── cooking/          # Cooking guide components
│   │   ├── CookingCameraView.tsx
│   │   ├── RecipeOverlay.tsx
│   │   ├── SmartTimer.tsx
│   │   └── CameraControls.tsx
│   ├── community/        # Social features components
│   └── ui/               # UI components
├── contexts/            # React Context providers
├── services/            # API service functions
├── constants/           # App constants and config
└── hooks/               # Custom React hooks
```

## Success Metrics

### User Engagement
- Daily/Monthly Active Users
- Recipe generation frequency
- Bookmark save rate
- Shopping list usage
- Cooking session completion rate
- Community photo sharing activity
- Recipe rating participation

### Technical Performance
- API response times
- App load times
- Error rates
- Database query performance
- AI analysis response time (target: 2 seconds)
- Camera processing performance
- Multi-recipe optimization accuracy

### Business Metrics
- User retention rates
- Feature adoption rates
- User satisfaction scores
- Platform stability

This specification provides a comprehensive overview of the Mise Cooking app, covering all major aspects from technical architecture to user experience design. 