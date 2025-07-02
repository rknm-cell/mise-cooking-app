import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { TouchableOpacity } from 'react-native';

export function HapticTab({ children, onPress, disabled, ...props }: BottomTabBarButtonProps) {
  const handlePress = (event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} {...props}>
      {children}
    </TouchableOpacity>
  );
} 