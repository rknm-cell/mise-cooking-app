import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

interface Recipe {
  id: string;
  name: string;
  description: string;
  totalTime: string;
  servings: number;
  instructions: string[];
}

interface StartCookingButtonProps {
  recipe: Recipe;
  size?: 'small' | 'medium' | 'large';
}

export function StartCookingButton({ recipe, size = 'medium' }: StartCookingButtonProps) {
  const handleStartCooking = () => {
    // Navigate to the simple session with recipe data
    router.push({
      pathname: '/(tabs)/simple-session',
      params: {
        recipeId: recipe.id,
        recipeName: recipe.name,
        recipeDescription: recipe.description,
        recipeTotalTime: recipe.totalTime,
        recipeServings: recipe.servings.toString(),
        recipeInstructions: JSON.stringify(recipe.instructions),
      }
    });
  };

  const getButtonStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle()]}
      onPress={handleStartCooking}
      activeOpacity={0.8}
    >
      <Ionicons name="restaurant" size={getIconSize()} color="#fff" />
      <Text style={[styles.buttonText, getTextStyle()]}>Start Cooking</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fcf45a',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#1d7b86',
    fontWeight: '600',
    marginLeft: 6,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
}); 