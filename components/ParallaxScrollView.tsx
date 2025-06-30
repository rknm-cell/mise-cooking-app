import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  headerBackgroundColor?: { light: string; dark: string };
  headerImage?: React.ReactNode;
  style?: ViewStyle;
}

export default function ParallaxScrollView({ 
  children, 
  headerBackgroundColor = { light: '#A1CEDC', dark: '#1D3D47' },
  headerImage,
  style 
}: ParallaxScrollViewProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor.light }]}>
        {headerImage}
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
}); 