import { Text, TextProps } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  type?: 'title' | 'subtitle' | 'default' | 'defaultSemiBold';
};

export function ThemedText({ type = 'default', style, ...otherProps }: ThemedTextProps) {
  const color = useThemeColor({}, 'text');
  
  const getTextStyle = () => {
    switch (type) {
      case 'title':
        return { fontSize: 32, fontWeight: 'bold' as const };
      case 'subtitle':
        return { fontSize: 20, fontWeight: '600' as const };
      case 'defaultSemiBold':
        return { fontSize: 16, fontWeight: '600' as const };
      default:
        return { fontSize: 16, fontWeight: '400' as const };
    }
  };

  return <Text style={[{ color }, getTextStyle(), style]} {...otherProps} />;
} 