import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderWithProfile } from '../../components/HeaderWithProfile';
import { RecipeDetailCard } from '../../components/RecipeDetailCard';

// Sample recipe data for demo
const sampleRecipeData = {
  id: 'demo-recipe-1',
  name: 'Spaghetti Carbonara',
  description: 'A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper. Simple yet delicious!',
  totalTime: '25 minutes',
  servings: 4,
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
  ingredients: [
    '400g spaghetti',
    '200g pancetta, cubed',
    '4 large eggs',
    '100g Pecorino Romano cheese, grated',
    '100g Parmigiano-Reggiano cheese, grated',
    '4 cloves garlic, minced',
    '1 tsp black pepper, freshly ground',
    'Salt to taste',
    '2 tbsp olive oil'
  ]
};

export default function RecipeDemoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithProfile title="Recipe Demo" subtitle="Start cooking with recipe data" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <RecipeDetailCard recipe={sampleRecipeData} />
        
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works:</Text>
            <Text style={styles.infoText}>
              1. Tap the "Start Cooking" button on the recipe card above
            </Text>
            <Text style={styles.infoText}>
              2. You'll be taken to the cooking session with this recipe's instructions
            </Text>
            <Text style={styles.infoText}>
              3. Follow the step-by-step cooking process
            </Text>
            <Text style={styles.infoText}>
              4. Complete each step to advance automatically
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d7b86',
  },
  scrollView: {
    flex: 1,
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#2d8d8b',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 8,
  },
}); 