import { useFonts } from 'expo-font';

export const useCustomFonts = () => {
  const [fontsLoaded, fontError] = useFonts({
    'NanumPenScript-Regular': require('../assets/fonts/NanumPenScript-Regular.ttf'),
  });

  if (fontError) {
    console.error('Font loading error:', fontError);
  }

  return fontsLoaded;
}; 