import { CookingSession, TimerSuggestion } from '../contexts/CookingSessionContext';

// Mock recipe data structure that can be replaced with actual recipe objects
export interface MockRecipe {
  id: string;
  name: string;
  description: string;
  totalTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  storage: string;
  nutrition: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  tags: string[];
}

// Mock cooking step data
export interface MockCookingStep {
  id: string;
  stepNumber: number;
  stage: 'prep' | 'cooking' | 'plating';
  title: string;
  description: string;
  estimatedTime: number; // in minutes
  ingredients: string[];
  equipment: string[];
  tips: string[];
  isCompleted: boolean;
}

// Mock cooking session data
export interface MockCookingSessionData {
  session: CookingSession;
  recipe: MockRecipe;
  steps: MockCookingStep[];
  suggestedTimers: TimerSuggestion[];
  currentStage: 'prep' | 'cooking' | 'plating';
  totalSteps: number;
  completedSteps: number;
}

// Sample recipe data
export const mockRecipe: MockRecipe = {
  id: 'spaghetti-carbonara-001',
  name: 'Spaghetti Carbonara',
  description: 'A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper',
  totalTime: '25 minutes',
  servings: 4,
  ingredients: [
    '400g spaghetti',
    '200g pancetta or guanciale, cubed',
    '4 large eggs',
    '100g Pecorino Romano cheese, grated',
    '100g Parmigiano-Reggiano cheese, grated',
    '4 cloves garlic, minced',
    '1 tsp black pepper, freshly ground',
    'Salt to taste',
    '2 tbsp olive oil'
  ],
  instructions: [
    'Bring a large pot of salted water to boil',
    'Cook spaghetti according to package directions',
    'Meanwhile, heat olive oil in a large skillet over medium heat',
    'Add pancetta and cook until crispy, about 5-7 minutes',
    'Add garlic and cook for 30 seconds until fragrant',
    'In a bowl, whisk together eggs, grated cheeses, and black pepper',
    'Drain pasta, reserving 1 cup of pasta water',
    'Add hot pasta to the skillet with pancetta',
    'Remove from heat and quickly stir in egg mixture',
    'Add pasta water as needed to create a creamy sauce',
    'Serve immediately with extra cheese and black pepper'
  ],
  storage: 'Best served immediately. Leftovers can be refrigerated for 1-2 days but may become dry.',
  nutrition: [
    'Calories: 650 per serving',
    'Protein: 25g',
    'Carbohydrates: 45g',
    'Fat: 35g',
    'Fiber: 2g'
  ],
  difficulty: 'medium',
  cuisine: 'Italian',
  tags: ['pasta', 'quick', 'dinner', 'classic']
};

// Mock cooking steps
export const mockCookingSteps: MockCookingStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    stage: 'prep',
    title: 'Prepare Ingredients',
    description: 'Gather and prepare all ingredients. Cube the pancetta, grate the cheeses, and mince the garlic.',
    estimatedTime: 10,
    ingredients: ['pancetta', 'cheeses', 'garlic'],
    equipment: ['cutting board', 'knife', 'grater'],
    tips: ['Use a sharp knife for clean cuts', 'Grate cheese finely for better melting'],
    isCompleted: false
  },
  {
    id: 'step-2',
    stepNumber: 2,
    stage: 'prep',
    title: 'Boil Water',
    description: 'Bring a large pot of salted water to a rolling boil for the pasta.',
    estimatedTime: 5,
    ingredients: ['water', 'salt'],
    equipment: ['large pot', 'stove'],
    tips: ['Salt the water generously - it should taste like seawater'],
    isCompleted: false
  },
  {
    id: 'step-3',
    stepNumber: 3,
    stage: 'cooking',
    title: 'Cook Pancetta',
    description: 'Heat oil in a large skillet and cook pancetta until crispy and golden brown.',
    estimatedTime: 7,
    ingredients: ['pancetta', 'olive oil'],
    equipment: ['large skillet', 'spatula'],
    tips: ['Don\'t overcrowd the pan', 'Cook over medium heat for even browning'],
    isCompleted: false
  },
  {
    id: 'step-4',
    stepNumber: 4,
    stage: 'cooking',
    title: 'Add Garlic',
    description: 'Add minced garlic to the skillet and cook briefly until fragrant.',
    estimatedTime: 1,
    ingredients: ['garlic'],
    equipment: ['skillet'],
    tips: ['Don\'t let garlic burn - it becomes bitter'],
    isCompleted: false
  },
  {
    id: 'step-5',
    stepNumber: 5,
    stage: 'cooking',
    title: 'Cook Pasta',
    description: 'Add pasta to boiling water and cook according to package directions.',
    estimatedTime: 12,
    ingredients: ['spaghetti'],
    equipment: ['pot', 'colander'],
    tips: ['Reserve 1 cup of pasta water before draining'],
    isCompleted: false
  },
  {
    id: 'step-6',
    stepNumber: 6,
    stage: 'cooking',
    title: 'Prepare Egg Mixture',
    description: 'Whisk together eggs, grated cheeses, and black pepper in a bowl.',
    estimatedTime: 3,
    ingredients: ['eggs', 'cheeses', 'black pepper'],
    equipment: ['bowl', 'whisk'],
    tips: ['Use room temperature eggs for better mixing'],
    isCompleted: false
  },
  {
    id: 'step-7',
    stepNumber: 7,
    stage: 'cooking',
    title: 'Combine Pasta and Sauce',
    description: 'Add hot pasta to the skillet and quickly stir in the egg mixture.',
    estimatedTime: 2,
    ingredients: ['pasta', 'egg mixture'],
    equipment: ['skillet', 'tongs'],
    tips: ['Work quickly to prevent eggs from scrambling'],
    isCompleted: false
  },
  {
    id: 'step-8',
    stepNumber: 8,
    stage: 'plating',
    title: 'Adjust Consistency',
    description: 'Add reserved pasta water as needed to create a creamy, smooth sauce.',
    estimatedTime: 1,
    ingredients: ['pasta water'],
    equipment: ['skillet'],
    tips: ['Add water gradually - you can always add more'],
    isCompleted: false
  },
  {
    id: 'step-9',
    stepNumber: 9,
    stage: 'plating',
    title: 'Plate and Serve',
    description: 'Divide pasta among serving plates and garnish with extra cheese and black pepper.',
    estimatedTime: 2,
    ingredients: ['extra cheese', 'black pepper'],
    equipment: ['serving plates', 'grater'],
    tips: ['Serve immediately while hot and creamy'],
    isCompleted: false
  }
];

