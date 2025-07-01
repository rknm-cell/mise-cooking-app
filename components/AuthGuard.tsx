import { useSegments } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  // useEffect(() => {
  //   if (isLoading) return;

  //   const inAuthGroup = segments[0] === '(auth)';
  //   const inModalGroup = segments[0] === '(modal)';

  //   if (!user && !inAuthGroup) {
  //     // User is not authenticated and not in auth group, redirect to login
  //     router.replace('/(auth)/login');
  //   } else if (user && inAuthGroup) {
  //     // User is authenticated but in auth group, redirect to main app
  //     router.replace('/');
  //   }
  // }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fcf45a" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
}); 