import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import { log } from '../utils/Logger';

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
  getNotesFilteredByTag: (tag: string) => Note[];
  getDeletedNotes: () => Note[];
  getUniqueTags: () => string[];
  resetDB: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoaded: false,

  initDB: () => {
    db.transaction((tx) => {
      // Notes Table
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
          // Migration: Add is_deleted if missing
          tx.executeSql(`ALTER TABLE notes ADD COLUMN is_deleted INTEGER DEFAULT 0;`, [], () => { }, () => false);

          get().loadNotes();
        }
      );
    });
  },

  loadNotes: () => {
    log.info("Loading notes from DB...");
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM notes ORDER BY updated_at DESC;`, [],
        (_, { rows: { _array } }) => {
          const loadedNotes = _array.map(row => ({
            ...row,
            pinned: row.pinned === 1,
            is_deleted: row.is_deleted === 1
          }));
          log.info(`Loaded ${loadedNotes.length} notes`);
          set({ notes: loadedNotes, isLoaded: true });
        }
      );
    });
  },


  addNote: (note) => {
    const now = Date.now();
    const newNote: Note = {
      ...note,
      id: now,
      created_at: now,
      updated_at: now,
      pinned: note.pinned ?? false,
      is_deleted: false,
    };

    log.info(`Adding new note: ${newNote.title}`);
    set((state) => ({ notes: [newNote, ...state.notes] }));

    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO notes (id, title, body, tag, created_at, updated_at, pinned, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0);`,
        [newNote.id, newNote.title, newNote.body, newNote.tag, newNote.created_at, newNote.updated_at, newNote.pinned ? 1 : 0]
      );
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
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE notes SET title = ?, body = ?, tag = ?, updated_at = ?, pinned = ? WHERE id = ?;`,
          [n.title, n.body, n.tag, n.updated_at, n.pinned ? 1 : 0, id]
        );
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
    db.transaction((tx) => {
      tx.executeSql(`UPDATE notes SET is_deleted = 1 WHERE id = ?;`, [id]);
    });
  },

  restoreNote: (id) => {
    set((state) => ({
      notes: state.notes.map((n) => n.id === id ? { ...n, is_deleted: false } : n)
    }));
    db.transaction((tx) => {
      tx.executeSql(`UPDATE notes SET is_deleted = 0 WHERE id = ?;`, [id]);
    });
  },

  permanentlyDeleteNote: (id) => {
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM notes WHERE id = ?;`, [id]);
    });
  },

  getDeletedNotes: () => {
    return get().notes.filter(n => n.is_deleted).sort((a, b) => b.updated_at - a.updated_at);
  },

  getUniqueTags: () => {
    const tags = new Set(get().notes.filter(n => !n.is_deleted).map((n) => n.tag).filter(Boolean));
    return Array.from(tags).sort();
  },

  resetDB: () => {
    set({ notes: [], isLoaded: false });
    // Re-initialize and load notes from the newly restored/replaced database file
    setTimeout(() => {
      get().initDB();
    }, 200);
  },
}));
