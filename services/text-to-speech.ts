import * as Speech from 'expo-speech';

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

export class TextToSpeechService {
  private static instance: TextToSpeechService;
  private isSpeaking: boolean = false;
  private currentText: string = '';

  private constructor() {}

  static getInstance(): TextToSpeechService {
    if (!TextToSpeechService.instance) {
      TextToSpeechService.instance = new TextToSpeechService();
    }
    return TextToSpeechService.instance;
  }

  /**
   * Speak the given text
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (this.isSpeaking) {
      await this.stop();
    }

    const defaultOptions: TTSOptions = {
      rate: 0.8, // Slightly slower for better comprehension
      pitch: 1.0,
      volume: 1.0,
      language: 'en-US',
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      this.isSpeaking = true;
      this.currentText = text;
      
      await Speech.speak(text, finalOptions);
      
      // Note: expo-speech doesn't have addEventListener, so we'll manage state manually
      // The speaking status will be updated when stop() is called or when new speech starts
      
    } catch (error) {
      console.error('TTS Error:', error);
      this.isSpeaking = false;
    this.currentText = '';
    }
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
      this.currentText = '';
    }
  }

  /**
   * Check if currently speaking
   */
  getSpeakingStatus(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get current text being spoken
   */
  getCurrentText(): string {
    return this.currentText;
  }

  /**
   * Speak recipe step with context
   */
  async speakStep(stepNumber: number, stepDescription: string, totalSteps: number): Promise<void> {
    const text = `Step ${stepNumber} of ${totalSteps}. ${stepDescription}`;
    await this.speak(text);
  }

  /**
   * Speak timer notification
   */
  async speakTimerNotification(description: string): Promise<void> {
    const text = `Timer complete. ${description}`;
    await this.speak(text, { rate: 0.9, pitch: 1.1 });
  }

  /**
   * Speak session start
   */
  async speakSessionStart(recipeName: string): Promise<void> {
    const text = `Starting cooking session for ${recipeName}. Let's begin!`;
    await this.speak(text, { rate: 0.8, pitch: 1.0 });
  }

  /**
   * Speak step completion
   */
  async speakStepComplete(stepNumber: number): Promise<void> {
    const text = `Step ${stepNumber} complete. Great job!`;
    await this.speak(text, { rate: 0.9, pitch: 1.1 });
  }

  /**
   * Speak session completion
   */
  async speakSessionComplete(): Promise<void> {
    const text = `Congratulations! You've completed the cooking session. Enjoy your meal!`;
    await this.speak(text, { rate: 0.8, pitch: 1.0 });
  }
}

// Export singleton instance
export const ttsService = TextToSpeechService.getInstance(); 