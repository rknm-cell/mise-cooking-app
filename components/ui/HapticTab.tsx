import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { TouchableOpacity } from 'react-native';

export function HapticTab({ children, onPress, disabled, ...props }: BottomTabBarButtonProps) {
  const handlePress = (event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  // Only pass essential props to avoid type conflicts
  const touchableProps = {
    onPress: handlePress,
    disabled: disabled ?? false,
    style: props.style,
    accessibilityLabel: props.accessibilityLabel,
    accessibilityRole: props.accessibilityRole,
  };

  return (
    <TouchableOpacity {...touchableProps}>
      {children}
    </TouchableOpacity>
  );
} 