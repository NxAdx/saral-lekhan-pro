import React, { useCallback } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../store/themeStore';
import { Icon } from './Icon';

interface FABProps {
  onPress: () => void;
  label?: string; // Kept for backwards compatibility
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FAB({ onPress, testID }: FABProps) {
  const { colors, shadow } = useTheme();

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

  const handlePressIn = useCallback(() => {
    pressed.value = 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handlePressOut = useCallback(() => {
    pressed.value = 0;
  }, []);

  return (
    <AnimatedPressable
      onPress={onPress}
      testID={testID}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true}
      accessibilityLabel="Create New Note"
      accessibilityRole="button"
      accessibilityHint="Tapping this will open the editor for a new note"
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
      <Icon name="plus" size={28} color={colors.white} strokeWidth={3} />
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
