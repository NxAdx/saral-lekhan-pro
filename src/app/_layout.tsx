import React, { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import {
  useFonts,
  Hind_400Regular,
  Hind_500Medium,
  Hind_600SemiBold,
  Hind_700Bold,
} from '@expo-google-fonts/hind';
import {
  VesperLibre_900Black,
} from '@expo-google-fonts/vesper-libre';
import {
  DMMono_400Regular,
} from '@expo-google-fonts/dm-mono';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Hind': Hind_400Regular,
    'Hind-Medium': Hind_500Medium,
    'Hind-SemiBold': Hind_600SemiBold,
    'Hind-Bold': Hind_700Bold,
    'VesperLibre-Black': VesperLibre_900Black,
    'DMMono-Regular': DMMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
