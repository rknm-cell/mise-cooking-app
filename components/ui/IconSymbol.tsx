import { Ionicons } from '@expo/vector-icons';

interface IconSymbolProps {
  name: string;
  size: number;
  color: string;
}

export function IconSymbol({ name, size, color }: IconSymbolProps) {
  // Map SF Symbol names to Ionicons
  const iconMap: Record<string, string> = {
    'house.fill': 'home',
    'paperplane.fill': 'paper-plane',
    'restaurant': 'restaurant',
    'book': 'book',
    'person': 'person',
  };

  const iconName = iconMap[name] || 'help-circle';
  
  return <Ionicons name={iconName as any} size={size} color={color} />;
} 