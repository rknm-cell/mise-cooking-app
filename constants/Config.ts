import { Platform } from 'react-native';

// API Configuration

// Utility function to get the correct IP address for development
const getDevelopmentBaseUrl = (): string => {
  // For Android simulators, we need to use the actual IP address instead of localhost
  // This is because Android simulators run in a different network namespace
  if (__DEV__) {
    // Try to get the local IP address from environment or use a fallback
    // For now, we'll use a common development IP that should work
    return 'http://192.168.1.165:8080'; // Update this to your actual IP
  }
  return 'http://localhost:8080';
};

export const API_CONFIG = {
  // Development environment uses localhost
  // Production environment uses Railway deployment
  BASE_URL: __DEV__ 
    ? getDevelopmentBaseUrl()  // Local development with correct IP
    : 'https://mise-cooking-app-production.up.railway.app', // Production
  
  // API Key will be fetched from backend
  API_KEY: null as string | null,
  
  // API endpoints
  ENDPOINTS: {
    GENERATE: '/api/generate',
    RECIPES: '/api/recipes',
    RECIPE_BY_ID: (id: string) => `/api/recipes/${id}`,
    SAVE_RECIPE: '/api/recipes',
    BOOKMARKS: '/api/bookmarks',
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
  }
};

// Font Configuration
export const FONT_CONFIG = {
  // Primary font for titles and headings
  PRIMARY: 'NanumPenScript-Regular',
  // Fallback fonts for better compatibility
  FALLBACK: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  // Combined font family for better cross-platform support
  PRIMARY_WITH_FALLBACK: 'NanumPenScript-Regular, System, sans-serif',
};

// Feature flags
export const FEATURE_FLAGS = {
  TTS_ENABLED: false, // Disable TTS for deployment
};

// Export API_BASE_URL for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Function to fetch API key from backend
export const fetchApiKey = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/config`);
    const data = await response.json();
    return data.apiKey;
  } catch (error) {
    console.error('Failed to fetch API key:', error);
    return null;
  }
};

// Helper function to get API headers with authentication
export const getApiHeaders = async (): Promise<Record<string, string>> => {
  // Fetch API key if not already loaded
  if (!API_CONFIG.API_KEY) {
    API_CONFIG.API_KEY = await fetchApiKey();
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
  };
};

// Environment detection
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__; 