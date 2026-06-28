import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../store/themeStore';

interface TagPillProps {
  label: string;
  active?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TagPill({ label, active, icon, onPress }: TagPillProps) {
  const { colors, font, radius, fontSize } = useTheme();
  const pressed = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(pressed.value ? 0.95 : 1, { duration: 100 }) }]
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { pressed.value = 1; }}
      onPressOut={() => { pressed.value = 0; }}
      style={[
        styles.pill,
        icon ? styles.rowPill : null,
        {
          backgroundColor: active ? colors.accent : colors.bg,
          borderColor: active ? colors.accentDark : colors.stroke,
          borderRadius: radius.md,
        },
        animStyle
      ]}
      hitSlop={8}
    >
      {icon}
      <View style={{ flexShrink: 1, justifyContent: 'center' }}>
        <Text 
          style={[styles.label, { 
            color: active ? colors.white : colors.inkMid, 
            fontFamily: font.sansSemi,
            fontSize: (typeof fontSize === 'number' && !isNaN(fontSize)) ? Math.max(11 * fontSize, 10) : 11,
          }]}
          textBreakStrategy="simple"
          numberOfLines={1}
        >
          {label + " "}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  rowPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
