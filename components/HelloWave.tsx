import { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

export function HelloWave() {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg'],
  });

  return (
    <Animated.Text style={[styles.wave, { transform: [{ rotate }] }]}>
      👋
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  wave: {
    fontSize: 24,
  },
}); 