import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import * as Sentry from '@sentry/react-native';
import { log } from '../utils/Logger';
import { stripMarkdown } from '../utils/markdown';

// Open (or create) the SQLite database
const DB_NAME = 'saral_lekhan.db';
let db = SQLite.openDatabaseSync(DB_NAME);

function reopenDatabaseConnection() {
  try {
    db.closeSync();
  } catch (error) {
    log.warn("SQLite close before reopen failed", error as any);
  }
  db = SQLite.openDatabaseSync(DB_NAME);
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
  is_archived: boolean;
  plain_body?: string;
}

const ALL_TAG = '__all__';
export const ALL_TAG_ID = ALL_TAG;

interface NotesState {
  notes: Note[];
  isLoaded: boolean;
  initDB: () => Promise<void>;
  loadNotes: () => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'plain_body'>) => Promise<number>;
  updateNote: (id: number, updates: Partial<Pick<Note, 'title' | 'body' | 'tag' | 'pinned'>>) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  restoreNote: (id: number) => Promise<void>;
  permanentlyDeleteNote: (id: number) => Promise<void>;
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

  initDB: async () => {
    try {
      await db.withTransactionAsync(async () => {
        // Step 1: Ensure the notes table exists
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT,
            body TEXT,
            tag TEXT,
            created_at INTEGER,
            updated_at INTEGER,
            pinned INTEGER DEFAULT 0,
            is_deleted INTEGER DEFAULT 0,
            is_archived INTEGER DEFAULT 0,
            plain_body TEXT
          );
        `);

        // Step 2: Safe migrations
        const info: any[] = await db.getAllAsync(`PRAGMA table_info(notes);`);
        
        const hasDeletedColumn = info.some(col => col.name === 'is_deleted');
        if (!hasDeletedColumn) {
          log.info("Migrating DB: Adding is_deleted column");
          await db.execAsync(`ALTER TABLE notes ADD COLUMN is_deleted INTEGER DEFAULT 0;`);
        }

        const hasArchivedColumn = info.some(col => col.name === 'is_archived');
        if (!hasArchivedColumn) {
          log.info("Migrating DB: Adding is_archived column");
          await db.execAsync(`ALTER TABLE notes ADD COLUMN is_archived INTEGER DEFAULT 0;`);
        }

        const hasPlainBodyColumn = info.some(col => col.name === 'plain_body');
        if (!hasPlainBodyColumn) {
          log.info("Migrating DB: Adding plain_body column");
          await db.execAsync(`ALTER TABLE notes ADD COLUMN plain_body TEXT;`);
        }

        // Step 3: Indexes for performance
        await db.execAsync(`
          CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes (updated_at);
          CREATE INDEX IF NOT EXISTS idx_notes_tag ON notes (tag);
          CREATE INDEX IF NOT EXISTS idx_notes_is_deleted ON notes (is_deleted);
          CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON notes (is_archived);
        `);
      });
      
      await get().loadNotes();
    } catch (err) {
      log.error("Failed to init DB", err);
      Sentry.captureException(err);
      set({ isLoaded: true });
    }
  },

  loadNotes: async () => {
    log.info("Loading notes from DB...");
    try {
      const rows: any[] = await db.getAllAsync(`SELECT * FROM notes ORDER BY updated_at DESC;`);
      const loadedNotes = rows.map(row => ({
        ...row,
        pinned: row.pinned === 1,
        is_deleted: row.is_deleted === 1,
        is_archived: row.is_archived === 1
      }));
      log.info(`Loaded ${loadedNotes.length} notes`);
      set({ notes: loadedNotes, isLoaded: true });
    } catch (err) {
      log.error("Failed to load notes", err);
      Sentry.captureException(err);
      set({ isLoaded: true });
    }
  },

  addNote: async (note) => {
    const now = Date.now();
    const plainBody = stripMarkdown(note.body);
    const newNote: Note = {
      ...note,
      id: now + Math.floor(Math.random() * 100000),
      created_at: now,
      updated_at: now,
      pinned: note.pinned ?? false,
      is_deleted: false,
      plain_body: plainBody,
    };

    log.info(`Adding new note: ${newNote.title}`);
    set((state) => ({ notes: [newNote, ...state.notes] }));

    try {
      await db.runAsync(
        `INSERT INTO notes (id, title, body, tag, created_at, updated_at, pinned, is_deleted, is_archived, plain_body) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?);`,
        [newNote.id, newNote.title, newNote.body, newNote.tag, newNote.created_at, newNote.updated_at, newNote.pinned ? 1 : 0, plainBody]
      );
    } catch (err) {
      log.error("Failed to insert note", err);
      Sentry.captureException(err);
    }

    return newNote.id;
  },

  updateNote: async (id, updates) => {
    const now = Date.now();
    
    set((state) => ({
      notes: state.notes.map((n) => {
        if (n.id === id) {
          const nextNote = { ...n, ...updates, updated_at: now };
          if (updates.body !== undefined) {
             nextNote.plain_body = stripMarkdown(updates.body);
          }
          return nextNote;
        }
        return n;
      }),
    }));

    const n = get().notes.find(x => x.id === id);
    if (n) {
      try {
        await db.runAsync(
          `UPDATE notes SET title = ?, body = ?, tag = ?, updated_at = ?, pinned = ?, plain_body = ? WHERE id = ?;`,
          [n.title, n.body, n.tag, n.updated_at, n.pinned ? 1 : 0, n.plain_body || '', id]
        );
      } catch (err) {
        log.error("Failed to update note", err);
        Sentry.captureException(err);
      }
    }
  },

  getNotesFilteredByTag: (tag) => {
    const { notes } = get();
    const activeNotes = notes.filter(n => !n.is_deleted);
    if (tag === ALL_TAG_ID) return [...activeNotes].sort((a, b) => b.updated_at - a.updated_at);
    return activeNotes.filter((n) => n.tag === tag).sort((a, b) => b.updated_at - a.updated_at);
  },

  deleteNote: async (id) => {
    set((state) => ({
      notes: state.notes.map((n) => n.id === id ? { ...n, is_deleted: true } : n)
    }));
    try {
      await db.runAsync(`UPDATE notes SET is_deleted = 1 WHERE id = ?;`, [id]);
    } catch (err) {
      log.error("Failed to delete note", err);
    }
  },

  restoreNote: async (id) => {
    set((state) => ({
      notes: state.notes.map((n) => n.id === id ? { ...n, is_deleted: false } : n)
    }));
    try {
      await db.runAsync(`UPDATE notes SET is_deleted = 0 WHERE id = ?;`, [id]);
    } catch (err) {
      log.error("Failed to restore note", err);
    }
  },

  permanentlyDeleteNote: async (id) => {
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    try {
      await db.runAsync(`DELETE FROM notes WHERE id = ?;`, [id]);
    } catch (err) {
      log.error("Failed to permanently delete note", err);
    }
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
    reopenDatabaseConnection();
    await get().initDB();
  },
}));
