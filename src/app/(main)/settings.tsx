import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Path, Circle, Polyline, Line } from 'react-native-svg';
import { useThemeStore, useTheme } from '../../store/themeStore';
import { useSettingsStore, FontFamily, AppLanguage } from '../../store/settingsStore';
import { themes, ThemeName, sharedTokens } from '../../tokens';
import { strings } from '../../i18n/strings';
import { BentoCard } from '../../components/ui/BentoCard';
import { TagPill } from '../../components/ui/TagPill';

const THEME_OPTIONS: { id: ThemeName; label: string }[] = [
    { id: 'classic', label: 'Tippani Classic' },
    { id: 'nord', label: 'Nord Ice' },
    { id: 'amoled', label: 'OLED Black' },
    { id: 'lavender', label: 'Soft Lavender' },
    { id: 'mocha', label: 'Catppuccin Mocha' },
];

const FONT_OPTIONS: FontFamily[] = ['Hind', 'Vesper Libre', 'DM Mono'];
const LANG_OPTIONS: { id: AppLanguage; label: string }[] = [
    { id: 'En', label: 'English' },
    { id: 'Hi', label: 'हिंदी' },
    { id: 'Bn', label: 'বাংলা' },
    { id: 'Te', label: 'తెలుగు' },
    { id: 'Mr', label: 'मराठी' },
    { id: 'Ta', label: 'தமிழ்' },
];

export default function SettingsScreen() {
    const router = useRouter();

    // Theme state
    const themeName = useThemeStore(s => s.themeName);
    const setTheme = useThemeStore(s => s.setTheme);
    const theme = useTheme();
    const colors = theme.colors;
    const font = theme.font;

    // Settings state
    const settings = useSettingsStore();
    const loc = strings[settings.language] || strings['En'];

    const s = useMemo(() => StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: colors.bg,
            paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.strokeDim,
        },
        backBtn: { marginRight: 16, padding: 4 },
        title: { fontFamily: font.sansBold, fontSize: 22, color: colors.ink },
        content: { padding: 20, paddingBottom: 60 },

        sectionTitle: { fontFamily: font.sansBold, fontSize: 13, color: colors.accent, textTransform: 'uppercase', marginBottom: 12, marginTop: 24, letterSpacing: 1 },

        // Live Preview
        previewBox: { marginBottom: 10 },

        // Cards & Lists
        listBlock: {
            backgroundColor: colors.bgRaised,
            borderRadius: sharedTokens.radius.lg,
            borderWidth: 1,
            borderColor: colors.strokeDim,
            overflow: 'hidden',
        },
        listItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.strokeDim,
        },
        listItemNoBorder: { borderBottomWidth: 0 },
        listLabel: { fontFamily: font.sansMed, fontSize: 16, color: colors.ink },
        listSub: { fontFamily: font.sans, fontSize: 13, color: colors.inkDim },

        // Theme Dots
        themeScroll: { paddingVertical: 10, paddingHorizontal: 4 },
        themeCard: {
            width: 100, height: 130,
            borderRadius: sharedTokens.radius.md,
            borderWidth: 2,
            marginRight: 12,
            padding: 10,
            justifyContent: 'space-between'
        },
        themeDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.strokeDim },
        themeLabel: { fontFamily: font.sansMed, fontSize: 12, textAlign: 'center', marginTop: 8 },

        // Pill selectors
        pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
    }), [colors, font]);

    return (
        <View style={s.root}>
            <StatusBar barStyle={themeName === 'classic' || themeName === 'lavender' ? 'dark-content' : 'light-content'} backgroundColor={colors.bg} translucent={false} />

            <View style={s.header}>
                <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
                    <Svg viewBox="0 0 24 24" width={24} height={24}>
                        <Line x1="19" y1="12" x2="5" y2="12" stroke={colors.ink} strokeWidth={2.5} strokeLinecap="round" />
                        <Polyline points="12 19 5 12 12 5" stroke={colors.ink} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </Svg>
                </Pressable>
                <Text style={s.title}>{loc.settings}</Text>
            </View>

            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

                {/* Live Preview */}
                <Text style={[s.sectionTitle, { marginTop: 0 }]}>{loc.settingsScreen.livePreview}</Text>
                <View style={s.previewBox} pointerEvents="none">
                    <BentoCard
                        title={loc.settingsScreen.previewTitle}
                        preview={loc.settingsScreen.previewSub}
                        date={loc.settingsScreen.justNow}
                        tag={loc.settingsScreen.aesthetics}
                        pinned
                    />
                </View>

                {/* Themes */}
                <Text style={s.sectionTitle}>{loc.settingsScreen.appearanceTheme}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.themeScroll}>
                    {THEME_OPTIONS.map((t) => {
                        const tColors = themes[t.id];
                        const isActive = themeName === t.id;
                        return (
                            <Pressable
                                key={t.id}
                                onPress={() => setTheme(t.id)}
                                style={[
                                    s.themeCard,
                                    { backgroundColor: tColors.bgRaised, borderColor: isActive ? tColors.accent : tColors.strokeDim }
                                ]}
                            >
                                <View style={[s.themeDot, { backgroundColor: tColors.accent }]} />
                                <View style={{ height: 6, width: '80%', backgroundColor: tColors.inkMid, borderRadius: 3, marginTop: 'auto', marginBottom: 6 }} />
                                <View style={{ height: 6, width: '50%', backgroundColor: tColors.inkDim, borderRadius: 3 }} />
                                <Text style={[s.themeLabel, { color: isActive ? tColors.accent : tColors.inkMid }]}>{t.label}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Fonts & Language */}
                <Text style={s.sectionTitle}>{loc.settingsScreen.typographyLanguage}</Text>
                <View style={s.listBlock}>
                    <View style={s.pillRow}>
                        {FONT_OPTIONS.map(f => (
                            <TagPill key={f} label={f} active={settings.fontFamily === f} onPress={() => settings.setFontFamily(f)} />
                        ))}
                    </View>
                    <View style={[s.pillRow, { paddingTop: 0, borderTopWidth: 1, borderTopColor: colors.strokeDim }]}>
                        {LANG_OPTIONS.map(l => (
                            <TagPill key={l.id} label={l.label} active={settings.language === l.id} onPress={() => settings.setLanguage(l.id)} />
                        ))}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
