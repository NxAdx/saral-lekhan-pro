


This makes perfect sense now. I’ve reviewed your `notesStore.ts` and `index.tsx`. 

**The Root Cause of the Bug:**
Your `notesStore.ts` is completely missing the database persistence layer! Right now, it is saving notes to RAM (memory) only. When you close the app, the memory clears, and the notes "disappear."

Here is the complete **Phase 1** execution. I have wired `expo-sqlite` directly into your Zustand store and fixed the Home Screen padding to prepare for the Bento Grid layout.

### 1. Update `notesStore.ts` (SQLite Persistence Fix)
We are going to add a database initialization function, load the notes from SQLite on startup, and ensure every `add`, `update`, and `delete` action syncs with the local database.

*Note: Run `npx expo install expo-sqlite` in your terminal if you haven't already.*

Replace your `src/store/notesStore.ts` with this:

```typescript
import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';

// Open (or create) the SQLite database
const db = SQLite.openDatabase('saral_lekhan.db');

export interface Note {
  id: number;
  title: string;
  body: string;
  tag: string;
  created_at: number;
  updated_at: number;
  pinned: boolean;
}

const ALL_TAG = '__all__';
export const ALL_TAG_ID = ALL_TAG;

interface NotesState {
  notes: Note[];
  isLoaded: boolean;
  initDB: () => void;
  loadNotes: () => void;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => void;
  updateNote: (id: number, updates: Partial<Pick<Note, 'title' | 'body' | 'tag' | 'pinned'>>) => void;
  deleteNote: (id: number) => void;
  getNotesFilteredByTag: (tag: string) => Note[];
  getUniqueTags: () => string[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes:[],
  isLoaded: false,

  initDB: () => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY NOT NULL,
          title TEXT,
          body TEXT,
          tag TEXT,
          created_at INTEGER,
          updated_at INTEGER,
          pinned INTEGER
        );`,[],
        () => get().loadNotes(), // Load notes immediately after creating table
        (_, error) => { console.error("DB Init Error: ", error); return false; }
      );
    });
  },

  loadNotes: () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM notes ORDER BY updated_at DESC;`,[],
        (_, { rows: { _array } }) => {
          // Convert SQLite integer boolean (0/1) back to JS boolean (true/false)
          const loadedNotes = _array.map(row => ({
            ...row,
            pinned: row.pinned === 1
          }));
          set({ notes: loadedNotes, isLoaded: true });
        }
      );
    });
  },

  addNote: (note) => {
    const now = Date.now();
    const newNote = {
      ...note,
      id: now,
      created_at: now,
      updated_at: now,
      pinned: note.pinned ?? false,
    };

    // Update UI immediately (Optimistic UI update)
    set((state) => ({ notes: [newNote, ...state.notes] }));

    // Persist to SQLite
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO notes (id, title, body, tag, created_at, updated_at, pinned) VALUES (?, ?, ?, ?, ?, ?, ?);`,[newNote.id, newNote.title, newNote.body, newNote.tag, newNote.created_at, newNote.updated_at, newNote.pinned ? 1 : 0]
      );
    });
  },

  updateNote: (id, updates) => {
    const now = Date.now();
    
    // Update UI immediately
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updated_at: now } : n
      ),
    }));

    // Find the full updated note to save to SQLite
    const updatedNote = get().notes.find(n => n.id === id);
    if (updatedNote) {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE notes SET title = ?, body = ?, tag = ?, updated_at = ?, pinned = ? WHERE id = ?;`,[updatedNote.title, updatedNote.body, updatedNote.tag, updatedNote.updated_at, updatedNote.pinned ? 1 : 0, id]
        );
      });
    }
  },

  deleteNote: (id) => {
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM notes WHERE id = ?;`, [id]);
    });
  },

  getNotesFilteredByTag: (tag) => {
    const { notes } = get();
    if (tag === ALL_TAG_ID) return [...notes].sort((a, b) => b.updated_at - a.updated_at);
    return notes.filter((n) => n.tag === tag).sort((a, b) => b.updated_at - a.updated_at);
  },

  getUniqueTags: () => {
    const { notes } = get();
    const tags = new Set(notes.map((n) => n.tag).filter(Boolean));
    return Array.from(tags).sort();
  },
}));
```

### 2. Update `index.tsx` (UI Padding & Mount Fix)
Here, I have wrapped the `NotePill` in a `View` with horizontal padding. I also added a `useEffect` that triggers the `initDB()` function as soon as the Home Screen loads, ensuring your saved notes populate instantly.

Replace your `src/app/(main)/index.tsx` with this:

```tsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  ScrollView, StatusBar, Pressable, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Circle, Line } from 'react-native-svg';
import { useNotesStore, ALL_TAG_ID } from '../../store/notesStore';
import { NotePill } from '../../components/ui/NotePill';
import { TagPill } from '../../components/ui/TagPill';
import { FAB } from '../../components/ui/FAB';
import { T } from '../../tokens';
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
  const[selectedTag, setSelectedTag] = useState<string>(ALL_TAG_ID);
  const[searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const initDB = useNotesStore((s) => s.initDB);
  const isLoaded = useNotesStore((s) => s.isLoaded);
  const notes = useNotesStore((s) => s.getNotesFilteredByTag(selectedTag));
  const getUniqueTags = useNotesStore((s) => s.getUniqueTags);
  
  // Initialize SQLite Database on mount
  useEffect(() => {
    initDB();
  },[initDB]);

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

  const ListHeader = useMemo(() => (
    <View>
      <View style={s.header}>
        <Text style={s.appName}>सरल लेखन</Text>
        <Text style={s.appSub}>NOTES EXPERIENCE</Text>
      </View>

      <View style={[s.searchWrap, searchFocused && s.searchFocused]}>
        <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={T.color.inkDim} strokeWidth={2}>
          <Circle cx="11" cy="11" r="8" />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" />
        </Svg>
        <TextInput
          style={s.searchInput}
          placeholder="खोजें..."
          placeholderTextColor={T.color.inkDim}
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
        <TagPill label="सभी" active={selectedTag === ALL_TAG_ID} onPress={() => setSelectedTag(ALL_TAG_ID)} />
        {uniqueTags.map((tag) => (
          <TagPill key={tag} label={tag} active={selectedTag === tag} onPress={() => setSelectedTag(tag)} />
        ))}
      </ScrollView>
    </View>
  ), [searchFocused, searchQuery, selectedTag, uniqueTags]);

  // Prevent flashing empty state before DB loads
  if (!isLoaded) return null; 

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.color.bg} translucent={false} />

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          // Wrapped NotePill in a View with horizontal padding to stop edge-touching
          <View style={s.noteContainer}>
            <NotePill
              title={item.title}
              preview={item.body}
              date={formatDate(item.updated_at)}
              tag={item.tag || undefined}
              pinned={item.pinned}
              onPress={() => onNotePress(item.id)}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyTitle}>
              {searchQuery ? 'कोई परिणाम नहीं' : 'कोई नोट नहीं'}
            </Text>
            <Text style={s.emptySub}>
              {searchQuery
                ? `"${searchQuery}" के लिए कुछ नहीं मिला`
                : '+ दबाएँ और पहला नोट लिखें'}
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

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.color.bg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44,
  },
  listContent: { paddingBottom: 100 },
  // FIX: Added horizontal padding wrapper for the note cards
  noteContainer: { paddingHorizontal: 20 },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, alignItems: 'center' },
  appName: { fontFamily: T.font.display, fontSize: 32, fontWeight: '900', color: T.color.ink, letterSpacing: -0.03 * 32 },
  appSub: { fontFamily: T.font.mono, fontSize: 10, color: T.color.accent, letterSpacing: 0.1 * 10, marginTop: 2 },
  searchWrap: { marginHorizontal: 20, marginBottom: 12, backgroundColor: T.color.bgRaised, borderRadius: T.radius.pill, borderWidth: 1.5, borderColor: T.color.stroke, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', shadowColor: T.color.shadow, shadowOffset: { width: 2, height: 4 }, shadowOpacity: 1, shadowRadius: 4, gap: 8 },
  searchFocused: { borderColor: T.color.accent },
  searchInput: { flex: 1, fontFamily: T.font.sans, fontSize: 14, color: T.color.ink, padding: 0 },
  clearBtn: { fontSize: 11, color: T.color.inkDim },
  tagRailOuter: { marginBottom: 8 },
  tagRail: { paddingHorizontal: 20, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 8 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyTitle: { fontFamily: T.font.sansSemi, fontSize: 16, color: T.color.inkMid, marginBottom: 6 },
  emptySub: { fontFamily: T.font.mono, fontSize: 11, color: T.color.inkDim },
  fabWrap: { position: 'absolute', bottom: 24, right: 24 },
});
```

### What's Next?
Test the app right now. Create a note, kill the app entirely, and reopen it. Your notes should persist perfectly, and the UI cards will now have beautiful breathing room on the edges!

Once you confirm this works, **we will begin Phase 2: The Advanced Theme Engine (Light/Dark/AMOLED) & Bento Grid overhaul.** Let me know when you are ready!

---

## Phase 14: Cloud Sync & Google OAuth Fixes

### 1. Google Auth Error 400: `invalid_request`
- **Issue**: When using `expo-auth-session` on Android, Google's security policy blocks web-based OAuth redirects back to the mobile app, causing a 400 invalid request error.
- **Fix**: Migrated from the web-based `AuthSession` to the native `@react-native-google-signin/google-signin` library. This invokes the native Android account picker overlay instead of a web browser.

### 2. Google Auth `DEVELOPER_ERROR` (Error 10)
- **Issue**: Attempting to sign in with the native Google Sign-In library instantly throws a `DEVELOPER_ERROR`.
- **Cause**: Two potential reasons:
  1. The `SHA-1` fingerprint generated by EAS Cloud Build does not match the fingerprint registered in Google Cloud Console.
  2. The code passes the **Android Client ID** into the `webClientId` parameter of the `GoogleSignin.configure()` block.
- **Fix**: Removed the `webClientId` configuration parameter entirely when only a standard Android token is needed.

### 3. Google Drive REST API `401 Unauthorized`
- **Issue**: While the Android Client ID allows the user to log in successfully (fixing Error 10), any subsequent `fetch()` request to the Google Drive REST APIs (like `https://www.googleapis.com/drive/v3/files`) returns a `401 Unauthorized` or `Invalid Credentials` error.
- **Cause**: Google strictly refuses to grant REST API access tokens to pure Android identity tokens. It requires a cross-platform Web Client ID to act as the authenticator for REST requests.
- **Fix**: You must generate a **"Web application"** OAuth Client ID in Google Cloud Console (in the same project) and pass *that* ID into the `webClientId` parameter of `GoogleSignin.configure()`. This specific ID architecture bridges the native login with the REST permissions.