import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Platform, StatusBar, Modal, TextInput, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Path, Circle, Polyline, Line } from 'react-native-svg';
import { useThemeStore, useTheme } from '../../store/themeStore';
import { useSettingsStore, AppLanguage } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { useAiStore } from '../../store/aiStore';
import { useSyncStore } from '../../store/syncStore';
import { useNotesStore } from '../../store/notesStore';
import { GoogleDriveService } from '../../services/googleDriveService';
import { themes, ThemeName, sharedTokens } from '../../tokens';
import { strings } from '../../i18n/strings';
import { BentoCard } from '../../components/ui/BentoCard';
import { TagPill } from '../../components/ui/TagPill';
import { AppFontType } from '../../store/settingsStore';
import { ThemedModal } from '../../components/ui/ThemedModal';

const STANDARD_THEMES: { id: ThemeName; label: string }[] = [
    { id: 'classic', label: 'Tippani' },
    { id: 'nord', label: 'Nordic' }
];

const PREMIUM_THEMES: { id: ThemeName; label: string }[] = [
    { id: 'pitch', label: 'Light & Dark' },
    { id: 'lavender', label: 'Lavender' },
    { id: 'ocean', label: 'Ocean' },
    { id: 'forest', label: 'Forest' },
    { id: 'sunset', label: 'Sunset' },
    { id: 'midnight', label: 'Midnight' },
    { id: 'rose', label: 'Rose' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'neon', label: 'Neon' },
    { id: 'mint', label: 'Mint' },
];

const FONT_OPTIONS: { id: AppFontType; label: string }[] = [
    { id: 'sans', label: 'Sans Serif' },
    { id: 'serif', label: 'Serif (Playfair)' },
    { id: 'mono', label: 'Mono (JetBrains)' },
];

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
];

const FONT_SIZE_STEPS = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4];

