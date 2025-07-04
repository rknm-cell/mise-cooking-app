import { useFonts } from 'expo-font';
import { Platform } from 'react-native';

export const useCustomFonts = () => {
  const [fontsLoaded, fontError] = useFonts({
    'NanumPenScript-Regular': require('../assets/fonts/NanumPenScript-Regular.ttf'),
  });

  if (fontError) {
    console.error('Font loading error:', fontError);
    console.error('Platform:', Platform.OS);
    console.error('Font path:', '../assets/fonts/NanumPenScript-Regular.ttf');
  }

  // For Android, we might need to wait a bit longer for fonts to load
  if (Platform.OS === 'android' && !fontsLoaded) {
    console.log('Android: Waiting for fonts to load...');
  }

  return fontsLoaded;
}; 