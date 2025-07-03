/**
 * Shared type definitions for Mise Cooking components
 */

/**
 * Base recipe data structure used across the app
 */
export interface Recipe {
  /** Unique identifier for the recipe */
  id: string;
  /** Recipe name */
  name: string;
  /** Recipe description */
  description: string;
  /** Total cooking time */
  totalTime: string;
  /** Number of servings */
  servings: number;
  /** Array of cooking instructions */
  instructions: string[];
  /** Array of ingredients (optional) */
  ingredients?: string[];
  /** Storage instructions */
  storage?: string;
  /** Nutritional information */
  nutrition?: string[];
  /** Creation timestamp */
  createdAt?: string;
}

/**
 * Common size variants used across components
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * Common color variants for theme consistency
 */
export type ThemeColor = 'primary' | 'secondary' | 'accent' | 'text' | 'background';

/**
 * Common button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Common icon names for consistency
 */
export type IconName = 
  | 'bookmark' 
  | 'bookmark-outline' 
  | 'person-circle' 
  | 'restaurant' 
  | 'time' 
  | 'people' 
  | 'list'
  | 'camera'
  | 'camera-reverse'
  | 'close'
  | 'add'
  | 'trash-outline'
  | 'chevron-forward'
  | 'checkmark'
  | 'alert-circle'
  | 'arrow-back'
  | 'cart-outline'
  | 'bulb'
  | 'heart'
  | 'arrow-forward';

/**
 * Common loading states
 */
export interface LoadingState {
  /** Whether the component is in a loading state */
  isLoading: boolean;
  /** Error message if loading failed */
  error?: string | null;
}

/**
 * Common API response structure
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if request failed */
  error?: string;
}

/**
 * Common navigation parameters
 */
export interface NavigationParams {
  /** Recipe ID for recipe-related navigation */
  recipeId?: string;
  /** Recipe name for display purposes */
  recipeName?: string;
  /** Recipe description for display purposes */
  recipeDescription?: string;
  /** Recipe total time for display purposes */
  recipeTotalTime?: string;
  /** Recipe servings for display purposes */
  recipeServings?: string;
  /** Recipe instructions as JSON string */
  recipeInstructions?: string;
} 