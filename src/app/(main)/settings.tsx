import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Platform, StatusBar, TextInput, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '../../store/themeStore';
import { useSettingsStore, AppLanguage } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { useAiStore } from '../../store/aiStore';
import { useSyncStore } from '../../store/syncStore';
import { useNotesStore } from '../../store/notesStore';
import { GoogleDriveService } from '../../services/googleDriveService';
import { themes, ThemeName } from '../../tokens';
import { strings } from '../../i18n/strings';
import { TagPill } from '../../components/ui/TagPill';
import { AppFontType } from '../../store/settingsStore';
import { ThemedModal } from '../../components/ui/ThemedModal';
import { useTypography } from '../../store/typographyStore';
import { APP_CHANGELOG } from '../../constants/changelog';
import { log } from '../../utils/Logger';

import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { APP_VERSION, checkForUpdate, downloadAndInstallApk, UpdateInfo } from '../../utils/githubUpdater';

const STANDARD_THEMES: { id: ThemeName; label: string }[] = [
    { id: 'classic', label: 'Tippani' },
    { id: 'nord', label: 'Nordic' }
];

const PREMIUM_THEMES: { id: ThemeName; label: string }[] = [

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
    { id: 'hind', label: 'Hind' },
    { id: 'poppins', label: 'Poppins' },
    { id: 'notoSans', label: 'Noto Sans' },
    { id: 'baloo2', label: 'Baloo 2' },
];

