#!/bin/bash

# Test script for Voice-First Cooking Assistant Tool Calls
# Make sure the backend server is running on localhost:8080

BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api/cooking-chat"

echo "🧪 Testing Voice-First Cooking Assistant Tool Calls"
echo "=================================================="
echo ""

# Test 1: Timer Management Tool Call
echo "1️⃣ Testing Timer Management Tool Call"
echo "-------------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Mise, set timer for 5 minutes",
    "recipeId": "test-recipe-123",
    "recipeName": "Test Recipe",
    "currentStep": 1,
    "totalSteps": 5,
    "currentStepDescription": "Boil water for pasta",
    "completedSteps": [],
    "isVoiceCommand": true,
    "wakePhrase": "hey mise"
  }' | jq '.'
echo ""

# Test 2: Step Navigation Tool Call
echo "2️⃣ Testing Step Navigation Tool Call"
echo "------------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Mise, next step",
    "recipeId": "test-recipe-123",
    "recipeName": "Test Recipe",
    "currentStep": 1,
    "totalSteps": 5,
    "currentStepDescription": "Boil water for pasta",
    "completedSteps": [1],
    "isVoiceCommand": true,
    "wakePhrase": "hey mise"
  }' | jq '.'
echo ""

# Test 3: Recipe Modification Tool Call
echo "3️⃣ Testing Recipe Modification Tool Call"
echo "----------------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Mise, substitute basil with parsley",
    "recipeId": "test-recipe-123",
    "recipeName": "Test Recipe",
    "currentStep": 2,
    "totalSteps": 5,
    "currentStepDescription": "Add herbs to the sauce",
    "completedSteps": [1],
    "isVoiceCommand": true,
    "wakePhrase": "hey mise"
  }' | jq '.'
echo ""

# Test 4: Prep Work Guidance Tool Call
echo "4️⃣ Testing Prep Work Guidance Tool Call"
echo "---------------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Mise, what do I need to prepare?",
    "recipeId": "test-recipe-123",
    "recipeName": "Test Recipe",
    "currentStep": 1,
    "totalSteps": 5,
    "currentStepDescription": "Boil water for pasta",
    "completedSteps": [],
    "isVoiceCommand": true,
    "wakePhrase": "hey mise"
  }' | jq '.'
echo ""

# Test 5: Timing Suggestions Tool Call
echo "5️⃣ Testing Timing Suggestions Tool Call"
echo "---------------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Mise, how long should this take?",
    "recipeId": "test-recipe-123",
    "recipeName": "Test Recipe",
    "currentStep": 1,
    "totalSteps": 5,
    "currentStepDescription": "Boil water for pasta",
    "completedSteps": [],
    "isVoiceCommand": true,
    "wakePhrase": "hey mise"
  }' | jq '.'
echo ""

# Test 6: Text-based Timer (non-voice)
echo "6️⃣ Testing Text-based Timer (non-voice)"
echo "----------------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Set timer for 10 minutes",
    "recipeId": "test-recipe-123",
    "recipeName": "Test Recipe",
    "currentStep": 2,
    "totalSteps": 5,
    "currentStepDescription": "Simmer the sauce",
    "completedSteps": [1],
    "isVoiceCommand": false
  }' | jq '.'
echo ""

# Test 7: Specific Step Navigation
echo "7️⃣ Testing Specific Step Navigation"
echo "-----------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Mise, go to step 3",
    "recipeId": "test-recipe-123",
    "recipeName": "Test Recipe",
    "currentStep": 1,
    "totalSteps": 5,
    "currentStepDescription": "Boil water for pasta",
    "completedSteps": [1],
    "isVoiceCommand": true,
    "wakePhrase": "hey mise"
  }' | jq '.'
echo ""

# Test 8: Temperature Modification
echo "8️⃣ Testing Temperature Modification"
echo "-----------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Mise, change temperature to 350 degrees",
    "recipeId": "test-recipe-123",
    "recipeName": "Test Recipe",
    "currentStep": 2,
    "totalSteps": 5,
    "currentStepDescription": "Bake in the oven",
    "completedSteps": [1],
    "isVoiceCommand": true,
    "wakePhrase": "hey mise"
  }' | jq '.'
echo ""

# Test 9: Equipment Prep Work
echo "9️⃣ Testing Equipment Prep Work"
echo "------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Mise, what equipment do I need?",
    "recipeId": "test-recipe-123",
    "recipeName": "Test Recipe",
    "currentStep": 1,
    "totalSteps": 5,
    "currentStepDescription": "Prepare ingredients",
    "completedSteps": [],
    "isVoiceCommand": true,
    "wakePhrase": "hey mise"
  }' | jq '.'
echo ""

# Test 10: General Cooking Question (fallback)
echo "🔟 Testing General Cooking Question (fallback)"
echo "----------------------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Mise, how do I know when pasta is done?",
    "recipeId": "test-recipe-123",
    "recipeName": "Test Recipe",
    "currentStep": 1,
    "totalSteps": 5,
    "currentStepDescription": "Boil pasta",
    "completedSteps": [],
    "isVoiceCommand": true,
    "wakePhrase": "hey mise"
  }' | jq '.'
echo ""

echo "✅ Tool Call Testing Complete!"
echo ""
echo "📊 Expected Results:"
echo "- Tests 1-5 should return specific tool actions"
echo "- Test 6 should work without voice command flag"
echo "- Tests 7-9 should trigger appropriate tool calls"
echo "- Test 10 should fall back to general AI response"
echo ""
echo "🔍 Check for:"
echo "- Proper acknowledgment responses for voice commands"
echo "- Correct tool action types in responses"
echo "- Appropriate error handling"
echo "- Structured response format" 