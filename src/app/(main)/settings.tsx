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

const SEED_COLORS = [
    '#FF5722', // Tippani Orange
    '#2196F3', // Material Blue
    '#4CAF50', // Material Green
    '#9C27B0', // Material Purple
    '#E91E63', // Material Pink
    '#FFEB3B', // Material Yellow
    '#00BCD4', // Material Cyan
    '#607D8B', // Material Blue Grey
];

const ICON_SHAPES: { id: 'circle' | 'squircle' | 'rounded'; label: string }[] = [
    { id: 'circle', label: 'Circle' },
    { id: 'squircle', label: 'Squircle' },
    { id: 'rounded', label: 'Rounded' },
];

export default function SettingsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const colors = theme.colors;
    const font = theme.font;

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
        content: { padding: 20, paddingBottom: 100 },

        sectionTitle: { fontFamily: font.sansBold, fontSize: 13, color: colors.accent, textTransform: 'uppercase', marginBottom: 12, marginTop: 24, letterSpacing: 1 },

        // Live Preview
        previewBox: { marginBottom: 10 },

        // Cards & Lists
        listBlock: {
            backgroundColor: colors.bgRaised,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: colors.strokeDim,
            overflow: 'hidden',
            marginBottom: 16,
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
        listSub: { fontFamily: font.sans, fontSize: 12, color: colors.inkDim, marginTop: 2 },
        listContent: { flex: 1, marginRight: 12 },

        // Grid Selectors (Material You style)
        gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
        colorCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, padding: 2 },
        colorInner: { flex: 1, borderRadius: 20 },

        shapeBtn: {
            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
            alignItems: 'center', justifyContent: 'center'
        },
        activeShape: { backgroundColor: colors.accentDim, borderColor: colors.accent },
        inactiveShape: { backgroundColor: colors.bg, borderColor: colors.strokeDim },

        // Control buttons
        modeBtn: {
            flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
            borderRightWidth: 1, borderRightColor: colors.strokeDim,
        },
        modeBtnLast: { borderRightWidth: 0 },
        activeMode: { backgroundColor: colors.accent },
        modeText: { fontFamily: font.sansSemi, fontSize: 13 },

        pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
    }), [colors, font, theme.radius, settings.nightMode]);

    return (
        <View style={s.root}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} translucent={false} />

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

                {/* Appearance Customizer */}
                <Text style={s.sectionTitle}>{loc.settingsScreen.lookAndFeel}</Text>

                <View style={s.listBlock}>
                    {/* Night Mode Toggle */}
                    <View style={s.listItem}>
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.settingsScreen.nightMode}</Text>
                            <Text style={s.listSub}>{loc.settingsScreen.nightModeSub}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.strokeDim }}>
                        {(['system', 'light', 'dark'] as const).map((m, idx) => (
                            <Pressable
                                key={m}
                                onPress={() => settings.setNightMode(m)}
                                style={[
                                    s.modeBtn,
                                    idx === 2 && s.modeBtnLast,
                                    settings.nightMode === m && s.activeMode
                                ]}
                            >
                                <Text style={[s.modeText, { color: settings.nightMode === m ? colors.white : colors.inkMid }]}>
                                    {m === 'system' ? 'System' : m === 'light' ? 'Light' : 'Dark'}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* AMOLED Toggle */}
                    <View style={s.listItem}>
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.settingsScreen.amoledMode}</Text>
                            <Text style={s.listSub}>{loc.settingsScreen.amoledModeSub}</Text>
                        </View>
                        <Switch
                            value={settings.amoledMode}
                            onValueChange={settings.setAmoledMode}
                            trackColor={{ false: colors.strokeDim, true: colors.accent }}
                            thumbColor={colors.white}
                        />
                    </View>

                    {/* Dynamic Colors (Android only mockup for now) */}
                    <View style={[s.listItem, s.listItemNoBorder]}>
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.settingsScreen.dynamicColors}</Text>
                            <Text style={s.listSub}>{loc.settingsScreen.dynamicColorsSub}</Text>
                        </View>
                        <Switch
                            value={settings.dynamicColors}
                            onValueChange={settings.setDynamicColors}
                            trackColor={{ false: colors.strokeDim, true: colors.accent }}
                            thumbColor={colors.white}
                        />
                    </View>
                </View>

                {/* Color Palette */}
                <Text style={s.sectionTitle}>{loc.settingsScreen.colorSeed}</Text>
                <View style={s.listBlock}>
                    <View style={s.gridRow}>
                        {SEED_COLORS.map(c => (
                            <Pressable
                                key={c}
                                onPress={() => settings.setSeedColor(c)}
                                style={[s.colorCircle, { borderColor: settings.seedColor === c ? colors.accent : 'transparent' }]}
                            >
                                <View style={[s.colorInner, { backgroundColor: c }]} />
                            </Pressable>
                        ))}
                    </View>
                    <View style={{ padding: 16, paddingTop: 0 }}>
                        <Text style={s.listSub}>{loc.settingsScreen.colorSeedSub}</Text>
                    </View>
                </View>

                {/* Icon Shapes */}
                <Text style={s.sectionTitle}>{loc.settingsScreen.iconShape}</Text>
                <View style={s.listBlock}>
                    <View style={s.gridRow}>
                        {ICON_SHAPES.map(sh => (
                            <Pressable
                                key={sh.id}
                                onPress={() => settings.setIconShape(sh.id)}
                                style={[s.shapeBtn, settings.iconShape === sh.id ? s.activeShape : s.inactiveShape]}
                            >
                                <Text style={[s.modeText, { color: settings.iconShape === sh.id ? colors.accent : colors.inkMid }]}>
                                    {sh.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <View style={{ padding: 16, paddingTop: 0 }}>
                        <Text style={s.listSub}>{loc.settingsScreen.iconShapeSub}</Text>
                    </View>
                </View>

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

                {/* Back to Home Hint */}
                <View style={{ height: 40 }} />

            </ScrollView>
        </View>
    );
}
