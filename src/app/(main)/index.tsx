import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ScrollView, StatusBar, Pressable, Platform, TextInput, View, Text, StyleSheet
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Svg, Circle, Line, Path } from 'react-native-svg';
import { useNotesStore, ALL_TAG_ID } from '../../store/notesStore';
import { useTheme } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { strings } from '../../i18n/strings';
import { BentoCard } from '../../components/ui/BentoCard';
import { TagPill } from '../../components/ui/TagPill';
import { useTypography } from '../../store/typographyStore';
import { FAB } from '../../components/ui/FAB';
import { ThemedModal } from '../../components/ui/ThemedModal';
import * as Sharing from 'expo-sharing';
import { log } from '../../utils/Logger';
import { APP_CHANGELOG } from '../../constants/changelog';
import { stripMarkdown, markdownToHtml } from '../../utils/markdown';
import { checkForUpdate } from '../../utils/githubUpdater';

function formatDate(ts: number, loc: any): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return loc.home.yesterday || 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const lang = useSettingsStore(s => s.language);
  // Fallback to English if the cached language from an older version doesn't exist anymore
  const loc = strings[lang] || strings['En'];
  const { colors, font, radius, shadow, spacing } = theme;
  const type = useTypography();

  const [selectedTag, setSelectedTag] = useState<string>(ALL_TAG_ID);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [appAlert, setAppAlert] = useState<{ visible: boolean; title: string; subtitle: string }>({ visible: false, title: '', subtitle: '' });
  const [updateModal, setUpdateModal] = useState<{ visible: boolean; title: string; subtitle: string; version: string }>({ visible: false, title: '', subtitle: '', version: '' });

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const initDB = useNotesStore((s) => s.initDB);
  const isLoaded = useNotesStore((s) => s.isLoaded);
  const notes = useNotesStore((s) => s.getNotesFilteredByTag(selectedTag));
  const getUniqueTags = useNotesStore((s) => s.getUniqueTags);
  const addNote = useNotesStore((s) => s.addNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  // Global App Update Checker
  useEffect(() => {
    const runUpdateCheck = async () => {
      const info = await checkForUpdate();
      // On Home screen, we ONLY notify if it's a genuine NEW version (isReinstall will be false by my logic)
      if (info && info.hasUpdate && !info.isReinstall) {
        setUpdateModal({
          visible: true,
          title: "Update Available",
          subtitle: `Version ${info.version} is available! Head to Settings to download it directly.`,
          version: info.version
        });
      }
    };
    runUpdateCheck();
  }, [router]);

  // Hide splash only when Home is ready to show
  useEffect(() => {
    if (isLoaded) {
      log.info("HomeScreen: isLoaded, releasing splash.");
      // Small timeout to ensure the first frame of the list is rendered
      const t = setTimeout(async () => {
        const { SplashScreen } = await import('expo-router');
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          // Ignore
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isLoaded]);

  const uniqueTags = useMemo(() => getUniqueTags(), [notes]);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        stripMarkdown(n.body).toLowerCase().includes(q) ||
        (n.tag || '').toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      if (next.size === 0) setIsSelectionMode(false);
      return next;
    });
  }, []);

  const handleLongPress = useCallback((id: number) => {
    setIsSelectionMode(true);
    setSelectedIds(new Set([id]));
  }, []);

  const clearSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(() => {
    setShowBulkDeleteModal(true);
  }, []);

  const handleBulkExport = useCallback(async () => {
    const selectedNotes = filteredNotes.filter(n => selectedIds.has(n.id));
    if (selectedNotes.length === 0) return;

    try {
      const content = selectedNotes.map(n => `## ${n.title}\n\n${n.body}`).join('\n\n---\n\n');
      const filename = `saral_export_${Date.now()}.md`;
      const uri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, content);
      const { shareAsync } = await import('expo-sharing');
      await shareAsync(uri, { dialogTitle: 'Bulk Export' });
      clearSelection();
    } catch (e) {
      console.warn(e);
    }
  }, [selectedIds, filteredNotes, clearSelection]);

  const onNewNote = useCallback(() => router.push('/editor/new'), [router]);
  const onNotePress = useCallback((id: number) => router.push(`/editor/${id}`), [router]);

  const handleImportFile = useCallback(async () => {
    setShowImportModal(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/markdown', 'text/plain'],
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const file = result.assets[0];
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext !== 'md' && ext !== 'txt') {
        setAppAlert({ visible: true, title: loc.home.importFailedTitle, subtitle: loc.editor.mdOnly || "Only Markdown files supported" });
        return;
      }

      let content = await FileSystem.readAsStringAsync(file.uri);
      if (ext === 'md') {
        content = markdownToHtml(content);
      }

      const newTitle = file.name.replace(/\.[^/.]+$/, "");
      const generatedId = addNote({ title: newTitle, body: content, tag: '', pinned: false });
      router.push(`/editor/${generatedId}`);
    } catch (e) {
      console.warn("Import failed", e);
      setAppAlert({ visible: true, title: loc.home.importFailedTitle, subtitle: loc.home.importFailedSub });
    }
  }, [addNote, loc, router]);

  const handleImport = useCallback(() => {
    setShowImportModal(true);
  }, []);

  // Create dynamic styles
  const s = useMemo(() => StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44,
    },
    listContent: { paddingBottom: 100 },
    noteContainer: { paddingHorizontal: 20 },
    headerLeft: {
      flex: 1,
    },
    appName: {
      ...type.headlineLarge,
      fontFamily: font.sansBold, // Reverted to sansBold as per older UI
      color: colors.ink,
      fontSize: 26, // Reduced to force one line and match smaller look
    },
    appSub: {
      ...type.labelMedium,
      fontFamily: font.mono, // Spaced mono look
      color: colors.inkDim,
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      marginTop: -2,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.bgRaised,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.strokeDim,
    },
    chipText: {
      ...type.labelMedium,
      fontFamily: font.sansBold,
      color: colors.inkMid
    },
    searchWrap: {
      marginHorizontal: 20, marginBottom: spacing[4], backgroundColor: colors.bgRaised,
      borderRadius: radius.pill, borderWidth: 1, borderColor: searchFocused ? colors.accent : colors.strokeDim,
      paddingHorizontal: 16, height: 52, flexDirection: 'row', alignItems: 'center',
      ...shadow.gentle, shadowColor: colors.shadow, gap: 12
    },
    searchInput: { flex: 1, fontFamily: font.sans, fontSize: 15 * theme.fontSize, color: colors.ink, padding: 0 },
    clearBtn: { fontSize: 13 * theme.fontSize, color: colors.inkDim, paddingHorizontal: 4 },
    tagRailOuter: { marginBottom: 12 },
    tagRail: { paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
    empty: { paddingTop: 60, alignItems: 'center' },
    emptyTitle: { fontFamily: font.sansSemi, fontSize: 16 * theme.fontSize, color: colors.inkMid, marginBottom: 6 },
    emptySub: { fontFamily: font.mono, fontSize: 12 * theme.fontSize, color: colors.inkDim },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 32,
      paddingBottom: 20
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    fabWrap: { position: 'absolute', bottom: 32, right: 28 },
    circleBtn: {
      width: 42, height: 42, borderRadius: 99, borderWidth: 1.5, borderColor: colors.stroke,
      backgroundColor: colors.bgRaised, justifyContent: 'center', alignItems: 'center',
      ...shadow.gentle, shadowColor: colors.shadow
    },
  }), [colors, font, radius, shadow, searchFocused, spacing, theme.fontSize]);

  const ListHeader = useMemo(() => (
    <View>
      <View style={s.header}>
        {isSelectionMode ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 16 }}>
            <Pressable onPress={clearSelection} style={s.circleBtn} hitSlop={12}>
              <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                <Path d="M10 10l4 4m0 -4l-4 4" />
              </Svg>
            </Pressable>
            <Text style={[s.appName, { fontSize: 24 }]}>{selectedIds.size} {loc.home.selected || 'Selected'}</Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={handleBulkExport} style={s.circleBtn} hitSlop={12}>
              <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                <Path d="M7 11l5 5l5 -5" />
                <Path d="M12 4l0 12" />
              </Svg>
            </Pressable>
            <Pressable onPress={handleBulkDelete} style={[s.circleBtn, { borderColor: colors.accent }]} hitSlop={12}>
              <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M4 7l16 0" />
                <Path d="M10 11l0 6" />
                <Path d="M14 11l0 6" />
                <Path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                <Path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
              </Svg>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={s.headerLeft}>
              <Text style={s.appName}>{loc.appName}</Text>
              <Text style={s.appSub}>{loc.appSub || "NOTES EXPERIENCE"}</Text>
            </View>
            <View style={s.headerRight}>
              <Pressable onPress={handleImport} style={s.circleBtn} hitSlop={12}>
                <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <Path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
                  <Path d="M7 16.5l3 3l3 -3" />
                  <Path d="M10 20.2V12" />
                  <Path d="M20 18v1a2 2 0 0 1 -2 2h-1" />
                </Svg>
              </Pressable>
              <Pressable onPress={() => router.push('/trash')} style={s.circleBtn} hitSlop={12}>
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M4 7l16 0" />
                  <Path d="M10 11l0 6" />
                  <Path d="M14 11l0 6" />
                  <Path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                  <Path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                </Svg>
              </Pressable>
              <Pressable onPress={() => router.push('/settings')} style={s.circleBtn} hitSlop={12}>
                <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37a1.724 1.724 0 0 0 2.572 -1.065z" />
                  <Path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                </Svg>
              </Pressable>
            </View>
          </>
        )}
      </View>

      <View style={s.searchWrap}>
        <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.inkDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
          <Path d="M21 21l-6 -6" />
        </Svg>
        <TextInput
          style={s.searchInput}
          placeholder={loc.searchPlaceholder}
          placeholderTextColor={colors.inkDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
            <Text style={s.clearBtn}>✕</Text>
          </Pressable>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tagRail} style={s.tagRailOuter}>
        <TagPill label={loc.allTag} active={selectedTag === ALL_TAG_ID} onPress={() => setSelectedTag(ALL_TAG_ID)} />
        {uniqueTags.map((tag) => (
          <TagPill key={tag} label={tag} active={selectedTag === tag} onPress={() => setSelectedTag(tag)} />
        ))}
      </ScrollView>
    </View >
  ), [searchFocused, searchQuery, selectedTag, uniqueTags, s, colors]);

  if (!isLoaded) return null;

  return (
    <View style={s.root}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} translucent={false} />

      <FlashList
        data={filteredNotes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.listContent}
        estimatedItemSize={140}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <View style={s.noteContainer}>
            <BentoCard
              note={item}
              onPress={() => isSelectionMode ? toggleSelection(item.id) : onNotePress(item.id)}
              onLongPress={() => handleLongPress(item.id)}
              date={formatDate(item.updated_at, loc)}
              selected={selectedIds.has(item.id)}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyTitle}>
              {searchQuery ? loc.noResults : loc.noNotes}
            </Text>
            <Text style={s.emptySub}>
              {searchQuery
                ? `${loc.noResultsSub} "${searchQuery}"`
                : loc.noNotesSub}
            </Text>
          </View>
        }
      />

      <View style={s.fabWrap} pointerEvents="box-none">
        <FAB onPress={onNewNote} />
      </View>

      <ThemedModal
        visible={showImportModal}
        title={loc.home.importTitle}
        subtitle={loc.home.importSub}
        onClose={() => setShowImportModal(false)}
        actions={[
          {
            label: loc.home.importChoose,
            style: 'default',
            onPress: handleImportFile
          },
          {
            label: loc.editor.cancel,
            style: 'cancel',
            onPress: () => setShowImportModal(false)
          }
        ]}
      />

      <ThemedModal
        visible={showBulkDeleteModal}
        title={loc.editor.deleteNote}
        subtitle={`${loc.home.deleteConfirm || "Delete"} ${selectedIds.size} ${loc.home.notesTitle || "notes"}?`}
        onClose={() => setShowBulkDeleteModal(false)}
        actions={[
          {
            label: loc.editor.delete,
            style: 'destructive',
            onPress: () => {
              selectedIds.forEach(id => deleteNote(id));
              clearSelection();
            }
          },
          {
            label: loc.editor.cancel,
            style: 'cancel',
            onPress: () => setShowBulkDeleteModal(false)
          }
        ]}
      />

      <ThemedModal
        visible={appAlert.visible}
        title={appAlert.title}
        subtitle={appAlert.subtitle}
        onClose={() => setAppAlert(prev => ({ ...prev, visible: false }))}
        actions={[
          {
            label: loc.settingsScreen.ok,
            style: 'default',
            onPress: () => setAppAlert(prev => ({ ...prev, visible: false }))
          }
        ]}
      />
      <ThemedModal
        visible={updateModal.visible}
        onClose={() => setUpdateModal(prev => ({ ...prev, visible: false }))}
        title={updateModal.title + " - " + updateModal.subtitle}
        actions={[
          {
            label: "Later",
            onPress: () => setUpdateModal(prev => ({ ...prev, visible: false })),
            style: 'cancel'
          },
          {
            label: "Update Now",
            onPress: () => {
              setUpdateModal(prev => ({ ...prev, visible: false }));
              router.push('/settings');
            },
            style: 'default'
          }
        ]}
      />
    </View>
  );
}
