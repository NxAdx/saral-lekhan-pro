import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { T } from '../../tokens';
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
  const cleanPreview = stripMarkdown(preview);

  return (
    <HardShadow
      onPress={onPress}
      radius={T.radius.pill}
      shadowColor={pinned ? T.color.accentDark : T.color.shadow}
      shadowOffset={{ width: 3, height: 4 }}
      frontStyle={[s.pill, pinned && s.pillPinned]}
      style={s.cardWrapper}
    >
      {/* Title row */}
      <Text style={[s.title, pinned && s.titlePinned]} numberOfLines={1}>
        {pinned ? '★ ' : ''}
        {title || 'Untitled'}
      </Text>

      {/* Preview */}
      {cleanPreview ? (
        <Text style={s.preview} numberOfLines={1}>
          {cleanPreview}
        </Text>
      ) : null}

      {/* Meta row: date left, tag chip right — matches .note-pill-meta in sample HTML */}
      <View style={s.metaRow}>
        <Text style={s.date}>{date}</Text>
        {tag ? (
          <View style={s.tagChip}>
            <Text style={s.tagText}>{tag}</Text>
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
    backgroundColor: T.color.bg,
    borderWidth: 2.5,
    borderColor: T.color.stroke,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  pillPinned: {
    borderColor: T.color.accent,
  },
  title: {
    fontFamily: T.font.sansSemi,
    fontSize: 16,
    fontWeight: '600',
    color: T.color.ink,
    marginBottom: 4,
  },
  titlePinned: { color: T.color.accent },
  preview: {
    fontFamily: T.font.sans,
    fontSize: 13,
    color: T.color.inkDim,
    lineHeight: 20,
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
    fontFamily: T.font.mono,
    fontSize: 10,
    color: T.color.inkDim,
  },
  tagChip: {
    backgroundColor: T.color.accentBg,
    borderWidth: 1,
    borderColor: T.color.accentDim,
    borderRadius: T.radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  tagText: {
    fontFamily: T.font.sansSemi,
    fontSize: 10,
    fontWeight: '600',
    color: T.color.accent,
  },
});
