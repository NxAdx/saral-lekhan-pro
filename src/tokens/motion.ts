import { Easing } from 'react-native-reanimated';

export const motionDurations = {
  fast: 140,
  base: 240,
  slow: 420,
} as const;

export const motionEasing = {
  standard: Easing.out(Easing.cubic),
  emphasized: Easing.inOut(Easing.quad),
  linear: Easing.linear,
} as const;

export const motionScales = {
  modalEnter: 0.96,
  pulseMin: 0.9,
  pulseMax: 1.08,
} as const;
