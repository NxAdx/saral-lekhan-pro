import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../store/themeStore';
import { stripMarkdown } from '../../utils/markdown';

interface BentoCardProps {
    title: string;
    preview: string;
    date: string;
    tag?: string;
    pinned?: boolean;
    onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BentoCard({
    title,
    preview,
    date,
    tag,
    pinned = false,
    onPress,
}: BentoCardProps) {
    const { colors, radius, shadow, font, fontSize } = useTheme();
    const cleanPreview = stripMarkdown(preview);
    const pressed = useSharedValue(0);

    const s = useMemo(() => StyleSheet.create({
        card: {
            marginVertical: 6,
            overflow: 'hidden',
            backgroundColor: colors.bgRaised,
            borderColor: pinned ? colors.accent : colors.strokeDim,
            borderWidth: pinned ? 2 : 1,
            borderRadius: radius.lg,
            ...shadow.soft,
            shadowColor: colors.shadow
        },
        content: {
            paddingVertical: 18,
            paddingHorizontal: 20,
        },
        title: {
            fontSize: 18 * fontSize,
            fontFamily: font.sansSemi,
            fontWeight: '600',
            color: pinned ? colors.accent : colors.ink,
            marginBottom: 6,
        },
        preview: {
            fontSize: 14 * fontSize,
            lineHeight: 22 * fontSize,
            fontFamily: font.sans,
            color: colors.inkMid,
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
        },
        date: {
            fontSize: 11 * fontSize,
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
            fontSize: 11 * fontSize,
            fontWeight: '600',
            fontFamily: font.sansSemi,
            color: colors.accent,
        },
    }), [colors, radius, shadow, font, fontSize, pinned]);

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
            onPressIn={() => { pressed.value = 1; }}
            onPressOut={() => { pressed.value = 0; }}
            style={[s.card, animStyle]}
        >
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
                    {tag ? (
                        <View style={s.tagChip}>
                            <Text style={s.tagText}>{tag}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </AnimatedPressable>
    );
}
