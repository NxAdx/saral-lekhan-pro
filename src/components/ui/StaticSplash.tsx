import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence,
  runOnJS,
  FadeOut
} from 'react-native-reanimated';
import { themes, ThemeName } from '../../tokens';

const { width, height } = Dimensions.get('window');

interface StaticSplashProps {
  themeId: ThemeName;
  isDark: boolean;
  onAnimationFinish?: () => void;
}

export function StaticSplash({ themeId, isDark, onAnimationFinish }: StaticSplashProps) {
  const theme = themes[themeId][isDark ? 'dark' : 'light'];
  
  // Replicate native splash layout
  // Background: Match exactly what was in app.json for that theme, 
  // but better: match the CURRENT app theme background for zero-gap.
  const bgColor = theme.bg;
  
  // Icon: use dark/light variant based on darkness
  const iconSource = isDark 
    ? require('../../../assets/splash-icon-light.png') 
    : require('../../../assets/splash-icon-dark.png');

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Start exit animation
    opacity.value = withTiming(0, { duration: 400 }, (finished) => {
      if (finished && onAnimationFinish) {
        runOnJS(onAnimationFinish)();
      }
    });
    // Subtle scale up for extra "premium" feel
    scale.value = withTiming(1.1, { duration: 450 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View 
      style={[
        StyleSheet.absoluteFill, 
        { backgroundColor: bgColor, zIndex: 10000, justifyContent: 'center', alignItems: 'center' },
        animatedStyle
      ]}
      pointerEvents="none"
    >
      <Animated.Image
        source={iconSource}
        style={{
          width: width * 0.5,
          height: width * 0.5,
          resizeMode: 'contain',
        }}
      />
    </Animated.View>
  );
}
