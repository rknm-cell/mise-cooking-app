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

### 3. Bookmarking System
- **Save Favorites**: Bookmark recipes for later access
- **User-Specific**: Bookmarks tied to authenticated users
- **Quick Access**: Dedicated bookmarks tab
- **Persistent Storage**: Bookmarks stored in database

### 4. Shopping List Management
- **Create Lists**: Multiple shopping lists per user
- **Add Items**: Add ingredients with quantities and units
- **Categorize**: Organize items by categories
- **Track Progress**: Mark items as completed
- **CRUD Operations**: Create, read, update, delete lists and items

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

### 7. Social Recipe Community
- **Recipe Sharing**: Users can share photos of their completed dishes
- **Social Feed**: Browse other users' cooking results for specific recipes
- **Rating System**: Upvote/downvote recipes with automatic moderation
- **Recipe Moderation**: Recipes with -1 or lower rating over 24 hours get automatically removed
- **Community Engagement**: Like, comment, and interact with other users' cooking posts

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

### Key Relationships
- Users can have multiple bookmarks, shopping lists, and cooking sessions
- Recipes can be bookmarked by multiple users and have multiple ratings
- Shopping lists contain multiple items
- Cooking sessions track progress through recipe steps
- Users can share multiple photos for each recipe
- Community posts are linked to recipes and users

## API Endpoints

### Recipe Management
- `POST /api/generate` - Generate new recipe with AI
- `GET /api/recipes` - Fetch all recipes
- `GET /api/recipes/:id` - Get specific recipe
- `POST /api/recipes` - Save recipe to database

### Bookmark Management
- `GET /api/bookmarks/:userId` - Get user's bookmarks
- `POST /api/bookmarks` - Save bookmark
- `DELETE /api/bookmarks` - Remove bookmark

### Shopping List Management
- `GET /api/shopping-lists` - Get user's shopping lists
- `POST /api/shopping-lists` - Create new list
- `PUT /api/shopping-lists/:id` - Update list
- `DELETE /api/shopping-lists/:id` - Delete list
- `GET /api/shopping-lists/:id/items` - Get list items
- `POST /api/shopping-lists/:id/items` - Add item to list
- `PUT /api/shopping-lists/:id/items/:itemId` - Update item
- `DELETE /api/shopping-lists/:id/items/:itemId` - Remove item

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
- **Tab Navigation**: 6 main tabs
  - Generate (Recipe AI)
  - Recipes (Browse)
  - Cooking Guide (AI Camera)
  - Bookmarks (Saved)
  - Community (Social Feed)
  - Profile (User)

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