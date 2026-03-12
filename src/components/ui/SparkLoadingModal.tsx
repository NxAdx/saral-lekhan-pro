import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../store/themeStore';
import { motionDurations, motionEasing, motionScales } from '../../tokens/motion';
import { SparkGenerationPhase } from '../../types/spark';

interface SparkLoadingModalProps {
  visible: boolean;
  phase: SparkGenerationPhase;
  title: string;
  phaseLabel: string;
  hintText: string;
  enableAnimation?: boolean;
}

const Dot = Animated.createAnimatedComponent(View);

export function SparkLoadingModal({
  visible,
  phase,
  title,
  phaseLabel,
  hintText,
  enableAnimation = true,
}: SparkLoadingModalProps) {
  const { colors, font, radius, shadow } = useTheme();
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  const cardProgress = useSharedValue(0);
  const dotOne = useSharedValue(1);
  const dotTwo = useSharedValue(1);
  const dotThree = useSharedValue(1);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotionEnabled(Boolean(enabled));
      })
      .catch(() => {
        // no-op
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setReduceMotionEnabled(Boolean(enabled));
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    cardProgress.value = withTiming(visible ? 1 : 0, {
      duration: visible ? motionDurations.base : motionDurations.fast,
      easing: motionEasing.standard,
    });
  }, [cardProgress, visible]);

  const shouldAnimate = visible && enableAnimation && !reduceMotionEnabled;

  useEffect(() => {
    if (!shouldAnimate) {
      cancelAnimation(dotOne);
      cancelAnimation(dotTwo);
      cancelAnimation(dotThree);
      dotOne.value = 1;
      dotTwo.value = 1;
      dotThree.value = 1;
      return;
    }

    const pulse = withRepeat(
      withSequence(
        withTiming(motionScales.pulseMax, {
          duration: motionDurations.base,
          easing: motionEasing.emphasized,
        }),
        withTiming(motionScales.pulseMin, {
          duration: motionDurations.base,
          easing: motionEasing.emphasized,
        })
      ),
      -1,
      false
    );

    dotOne.value = pulse;
    dotTwo.value = withDelay(motionDurations.fast, pulse);
    dotThree.value = withDelay(motionDurations.fast * 2, pulse);

    return () => {
      cancelAnimation(dotOne);
      cancelAnimation(dotTwo);
      cancelAnimation(dotThree);
    };
  }, [dotOne, dotTwo, dotThree, shouldAnimate]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardProgress.value,
    transform: [
      {
        scale: motionScales.modalEnter + (1 - motionScales.modalEnter) * cardProgress.value,
      },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * cardProgress.value,
  }));

  const dotStyleOne = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * dotOne.value,
    transform: [{ scale: dotOne.value }],
  }));
  const dotStyleTwo = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * dotTwo.value,
    transform: [{ scale: dotTwo.value }],
  }));
  const dotStyleThree = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * dotThree.value,
    transform: [{ scale: dotThree.value }],
  }));

  const s = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        },
        backdrop: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: '#000000',
        },
        card: {
          width: '100%',
          maxWidth: 360,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.stroke,
          backgroundColor: colors.bgRaised,
          paddingHorizontal: 20,
          paddingVertical: 18,
          ...shadow.soft,
          shadowColor: colors.shadow,
        },
        title: {
          fontFamily: font.sansBold,
          fontSize: 18,
          color: colors.ink,
          marginBottom: 6,
        },
        phase: {
          fontFamily: font.sansSemi,
          fontSize: 13,
          color: colors.accent,
          marginBottom: 8,
        },
        hint: {
          fontFamily: font.sans,
          fontSize: 12,
          color: colors.inkMid,
        },
        dotsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 14,
        },
        dot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.accent,
        },
      }),
    [colors, font, radius, shadow]
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={() => {
        // Intentionally blocked during generation
      }}
    >
      <View style={s.root}>
        <Animated.View
          style={[s.backdrop, backdropStyle]}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <Animated.View
          style={[s.card, cardStyle]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${title}. ${phase}. ${phaseLabel}. ${hintText}`}
        >
          <Text style={s.title}>{title}</Text>
          <Text style={s.phase}>{phaseLabel}</Text>
          <Text style={s.hint}>{hintText}</Text>
          <View style={s.dotsRow}>
            <Dot style={[s.dot, dotStyleOne]} />
            <Dot style={[s.dot, dotStyleTwo]} />
            <Dot style={[s.dot, dotStyleThree]} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
