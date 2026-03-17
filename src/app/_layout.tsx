import React, { useEffect, useMemo } from 'react';
import { AppState, useColorScheme, View, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { Stack, useRootNavigationState } from 'expo-router';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import { LockScreen } from '../components/ui/LockScreen';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { themes } from '../tokens';
import { useFonts } from '@expo-google-fonts/hind';
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

try {
  Sentry.init({
    dsn: 'https://3a2804f7a6c66cc9f1c0ab029bdfef94@o4510973886464000.ingest.de.sentry.io/4510973892100176',
    debug: __DEV__,
  });
} catch {
  // Guard startup in case Sentry native init fails on specific builds.
}

import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

export function RootLayout(props: any) {
  const { themeId, nightMode } = useSettingsStore(
    (s) => ({ themeId: s.themeId, nightMode: s.nightMode }),
    shallow
  );

  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(1);
  const bgOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.95);
  const [showSplash, setShowSplash] = React.useState(true);

  // HYPER-INSTANT: Hydrate store from native pre-load props immediately
  useMemo(() => {
    if (props?.initialNotes) {
      useNotesStore.getState().bootstrap(props.initialNotes);
    }
  }, []);

  const systemColor = useColorScheme();
  const rootNavigationState = useRootNavigationState();

  const [fontsLoaded] = useFonts({
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

  const isDark = nightMode === 'dark' || (nightMode === 'system' && systemColor === 'dark');
  const finalBgColor = themes[themeId][isDark ? 'dark' : 'light'].bg;
  const coreReady = !!rootNavigationState;
  const SPLASH_ANIM_DURATION = 400; // Refined for ultra-fast feel
  const LOGO_EXIT_DURATION = 350;
  const CONTENT_ENTRANCE_DURATION = 450;

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const splashBgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  useEffect(() => {
    if (coreReady && fontsLoaded) {
      // 🚀 Ultra-fast transition sequence
      logoScale.value = withDelay(100, withTiming(1.2, { duration: LOGO_EXIT_DURATION, easing: Easing.out(Easing.exp) }));
      logoOpacity.value = withDelay(150, withTiming(0, { duration: LOGO_EXIT_DURATION * 0.8 }));
      
      bgOpacity.value = withDelay(250, withTiming(0, { duration: CONTENT_ENTRANCE_DURATION, easing: Easing.inOut(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(setShowSplash)(false);
        }
      }));
      
      contentOpacity.value = withDelay(200, withTiming(1, { duration: CONTENT_ENTRANCE_DURATION, easing: Easing.out(Easing.exp) }));
      contentScale.value = withDelay(200, withTiming(1, { duration: CONTENT_ENTRANCE_DURATION, easing: Easing.out(Easing.back(0.5)) }));
    }
  }, [coreReady, fontsLoaded]);

  useEffect(() => {
    const init = async () => {
      log.info('RootLayout: Starting atomic initialization.');
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

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        useAuthStore.getState().lockApp();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(finalBgColor).catch(() => {});
  }, [finalBgColor]);

  const navTheme = useMemo(() => ({
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: finalBgColor,
    },
  }), [isDark, finalBgColor]);

  return (
    <View style={{ flex: 1, backgroundColor: finalBgColor }}>
      {showSplash && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: finalBgColor, zIndex: 10, justifyContent: 'center', alignItems: 'center' }]}>
          <Animated.Image 
            source={require('../../assets/android-adaptive.png')} 
            style={[{ width: 120, height: 120 }, logoStyle]}
            resizeMode="contain"
          />
        </View>
      )}
      <Animated.View style={[{ flex: 1 }, contentStyle]}>
        <ThemeProvider value={navTheme}>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
            <Stack.Screen name="editor/[id]" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="trash" options={{ presentation: 'modal', animation: 'slide_from_right' }} />
            <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_right' }} />
          </Stack>
          <LockScreen />
        </ThemeProvider>
      </Animated.View>
    </View>
  );
}

export default Sentry.wrap(RootLayout);