const LANG_OPTIONS: { id: AppLanguage; label: string }[] = [
    { id: 'En', label: 'English' },
    { id: 'Hi', label: 'हिंदी' },
    { id: 'Bn', label: 'বাংলা' },
    { id: 'Te', label: 'తెలుగు' },
    { id: 'Mr', label: 'मराठी' },
    { id: 'Ta', label: 'தமிழ்' },
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
    const type = useTypography();

    const [showFontModal, setShowFontModal] = React.useState(false);
    const [showFeatures, setShowFeatures] = React.useState(false);
    const [showChangelog, setShowChangelog] = React.useState(false);
    const [tempKey, setTempKey] = React.useState('');
    const [syncAlert, setSyncAlert] = React.useState<{ visible: boolean, title: string, sub: string }>({ visible: false, title: '', sub: '' });
    const [updateModal, setUpdateModal] = React.useState<{ visible: boolean, title: string, sub: string, info: UpdateInfo | null }>({ visible: false, title: '', sub: '', info: null });

    // Updater State
    const [updateInfo, setUpdateInfo] = React.useState<UpdateInfo | null>(null);
    const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);
    const [isDownloadingUpdate, setIsDownloadingUpdate] = React.useState(false);
    const [downloadProgress, setDownloadProgress] = React.useState(0);

    // Load sync state payload on mount
    React.useEffect(() => {
        sync.loadSyncState();
        handleCheckUpdate(false);
    }, []);

    const handleCheckUpdate = async (isManual = true) => {
        setIsCheckingUpdate(true);
        const info = await checkForUpdate(isManual);
        if (info && info.hasUpdate) {
            setUpdateInfo(info);
            // Show update modal if it's a new version OR if user manually checked for reinstall
            // NEW: Always show modal on mount if a NEW version is found (not just on manual check)
            if (isManual || (!info.isReinstall)) {
                setUpdateModal({
                    visible: true,
                    title: info.isReinstall ? "Reinstall Available" : "Update Available",
                    sub: info.isReinstall
                        ? `Version ${info.version} is already installed. Do you want to reinstall this build now?`
                        : `Version ${info.version} is available. Do you want to download it now?`,
                    info
                });
            }
        } else if (isManual) {
            setSyncAlert({ visible: true, title: "Up to date", sub: "You are already on the latest version." });
        }
        setIsCheckingUpdate(false);
    };

    const handleDownloadUpdate = async () => {
        if (!updateInfo?.downloadUrl) return;

        // 1. Check for Install Permission first
        const { checkInstallPermission, requestInstallPermission } = await import('../../utils/githubUpdater');
        const hasPermission = await checkInstallPermission();
        if (!hasPermission) {
            setSyncAlert({
                visible: true,
                title: "Permission Required",
                sub: "Saral Lekhan Plus needs permission to install updates. Please enable 'Install unknown apps' in the settings and try again."
            });
            await requestInstallPermission();
            return;
        }

        setIsDownloadingUpdate(true);
        setDownloadProgress(0);

        try {
            const success = await downloadAndInstallApk(
                updateInfo.downloadUrl,
                updateInfo.version,
                (prog) => setDownloadProgress(prog)
            );

            if (!success) {
                setSyncAlert({
                    visible: true,
                    title: "Update Failed",
                    sub: "Could not initiate the installation. This might happen if permission was denied or the download was interrupted."
                });
                return;
            }

            setDownloadProgress(1);
            setSyncAlert({
                visible: true,
                title: "Installer Started",
                sub: "The system update dialog should appear now. If it doesn't, please ensure 'Install unknown apps' is enabled for this app."
            });
        } catch (e: any) {
            setSyncAlert({
                visible: true,
                title: "Update Failed",
                sub: e?.message || "Something went wrong while preparing the installer."
            });
        } finally {
            setIsDownloadingUpdate(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { accessToken, email } = await GoogleDriveService.signIn();
            await sync.setGoogleTokens(accessToken, email);
        } catch (e: any) {
            setSyncAlert({ visible: true, title: "Login Failed", sub: e.message || "Could not authenticate with Google." });
        }
    };

    const getAuthenticatedToken = async () => {
        try {
            const accessToken = await GoogleDriveService.getFreshToken();
            return { accessToken, email: sync.googleEmail || '' };
        } catch (e: any) {
            const msg = String(e?.message || '').toLowerCase();
            const shouldReauth =
                msg.includes('session expired') ||
                msg.includes('sign in') ||
                msg.includes('sign-in');

            if (!shouldReauth) throw e;

            // Fallback: do one explicit native sign-in and continue.
            const freshSession = await GoogleDriveService.signIn();
            await sync.setGoogleTokens(freshSession.accessToken, freshSession.email);
            return freshSession;
        }
    };

    const handleBackup = async () => {
        sync.setIsSyncing(true);
        try {
            const { accessToken, email } = await getAuthenticatedToken();
            await sync.setGoogleTokens(accessToken, email || sync.googleEmail || '');
            await GoogleDriveService.backupDatabase(accessToken);
            await sync.setLastSync(Date.now());
            setSyncAlert({ visible: true, title: "Backup Complete", sub: "Your notes were safely uploaded to Google Drive." });
        } catch (e: any) {
            setSyncAlert({ visible: true, title: "Backup Failed", sub: e.message || "An error occurred during upload." });
        } finally {
            sync.setIsSyncing(false);
        }
    };

    const handleRestore = async () => {
        sync.setIsSyncing(true);
        try {
            const { accessToken, email } = await getAuthenticatedToken();
            await sync.setGoogleTokens(accessToken, email || sync.googleEmail || '');
            await GoogleDriveService.restoreDatabase(accessToken);
            // Sequence: Reset DB -> Refresh Settings (if any changed) -> Notify
            notes.resetDB();
            await sync.setLastSync(Date.now());
            setSyncAlert({ visible: true, title: loc.plusFeatures.syncRestore, sub: loc.plusFeatures.syncRestore });
        } catch (e: any) {
            setSyncAlert({ visible: true, title: "Restore Failed", sub: e.message || "An error occurred during download." });
        } finally {
            sync.setIsSyncing(false);
        }
    };

    const handleBugReport = async () => {
        try {
            const debugInfo = log.getDebugInfo();
            const logsText = log.getLogsAsString();
            const fullReport = `${debugInfo}\n\n${logsText}`;

            const filename = `saral_lekhan_debug_${Date.now()}.txt`;
            const uri = `${FileSystem.cacheDirectory}${filename}`;
            await FileSystem.writeAsStringAsync(uri, fullReport);

            if (!(await Sharing.isAvailableAsync())) {
                setSyncAlert({ visible: true, title: "Error", sub: "Sharing is not available on this device" });
                return;
            }

            await Sharing.shareAsync(uri, {
                dialogTitle: 'Saral Lekhan Bug Report',
                mimeType: 'text/plain',
                UTI: 'public.plain-text',
            });

            log.info("Bug report shared successfully");
        } catch (e) {
            console.error("Failed to share bug report", e);
            setSyncAlert({ visible: true, title: "Error", sub: "Failed to generate bug report" });
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

        sectionTitle: { fontFamily: font.sansBold, fontSize: 13 * theme.fontSize, color: colors.accent, textTransform: 'uppercase', marginBottom: 12, marginTop: 24, letterSpacing: 1 },

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
        singleRowCard: {
            backgroundColor: colors.bgRaised,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: colors.stroke,
            overflow: 'hidden',
            elevation: 0,
            shadowColor: 'transparent',
            shadowOpacity: 0,
            shadowRadius: 0,
            shadowOffset: { width: 0, height: 0 },
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
        listLabel: { ...type.titleLarge, fontSize: type.titleLarge.fontSize - 2, fontFamily: font.sansBold, color: colors.ink, marginBottom: 2 },
        listSub: { ...type.labelMedium, fontFamily: font.sans, color: colors.inkMid },
        listContent: { flex: 1, marginRight: 12 },

        // Control buttons
        modeBtn: {
            flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
            borderRightWidth: 1, borderRightColor: colors.strokeDim,
        },
        modeBtnLast: { borderRightWidth: 0 },
        activeMode: { backgroundColor: colors.accent },
        modeText: { fontFamily: font.sansSemi, fontSize: 13 * theme.fontSize },

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
        themeLabel: { fontFamily: font.sans, fontSize: 11 * theme.fontSize, textAlign: 'center' },
        listDivider: { height: 1, backgroundColor: colors.strokeDim, marginLeft: 16 },
    }), [colors, font, theme.radius, theme.isDark, settings.nightMode, settings.themeId]);

    return (
        <View style={s.root}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} translucent={false} />

            <View style={s.header}>
                <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
                    <Svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M5 12l14 0" />
                        <Path d="M5 12l6 6" />
                        <Path d="M5 12l6 -6" />
                    </Svg>
                </Pressable>
                <Text style={s.title}>{loc.settings}</Text>
                <View style={{ flex: 1 }} />

                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Pressable
                        onPress={handleBugReport}
                        style={({ pressed }) => ({
                            width: 38, height: 38, borderRadius: 99,
                            borderWidth: 1.5, borderColor: colors.strokeDim,
                            backgroundColor: colors.bgRaised,
                            justifyContent: 'center', alignItems: 'center',
                            opacity: pressed ? 0.7 : 1,
                            ...theme.shadow.gentle
                        })}
                    >
                        <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M9 9v-1a3 3 0 0 1 6 0v1" />
                            <Path d="M8 9h8a6 6 0 0 1 1 3v3a5 5 0 0 1 -10 0v-3a6 6 0 0 1 1 -3" />
                            <Path d="M3 13l4 0" />
                            <Path d="M17 13l4 0" />
                            <Path d="M12 20l0 -6" />
                            <Path d="M4 19l3.35 -2" />
                            <Path d="M20 19l-3.35 -2" />
                            <Path d="M4 7l3.75 2.4" />
                            <Path d="M20 7l-3.75 2.4" />
                        </Svg>
                    </Pressable>

                    <Pressable
                        onPress={() => setShowFeatures(true)}
                        style={({ pressed }) => ({
                            width: 38, height: 38, borderRadius: 99,
                            borderWidth: 1.5, borderColor: colors.strokeDim,
                            backgroundColor: colors.bgRaised,
                            justifyContent: 'center', alignItems: 'center',
                            opacity: pressed ? 0.7 : 1,
                            ...theme.shadow.gentle
                        })}
                    >
                        <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                            <Path d="M12 9v4" />
                            <Path d="M12 16v.01" />
                        </Svg>
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

                {/* APP UPDATER */}
                <View
                    style={{
                        marginBottom: 24,
                        padding: 16,
                        backgroundColor: colors.bgRaised,
                        borderRadius: theme.radius.lg,
                        borderWidth: 1,
                        borderColor: colors.strokeDim
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.listLabel}>App Version</Text>
                            <Text style={s.listSub}>
                                Current: v{APP_VERSION}
                                {updateInfo?.hasUpdate
                                    ? (updateInfo.isReinstall
                                        ? ` • Reinstall v${updateInfo.version}`
                                        : ` • Latest: v${updateInfo.version}`)
                                    : ' • Up to date'}
                            </Text>
                        </View>
                        {isCheckingUpdate ? (
                            <Text style={[s.listSub, { color: colors.accent }]}>Checking...</Text>
                        ) : updateInfo?.hasUpdate ? (
                            <Pressable
                                onPress={handleDownloadUpdate}
                                disabled={isDownloadingUpdate}
                                style={{ backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radius.sm }}
                            >
                                <Text style={{ color: colors.white, fontFamily: font.sansBold }}>
                                    {isDownloadingUpdate
                                        ? `Downloading ${Math.round(downloadProgress * 100)}%`
                                        : (updateInfo?.isReinstall ? 'Reinstall' : 'Update Now')}
                                </Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                onPress={() => handleCheckUpdate(true)}
                                style={{
                                    backgroundColor: colors.bgRaised,
                                    borderWidth: 1,
                                    borderColor: colors.strokeDim,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: theme.radius.sm
                                }}
                            >
                                <Text style={{ color: colors.ink, fontFamily: font.sansSemi, fontSize: 13 }}>
                                    Check for Updates
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>


                {/* APPEARANCE SECTION */}
                <Text style={s.sectionTitle}>{loc.settingsScreen.aesthetics}</Text>
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
                                <Text style={[s.modeText, { color: settings.nightMode === m ? (theme.isDark ? colors.bg : colors.white) : colors.inkMid, includeFontPadding: false }]}>
                                    {m === 'system' ? 'System' : m === 'light' ? 'Light' : 'Dark'}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Auto-save Toggle */}
                    <View style={s.listItem}>
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.settingsScreen.autoSave}</Text>
                            <Text style={s.listSub}>Automatically save notes as you type</Text>
                        </View>
                        <Switch
                            value={settings.autoSave}
                            onValueChange={settings.setAutoSave}
                            trackColor={{ false: colors.stroke, true: colors.accent }}
                            thumbColor={colors.white}
                        />
                    </View>

                    {/* Text Size Entry */}
                    <Pressable
                        style={[s.listItem, s.listItemNoBorder]}
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
                </View>

                {/* Font Customization */}
                <View style={s.listBlock}>
                    <View style={s.listItem}>
                        <View style={s.listContent}>
                            <Text style={s.listLabel}>{loc.typography.appFont}</Text>
                            <Text style={s.listSub}>{loc.typography.appFontDesc}</Text>
                        </View>
                    </View>
                    <View style={[s.pillRow, { paddingTop: 20, paddingBottom: 24 }]}>
                        {FONT_OPTIONS.map(f => (
                            <TagPill key={f.id} label={f.label} active={settings.appFont === f.id} onPress={() => settings.setAppFont(f.id)} />
                        ))}
                    </View>
                </View>

                {/* THEME PALETTES */}
                <Text style={s.sectionTitle}>{loc.palettes.standard}</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.themeGrid}
                    style={{ marginBottom: 24 }}
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
                                <Text style={[s.themeLabel, { color: isSelected ? colors.accent : colors.inkMid, includeFontPadding: false }]} numberOfLines={2}>
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
                    style={{ marginBottom: 24 }}
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
                                <Text style={[s.themeLabel, { color: isSelected ? colors.accent : colors.inkMid, includeFontPadding: false }]} numberOfLines={2}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* LANGUAGE SECTION */}
                <Text style={s.sectionTitle}>{loc.settingsScreen.displayLanguage}</Text>
                <View style={[s.listBlock, { paddingBottom: 16 }]}>
                    <View style={[s.pillRow, { paddingTop: 16 }]}>
                        {LANG_OPTIONS.map(l => (
                            <TagPill key={l.id} label={l.label} active={settings.language === l.id} onPress={() => settings.setLanguage(l.id)} />
                        ))}
                    </View>
                </View>

                {/* SECURITY & PRIVACY */}
                <Text style={s.sectionTitle}>Security & Privacy</Text>
                <View style={s.singleRowCard}>
                    <View style={[s.listItem, s.listItemNoBorder]}>
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
                            trackColor={{ false: colors.stroke, true: colors.accent }}
                            thumbColor={colors.white}
                        />
                    </View>
                </View>

                {/* CLOUD & BACKUP */}
                <Text style={s.sectionTitle}>Cloud & Intelligence</Text>
                <View style={s.listBlock}>
                    {/* Spark AI Key */}
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
                                        if (key.length < 30 || !key.startsWith('AIza')) {
                                            setSyncAlert({ visible: true, title: "Invalid Key Format", sub: "Gemini API keys typically start with 'AIza' and are around 39 characters long. Please check your key." });
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

                    {/* Google Drive Sync */}
                    <View style={[s.listItem, s.listItemNoBorder]}>
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
                                            style={{ flex: 1, paddingVertical: 12, backgroundColor: colors.accent, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', opacity: sync.isSyncing ? 0.6 : 1 }}
                                            onPress={handleBackup}
                                            disabled={sync.isSyncing}
                                        >
                                            <Text style={{ fontFamily: font.sansSemi, color: colors.white, fontSize: 13, textAlign: 'center', includeFontPadding: false }}>
                                                {sync.isSyncing ? loc.plusFeatures.isSyncing : loc.plusFeatures.syncBackup}
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            style={{ flex: 1, paddingVertical: 12, backgroundColor: colors.bgRaised, borderWidth: 1, borderColor: colors.stroke, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', opacity: sync.isSyncing ? 0.6 : 1 }}
                                            onPress={handleRestore}
                                            disabled={sync.isSyncing}
                                        >
                                            <Text style={{ fontFamily: font.sansSemi, color: colors.inkMid, fontSize: 13, textAlign: 'center', includeFontPadding: false }}>
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


                {/* About Developer Section */}
                <View style={{ marginTop: 40, alignItems: 'center', opacity: 0.6 }}>
                    <Text style={{ fontFamily: font.sans, fontSize: 13, color: colors.inkMid }}>
                        Designed by
                    </Text>
                    <Text style={{ fontFamily: font.sansBold, fontSize: 15, color: colors.accent, marginTop: 4 }}>
                        Aadarsh Lokhande
                    </Text>
                    <Text style={{ fontFamily: font.mono, fontSize: 10, color: colors.inkDim, marginTop: 12 }}>
                        {`SARAL LEKHAN PLUS ENGINE v${APP_VERSION}`}
                    </Text>
                </View>

                <View style={{ height: 80 }} />

            </ScrollView >

            <ThemedModal
                visible={showFeatures}
                title={loc.featureDiscovery.title}
                subtitle={loc.featureDiscovery.subtitle}
                onClose={() => setShowFeatures(false)}
                actions={[
                    { label: loc.featureDiscovery.viewChangelog, style: "default", onPress: () => { setShowFeatures(false); setShowChangelog(true); } },
                    { label: loc.settingsScreen.ok, style: "default", onPress: () => setShowFeatures(false) }
                ]}
                customContent={
                    <View style={{ gap: 20 }}>
                        {[
                            { title: loc.featureDiscovery.sparkAi, desc: loc.featureDiscovery.sparkAiDesc },
                            { title: loc.featureDiscovery.sync, desc: loc.featureDiscovery.syncDesc },
                            { title: loc.featureDiscovery.vault, desc: loc.featureDiscovery.vaultDesc },
                            { title: loc.featureDiscovery.editor, desc: loc.featureDiscovery.editorDesc },
                        ].map((feat, i) => (
                            <View key={i} style={{ flexDirection: 'row', gap: 16 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: font.sansBold, fontSize: 15, color: colors.ink, includeFontPadding: false }}>{feat.title}</Text>
                                    <Text style={{ fontFamily: font.sans, fontSize: 13, color: colors.inkMid, marginTop: 2, includeFontPadding: false }}>{feat.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                }
            />

            <ThemedModal
                visible={showFontModal}
                title={loc.settingsScreen.textSize}
                subtitle={loc.settingsScreen.textSizeSub}
                onClose={() => setShowFontModal(false)}
                actions={[
                    { label: loc.settingsScreen.reset, style: "default", onPress: () => { settings.setFontSize(1.0); setShowFontModal(false); } },
                    { label: loc.settingsScreen.ok, style: "default", onPress: () => setShowFontModal(false) }
                ]}
                customContent={
                    <View>
                        <View style={{
                            backgroundColor: colors.bgRaised,
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 24,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.strokeDim,
                            minHeight: 100,
                            justifyContent: 'center'
                        }}>
                            <Text style={{
                                fontFamily: font.sans,
                                fontSize: type.bodyLarge.fontSize,
                                color: colors.ink,
                                textAlign: 'center',
                                includeFontPadding: false
                            }}>
                                {settings.language === 'Hi' ? "नमस्ते, सरल लेखन।" : settings.language === 'Mr' ? "नमस्कार, सरल लेखन।" : "The quick brown fox jumps over the lazy dog."}
                            </Text>
                            <Text style={{ fontFamily: font.mono, fontSize: 11, color: colors.accent, marginTop: 8 }}>
                                {Math.round(settings.fontSize * 100)}% ({settings.appFont})
                            </Text>
                        </View>

                        <View style={{ alignItems: 'center', paddingBottom: 10 }}>
                            <View style={{ width: '100%', height: 48, justifyContent: 'center' }}>
                                <View style={{
                                    height: 12,
                                    backgroundColor: colors.accentBg,
                                    borderRadius: 6,
                                    width: '100%',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <View style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: `${((settings.fontSize - 0.8) / (1.4 - 0.8)) * 100}%`,
                                        backgroundColor: colors.accent
                                    }} />
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                }}>
                                    {FONT_SIZE_STEPS.map((step) => {
                                        const isActive = settings.fontSize === step;
                                        return (
                                            <Pressable
                                                key={step}
                                                onPress={() => settings.setFontSize(step)}
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <View style={{
                                                    width: 4,
                                                    height: 4,
                                                    borderRadius: 2,
                                                    backgroundColor: isActive ? colors.white : colors.accent,
                                                    opacity: isActive ? 1 : 0.4
                                                }} />

                                                {isActive && (
                                                    <View style={{
                                                        position: 'absolute',
                                                        width: 10,
                                                        height: 28,
                                                        borderRadius: 4,
                                                        backgroundColor: colors.accent,
                                                        zIndex: -1
                                                    }} />
                                                )}
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>
                }
            />

            <ThemedModal
                visible={syncAlert.visible}
                title={syncAlert.title}
                subtitle={syncAlert.sub}
                onClose={() => setSyncAlert(prev => ({ ...prev, visible: false }))}
                actions={[
                    { label: "OK", style: "default", onPress: () => setSyncAlert(prev => ({ ...prev, visible: false })) }
                ]}
            />

            <ThemedModal
                visible={showChangelog}
                title={loc.settingsScreen.whatsNew}
                onClose={() => setShowChangelog(false)}
                actions={[
                    { label: loc.settingsScreen.ok, style: "default", onPress: () => setShowChangelog(false) }
                ]}
                customContent={
                    <View style={{ height: 400 }}>
                        <ScrollView showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
                            {APP_CHANGELOG.map((item, idx) => (
                                <View key={item.version} style={{ marginBottom: 24, borderBottomWidth: idx === APP_CHANGELOG.length - 1 ? 0 : 1, borderBottomColor: colors.strokeDim, paddingBottom: 16 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <Text style={{ fontFamily: font.sansBold, fontSize: 18, color: colors.accent, includeFontPadding: false }}>v{item.version}</Text>
                                        <Text style={{ fontFamily: font.mono, fontSize: 11, color: colors.inkDim }}>{item.date}</Text>
                                    </View>
                                    {(item.changes[settings.language.toLowerCase() as keyof typeof item.changes] || item.changes['en'])?.map((change, cIdx) => (
                                        <Text key={cIdx} style={{ fontFamily: font.sans, fontSize: 14, color: colors.ink, marginBottom: 6, lineHeight: 20, includeFontPadding: false }}>
                                            • {change}
                                        </Text>
                                    ))}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                }
            />
            <ThemedModal
                visible={updateModal.visible}
                onClose={() => setUpdateModal(prev => ({ ...prev, visible: false }))}
                title={updateModal.title}
                subtitle={updateModal.sub}
                actions={[
                    {
                        label: "Wait",
                        style: 'cancel',
                        onPress: () => setUpdateModal(prev => ({ ...prev, visible: false })),
                    },
                    {
                        label: updateModal.info?.isReinstall ? "Reinstall Now" : "Update Now",
                        onPress: () => {
                            setUpdateModal(prev => ({ ...prev, visible: false }));
                            handleDownloadUpdate();
                        },
                    }
                ]}
            />
        </View>
    );
}
