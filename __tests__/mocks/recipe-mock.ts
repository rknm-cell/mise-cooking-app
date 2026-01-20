export const mockRecipe = {
  id: 'mock-recipe-123',
  name: 'Mock Pasta Carbonara',
  description: 'A traditional Italian pasta dish with eggs, cheese, and pancetta',
  totalTime: '30 minutes',
  servings: 4,
  ingredients: [
    '400g spaghetti',
    '200g pancetta, diced',
    '4 large eggs',
    '100g Pecorino Romano, grated',
    'Black pepper to taste',
    'Salt for pasta water',
  ],
  instructions: [
    'Bring large pot of salted water to boil',
    'Cook spaghetti according to package directions (8-10 minutes)',
    'Meanwhile, cook pancetta in large skillet over medium heat until crispy (5-7 minutes)',
    'Beat eggs with grated cheese in a bowl',
    'Drain pasta, reserving 1 cup cooking water',
    'Add hot pasta to pancetta, remove from heat',
    'Quickly stir in egg mixture, adding pasta water as needed for creamy consistency',
    'Season generously with black pepper and serve immediately',
  ],
  storage: 'Best served immediately. Leftovers can be stored in an airtight container in the refrigerator for up to 2 days. Reheat gently with a splash of water.',
  nutrition: [
    'Calories: 520 per serving',
    'Protein: 25g',
    'Carbohydrates: 65g',
    'Fat: 18g',
    'Fiber: 3g',
  ],
};

export const mockRecipeList = [
  mockRecipe,
  {
    ...mockRecipe,
    id: 'mock-recipe-456',
    name: 'Mock Chicken Parmesan',
    description: 'Breaded chicken cutlets topped with marinara and mozzarella',
    totalTime: '45 minutes',
  },
  {
    ...mockRecipe,
    id: 'mock-recipe-789',
    name: 'Mock Caesar Salad',
    description: 'Classic Caesar salad with homemade dressing',
    totalTime: '15 minutes',
  },
];

export const mockGeneratedRecipe = {
  object: {
    id: 'generated-123',
    name: 'AI Generated Pizza',
    description: 'A delicious homemade pizza',
    totalTime: '45 minutes',
    servings: 4,
    ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Fresh basil'],
    instructions: ['Roll out dough', 'Spread sauce', 'Add cheese', 'Bake at 450°F for 12-15 minutes'],
    storage: 'Store in refrigerator for up to 3 days',
    nutrition: ['Calories: 280', 'Protein: 12g', 'Fat: 10g'],
  },
};

export const mockModifiedRecipe = {
  object: {
    id: 'modified-123',
    name: 'Vegan AI Generated Pizza',
    description: 'A delicious homemade vegan pizza',
    totalTime: '45 minutes',
    servings: 4,
    ingredients: ['Pizza dough', 'Tomato sauce', 'Vegan mozzarella', 'Fresh basil'],
    instructions: ['Roll out dough', 'Spread sauce', 'Add vegan cheese', 'Bake at 450°F for 12-15 minutes'],
    storage: 'Store in refrigerator for up to 3 days',
    nutrition: ['Calories: 250', 'Protein: 8g', 'Fat: 8g'],
    isModification: true,
    conversationContext: 'Based on conversation: make it vegan',
  },
};
