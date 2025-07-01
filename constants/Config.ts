// API Configuration
export const API_CONFIG = {
  // Development environment uses localhost
  // Production environment uses Railway deployment
  BASE_URL: __DEV__ 
    ? 'http://localhost:8080'  // Local development
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