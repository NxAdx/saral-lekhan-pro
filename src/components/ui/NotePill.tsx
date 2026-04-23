import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../store/themeStore';
import { stripMarkdown } from '../../utils/markdown';
import { HardShadow } from './HardShadow';

interface NotePillProps {
  title: string;
  preview: string;
  date: string;
  tag?: string;
  pinned?: boolean;
  onPress?: () => void;
}

export function NotePill({
  title,
  preview,
  date,
  tag,
  pinned = false,
  onPress,
}: NotePillProps) {
  const { colors, font, radius, fontSize } = useTheme();
  const cleanPreview = stripMarkdown(preview);

  return (
    <HardShadow
      onPress={onPress}
      radius={radius.pill}
      shadowColor={pinned ? colors.accentDark : colors.shadow}
      shadowOffset={{ width: 3, height: 4 }}
      frontStyle={[s.pill, { backgroundColor: colors.bg, borderColor: pinned ? colors.accent : colors.stroke }, pinned && s.pillPinned]}
      style={s.cardWrapper}
    >
      {/* Title row */}
      <Text style={[s.title, { color: colors.ink, fontFamily: font.sansSemi, fontSize: 16 * fontSize }, pinned && { color: colors.accent }]} numberOfLines={1}>
        {pinned ? '★ ' : ''}
        {title || 'Untitled'}
      </Text>

      {/* Preview */}
      {cleanPreview ? (
        <Text style={[s.preview, { color: colors.inkDim, fontFamily: font.sans, fontSize: 13 * fontSize, lineHeight: 20 * fontSize }]} numberOfLines={1}>
          {cleanPreview}
        </Text>
      ) : null}

      {/* Meta row: date left, tag chip right — matches .note-pill-meta in sample HTML */}
      <View style={s.metaRow}>
        <Text style={[s.date, { color: colors.inkDim, fontFamily: font.mono, fontSize: 10 * fontSize }]}>{date}</Text>
        {tag ? (
          <View style={[s.tagChip, { backgroundColor: colors.accentBg, borderColor: colors.accentDim, borderRadius: radius.pill }]}>
            <Text style={[s.tagText, { color: colors.accent, fontFamily: font.sansSemi, fontSize: 10 * fontSize }]}>{tag}</Text>
          </View>
        ) : null}
      </View>
    </HardShadow>
  );
}

const s = StyleSheet.create({
  cardWrapper: {
    alignSelf: 'stretch',
  },
  pill: {
    borderWidth: 2.5,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  pillPinned: {
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  preview: {
  },
  // Bottom meta row — date left, tag chip right (matches sample HTML)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  date: {
  },
  tagChip: {
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  tagText: {
    fontWeight: '600',
  },
});
