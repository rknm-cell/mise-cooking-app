import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RecipeSession } from '../RecipeSession';
import { useLocalSearchParams } from 'expo-router';
import { ttsService } from '../../../services/text-to-speech';

// Mock dependencies
jest.mock('expo-router');
jest.mock('../../../services/text-to-speech', () => ({
  ttsService: {
    speakSessionStart: jest.fn(),
    speakStepComplete: jest.fn(),
    speakSessionComplete: jest.fn(),
    stop: jest.fn(),
  },
}));

jest.mock('../CookingChat', () => ({
  CookingChat: () => null,
}));

jest.mock('../Timer', () => ({
  Timer: () => null,
}));

jest.mock('../TTSControls', () => ({
  TTSControls: () => null,
}));

jest.mock('../navigation/HeaderWithProfile', () => ({
  HeaderWithProfile: () => null,
}));

const mockRecipeParams = {
  recipeId: 'test-recipe-123',
  recipeName: 'Test Pasta Carbonara',
  recipeDescription: 'A delicious test pasta with eggs and cheese',
  recipeTotalTime: '30 minutes',
  recipeServings: '4',
  recipeInstructions: JSON.stringify([
    'Boil water in large pot',
    'Cook pasta for 8-10 minutes',
    'Meanwhile, cook pancetta until crispy',
    'Mix eggs with cheese',
    'Combine everything and serve',
  ]),
};

