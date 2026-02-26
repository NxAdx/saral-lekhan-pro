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
  is_deleted: boolean;
}

const ALL_TAG = '__all__';
export const ALL_TAG_ID = ALL_TAG;

interface NotesState {
  notes: Note[];
  isLoaded: boolean;
  initDB: () => void;
  loadNotes: () => void;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>) => void;
  updateNote: (id: number, updates: Partial<Pick<Note, 'title' | 'body' | 'tag' | 'pinned'>>) => void;
  deleteNote: (id: number) => void; // Soft delete
  restoreNote: (id: number) => void; // Undelete
  permanentlyDeleteNote: (id: number) => void; // Hard delete
  getNotesFilteredByTag: (tag: string) => Note[];
  getDeletedNotes: () => Note[];
  getUniqueTags: () => string[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoaded: false,

  initDB: () => {
    db.transaction((tx) => {
      // 1. Create table if not exists
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY NOT NULL,
          title TEXT,
          body TEXT,
          tag TEXT,
          created_at INTEGER,
          updated_at INTEGER,
          pinned INTEGER,
          is_deleted INTEGER DEFAULT 0
        );`, [],
        () => {
          // 2. Try to add 'is_deleted' column for existing users.
          // This will fail silently if the column already exists.
          tx.executeSql(
            `ALTER TABLE notes ADD COLUMN is_deleted INTEGER DEFAULT 0;`, [],
            () => get().loadNotes(),
            () => {
              // The error usually means the column already exists, so proceed regardless.
              get().loadNotes();
              return false; // Tells Expo SQLite not to rollback transaction due to this expected error
            }
          );
        },
        (_, error) => { console.error("DB Init Error: ", error); return false; }
      );
    });
  },

  loadNotes: () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM notes ORDER BY updated_at DESC;`, [],
        (_, { rows: { _array } }) => {
          const loadedNotes = _array.map(row => ({
            ...row,
            pinned: row.pinned === 1,
            is_deleted: row.is_deleted === 1
          }));
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

    set((state) => ({ notes: [newNote, ...state.notes] }));

    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO notes (id, title, body, tag, created_at, updated_at, pinned, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0);`,
        [newNote.id, newNote.title, newNote.body, newNote.tag, newNote.created_at, newNote.updated_at, newNote.pinned ? 1 : 0]
      );
    });
  },

  updateNote: (id, updates) => {
    const now = Date.now();

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updated_at: now } : n
      ),
    }));

    const updatedNote = get().notes.find(n => n.id === id);
    if (updatedNote) {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE notes SET title = ?, body = ?, tag = ?, updated_at = ?, pinned = ? WHERE id = ?;`,
          [updatedNote.title, updatedNote.body, updatedNote.tag, updatedNote.updated_at, updatedNote.pinned ? 1 : 0, id]
        );
      });
    }
  },

  deleteNote: (id) => {
    // Soft delete
    set((state) => ({
      notes: state.notes.map((n) => n.id === id ? { ...n, is_deleted: true } : n)
    }));
    db.transaction((tx) => {
      tx.executeSql(`UPDATE notes SET is_deleted = 1 WHERE id = ?;`, [id]);
    });
  },

  restoreNote: (id) => {
    // Undelete
    set((state) => ({
      notes: state.notes.map((n) => n.id === id ? { ...n, is_deleted: false } : n)
    }));
    db.transaction((tx) => {
      tx.executeSql(`UPDATE notes SET is_deleted = 0 WHERE id = ?;`, [id]);
    });
  },

  permanentlyDeleteNote: (id) => {
    // Hard delete
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM notes WHERE id = ?;`, [id]);
    });
  },

  getNotesFilteredByTag: (tag) => {
    const { notes } = get();
    // Only return notes that are NOT deleted
    const activeNotes = notes.filter(n => !n.is_deleted);
    if (tag === ALL_TAG_ID) return [...activeNotes].sort((a, b) => b.updated_at - a.updated_at);
    return activeNotes.filter((n) => n.tag === tag).sort((a, b) => b.updated_at - a.updated_at);
  },

  getDeletedNotes: () => {
    const { notes } = get();
    // Return ONLY deleted notes
    return notes.filter(n => n.is_deleted).sort((a, b) => b.updated_at - a.updated_at);
  },

  getUniqueTags: () => {
    const { notes } = get();
    // Only get tags from active, undeleted notes
    const tags = new Set(notes.filter(n => !n.is_deleted).map((n) => n.tag).filter(Boolean));
    return Array.from(tags).sort();
  },
}));
