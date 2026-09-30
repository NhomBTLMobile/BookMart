import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        const isLoggedIn = await authService.checkLogin();
        if (isLoggedIn) {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.log('Error checking login', error);
      } finally {
        setIsChecking(false);
      }
    };
    checkUserLogin();
  }, []);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#183C27" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}