import * as Haptics from 'expo-haptics';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface HapticTabProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export function HapticTab({ children, onPress, ...props }: HapticTabProps) {
  const handlePress = (event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
} 