export default function SettingsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const colors = theme.colors;
    const font = theme.font;

    const settings = useSettingsStore();
    const auth = useAuthStore();
    const ai = useAiStore();
    const sync = useSyncStore();
    const notes = useNotesStore();
    const loc = strings[settings.language] || strings['En'];

    const [showFontModal, setShowFontModal] = React.useState(false);
    const [tempKey, setTempKey] = React.useState('');
    const [syncAlert, setSyncAlert] = React.useState<{ visible: boolean, title: string, sub: string }>({ visible: false, title: '', sub: '' });

    // Load sync state payload on mount
    React.useEffect(() => {
        sync.loadSyncState();
    }, []);

    const handleGoogleLogin = async () => {
        try {
            const { accessToken, email } = await GoogleDriveService.signIn();
            sync.setGoogleTokens(accessToken, email);
        } catch (e: any) {
            setSyncAlert({ visible: true, title: "Login Failed", sub: e.message || "Could not authenticate with Google." });
        }
    };

    const handleBackup = async () => {
        if (!sync.googleToken) return;
        sync.setIsSyncing(true);
        try {
            await GoogleDriveService.backupDatabase(sync.googleToken);
            sync.setLastSync(Date.now());
            setSyncAlert({ visible: true, title: "Backup Complete", sub: "Your notes were safely uploaded to Google Drive." });
        } catch (e: any) {
            setSyncAlert({ visible: true, title: "Backup Failed", sub: e.message || "An error occurred during upload." });
        } finally {
            sync.setIsSyncing(false);
        }
    };

    const handleRestore = async () => {
        if (!sync.googleToken) return;
        sync.setIsSyncing(true);
        try {
            await GoogleDriveService.restoreDatabase(sync.googleToken);
            notes.loadNotes(); // Reload Zustand state from the newly downloaded DB file
            sync.setLastSync(Date.now());
            setSyncAlert({ visible: true, title: "Restore Complete", sub: "Your notes were successfully restored from Google Drive." });
        } catch (e: any) {
            setSyncAlert({ visible: true, title: "Restore Failed", sub: e.message || "An error occurred during download." });
        } finally {
            sync.setIsSyncing(false);
        }
    };

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
        backBtn: { width: 38, height: 38, borderRadius: 99, borderWidth: 1.5, borderColor: colors.stroke, backgroundColor: colors.bgRaised, justifyContent: 'center', alignItems: 'center', marginRight: 16, ...theme.shadow.gentle },
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

        // Control buttons
        modeBtn: {
            flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
            borderRightWidth: 1, borderRightColor: colors.strokeDim,
        },
        modeBtnLast: { borderRightWidth: 0 },
        activeMode: { backgroundColor: colors.accent },
        modeText: { fontFamily: font.sansSemi, fontSize: 13 },

        pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },

        // Theme Cards
        themeGrid: { flexDirection: 'row', paddingHorizontal: 4, paddingBottom: 16 },
        themeCard: {
            width: 100,
            height: 140,
            borderRadius: 20,
            backgroundColor: colors.bgRaised,
            borderWidth: 2,
            marginRight: 12,
            padding: 12,
            justifyContent: 'space-between',
        },
        themeCardActive: { borderColor: colors.accent },
        themeCardInactive: { borderColor: colors.strokeDim },
        themeCircle: { width: 24, height: 24, borderRadius: 12 },
        themeLineLong: { height: 4, borderRadius: 2, width: '80%', marginBottom: 6 },
        themeLineShort: { height: 4, borderRadius: 2, width: '50%', marginBottom: 12 },
        themeLabel: { fontFamily: font.sans, fontSize: 11, textAlign: 'center' },
    }), [colors, font, theme.radius, theme.isDark, settings.nightMode, settings.themeId]);

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

                {/* PLUS FEATURES */}
                <Text style={s.sectionTitle}>{loc.plusFeatures.title}</Text>
                <View style={s.listBlock}>
                    <View style={s.listItem}>
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.plusFeatures.biometricTitle}</Text>
                            <Text style={s.listSub}>
                                {auth.isSupported
                                    ? loc.plusFeatures.biometricActive
                                    : loc.plusFeatures.biometricUnsupported}
                            </Text>
                        </View>
                        <Switch
                            disabled={!auth.isSupported}
                            value={auth.isBiometricEnabled}
                            onValueChange={(val: boolean) => auth.enableBiometric(val)}
                            trackColor={{ false: colors.strokeDim, true: colors.accent }}
                            thumbColor={colors.white}
                        />
                    </View>
                    <View style={s.listItem}>
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.plusFeatures.sparkAiTitle}</Text>
                            <Text style={s.listSub}>{loc.plusFeatures.sparkAiDesc}</Text>

                            <Pressable onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}>
                                <Text style={{ fontFamily: font.sansSemi, fontSize: 11, color: colors.accent, marginTop: 8 }}>{loc.plusFeatures.sparkAiGetBtn}</Text>
                            </Pressable>

                            <TextInput
                                style={{
                                    marginTop: 12,
                                    padding: 10,
                                    borderRadius: theme.radius.md,
                                    backgroundColor: colors.bg,
                                    color: colors.ink,
                                    fontFamily: font.mono,
                                    borderWidth: 1,
                                    borderColor: colors.strokeDim,
                                    fontSize: 12,
                                }}
                                placeholder={loc.plusFeatures.sparkAiPlaceholder}
                                placeholderTextColor={colors.inkDim}
                                value={tempKey}
                                onChangeText={setTempKey}
                                onBlur={() => {
                                    const key = tempKey.trim();
                                    if (key.length > 0) {
                                        // Basic validation to prevent obvious bad inputs
                                        if (key.length < 30 || !key.startsWith('AIza')) {
                                            Alert.alert("Invalid Key Format", "Gemini API keys typically start with 'AIza' and are around 39 characters long. Please check your key.");
                                            return;
                                        }
                                        ai.setGeminiApiKey(key);
                                        setTempKey('');
                                    }
                                }}
                                secureTextEntry
                            />
                            {ai.geminiApiKey && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                    <Text style={{ fontFamily: font.sansMed, fontSize: 12, color: colors.accent }}>{loc.plusFeatures.sparkAiActive}</Text>
                                    <Pressable onPress={() => ai.removeKey()}>
                                        <Text style={{ fontFamily: font.sans, fontSize: 12, color: colors.inkDim }}>{loc.plusFeatures.sparkAiRemove}</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={s.listItem}>
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.plusFeatures.syncTitle}</Text>
                            <Text style={s.listSub}>{loc.plusFeatures.syncDesc}</Text>

                            {!sync.googleToken ? (
                                <Pressable
                                    style={{ marginTop: 12, paddingVertical: 10, backgroundColor: colors.bgDeep, borderRadius: theme.radius.md, alignItems: 'center' }}
                                    onPress={handleGoogleLogin}
                                >
                                    <Text style={{ fontFamily: font.sansSemi, color: colors.ink, fontSize: 13 }}>{loc.plusFeatures.syncSignIn}</Text>
                                </Pressable>
                            ) : (
                                <View style={{ marginTop: 12 }}>
                                    <Text style={{ fontFamily: font.sansMed, fontSize: 12, color: colors.accent, marginBottom: 8 }}>
                                        ✓ Connected: {sync.googleEmail}
                                    </Text>

                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <Pressable
                                            style={{ flex: 1, paddingVertical: 10, backgroundColor: colors.accent, borderRadius: theme.radius.md, alignItems: 'center', opacity: sync.isSyncing ? 0.6 : 1 }}
                                            onPress={handleBackup}
                                            disabled={sync.isSyncing}
                                        >
                                            <Text style={{ fontFamily: font.sansSemi, color: colors.white, fontSize: 13 }}>
                                                {sync.isSyncing ? loc.plusFeatures.isSyncing : loc.plusFeatures.syncBackup}
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            style={{ flex: 1, paddingVertical: 10, backgroundColor: colors.bgRaised, borderWidth: 1, borderColor: colors.stroke, borderRadius: theme.radius.md, alignItems: 'center', opacity: sync.isSyncing ? 0.6 : 1 }}
                                            onPress={handleRestore}
                                            disabled={sync.isSyncing}
                                        >
                                            <Text style={{ fontFamily: font.sansSemi, color: colors.inkMid, fontSize: 13 }}>
                                                {sync.isSyncing ? 'Wait...' : loc.plusFeatures.syncRestore}
                                            </Text>
                                        </Pressable>
                                    </View>

                                    {sync.lastSync && (
                                        <Text style={{ fontFamily: font.mono, fontSize: 10, color: colors.inkDim, marginTop: 12, textAlign: 'center' }}>
                                            {loc.plusFeatures.lastSync}: {new Date(sync.lastSync).toLocaleString()}
                                        </Text>
                                    )}

                                    <Pressable style={{ marginTop: 16 }} onPress={async () => {
                                        await GoogleDriveService.signOut();
                                        sync.clearGoogleTokens();
                                    }}>
                                        <Text style={{ fontFamily: font.sans, fontSize: 12, color: colors.inkDim, textAlign: 'center' }}>{loc.plusFeatures.syncDisconnect}</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Appearance Customizer */}
                <Text style={s.sectionTitle}>{loc.settingsScreen.colorPalette}</Text>

                <View style={s.listBlock}>
                    {/* Appearance Mode Toggle */}
                    <View style={s.listItem}>
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.settingsScreen.appearanceTheme}</Text>
                            <Text style={s.listSub}>{loc.settingsScreen.colorSchemeSub}</Text>
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
                                <Text style={[s.modeText, { color: settings.nightMode === m ? (theme.isDark ? colors.bg : colors.white) : colors.inkMid }]}>
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

                </View>

                {/* Font Customization */}
                <Text style={s.sectionTitle}>{loc.typography.title}</Text>
                <View style={s.listBlock}>
                    <View style={s.listItem}>
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.typography.appFont}</Text>
                            <Text style={s.listSub}>{loc.typography.appFontDesc}</Text>
                        </View>
                    </View>
                    <View style={[s.pillRow, { paddingTop: 0, paddingBottom: 16 }]}>
                        {FONT_OPTIONS.map(f => (
                            <TagPill key={f.id} label={f.label} active={settings.appFont === f.id} onPress={() => settings.setAppFont(f.id)} />
                        ))}
                    </View>
                </View>

                {/* Appearance Theme Selector */}
                <Text style={s.sectionTitle}>{loc.palettes.standard}</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.themeGrid}
                >
                    {STANDARD_THEMES.map(opt => {
                        const isSelected = settings.themeId === opt.id;
                        const themeEntry = themes[opt.id];
                        const previewColors = theme.isDark ? themeEntry.dark : themeEntry.light;
                        return (
                            <Pressable
                                key={opt.id}
                                onPress={() => settings.setThemeId(opt.id)}
                                style={[
                                    s.themeCard,
                                    isSelected ? s.themeCardActive : s.themeCardInactive
                                ]}
                            >
                                <View>
                                    <View style={{ flexDirection: 'row', gap: 4, marginBottom: 12 }}>
                                        <View style={[s.themeCircle, { backgroundColor: themeEntry.light.accent, marginRight: 0 }]} />
                                        <View style={[s.themeCircle, { backgroundColor: themeEntry.dark.accent, marginRight: 0 }]} />
                                    </View>
                                    <View style={[s.themeLineLong, { backgroundColor: previewColors.strokeDim }]} />
                                    <View style={[s.themeLineShort, { backgroundColor: previewColors.strokeDim }]} />
                                </View>
                                <Text style={[s.themeLabel, { color: isSelected ? colors.accent : colors.inkMid }]} numberOfLines={2}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <Text style={s.sectionTitle}>{loc.palettes.pro}</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.themeGrid}
                >
                    {PREMIUM_THEMES.map(opt => {
                        const isSelected = settings.themeId === opt.id;
                        const themeEntry = themes[opt.id];
                        const previewColors = theme.isDark ? themeEntry.dark : themeEntry.light;
                        return (
                            <Pressable
                                key={opt.id}
                                onPress={() => settings.setThemeId(opt.id)}
                                style={[
                                    s.themeCard,
                                    isSelected ? s.themeCardActive : s.themeCardInactive
                                ]}
                            >
                                <View>
                                    <View style={{ flexDirection: 'row', gap: 4, marginBottom: 12 }}>
                                        <View style={[s.themeCircle, { backgroundColor: themeEntry.light.accent, marginRight: 0 }]} />
                                        <View style={[s.themeCircle, { backgroundColor: themeEntry.dark.accent, marginRight: 0 }]} />
                                    </View>
                                    <View style={[s.themeLineLong, { backgroundColor: previewColors.strokeDim }]} />
                                    <View style={[s.themeLineShort, { backgroundColor: previewColors.strokeDim }]} />
                                </View>
                                <Text style={[s.themeLabel, { color: isSelected ? colors.accent : colors.inkMid }]} numberOfLines={2}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Text Size & Language */}
                <Text style={s.sectionTitle}>{loc.settingsScreen.displayLanguage}</Text>
                <View style={s.listBlock}>
                    <Pressable
                        style={s.listItem}
                        onPress={() => setShowFontModal(true)}
                    >
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.settingsScreen.textSize}</Text>
                            <Text style={s.listSub}>{loc.settingsScreen.textSizeSub}</Text>
                        </View>
                        <Text style={{ fontFamily: font.mono, color: colors.accent, fontSize: 16 }}>
                            {Math.round(settings.fontSize * 100)}%
                        </Text>
                    </Pressable>

                    <View style={[s.pillRow, { paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.strokeDim }]}>
                        {LANG_OPTIONS.map(l => (
                            <TagPill key={l.id} label={l.label} active={settings.language === l.id} onPress={() => settings.setLanguage(l.id)} />
                        ))}
                    </View>
                </View>

                {/* Font Size Modal (Metrolist style) */}
                <Modal visible={showFontModal} transparent animationType="fade">
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <View style={{ backgroundColor: colors.bg, borderRadius: 28, width: '100%', padding: 24, ...theme.shadow.soft }}>
                            <Text style={{ fontFamily: font.sansBold, fontSize: 18, color: colors.ink, marginBottom: 8 }}>{loc.settingsScreen.textSize}</Text>
                            <Text style={{ fontFamily: font.sans, fontSize: 14, color: colors.inkMid, marginBottom: 32 }}>{loc.settingsScreen.textSizeSub}</Text>

                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontFamily: font.mono, fontSize: 24, color: colors.accent, marginBottom: 32 }}>
                                    {(settings.fontSize * 16).toFixed(1)} pt
                                </Text>

                                <View style={{ width: '100%', paddingHorizontal: 12 }}>
                                    {/* The Horizontal Line */}
                                    <View style={{ height: 4, backgroundColor: colors.strokeDim, borderRadius: 2, position: 'absolute', top: 10, left: 12, right: 12 }} />

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 24 }}>
                                        {FONT_SIZE_STEPS.map((step) => {
                                            const isActive = settings.fontSize === step;
                                            return (
                                                <Pressable
                                                    key={step}
                                                    onPress={() => settings.setFontSize(step)}
                                                    style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}
                                                >
                                                    {isActive ? (
                                                        <View style={{ width: 4, height: 24, backgroundColor: colors.accent, borderRadius: 2 }} />
                                                    ) : (
                                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.inkDim }} />
                                                    )}
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 40, gap: 12 }}>
                                <Pressable onPress={() => { settings.setFontSize(1.0); setShowFontModal(false); }} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                                    <Text style={{ color: colors.accent, fontFamily: font.sansSemi }}>{loc.settingsScreen.reset}</Text>
                                </Pressable>
                                <Pressable onPress={() => setShowFontModal(false)} style={{ backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}>
                                    <Text style={{ color: colors.white, fontFamily: font.sansSemi }}>{loc.settingsScreen.ok}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Back to Home Hint */}
                <View style={{ height: 40 }} />

            </ScrollView >

            <ThemedModal
                visible={syncAlert.visible}
                title={syncAlert.title}
                subtitle={syncAlert.sub}
                onClose={() => setSyncAlert(prev => ({ ...prev, visible: false }))}
                actions={[
                    { label: "OK", style: "default", onPress: () => setSyncAlert(prev => ({ ...prev, visible: false })) }
                ]}
            />
        </View >
    );
}
