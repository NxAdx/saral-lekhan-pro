import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
    const { colors, radius, shadow, font } = useTheme();
    const cleanPreview = stripMarkdown(preview);
    const pressed = useSharedValue(0);

    const animStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: withTiming(pressed.value ? 0.98 : 1, { duration: 150 }) }
            ],
            // Slightly reduce elevation when pressed to mimic soft pushing
            elevation: withTiming(pressed.value ? shadow.gentle.elevation : shadow.soft.elevation, { duration: 150 })
        };
    });

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={() => { pressed.value = 1; }}
            onPressOut={() => { pressed.value = 0; }}
            style={[
                styles.card,
                {
                    backgroundColor: colors.bgRaised,
                    borderColor: pinned ? colors.accent : colors.strokeDim,
                    borderWidth: pinned ? 2 : 1,
                    borderRadius: radius.lg, // bento rounding
                    ...shadow.soft, // Soft glassmorphic shadow
                    shadowColor: colors.shadow
                },
                animStyle
            ]}
        >
            <View style={styles.content}>
                <Text style={[styles.title, { color: pinned ? colors.accent : colors.ink, fontFamily: font.sansSemi }]} numberOfLines={1}>
                    {pinned ? '★ ' : ''}
                    {title || 'Untitled'}
                </Text>

                {cleanPreview ? (
                    <Text style={[styles.preview, { color: colors.inkMid, fontFamily: font.sans }]} numberOfLines={2}>
                        {cleanPreview}
                    </Text>
                ) : null}

                <View style={styles.metaRow}>
                    <Text style={[styles.date, { color: colors.inkDim, fontFamily: font.mono }]}>{date}</Text>
                    {tag ? (
                        <View style={[styles.tagChip, { backgroundColor: colors.accentBg, borderColor: colors.accentDim }]}>
                            <Text style={[styles.tagText, { color: colors.accent, fontFamily: font.sansSemi }]}>{tag}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 6,
        overflow: 'hidden',
    },
    content: {
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    preview: {
        fontSize: 14,
        lineHeight: 22,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    date: {
        fontSize: 11,
    },
    tagChip: {
        borderWidth: 1,
        borderRadius: 9999, // Pill shaped tags still exist inside components
        paddingVertical: 2,
        paddingHorizontal: 10,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
