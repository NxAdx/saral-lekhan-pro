import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import { log } from '../utils/Logger';

// Open (or create) the SQLite database
const DB_NAME = 'saral_lekhan.db';
let db = SQLite.openDatabase(DB_NAME);

async function reopenDatabaseConnection() {
  try {
    if ((db as any)?.closeAsync) {
      await (db as any).closeAsync();
    }
  } catch (error) {
    // Ignore close errors and still attempt to reopen.
    log.warn("SQLite close before reopen failed", error as any);
  }
  db = SQLite.openDatabase(DB_NAME);
}

export interface Note {
  id: number;
  title: string;
  body: string;
  tag: string;
  created_at: number;
  updated_at: number;
  pinned: boolean;
  is_deleted: boolean;
}

const ALL_TAG = '__all__';
export const ALL_TAG_ID = ALL_TAG;

interface NotesState {
  notes: Note[];
  isLoaded: boolean;
  initDB: () => void;
  loadNotes: () => void;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>) => number;
  updateNote: (id: number, updates: Partial<Pick<Note, 'title' | 'body' | 'tag' | 'pinned'>>) => void;
  deleteNote: (id: number) => void;
  restoreNote: (id: number) => void;
  permanentlyDeleteNote: (id: number) => void;
  emptyTrash: () => void;
  getNotesFilteredByTag: (tag: string) => Note[];
  getDeletedNotes: () => Note[];
  getUniqueTags: () => string[];
  resetDB: () => Promise<void>;
  bootstrap: (initialNotesJson?: string) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoaded: false,

  bootstrap: (json) => {
    if (!json) return;
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        log.info(`Bootstrapping store with ${parsed.length} native-preloaded notes`);
        set({ notes: parsed, isLoaded: true });
      }
    } catch (e) {
      log.error("Bootstrap parsing failed", e);
    }
  },

  initDB: () => {
    db.transaction((tx: any) => {
      // Step 1: Ensure the notes table exists with all columns.
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY NOT NULL,
          title TEXT,
          body TEXT,
          tag TEXT,
          created_at INTEGER,
          updated_at INTEGER,
          pinned INTEGER DEFAULT 0,
          is_deleted INTEGER DEFAULT 0
        );`, [],
        () => {
          // Step 2: Safe migration — ONLY alter if column is actually missing.
          // This prevents the "duplicate column name: is_deleted" crash on existing installs.
          tx.executeSql(
            `SELECT COUNT(*) as count FROM pragma_table_info('notes') WHERE name='is_deleted';`,
            [],
            (_: any, { rows }: any) => {
              const hasColumn = rows.item(0)?.count > 0;
              if (!hasColumn) {
                tx.executeSql(
                  `ALTER TABLE notes ADD COLUMN is_deleted INTEGER DEFAULT 0;`,
                  [],
                  () => get().loadNotes(),
                  (_: any, err: any) => {
                    log.warn('Migration ALTER failed', err as any);
                    get().loadNotes();
                    return true;
                  }
                );
              } else {
                get().loadNotes();
              }
            },
            (_: any, err: any) => {
              log.warn('pragma_table_info check failed, loading anyway', err as any);
              get().loadNotes();
              return true;
            }
          );
        }
      );
    }, (err: any) => {
        log.error("Failed to init DB (Transaction Error)", err);
        // CRITICAL: Always mark as loaded so the app doesn't stay stuck on the loading screen.
        set({ isLoaded: true });
    });
  },

  loadNotes: () => {
    log.info("Loading notes from DB...");
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM notes ORDER BY updated_at DESC;`, [],
        (_: any, { rows: { _array } }: any) => {
          const loadedNotes = _array.map((row: any) => ({
            ...row,
            pinned: row.pinned === 1,
            is_deleted: row.is_deleted === 1
          }));
          log.info(`Loaded ${loadedNotes.length} notes`);
          set({ notes: loadedNotes, isLoaded: true });
        }
      );
    }, (err: any) => {
      log.error("Failed to load notes", err);
      // Ensure app never stays stuck on the loading skeleton
      set({ isLoaded: true });
    });
  },

  addNote: (note) => {
    const now = Date.now();
    const newNote: Note = {
      ...note,
      id: now + Math.floor(Math.random() * 100000),
      created_at: now,
      updated_at: now,
      pinned: note.pinned ?? false,
      is_deleted: false,
    };

    log.info(`Adding new note: ${newNote.title}`);
    set((state) => ({ notes: [newNote, ...state.notes] }));

    db.transaction((tx: any) => {
      tx.executeSql(
        `INSERT INTO notes (id, title, body, tag, created_at, updated_at, pinned, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0);`,
        [newNote.id, newNote.title, newNote.body, newNote.tag, newNote.created_at, newNote.updated_at, newNote.pinned ? 1 : 0]
      );
    }, (err: any) => {
      log.error("Failed to insert note", err);
    });

    return newNote.id;
  },

  updateNote: (id, updates) => {
    const now = Date.now();

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updated_at: now } : n
      ),
    }));

    const n = get().notes.find(x => x.id === id);
    if (n) {
      db.transaction((tx: any) => {
        tx.executeSql(
          `UPDATE notes SET title = ?, body = ?, tag = ?, updated_at = ?, pinned = ? WHERE id = ?;`,
          [n.title, n.body, n.tag, n.updated_at, n.pinned ? 1 : 0, id]
        );
      }, (err: any) => {
        log.error("Failed to update note", err);
      });
    }
  },

  getNotesFilteredByTag: (tag) => {
    const { notes } = get();
    const activeNotes = notes.filter(n => !n.is_deleted);
    if (tag === ALL_TAG_ID) return [...activeNotes].sort((a, b) => b.updated_at - a.updated_at);
    return activeNotes.filter((n) => n.tag === tag).sort((a, b) => b.updated_at - a.updated_at);
  },

  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.map((n) => n.id === id ? { ...n, is_deleted: true } : n)
    }));
    db.transaction((tx: any) => {
      tx.executeSql(`UPDATE notes SET is_deleted = 1 WHERE id = ?;`, [id]);
    });
  },

  restoreNote: (id) => {
    set((state) => ({
      notes: state.notes.map((n) => n.id === id ? { ...n, is_deleted: false } : n)
    }));
    db.transaction((tx: any) => {
      tx.executeSql(`UPDATE notes SET is_deleted = 0 WHERE id = ?;`, [id]);
    });
  },

  permanentlyDeleteNote: (id) => {
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    db.transaction((tx: any) => {
      tx.executeSql(`DELETE FROM notes WHERE id = ?;`, [id]);
    });
  },

  emptyTrash: () => {
    const trashIds = get().notes.filter(n => n.is_deleted).map(n => n.id);
    if (trashIds.length === 0) return;
    set((state) => ({ notes: state.notes.filter((n) => !n.is_deleted) }));
    db.transaction((tx: any) => {
      tx.executeSql(`DELETE FROM notes WHERE is_deleted = 1;`);
    }, (err: any) => {
      log.error("Failed to empty trash", err);
    });
  },

  getDeletedNotes: () => {
    return get().notes.filter(n => n.is_deleted).sort((a, b) => b.updated_at - a.updated_at);
  },

  getUniqueTags: () => {
    const tags = new Set(get().notes.filter(n => !n.is_deleted).map((n) => n.tag).filter(Boolean));
    return Array.from(tags).sort();
  },

  resetDB: async () => {
    set({ notes: [], isLoaded: false });
    // Re-initialize and load notes from the newly restored/replaced database file
    await reopenDatabaseConnection();
    get().initDB();
  },
}));
