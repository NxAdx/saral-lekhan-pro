import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ScrollView, StatusBar, Pressable, Platform, TextInput, View, Text, StyleSheet
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useNotesStore, ALL_TAG_ID, Note } from '../../store/notesStore';
import { useTheme } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { strings } from '../../i18n/strings';
import { BentoCard } from '../../components/ui/BentoCard';
import { TagPill } from '../../components/ui/TagPill';
import { useTypography } from '../../store/typographyStore';
import { FAB } from '../../components/ui/FAB';
import { ThemedModal } from '../../components/ui/ThemedModal';
import { Icon } from '../../components/ui/Icon';
import { stripMarkdown, markdownToHtml } from '../../utils/markdown';
import { checkForUpdate } from '../../utils/githubUpdater';

const HOME_BRAND = 'Saral लेखन';

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

/**
 * FlashList optimization: Move renderItem and keyExtractor outside
 */
const keyExtractor = (item: Note) => String(item.id);

const ItemSeparator = () => <View style={{ height: 8 }} />;

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const lang = useSettingsStore(s => s.language);
  const loc = strings[lang] || strings['En'];
  const { colors, font, radius, shadow, spacing } = theme;
  const type = useTypography();

  const [selectedTag, setSelectedTag] = useState<string>(ALL_TAG_ID);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [appAlert, setAppAlert] = useState<{ visible: boolean; title: string; subtitle: string }>({ visible: false, title: '', subtitle: '' });
  const [updateModal, setUpdateModal] = useState<{ visible: boolean; title: string; subtitle: string; version: string }>({ visible: false, title: '', subtitle: '', version: '' });

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const isLoaded = useNotesStore((s) => s.isLoaded);
  const notes = useNotesStore((s) => s.getNotesFilteredByTag(selectedTag));
  const getUniqueTags = useNotesStore((s) => s.getUniqueTags);
  const addNote = useNotesStore((s) => s.addNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  useEffect(() => {
    const runUpdateCheck = async () => {
      const info = await checkForUpdate();
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

  const uniqueTags = useMemo(() => getUniqueTags(), [notes]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim().toLowerCase());
    }, 120);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchIndex = useMemo(() => {
    return notes.map((note) => ({
      note,
      haystack: [
        note.title,
        note.plain_body || stripMarkdown(note.body),
        note.tag || '',
      ].join(' ').toLowerCase(),
    }));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = debouncedSearchQuery;
    if (!q) return notes;
    return searchIndex
      .filter(({ haystack }) => haystack.includes(q))
      .map(({ note }) => note);
  }, [notes, searchIndex, debouncedSearchQuery]);

  const toggleSelection = useCallback((id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === 0) setIsSelectionMode(false);
      return next;
    });
  }, []);

  const handleLongPress = useCallback((id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSelectionMode(true);
    setSelectedIds(new Set([id]));
  }, []);

  const clearSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowBulkDeleteModal(true);
  }, []);

  const handleBulkExport = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const onNewNote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/editor/new');
  }, [router]);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowImportModal(true);
  }, []);

  const s = useMemo(() => StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    listContent: { paddingBottom: 100 },
    noteContainer: { paddingHorizontal: 20 },
    headerLeft: {
      flexShrink: 1, 
    },
    appNameRow: {
      flexDirection: 'row',
      alignItems: 'baseline', 
    },
    appNameWordmark: {
      color: colors.ink,
      fontFamily: 'Poppins-Bold',
      fontSize: 28, 
      lineHeight: 34,
      letterSpacing: -0.4,
      includeFontPadding: false,
    },
    appSub: {
      ...type.labelMedium,
      fontFamily: 'Poppins-Medium',
      color: colors.inkDim,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      marginTop: 2,
    },
    selectionTitle: {
      ...type.headlineLarge,
      fontFamily: 'Poppins-Bold',
      color: colors.ink,
      fontSize: 24,
      lineHeight: 30,
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
      width: 44, height: 44, borderRadius: 99, borderWidth: 1.5, borderColor: colors.stroke,
      backgroundColor: colors.bgRaised, justifyContent: 'center', alignItems: 'center',
      ...shadow.gentle, shadowColor: colors.shadow
    },
  }), [colors, font, radius, shadow, searchFocused, spacing, theme.fontSize]);

  const ListHeader = useMemo(() => (
    <View>
      <View style={s.header}>
        {isSelectionMode ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 16 }}>
            <Pressable 
              onPress={clearSelection} 
              style={s.circleBtn} 
              hitSlop={12}
              accessible={true}
              accessibilityLabel={loc.editor.cancel || "Cancel Selection"}
              accessibilityRole="button"
            >
              <Icon name="x" color={colors.ink} size={20} />
            </Pressable>
            <Text style={s.selectionTitle} accessibilityLiveRegion="polite">
              {selectedIds.size} {loc.home.selected || 'Selected'}
            </Text>
            <View style={{ flex: 1 }} />
            <Pressable 
              onPress={handleBulkExport} 
              style={s.circleBtn} 
              hitSlop={12}
              accessible={true}
              accessibilityLabel="Export Data"
              accessibilityRole="button"
            >
              <Icon name="share" color={colors.ink} size={18} />
            </Pressable>
            <Pressable 
              onPress={handleBulkDelete} 
              style={[s.circleBtn, { borderColor: colors.accent }]} 
              hitSlop={12}
              accessible={true}
              accessibilityLabel="Delete Selected"
              accessibilityRole="button"
            >
              <Icon name="trash" color={colors.accent} size={18} />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={s.headerLeft} accessible={true} accessibilityLabel="Saral Lekhan Header">
              <Text style={s.appNameRow} numberOfLines={1}>
                <Text style={s.appNameWordmark}>{HOME_BRAND}</Text>
              </Text>
              <Text style={s.appSub}>{loc.appSub || "NOTES EXPERIENCE"}</Text>
            </View>
            <View style={s.headerRight}>
              <Pressable 
                onPress={handleImport} 
                style={s.circleBtn} 
                hitSlop={12}
                accessible={true}
                accessibilityLabel="Import Markdown"
                accessibilityRole="button"
              >
                <Icon name="import" color={colors.ink} size={18} />
              </Pressable>
              <Pressable 
                onPress={() => router.push('/trash')} 
                style={s.circleBtn} 
                hitSlop={12}
                accessible={true}
                accessibilityLabel="Open Trash"
                accessibilityRole="button"
              >
                <Icon name="trash-2" color={colors.ink} size={20} />
              </Pressable>
              <Pressable 
                onPress={() => router.push('/settings')} 
                style={s.circleBtn} 
                hitSlop={12} 
                testID="settings-button"
                accessible={true}
                accessibilityLabel="Open Settings"
                accessibilityRole="button"
              >
                <Icon name="settings" color={colors.ink} size={20} />
              </Pressable>
            </View>
          </>
        )}
      </View>
      <View style={s.searchWrap}>
        <Icon name="search" color={colors.inkDim} size={18} />
        <TextInput
          style={s.searchInput}
          placeholder={loc.searchPlaceholder}
          placeholderTextColor={colors.inkDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
          testID="search-input"
          accessible={true}
          accessibilityLabel="Search Notes"
        />
        {searchQuery.length > 0 && (
          <Pressable 
            onPress={() => setSearchQuery('')} 
            hitSlop={10}
            accessible={true}
            accessibilityLabel="Clear Search"
            accessibilityRole="button"
          >
            <Text style={s.clearBtn}>{'\u2715'}</Text>
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
  ), [searchFocused, searchQuery, selectedTag, uniqueTags, s, colors, loc, isSelectionMode, selectedIds]);

  const renderItem = useCallback(({ item, index }: { item: Note, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={s.noteContainer}
    >
      <BentoCard
        note={item}
        onPress={() => isSelectionMode ? toggleSelection(item.id) : onNotePress(item.id)}
        onLongPress={() => handleLongPress(item.id)}
        date={formatDate(item.updated_at, loc)}
        selected={selectedIds.has(item.id)}
      />
    </Animated.View>
  ), [s, loc, isSelectionMode, selectedIds, toggleSelection, onNotePress, handleLongPress]);

  if (!isLoaded) return null;

  return (
    <SafeAreaView style={s.root} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent={true} />
      <FlashList
        data={filteredNotes}
        keyExtractor={keyExtractor}
        contentContainerStyle={s.listContent}
        estimatedItemSize={140}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={ListHeader}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
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
        <FAB onPress={onNewNote} testID="fab-add-note" />
      </View>
      <ThemedModal
        visible={showImportModal}
        title={loc.home.importTitle}
        subtitle={loc.home.importSub}
        onClose={() => setShowImportModal(false)}
        actions={[
          { label: loc.home.importChoose, style: 'default', onPress: handleImportFile },
          { label: loc.editor.cancel, style: 'cancel', onPress: () => setShowImportModal(false) }
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
          { label: loc.editor.cancel, style: 'cancel', onPress: () => setShowBulkDeleteModal(false) }
        ]}
      />
      <ThemedModal
        visible={appAlert.visible}
        title={appAlert.title}
        subtitle={appAlert.subtitle}
        onClose={() => setAppAlert(prev => ({ ...prev, visible: false }))}
        actions={[
          { label: loc.settingsScreen.ok, style: 'default', onPress: () => setAppAlert(prev => ({ ...prev, visible: false })) }
        ]}
      />
      <ThemedModal
        visible={updateModal.visible}
        onClose={() => setUpdateModal(prev => ({ ...prev, visible: false }))}
        title={updateModal.title + " - " + updateModal.subtitle}
        actions={[
          { label: "Later", onPress: () => setUpdateModal(prev => ({ ...prev, visible: false })), style: 'cancel' },
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
    </SafeAreaView>
  );
}
