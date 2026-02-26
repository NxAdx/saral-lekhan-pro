import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  ScrollView, StatusBar, Pressable, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Circle, Line, Path } from 'react-native-svg';
import { useNotesStore, ALL_TAG_ID } from '../../store/notesStore';
import { useTheme } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { strings } from '../../i18n/strings';
import { BentoCard } from '../../components/ui/BentoCard';
import { TagPill } from '../../components/ui/TagPill';
import { FAB } from '../../components/ui/FAB';
import { stripMarkdown } from '../../utils/markdown';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'कल';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const lang = useSettingsStore(s => s.language);
  // Fallback to English if the cached language from an older version doesn't exist anymore
  const loc = strings[lang] || strings['En'];
  const { colors, font, radius, shadow } = theme;

  const [selectedTag, setSelectedTag] = useState<string>(ALL_TAG_ID);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const initDB = useNotesStore((s) => s.initDB);
  const isLoaded = useNotesStore((s) => s.isLoaded);
  const notes = useNotesStore((s) => s.getNotesFilteredByTag(selectedTag));
  const getUniqueTags = useNotesStore((s) => s.getUniqueTags);

  useEffect(() => {
    initDB();
  }, [initDB]);

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

  const onNewNote = useCallback(() => router.push('/editor/new'), [router]);
  const onNotePress = useCallback((id: number) => router.push(`/editor/${id}`), [router]);

  // Create dynamic styles
  const s = useMemo(() => StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44,
    },
    listContent: { paddingBottom: 100 },
    noteContainer: { paddingHorizontal: 20 },
    header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' },
    appName: { fontFamily: font.display, fontSize: 32, fontWeight: '900', color: colors.ink, letterSpacing: -0.03 * 32 },
    appSub: { fontFamily: font.mono, fontSize: 10, color: colors.accent, letterSpacing: 0.1 * 10, marginTop: 2 },
    searchWrap: {
      marginHorizontal: 20, marginBottom: 12, backgroundColor: colors.bgRaised,
      borderRadius: radius.pill, borderWidth: 1.5, borderColor: searchFocused ? colors.accent : colors.stroke,
      paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center',
      ...shadow.gentle, shadowColor: colors.shadow, gap: 10
    },
    searchInput: { flex: 1, fontFamily: font.sans, fontSize: 15, color: colors.ink, padding: 0 },
    clearBtn: { fontSize: 13, color: colors.inkDim, paddingHorizontal: 4 },
    tagRailOuter: { marginBottom: 12 },
    tagRail: { paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
    empty: { paddingTop: 60, alignItems: 'center' },
    emptyTitle: { fontFamily: font.sansSemi, fontSize: 16, color: colors.inkMid, marginBottom: 6 },
    emptySub: { fontFamily: font.mono, fontSize: 12, color: colors.inkDim },
    fabWrap: { position: 'absolute', bottom: 24, right: 24 },
  }), [colors, font, radius, shadow, searchFocused]);

  const ListHeader = useMemo(() => (
    <View>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.appName}>{loc.appName}</Text>
          <Text style={s.appSub}>{loc.appSub}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Pressable onPress={() => router.push('/trash')} hitSlop={15}>
            <Svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
            </Svg>
          </Pressable>
          <Pressable onPress={() => router.push('/settings')} hitSlop={15}>
            <Svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Circle cx="12" cy="12" r="3" />
              <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </Svg>
          </Pressable>
        </View>
      </View>

      <View style={s.searchWrap}>
        <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={colors.inkDim} strokeWidth={2}>
          <Circle cx="11" cy="11" r="8" />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" />
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
    </View>
  ), [searchFocused, searchQuery, selectedTag, uniqueTags, s, colors]);

  if (!isLoaded) return null;

  return (
    <View style={s.root}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} translucent={false} />

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <View style={s.noteContainer}>
            <BentoCard
              title={item.title}
              preview={item.body}
              date={formatDate(item.updated_at)}
              tag={item.tag || undefined}
              pinned={item.pinned}
              onPress={() => onNotePress(item.id)}
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
    </View>
  );
}
