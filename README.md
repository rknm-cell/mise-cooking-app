# Mise Cooking App 👨‍🍳

**Discover the Joy of Cooking** - An AI-powered recipe generation and cooking guidance app built with React Native and Expo.

## About

Mise Cooking (pronounced "meez") derived from mise en place a French culinary term meaning "everything in place." This app helps you discover and create recipes using AI-powered recipe generation, manage your cooking journey with real-time guidance, and connect with a community of home chefs.

## Features

### 🎯 Core Features
- **AI Recipe Generation** - Generate personalized recipes using OpenAI GPT-4o-mini
- **Recipe Management** - Browse, search, and save your favorite recipes
- **Smart Bookmarking** - Save recipes for later with user-specific bookmarks
- **Shopping Lists** - Create and manage multiple shopping lists with categories
- **User Authentication** - Secure email-based authentication with JWT tokens

### 🔮 Coming Soon (Phase 2)
- **AI Cooking Guide** - Real-time camera analysis with cooking stage detection
- **Smart Timers** - Recipe-based timers with AI confirmation
- **Social Community** - Share cooking results and discover community recipes
- **Voice Guidance** - Hands-free cooking instructions

## Tech Stack

### Frontend
- **React Native** with Expo SDK 53
- **Expo Router** for file-based navigation
- **NativeWind** (Tailwind CSS for React Native)
- **TypeScript** for type safety
- **Expo Camera** for real-time video processing
- **React Context API** for state management

### Backend
- **Bun** runtime with Express.js
- **PostgreSQL** database with Drizzle ORM
- **Better Auth** for authentication
- **OpenAI GPT-4o-mini** for AI recipe generation
- **Google Cloud Vision API** for computer vision
- **Railway** for deployment

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Bun (for backend development)
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mise-cooking
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   bun install
   ```

4. **Set up environment variables**
   ```bash
   # Frontend (.env)
   EXPO_PUBLIC_API_URL=http://localhost:3000
   
   # Backend (.env)
   DATABASE_URL=your_postgresql_url
   OPENAI_API_KEY=your_openai_key
   GOOGLE_CLOUD_VISION_KEY=your_vision_api_key
   JWT_SECRET=your_jwt_secret
   ```

5. **Start the development server**
   ```bash
   # Terminal 1: Start backend
   cd backend
   bun run dev
   
   # Terminal 2: Start frontend
   npx expo start
   ```

### Development Options

- **Expo Go** - Scan QR code with Expo Go app (limited camera features)
- **Development Build** - Full native features including camera
- **iOS Simulator** - Press `i` in Expo CLI
- **Android Emulator** - Press `a` in Expo CLI
- **Web Browser** - Press `w` in Expo CLI

## Project Structure

```
mise-cooking/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── (modal)/           # Modal screens
├── components/            # Reusable UI components
│   ├── cooking/           # Camera and cooking components
│   └── ui/                # Basic UI components
├── backend/               # Express.js API server
│   ├── routes/            # API endpoints
│   ├── db/                # Database schema and queries
│   └── models/            # Data models
├── contexts/              # React Context providers
├── services/              # API service functions
└── constants/             # App constants and configuration
```

## Current Status

### ✅ Implemented
- User authentication system
- AI recipe generation with OpenAI
- Recipe browsing and management
- Bookmarking system
- Shopping list CRUD operations
- Basic camera test component
- Database schema and migrations
- API endpoints for core features

### 🚧 In Progress
- Camera integration for cooking guidance
- Real-time AI analysis
- Social community features

### 📋 Planned
- Voice guidance system
- Advanced AI cooking assistance
- Community recipe sharing
- Performance optimizations

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Recipes
- `POST /api/generate` - Generate AI recipe
- `GET /api/recipes` - Fetch all recipes
- `GET /api/recipes/:id` - Get specific recipe

### Bookmarks
- `GET /api/bookmarks/:userId` - Get user bookmarks
- `POST /api/bookmarks` - Save bookmark
- `DELETE /api/bookmarks` - Remove bookmark

### Shopping Lists
- `GET /api/shopping-lists` - Get user lists
- `POST /api/shopping-lists` - Create list
- `PUT /api/shopping-lists/:id` - Update list
- `DELETE /api/shopping-lists/:id` - Delete list

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check the [PROJECT_SPEC.md](PROJECT_SPEC.md) and [ENGINEERING_SPEC.md](ENGINEERING_SPEC.md) for detailed specifications
- **Issues**: Report bugs and feature requests on GitHub
- **Community**: Join our Discord for discussions and support

---

Built with ❤️ using React Native, Expo, and AI technology to make cooking more accessible and enjoyable for everyone.
