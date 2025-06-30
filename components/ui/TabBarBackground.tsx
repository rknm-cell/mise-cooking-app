import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';

export default function TabBarBackground() {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={80}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    );
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      }}
    />
  );
} 