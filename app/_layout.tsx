import { Stack } from "expo-router";
import React from "react";
import { AuthGuard } from "../components/AuthGuard";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}
