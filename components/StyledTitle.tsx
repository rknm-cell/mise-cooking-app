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
    fontFamily: 'NanumPenScript-Regular, Arial, sans-serif',
    color: '#fcf45a',
    textAlign: 'center',
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
    fontFamily: 'NanumPenScript-Regular, Arial, sans-serif',
    color: '#fcf45a',
    textAlign: 'center',
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