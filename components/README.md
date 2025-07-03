# Mise Cooking Component Library

This directory contains all React Native components used in the Mise Cooking app, organized by feature and following consistent patterns.

## 📁 Directory Structure

```
components/
├── auth/           # Authentication components
├── cooking/        # Cooking session components
├── navigation/     # Navigation components
├── recipes/        # Recipe-related components
├── ui/             # Shared UI components
├── shopping/       # Shopping list components (future)
├── types.ts        # Shared type definitions
├── index.ts        # Main barrel exports
└── README.md       # This file
```

## 🎯 Component Categories

### Authentication (`auth/`)
Components related to user authentication and session management.

- **AuthGuard**: Wraps the app and handles authentication state

### Cooking (`cooking/`)
Components for cooking sessions and real-time cooking guidance.

- **CameraTest**: Basic camera functionality for testing
- **CookingProgress**: Visual progress tracking for cooking sessions
- **RecipeSession**: Full cooking session management
- **SmartTimer**: AI-powered timer with cooking stage context
- **StartCookingButton**: Button to initiate cooking sessions

### Navigation (`navigation/`)
Components for app navigation and header layouts.

- **HeaderWithProfile**: Consistent header with profile navigation

### Recipes (`recipes/`)
Components for recipe display and management.

- **BookmarkButton**: Toggle button for recipe bookmarks
- **RecipeDetailCard**: Card component for recipe details

### UI (`ui/`)
Shared UI components used across the app.

- **HapticTab**: Tab button with haptic feedback
- **IconSymbol**: Icon wrapper with consistent mapping
- **ParallaxScrollView**: Enhanced scrolling experience
- **StyledTitle**: Custom title component with variants
- **TabBarBackground**: Tab bar styling component
- **ThemedText**: Theme-aware text component
- **ThemedView**: Theme-aware view component

## 🏗️ Component Patterns

### Standard Component Structure

All components follow this consistent pattern:

```typescript
import React from 'react';
import { /* React Native imports */ } from 'react-native';
import { /* other imports */ } from '../path';

/**
 * Props for the ComponentName component
 */
export interface ComponentNameProps {
  /** Description of the prop */
  propName: string;
  /** Optional prop with default value */
  optionalProp?: string;
}

/**
 * ComponentName component description
 * 
 * Detailed description of what the component does,
 * its purpose, and how it should be used.
 * 
 * @param props - The component props
 * @returns Description of what the component renders
 */
export function ComponentName({ propName, optionalProp = 'default' }: ComponentNameProps) {
  // Component logic here
  
  return (
    // JSX here
  );
}

const styles = StyleSheet.create({
  // Styles here
});
```

### Export Patterns

- **Named exports**: Used for most components (`export function ComponentName`)
- **Default exports**: Used sparingly, mainly for legacy compatibility
- **Barrel exports**: Each directory has an `index.ts` file for clean imports

### TypeScript Patterns

- **Shared types**: Common interfaces defined in `types.ts`
- **Component-specific types**: Defined in the component file when not shared
- **Proper interfaces**: All props are properly typed with JSDoc comments

## 📦 Importing Components

### Using Barrel Exports (Recommended)

```typescript
// Import multiple components from one place
import { 
  AuthGuard, 
  HeaderWithProfile, 
  ThemedText, 
  ThemedView,
  BookmarkButton,
  StartCookingButton 
} from '../components';

// Import from specific feature directories
import { AuthGuard } from '../components/auth';
import { HeaderWithProfile } from '../components/navigation';
import { ThemedText, ThemedView } from '../components/ui';
```

### Importing Shared Types

```typescript
import { Recipe, ComponentSize, LoadingState } from '../components';
```

## 🎨 Design System

### Color Palette
- **Primary**: `#1d7b86` (Teal)
- **Secondary**: `#426b70` (Light teal)
- **Accent**: `#fcf45a` (Yellow)
- **Text**: White, dark gray
- **Background**: Gradient overlays with transparency

### Typography
- **Primary Font**: `NanumPenScript-Regular`
- **Fallback**: `Arial, sans-serif`
- **Size Variants**: `small`, `medium`, `large`

### Component Sizes
- **Small**: Compact, for secondary actions
- **Medium**: Standard, for most use cases
- **Large**: Prominent, for primary actions

## 🔧 Development Guidelines

### Adding New Components

1. **Choose the right directory** based on the component's purpose
2. **Follow the standard structure** with proper TypeScript interfaces
3. **Add JSDoc documentation** for props and component purpose
4. **Use shared types** when possible to avoid duplication
5. **Update barrel exports** in the appropriate `index.ts` file
6. **Test the component** in isolation before integration

### Component Naming

- **PascalCase** for component names: `RecipeDetailCard`
- **camelCase** for props: `recipeId`, `totalTime`
- **Descriptive names** that clearly indicate purpose

### Props Design

- **Required props first**, optional props last
- **Provide sensible defaults** for optional props
- **Use TypeScript interfaces** for all prop definitions
- **Add JSDoc comments** for all props

### Styling Guidelines

- **Use StyleSheet.create()** for all styles
- **Follow the design system** colors and typography
- **Make components responsive** where appropriate
- **Use consistent spacing** and sizing

## 🧪 Testing

### Component Testing Checklist

- [ ] Component renders without errors
- [ ] Props are properly typed and validated
- [ ] Default props work correctly
- [ ] Component handles edge cases gracefully
- [ ] Styling is consistent with design system
- [ ] Accessibility features are implemented

### Integration Testing

- [ ] Component works with barrel exports
- [ ] Component integrates with navigation
- [ ] Component handles theme changes
- [ ] Component works with authentication context

## 📚 Examples

### Basic Component Usage

```typescript
import { ThemedText, ThemedView } from '../components';

export function MyScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome to Mise Cooking</ThemedText>
      <ThemedText type="subtitle">Discover the joy of cooking</ThemedText>
    </ThemedView>
  );
}
```

### Component with Props

```typescript
import { StyledTitle, BookmarkButton } from '../components';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <View>
      <StyledTitle 
        title={recipe.name} 
        subtitle={recipe.description}
        size="medium"
      />
      <BookmarkButton 
        recipeId={recipe.id}
        size={24}
        color="#666"
        activeColor="#fcf45a"
      />
    </View>
  );
}
```

## 🔄 Migration Guide

### From Old Import Patterns

**Before:**
```typescript
import { HeaderWithProfile } from '@/components/HeaderWithProfile';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
```

**After:**
```typescript
import { HeaderWithProfile, ThemedText, ThemedView } from '@/components';
```

### From Default Exports

**Before:**
```typescript
import BookmarkButton from '../components/BookmarkButton';
import StyledTitle from '../components/StyledTitle';
```

**After:**
```typescript
import { BookmarkButton, StyledTitle } from '../components';
```

## 🚀 Future Enhancements

### Planned Features

- **Storybook integration** for component documentation
- **Component playground** for testing and development
- **Design system tokens** for consistent theming
- **Performance optimizations** with React.memo
- **Accessibility improvements** with proper ARIA labels

### Component Library Goals

- **100% TypeScript coverage** with proper type safety
- **Comprehensive documentation** for all components
- **Consistent design patterns** across the app
- **Easy maintenance** and extensibility
- **Developer experience** improvements

---

For questions or contributions, please refer to the main project documentation or create an issue in the repository. 