import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { AuthGuard } from "../components/auth/AuthGuard";
import { AuthProvider } from "../contexts/AuthContext";
import { CookingSessionProvider } from "../contexts/CookingSessionContext";
import { useCustomFonts } from "../hooks/useFonts";

export default function RootLayout() {
  const fontsLoaded = useCustomFonts();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    console.log('Font loading status:', fontsLoaded);
    console.log('Platform:', Platform.OS);
    
    // Fallback: if fonts don't load within 5 seconds, continue anyway
    const timer = setTimeout(() => {
      console.log('Font loading timeout - continuing anyway');
      setShowLoading(false);
    }, 5000);

    if (fontsLoaded) {
      console.log('Fonts loaded successfully');
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
      <CookingSessionProvider>
        <AuthGuard>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(modal)" />
          </Stack>
        </AuthGuard>
      </CookingSessionProvider>
    </AuthProvider>
  );
}