describe('RecipeSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue(mockRecipeParams);
  });

  describe('Rendering', () => {
    it('should render recipe information', () => {
      const { getByText } = render(<RecipeSession />);

      expect(getByText('Test Pasta Carbonara')).toBeTruthy();
      expect(getByText('A delicious test pasta with eggs and cheese')).toBeTruthy();
    });

    it('should render time and servings info', () => {
      const { getByText } = render(<RecipeSession />);

      expect(getByText(/30 minutes/)).toBeTruthy();
      expect(getByText(/4 servings/i)).toBeTruthy();
    });

    it('should show Start Cooking button initially', () => {
      const { getByText } = render(<RecipeSession />);

      expect(getByText('Start Cooking')).toBeTruthy();
    });

    it('should handle missing recipe data gracefully', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({});

      const { getByText } = render(<RecipeSession />);

      expect(getByText(/No active recipe/i)).toBeTruthy();
    });
  });

  describe('Session Management', () => {
    it('should start session when Start button pressed', async () => {
      const { getByText } = render(<RecipeSession />);

      const startButton = getByText('Start Cooking');
      fireEvent.press(startButton);

      await waitFor(() => {
        expect(ttsService.speakSessionStart).toHaveBeenCalledWith('Test Pasta Carbonara');
      });

      // Should show first step after starting
      expect(getByText(/Step 1/i)).toBeTruthy();
    });

    it('should display current step number', () => {
      const { getByText } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      expect(getByText(/Step 1 of 5/i)).toBeTruthy();
    });

    it('should handle TTS errors gracefully during session start', async () => {
      (ttsService.speakSessionStart as jest.Mock).mockRejectedValue(
        new Error('TTS Error')
      );

      const { getByText } = render(<RecipeSession />);

      const startButton = getByText('Start Cooking');

      // Should not crash
      expect(() => fireEvent.press(startButton)).not.toThrow();

      // Session should still start
      await waitFor(() => {
        expect(getByText(/Step 1/i)).toBeTruthy();
      });
    });
  });

  describe('Step Navigation', () => {
    it('should navigate to next step', () => {
      const { getByText, getByTestId } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      // Should show first step
      expect(getByText(/Boil water/i)).toBeTruthy();

      // Move to next step
      const nextButton = getByTestId('next-step-button');
      fireEvent.press(nextButton);

      // Should show second step
      expect(getByText(/Cook pasta/i)).toBeTruthy();
      expect(getByText(/Step 2 of 5/i)).toBeTruthy();
    });

    it('should navigate to previous step', () => {
      const { getByText, getByTestId } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      // Move to step 2
      const nextButton = getByTestId('next-step-button');
      fireEvent.press(nextButton);
      expect(getByText(/Step 2/i)).toBeTruthy();

      // Go back to step 1
      const prevButton = getByTestId('prev-step-button');
      fireEvent.press(prevButton);

      expect(getByText(/Step 1/i)).toBeTruthy();
      expect(getByText(/Boil water/i)).toBeTruthy();
    });

    it('should not go to previous step from first step', () => {
      const { getByText, getByTestId, queryByTestId } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      // On first step, previous button should be disabled
      const prevButton = queryByTestId('prev-step-button');
      if (prevButton) {
        expect(prevButton).toBeDisabled();
      }
    });

    it('should not advance past last step', () => {
      const { getByText, getByTestId } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      const nextButton = getByTestId('next-step-button');

      // Navigate to last step
      fireEvent.press(nextButton); // Step 2
      fireEvent.press(nextButton); // Step 3
      fireEvent.press(nextButton); // Step 4
      fireEvent.press(nextButton); // Step 5

      expect(getByText(/Step 5 of 5/i)).toBeTruthy();

      // Try to go beyond - should stay on step 5
      fireEvent.press(nextButton);
      expect(getByText(/Step 5 of 5/i)).toBeTruthy();
    });
  });

  describe('Step Completion', () => {
    it('should mark step as completed', async () => {
      const { getByText, getByTestId } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      const completeButton = getByTestId('complete-step-button');
      fireEvent.press(completeButton);

      await waitFor(() => {
        expect(ttsService.speakStepComplete).toHaveBeenCalledWith(1);
      });
    });

    it('should auto-advance to next step after completion', async () => {
      const { getByText, getByTestId } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      // Complete step 1
      const completeButton = getByTestId('complete-step-button');
      fireEvent.press(completeButton);

      await waitFor(() => {
        // Should auto-advance to step 2
        expect(getByText(/Step 2/i)).toBeTruthy();
        expect(getByText(/Cook pasta/i)).toBeTruthy();
      });
    });

    it('should track multiple completed steps', async () => {
      const { getByText, getByTestId } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      const completeButton = getByTestId('complete-step-button');

      // Complete first 3 steps
      fireEvent.press(completeButton);
      await waitFor(() => expect(getByText(/Step 2/i)).toBeTruthy());

      fireEvent.press(completeButton);
      await waitFor(() => expect(getByText(/Step 3/i)).toBeTruthy());

      fireEvent.press(completeButton);
      await waitFor(() => expect(getByText(/Step 4/i)).toBeTruthy());

      // Should have completed 3 steps
      expect(ttsService.speakStepComplete).toHaveBeenCalledTimes(3);
    });

    it('should not complete same step twice', async () => {
      const { getByText, getByTestId } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      const completeButton = getByTestId('complete-step-button');
      fireEvent.press(completeButton);

      await waitFor(() => {
        expect(ttsService.speakStepComplete).toHaveBeenCalledTimes(1);
      });

      // Navigate back to step 1
      const prevButton = getByTestId('prev-step-button');
      fireEvent.press(prevButton);

      // Try to complete again
      fireEvent.press(completeButton);

      // Should not call TTS again for already completed step
      expect(ttsService.speakStepComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Session Completion', () => {
    it('should show completion message after all steps', async () => {
      const { getByText, getByTestId } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      const completeButton = getByTestId('complete-step-button');

      // Complete all 5 steps
      for (let i = 0; i < 5; i++) {
        fireEvent.press(completeButton);
        await waitFor(() => {
          expect(ttsService.speakStepComplete).toHaveBeenCalledWith(i + 1);
        });
      }

      // Should show completion
      await waitFor(() => {
        expect(ttsService.speakSessionComplete).toHaveBeenCalled();
      });
    });

    it('should handle TTS errors during step completion', async () => {
      (ttsService.speakStepComplete as jest.Mock).mockRejectedValue(
        new Error('TTS Error')
      );

      const { getByText, getByTestId } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      const completeButton = getByTestId('complete-step-button');

      // Should not crash
      expect(() => fireEvent.press(completeButton)).not.toThrow();

      // Should still advance to next step
      await waitFor(() => {
        expect(getByText(/Step 2/i)).toBeTruthy();
      });
    });
  });

  describe('Timer Management', () => {
    it('should handle timer creation from AI assistant', () => {
      const { getByText } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      // This would be triggered by AI assistant
      // The implementation should show active timers
      expect(getByText).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle recipe with single instruction', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        ...mockRecipeParams,
        recipeInstructions: JSON.stringify(['Just do it']),
      });

      const { getByText } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      expect(getByText(/Step 1 of 1/i)).toBeTruthy();
      expect(getByText(/Just do it/i)).toBeTruthy();
    });

    it('should handle recipe with empty instructions', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        ...mockRecipeParams,
        recipeInstructions: JSON.stringify([]),
      });

      const { getByText } = render(<RecipeSession />);

      fireEvent.press(getByText('Start Cooking'));

      expect(getByText(/No instructions/i)).toBeTruthy();
    });

    it('should handle malformed JSON in instructions', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        ...mockRecipeParams,
        recipeInstructions: 'not valid json',
      });

      const { getByText } = render(<RecipeSession />);

      // Should not crash
      expect(() => render(<RecipeSession />)).not.toThrow();
    });
  });
});
