import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider } from "../contexts/AuthContext";
import { useCustomFonts } from "../hooks/useFonts";

export default function RootLayout() {
  const fontsLoaded = useCustomFonts();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Fallback: if fonts don't load within 5 seconds, continue anyway
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 5000);

    if (fontsLoaded) {
      setShowLoading(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (showLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1d7b86' }}>
        <ActivityIndicator size="large" color="#fcf45a" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(modal)" />
      </Stack>
    </AuthProvider>
  );
}
