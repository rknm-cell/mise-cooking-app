import { Stack } from 'expo-router';
import React from 'react';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'transparentModal',
        animation: 'fade',
        gestureEnabled: true,
        gestureDirection: 'vertical',
      }}
    >
      <Stack.Screen 
        name="recipe/[id]" 
        options={{
          title: 'Recipe Details',
          presentation: 'transparentModal',
        }}
      />
      <Stack.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
} 