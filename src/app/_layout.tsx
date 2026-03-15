import React, { useEffect, useMemo, useRef } from 'react';
import { AppState, useColorScheme, View, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { Stack, SplashScreen, useRootNavigationState } from 'expo-router';
import Animated, { FadeOut } from 'react-native-reanimated';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import { LockScreen } from '../components/ui/LockScreen';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { themes } from '../tokens';
import {
  useFonts,
} from '@expo-google-fonts/hind';
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

import { useAiStore } from '../store/aiStore';
import { useNotesStore } from '../store/notesStore';
import { useRuntimeUxFlagsStore } from '../store/runtimeUxFlagsStore';
import { log } from '../utils/Logger';
import { shallow } from 'zustand/shallow';

const splashPreventResult = SplashScreen.preventAutoHideAsync();
(splashPreventResult as any)?.catch?.(() => {});
try {
  Sentry.init({
    dsn: 'https://3a2804f7a6c66cc9f1c0ab029bdfef94@o4510973886464000.ingest.de.sentry.io/4510973892100176',
    debug: __DEV__,
  });
} catch {
  // Guard startup in case Sentry native init fails on specific builds.
}

export function RootLayout() {
  const { themeId, nightMode } = useSettingsStore(
    (s) => ({ themeId: s.themeId, nightMode: s.nightMode }),
    shallow
  );
  const systemColor = useColorScheme();
  
  // State-Driven Splash Controller
  const [appReady, setAppReady] = React.useState(false);
  const [isStartupTimeout, setIsStartupTimeout] = React.useState(false);
  const [splashFinished, setSplashFinished] = React.useState(false);
  const rootNavigationState = useRootNavigationState();

  const [fontsLoaded, fontError] = useFonts({
    Hind: require('../../assets/fonts/Hind-Regular.ttf'),
    'Hind-Medium': require('../../assets/fonts/Hind-Medium.ttf'),
    'Hind-SemiBold': require('../../assets/fonts/Hind-SemiBold.ttf'),
    'Hind-Bold': require('../../assets/fonts/Hind-Bold.ttf'),
    Poppins: Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    NotoSans: NotoSans_400Regular,
    'NotoSans-Medium': NotoSans_500Medium,
    'NotoSans-SemiBold': NotoSans_600SemiBold,
    'NotoSans-Bold': NotoSans_700Bold,
    Baloo2: Baloo2_400Regular,
    'Baloo2-Medium': Baloo2_500Medium,
    'Baloo2-SemiBold': Baloo2_600SemiBold,
    'Baloo2-Bold': Baloo2_700Bold,
  });

  const isLoaded = useNotesStore((s) => s.isLoaded);
  
  // App is ready for JS overlay when core data is loaded and navigation has first key
  const coreReady = (fontsLoaded || fontError || isStartupTimeout) && (isLoaded || isStartupTimeout);
  const isNavReady = !!rootNavigationState?.key;

  useEffect(() => {
    const init = async () => {
      useRuntimeUxFlagsStore.getState().loadFlags().catch(() => {});

      try {
        await useNotesStore.getState().initDB();
      } catch (e) {
        log.error('DB Init Failed', e as any);
      }

      setTimeout(() => {
        useAuthStore.getState().initialize().catch(() => {});
        useAiStore.getState().initialize().catch(() => {});
      }, 0);
    };

    init();

    const safetyTimer = setTimeout(() => {
      log.warn('RootLayout: 5s safety net reached.');
      setIsStartupTimeout(true);
      useNotesStore.setState({ isLoaded: true });
    }, 5000);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        useAuthStore.getState().lockApp();
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.remove();
    };
  }, []);

  // Coordinated Hide Logic
  useEffect(() => {
    if (coreReady && isNavReady) {
      log.info('Coordinated Ready: Hiding native splash.');
      // Give the JS overlay one frame to render before hiding native splash
      const frame = requestAnimationFrame(() => {
        setAppReady(true);
        SplashScreen.hideAsync().catch(() => {});
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [coreReady, isNavReady]);

  const isDark = nightMode === 'dark' || (nightMode === 'system' && systemColor === 'dark');
  const finalBgColor = themes[themeId][isDark ? 'dark' : 'light'].bg;

  useEffect(() => {
    if (!coreReady) return;
    SystemUI.setBackgroundColorAsync(finalBgColor).catch(() => {});
  }, [finalBgColor, coreReady]);

  const navTheme = useMemo(() => ({
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: finalBgColor,
    },
  }), [isDark, finalBgColor]);

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen name="editor/[id]" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="trash" options={{ presentation: 'modal', animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_right' }} />
      </Stack>

      {!splashFinished && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject, 
            { backgroundColor: finalBgColor, justifyContent: 'center', alignItems: 'center', zIndex: 9999 }
          ]}
          exiting={FadeOut.duration(600).withCallback(() => {
            'worklet';
            // Use setSplashFinished(true) here if needed, but absoluteFill works fine
          })}
        >
          <Animated.Image
            source={require('../../assets/splash-icon-light.png')}
            style={{ width: 160, height: 160 }}
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
