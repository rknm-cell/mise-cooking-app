import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GenerateScreen() {
  const [ingredients, setIngredients] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState('');

  const cuisineOptions = [
    'Italian', 'Mexican', 'Asian', 'Mediterranean', 'Indian', 
    'French', 'American', 'Thai', 'Japanese', 'Greek'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Low-Carb', 'Keto', 'Paleo', 'None'
  ];

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      Alert.alert('Error', 'Please enter at least one ingredient');
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call for recipe generation
    setTimeout(() => {
      const mockRecipe = `🍳 Recipe Generated!

Ingredients:
${ingredients.split(',').map(ing => `• ${ing.trim()}`).join('\n')}

${cuisine ? `Cuisine: ${cuisine}` : ''}
${dietaryRestrictions ? `Dietary: ${dietaryRestrictions}` : ''}

Instructions:
1. Prepare all ingredients as listed above
2. Heat a large pan over medium heat
3. Add your main ingredients and cook for 5-7 minutes
4. Season with salt, pepper, and your favorite herbs
5. Serve hot and enjoy!

Cooking Time: 20-25 minutes
Servings: 2-3 people

💡 Tip: Feel free to adjust seasoning and cooking time based on your preferences!`;

      setGeneratedRecipe(mockRecipe);
      setIsGenerating(false);
    }, 2000);
  };

  const clearForm = () => {
    setIngredients('');
    setCuisine('');
    setDietaryRestrictions('');
    setGeneratedRecipe('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={{ flex: 1, padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
              Generate Recipe
            </Text>
            <Text style={{ fontSize: 16, opacity: 0.7, color: '#666' }}>
              Tell us what ingredients you have, and we'll create a delicious recipe for you!
            </Text>
          </View>

          {/* Ingredients Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#333' }}>
              Available Ingredients
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 12,
                padding: 15,
                fontSize: 16,
                backgroundColor: '#fff',
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              placeholder="Enter ingredients separated by commas (e.g., chicken, rice, tomatoes)"
              value={ingredients}
              onChangeText={setIngredients}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Cuisine Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#333' }}>
              Preferred Cuisine (Optional)
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10 }}
            >
              {cuisineOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setCuisine(cuisine === option ? '' : option)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 10,
                    backgroundColor: cuisine === option ? '#007AFF' : '#f0f0f0',
                  }}
                >
                  <Text style={{
                    color: cuisine === option ? '#fff' : '#333',
                    fontSize: 14,
                    fontWeight: '500',
                  }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Dietary Restrictions */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#333' }}>
              Dietary Restrictions (Optional)
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10 }}
            >
              {dietaryOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setDietaryRestrictions(dietaryRestrictions === option ? '' : option)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 10,
                    backgroundColor: dietaryRestrictions === option ? '#34C759' : '#f0f0f0',
                  }}
                >
                  <Text style={{
                    color: dietaryRestrictions === option ? '#fff' : '#333',
                    fontSize: 14,
                    fontWeight: '500',
                  }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            onPress={handleGenerateRecipe}
            disabled={isGenerating}
            style={{
              backgroundColor: '#007AFF',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 20,
              opacity: isGenerating ? 0.6 : 1,
            }}
          >
            {isGenerating ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                  Generating Recipe...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="restaurant" size={24} color="#fff" style={{ marginRight: 10 }} />
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                  Generate Recipe
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Clear Button */}
          <TouchableOpacity
            onPress={clearForm}
            style={{
              backgroundColor: '#f0f0f0',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text style={{ color: '#666', fontSize: 16, fontWeight: '500' }}>
              Clear Form
            </Text>
          </TouchableOpacity>

          {/* Generated Recipe */}
          {generatedRecipe ? (
            <View style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e9ecef',
            }}>
              <Text style={{ 
                fontSize: 16, 
                lineHeight: 24,
                color: '#333'
              }}>
                {generatedRecipe}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
