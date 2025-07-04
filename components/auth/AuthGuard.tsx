import { router, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inModalGroup = segments[0] === '(modal)';

    if (!user && !inAuthGroup) {
      // User is not authenticated and not in auth group, redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is authenticated but in auth group, redirect to main app
      router.replace('/');
    }
  }, [user, segments]);

  return <>{children}</>;
} 