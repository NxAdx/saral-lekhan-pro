import React, { useEffect, useCallback } from 'react';
import { AppState, useColorScheme, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { Stack, SplashScreen } from 'expo-router';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import { LockScreen } from '../components/ui/LockScreen';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { themes } from '../tokens';
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
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
} from '@expo-google-fonts/noto-sans';
import {
  Baloo2_400Regular,
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
} from '@expo-google-fonts/baloo-2';
import {
  Yantramanav_400Regular,
  Yantramanav_500Medium,
  Yantramanav_700Bold,
} from '@expo-google-fonts/yantramanav';
import {
  TiroDevanagariHindi_400Regular,
} from '@expo-google-fonts/tiro-devanagari-hindi';

import { useAiStore } from '../store/aiStore';
import { log } from '../utils/Logger';

SplashScreen.preventAutoHideAsync().catch(() => { });

try {
  Sentry.init({
    dsn: "https://3a2804f7a6c66cc9f1c0ab029bdfef94@o4510973886464000.ingest.de.sentry.io/4510973892100176",
    debug: __DEV__,
  });
} catch {
  // Guard startup in case Sentry native init fails on specific builds.
}

export function RootLayout() {
  const { themeId, nightMode, amoledMode } = useSettingsStore();
  const systemColor = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    'Hind': Hind_400Regular,
    'Hind-Medium': Hind_500Medium,
    'Hind-SemiBold': Hind_600SemiBold,
    'Hind-Bold': Hind_700Bold,
    'VesperLibre-Black': VesperLibre_900Black,
    'DMMono-Regular': DMMono_400Regular,
    'Poppins': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'NotoSans': NotoSans_400Regular,
    'NotoSans-Medium': NotoSans_500Medium,
    'NotoSans-SemiBold': NotoSans_600SemiBold,
    'NotoSans-Bold': NotoSans_700Bold,
    'Baloo2': Baloo2_400Regular,
    'Baloo2-Medium': Baloo2_500Medium,
    'Baloo2-SemiBold': Baloo2_600SemiBold,
    'Baloo2-Bold': Baloo2_700Bold,
    'Yantramanav': Yantramanav_400Regular,
    'Yantramanav-Medium': Yantramanav_500Medium,
    'Yantramanav-Bold': Yantramanav_700Bold,
    'TiroDevanagari': TiroDevanagariHindi_400Regular,
  });

  // Removed explicit hideAsync here, moved to onLayoutRootView below

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

  const isDark = nightMode === 'dark' || (nightMode === 'system' && systemColor === 'dark');
  const coreColors = themes[themeId][isDark ? 'dark' : 'light'];
  const finalBgColor = isDark && amoledMode ? '#000000' : coreColors.bg;

  useEffect(() => {
    // Fix the 1ms white-flash on resume and keep root window tracking active theme
    SystemUI.setBackgroundColorAsync(finalBgColor).catch(() => { });
  }, [finalBgColor]);

  const navTheme = {
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: finalBgColor,
    },
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={navTheme}>
      <View style={{ flex: 1, backgroundColor: finalBgColor }} onLayout={onLayoutRootView}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: finalBgColor } }} />
        <LockScreen />
      </View>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
