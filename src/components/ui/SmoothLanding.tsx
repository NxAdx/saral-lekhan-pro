import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { themes, ThemeName } from '../../tokens';
import { useSettingsStore } from '../../store/settingsStore';

const { width } = Dimensions.get('window');

export function SmoothLanding({ themeId, isDark }: { themeId: ThemeName, isDark: boolean }) {
  const theme = themes[themeId][isDark ? 'dark' : 'light'];
  
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Mimic Header */}
      <View style={[styles.header, { backgroundColor: theme.bg }]}>
        <View style={[styles.brand, { backgroundColor: theme.bgRaised, width: 140 }]} />
        <View style={styles.actions}>
          <View style={[styles.icon, { backgroundColor: theme.bgRaised }]} />
          <View style={[styles.icon, { backgroundColor: theme.bgRaised }]} />
          <View style={[styles.icon, { backgroundColor: theme.bgRaised }]} />
        </View>
      </View>

      {/* Mimic Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.bgRaised, borderColor: theme.strokeDim }]}>
         <View style={[styles.searchPlaceholder, { backgroundColor: theme.bgDeep }]} />
      </View>

      {/* Mimic Tag Row */}
      <View style={styles.tagRow}>
        <View style={[styles.tag, { backgroundColor: theme.accent, opacity: 0.1 }]} />
        <View style={[styles.tag, { backgroundColor: theme.bgRaised }]} />
        <View style={[styles.tag, { backgroundColor: theme.bgRaised }]} />
      </View>

      {/* Mimic Notes - Bento Style */}
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.bgRaised, height: 180 }]} />
        <View style={[styles.card, { backgroundColor: theme.bgRaised, height: 120 }]} />
        <View style={[styles.card, { backgroundColor: theme.bgRaised, height: 220 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
  },
  brand: {
    height: 32,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 54,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    height: 20,
    width: '60%',
    borderRadius: 4,
  },
  tagRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 8,
  },
  tag: {
    width: 80,
    height: 36,
    borderRadius: 18,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    width: '100%',
    borderRadius: 24,
  },
});
