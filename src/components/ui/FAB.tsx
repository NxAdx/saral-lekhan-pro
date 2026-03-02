import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../store/themeStore';

interface FABProps {
  onPress: () => void;
  label?: string; // Kept for backwards compatibility
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FAB({ onPress }: FABProps) {
  const { colors, shadow, radius } = useTheme();

  // simple mount animation
  const scale = useSharedValue(0);
  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [scale]);

  const pressed = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { scale: withTiming(pressed.value ? 0.9 : 1, { duration: 150 }) }
    ]
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { pressed.value = 1; }}
      onPressOut={() => { pressed.value = 0; }}
      style={[
        styles.fabBase,
        {
          backgroundColor: colors.accent,
          borderColor: colors.accentDark,
          borderRadius: 99,
          ...shadow.soft,
          shadowColor: colors.shadow,
        },
        animStyle
      ]}
    >
      <Svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 5l0 14" />
        <Path d="M5 12l14 0" />
      </Svg>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fabBase: {
    width: 64,
    height: 64,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
