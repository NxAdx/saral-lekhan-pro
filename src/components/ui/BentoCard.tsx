import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../store/themeStore';
import { useTypography } from '../../store/typographyStore';
import { stripMarkdown } from '../../utils/markdown';

import { Note } from '../../store/notesStore';

interface BentoCardProps {
    note: Note;
    date: string;
    selected?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BentoCard({
    note,
    date,
    selected = false,
    onPress,
    onLongPress,
}: BentoCardProps) {
    if (!note) return null;
    const { title, body: preview, tag, pinned } = note;
    const { colors, radius, shadow, font } = useTheme();
    const type = useTypography();
    const cleanPreview = stripMarkdown(preview);
    const pressed = useSharedValue(0);

    const s = useMemo(() => StyleSheet.create({
        card: {
            marginVertical: 6,
            overflow: 'hidden',
            backgroundColor: selected ? colors.accentBg : colors.bgRaised,
            borderColor: selected ? colors.accent : (pinned ? colors.accent : colors.strokeDim),
            borderWidth: (selected || pinned) ? 2 : 1,
            borderRadius: radius.lg,
            ...shadow.soft,
            shadowColor: colors.shadow,
            elevation: 2,
        },
        content: {
            paddingVertical: 18,
            paddingHorizontal: 20,
        },
        title: {
            ...type.titleLarge,
            fontFamily: font.sansBold,
            color: (selected || pinned) ? colors.accent : colors.ink,
            marginBottom: 4,
            letterSpacing: -0.2,
        },
        preview: {
            ...type.bodyLarge,
            fontFamily: font.sans,
            color: colors.inkMid,
            lineHeight: type.bodyLarge.fontSize * 1.4,
            opacity: 0.85,
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
        },
        date: {
            ...type.bodySmall,
            fontFamily: font.mono,
            color: colors.inkDim,
        },
        tagChip: {
            borderWidth: 1,
            paddingVertical: 2,
            paddingHorizontal: 10,
            backgroundColor: colors.accentBg,
            borderColor: colors.accentDim,
            borderRadius: radius.md,
        },
        tagText: {
            ...type.labelMedium,
            fontFamily: font.sansBold,
            color: colors.accent,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        selectionIcon: {
            position: 'absolute',
            top: 12,
            right: 12,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
        }
    }), [colors, radius, shadow, font, pinned, type, selected]);

    const animStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: withTiming(pressed.value ? 0.98 : 1, { duration: 150 }) }
            ],
            elevation: withTiming(pressed.value ? shadow.gentle.elevation : shadow.soft.elevation, { duration: 150 })
        };
    });

    return (
        <AnimatedPressable
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={() => { pressed.value = 1; }}
            onPressOut={() => { pressed.value = 0; }}
            style={[s.card, animStyle]}
            delayLongPress={300}
        >
            {selected && (
                <View style={s.selectionIcon}>
                    <Text style={{ color: colors.white, fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                </View>
            )}
            <View style={s.content}>
                <Text style={s.title} numberOfLines={1}>
                    {pinned ? '★ ' : ''}
                    {title || 'Untitled'}
                </Text>

                {cleanPreview ? (
                    <Text style={s.preview} numberOfLines={2}>
                        {cleanPreview}
                    </Text>
                ) : null}

                <View style={s.metaRow}>
                    <Text style={s.date}>{date}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {tag ? (
                            <View style={s.tagChip}>
                                <Text style={s.tagText}>{tag}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>
        </AnimatedPressable>
    );
}