// Mock timer suggestions
export const mockTimerSuggestions: TimerSuggestion[] = [
  {
    duration: 300, // 5 minutes
    stage: 'prep',
    description: 'Prep time for ingredients',
    trigger: 'manual'
  },
  {
    duration: 420, // 7 minutes
    stage: 'cooking',
    description: 'Cook pancetta until crispy',
    trigger: 'manual'
  },
  {
    duration: 720, // 12 minutes
    stage: 'cooking',
    description: 'Cook pasta al dente',
    trigger: 'manual'
  },
  {
    duration: 60, // 1 minute
    stage: 'cooking',
    description: 'Add garlic and cook briefly',
    trigger: 'manual'
  }
];

// Mock active cooking session
export const mockActiveSession: CookingSession = {
  id: 'session-001',
  userId: 'user-123',
  recipeId: 'spaghetti-carbonara-001',
  status: 'active',
  startTime: new Date(Date.now() - 15 * 60 * 1000), // Started 15 minutes ago
  currentStep: 3,
  createdAt: new Date(Date.now() - 15 * 60 * 1000)
};

// Complete mock cooking session data
export const mockCookingSessionData: MockCookingSessionData = {
  session: mockActiveSession,
  recipe: mockRecipe,
  steps: mockCookingSteps,
  suggestedTimers: mockTimerSuggestions,
  currentStage: 'cooking',
  totalSteps: mockCookingSteps.length,
  completedSteps: 2
};

// Helper functions for working with mock data
export const getStepByNumber = (stepNumber: number): MockCookingStep | undefined => {
  return mockCookingSteps.find(step => step.stepNumber === stepNumber);
};

export const getStepsByStage = (stage: 'prep' | 'cooking' | 'plating'): MockCookingStep[] => {
  return mockCookingSteps.filter(step => step.stage === stage);
};

export const getTimersByStage = (stage: string): TimerSuggestion[] => {
  return mockTimerSuggestions.filter(timer => timer.stage === stage);
};

export const calculateProgress = (completedSteps: number): number => {
  return Math.round((completedSteps / mockCookingSteps.length) * 100);
};

export const getEstimatedTotalTime = (): number => {
  return mockCookingSteps.reduce((total, step) => total + step.estimatedTime, 0);
};

// Function to create a new session from a recipe (for future use)
export const createSessionFromRecipe = (recipe: MockRecipe): MockCookingSessionData => {
  const session: CookingSession = {
    id: `session-${Date.now()}`,
    userId: 'user-123', // This would come from auth context
    recipeId: recipe.id,
    status: 'active',
    startTime: new Date(),
    currentStep: 1,
    createdAt: new Date()
  };

  // Convert recipe instructions to cooking steps
  const steps: MockCookingStep[] = recipe.instructions.map((instruction, index) => ({
    id: `step-${index + 1}`,
    stepNumber: index + 1,
    stage: index < 2 ? 'prep' : index < recipe.instructions.length - 1 ? 'cooking' : 'plating',
    title: `Step ${index + 1}`,
    description: instruction,
    estimatedTime: 5, // Default 5 minutes per step
    ingredients: [], // Would be extracted from instruction text
    equipment: [], // Would be determined based on instruction
    tips: [], // Would be generated based on recipe difficulty
    isCompleted: false
  }));

  // Generate timer suggestions based on recipe
  const timers: TimerSuggestion[] = [
    {
      duration: 300, // 5 minutes
      stage: 'prep',
      description: 'Prep time',
      trigger: 'manual'
    },
    {
      duration: 600, // 10 minutes
      stage: 'cooking',
      description: 'Main cooking time',
      trigger: 'manual'
    }
  ];

  return {
    session,
    recipe,
    steps,
    suggestedTimers: timers,
    currentStage: 'prep',
    totalSteps: steps.length,
    completedSteps: 0
  };
}; 