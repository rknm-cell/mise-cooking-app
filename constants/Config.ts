// API Configuration
export const API_CONFIG = {
  // Development environment uses localhost
  // Production environment uses Railway deployment
  BASE_URL: __DEV__ 
    ? 'http://localhost:8080'  // Local development
    : 'https://mise-cooking-app-production.up.railway.app', // Production
  
  // API endpoints
  ENDPOINTS: {
    GENERATE: '/api/generate',
    RECIPES: '/api/recipes',
    RECIPE_BY_ID: (id: string) => `/api/recipes/${id}`,
    SAVE_RECIPE: '/api/recipes',
    BOOKMARKS: '/api/bookmarks',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Environment detection
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__; 