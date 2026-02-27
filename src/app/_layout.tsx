import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { LockScreen } from '../components/ui/LockScreen';
import { useAuthStore } from '../store/authStore';
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
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import { useAiStore } from '../store/aiStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Hind': Hind_400Regular,
    'Hind-Medium': Hind_500Medium,
    'Hind-SemiBold': Hind_600SemiBold,
    'Hind-Bold': Hind_700Bold,
    'VesperLibre-Black': VesperLibre_900Black,
    'DMMono-Regular': DMMono_400Regular,
    'Playfair': PlayfairDisplay_400Regular,
    'Playfair-Medium': PlayfairDisplay_500Medium,
    'Playfair-SemiBold': PlayfairDisplay_600SemiBold,
    'Playfair-Bold': PlayfairDisplay_700Bold,
    'JetBrains': JetBrainsMono_400Regular,
    'JetBrains-Medium': JetBrainsMono_500Medium,
    'JetBrains-SemiBold': JetBrainsMono_600SemiBold,
    'JetBrains-Bold': JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    useAuthStore.getState().initialize();
    useAiStore.getState().initialize();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        useAuthStore.getState().lockApp();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <LockScreen />
    </>
  );
}
