import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen 
        name="signup" 
        options={{
          title: 'Create Account',
        }}
      />
    </Stack>
  );
} 