import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StartCookingButton } from '../cooking/StartCookingButton';

interface Recipe {
  id: string;
  name: string;
  description: string;
  totalTime: string;
  servings: number;
  instructions: string[];
  ingredients?: string[];
}

interface RecipeDetailCardProps {
  recipe: Recipe;
}

export function RecipeDetailCard({ recipe }: RecipeDetailCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.name}</Text>
        <Text style={styles.description}>{recipe.description}</Text>
      </View>

      <View style={styles.metaInfo}>
        <View style={styles.metaItem}>
          <Ionicons name="time" size={16} color="#fcf45a" />
          <Text style={styles.metaText}>{recipe.totalTime}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people" size={16} color="#fcf45a" />
          <Text style={styles.metaText}>{recipe.servings} servings</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="list" size={16} color="#fcf45a" />
          <Text style={styles.metaText}>{recipe.instructions.length} steps</Text>
        </View>
      </View>

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
            <Text key={index} style={styles.ingredientItem}>• {ingredient}</Text>
          ))}
          {recipe.ingredients.length > 3 && (
            <Text style={styles.moreText}>+{recipe.ingredients.length - 3} more</Text>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <StartCookingButton recipe={recipe} size="large" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#fcf45a',
    marginLeft: 4,
    fontWeight: '600',
  },
  ingredientsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  ingredientItem: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
    marginLeft: 8,
  },
  moreText: {
    fontSize: 12,
    color: '#fcf45a',
    fontStyle: 'italic',
    marginLeft: 8,
    marginTop: 4,
  },
  actions: {
    alignItems: 'center',
  },
}); 