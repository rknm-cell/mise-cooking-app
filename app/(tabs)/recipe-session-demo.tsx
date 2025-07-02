import React from 'react';
import { RecipeSession } from '../../components/cooking/RecipeSession';
import { CookingSessionProvider } from '../../contexts/CookingSessionContext';

export default function RecipeSessionDemo() {
  return (
    <CookingSessionProvider>
      <RecipeSession 
        recipeId="demo-recipe-123"
        recipeName="Spaghetti Carbonara"
      />
    </CookingSessionProvider>
  );
} 