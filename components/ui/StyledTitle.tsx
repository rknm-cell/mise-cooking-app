import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StyledTitleProps {
  title: string;
  subtitle?: string;
  size?: 'large' | 'medium' | 'small';
}

export default function StyledTitle({ title, subtitle, size = 'large' }: StyledTitleProps) {
  const getTitleStyle = () => {
    switch (size) {
      case 'large':
        return styles.titleLarge;
      case 'medium':
        return styles.titleMedium;
      case 'small':
        return styles.titleSmall;
      default:
        return styles.titleLarge;
    }
  };

  const getSubtitleStyle = () => {
    switch (size) {
      case 'large':
        return styles.subtitleLarge;
      case 'medium':
        return styles.subtitleMedium;
      case 'small':
        return styles.subtitleSmall;
      default:
        return styles.subtitleLarge;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, getTitleStyle()]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, getSubtitleStyle()]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleLarge: {
    fontSize: 64,
  },
  titleMedium: {
    fontSize: 48,
  },
  titleSmall: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
  },
  subtitleLarge: {
    fontSize: 32,
  },
  subtitleMedium: {
    fontSize: 24,
  },
  subtitleSmall: {
    fontSize: 18,
  },
}); 