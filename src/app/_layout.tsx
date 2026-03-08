import React, { useEffect, useMemo } from 'react';
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
import {
  Yantramanav_400Regular,
  Yantramanav_500Medium,
  Yantramanav_700Bold,
} from '@expo-google-fonts/yantramanav';
import { TiroDevanagariHindi_400Regular } from '@expo-google-fonts/tiro-devanagari-hindi';

import { useAiStore } from '../store/aiStore';
import { useNotesStore } from '../store/notesStore';
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
  const [isStartupTimeout, setIsStartupTimeout] = React.useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Hind: require('../../assets/fonts/Hind-Regular.ttf'),
    'Hind-Medium': require('../../assets/fonts/Hind-Medium.ttf'),
    'Hind-SemiBold': require('../../assets/fonts/Hind-SemiBold.ttf'),
    'Hind-Bold': require('../../assets/fonts/Hind-Bold.ttf'),
    'VesperLibre-Black': require('../../assets/fonts/VesperLibre-Black.ttf'),
    'DMMono-Regular': require('../../assets/fonts/DMMono-Regular.ttf'),
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
    Yantramanav: Yantramanav_400Regular,
    'Yantramanav-Medium': Yantramanav_500Medium,
    'Yantramanav-Bold': Yantramanav_700Bold,
    TiroDevanagari: TiroDevanagariHindi_400Regular,
  });

  const isLoaded = useNotesStore((s) => s.isLoaded);
  const coreReady = (fontsLoaded || fontError || isStartupTimeout) && (isLoaded || isStartupTimeout);

  useEffect(() => {
    const init = async () => {
      log.info('RootLayout: Starting atomic initialization.');

      try {
        log.info('Init DB...');
        await useNotesStore.getState().initDB();
      } catch (e) {
        log.error('DB Init Failed', e as any);
      }

      try {
        log.info('Init Auth...');
        await useAuthStore.getState().initialize();
      } catch (e) {
        log.error('Auth Init Failed', e as any);
      }

      try {
        log.info('Init AI...');
        await useAiStore.getState().initialize();
      } catch (e) {
        log.error('AI Init Failed', e as any);
      }
    };

    init();

    // Fail-safe: never block startup forever.
    const safetyTimer = setTimeout(() => {
      log.warn('RootLayout: 5s safety net reached. Forcing internal ready.');
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

  const isDark = nightMode === 'dark' || (nightMode === 'system' && systemColor === 'dark');
  const finalBgColor = themes[themeId][isDark ? 'dark' : 'light'].bg;

  useEffect(() => {
    if (!coreReady) return;
    log.info(`Theme Sync: ${themeId} | Dark: ${isDark}`);
    SystemUI.setBackgroundColorAsync(finalBgColor).catch(() => {});
  }, [finalBgColor, isDark, themeId, coreReady]);

  useEffect(() => {
    if (!coreReady) return;
    try {
      SplashScreen.hideAsync();
    } catch {
      // no-op
    }
  }, [coreReady]);

  // Keep pre-ready state visually blank so users perceive one branded splash.
  const gapColor = '#d9d7d2';

  const navTheme = useMemo(() => ({
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: finalBgColor,
    },
  }), [isDark, finalBgColor]);

  if (!coreReady) {
    return <View style={{ flex: 1, backgroundColor: gapColor }} />;
  }

  return (
    <ThemeProvider value={navTheme}>
      <View style={{ flex: 1, backgroundColor: finalBgColor }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: finalBgColor } }} />
        <LockScreen />
      </View>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
