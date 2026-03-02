import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../store/themeStore';

export function HomeSkeleton() {
  const { colors, radius, spacing } = useTheme();
  
  const opacity = useSharedValue(0.5);
  
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  const SkeletonBox = ({ width, height, br = radius.md, style }: any) => (
    <Animated.View style={[{ width, height, borderRadius: br, backgroundColor: colors.strokeDim }, animStyle, style]} />
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBox width={120} height={32} />
          <SkeletonBox width={150} height={16} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <SkeletonBox width={42} height={42} br={99} />
          <SkeletonBox width={42} height={42} br={99} />
          <SkeletonBox width={42} height={42} br={99} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={{ marginHorizontal: 20, marginBottom: spacing[4] }}>
        <SkeletonBox width="100%" height={52} br={radius.pill} />
      </View>

      {/* Tag Rail */}
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        <SkeletonBox width={60} height={32} br={radius.pill} />
        <SkeletonBox width={80} height={32} br={radius.pill} />
        <SkeletonBox width={70} height={32} br={radius.pill} />
        <SkeletonBox width={90} height={32} br={radius.pill} />
      </View>

      {/* Cards */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }} scrollEnabled={false}>
        <SkeletonBox width="100%" height={120} br={radius.xl} />
        <SkeletonBox width="100%" height={160} br={radius.xl} />
        <SkeletonBox width="100%" height={140} br={radius.xl} />
        <SkeletonBox width="100%" height={120} br={radius.xl} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20
  }
});
